import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import type {
  ChatContextType,
  ChatProviderProps,
  ChatState,
  ConversationPair,
  Message,
} from './types';
import { chatReducer } from './chat-reducer';
import { client } from '@/utils/openai';
import { SYSTEM_PROMPT } from '@/constants/openai';
import { EChatUserType } from './enums';
import { generateUser } from '@/helpers/openai';
import { extractChatTitle } from '@/helpers/chat';
import { sanitizeHtmlForLLM } from '@/utils/sanitize';
import { useChatTabsContext } from './chat-tabs-context';
import { chatStorage } from '@/utils/indexeddb';
import {
  addConversation,
  setCurrentMessage,
  clearCurrentMessage,
  setLoading,
  setError,
  setStreaming,
  updateStreamingMessage,
  clearMessages,
  setEditingMessageId,
  updateEditingMessage,
  setConversations,
} from './chat-actions';

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const initialState: ChatState = {
  conversations: [],
  currentMessage: '',
  isLoading: false,
  isStreaming: false,
  error: null,
  editingMessageId: null,
};

export const ChatProvider = ({ children, chatId }: ChatProviderProps) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { updateChatTabLabel, getChatTab } = useChatTabsContext();

  const abortControllerRef = useRef<AbortController | null>(null);

  const saveConversationsToStorage = useCallback(async () => {
    if (
      !chatId ||
      state.conversations.length === 0 ||
      !chatStorage.isSupported()
    ) {
      return;
    }

    try {
      const chatTitle = state.conversations[0]?.user?.content
        ? extractChatTitle(
            sanitizeHtmlForLLM(state.conversations[0].user.content)
          )
        : 'New Chat';

      await chatStorage.saveChat(chatId, chatTitle, state.conversations);

      // Only update tab label if it's currently "Untitled Chat" or "New Chat"
      const currentTab = getChatTab(chatId);
      if (
        currentTab &&
        (currentTab.label === 'Untitled Chat' ||
          currentTab.label === 'New Chat')
      ) {
        updateChatTabLabel(chatId, chatTitle);
      }
    } catch (error) {
      console.error('Failed to save chat to IndexedDB:', error);
    }
  }, [chatId, state.conversations, updateChatTabLabel, getChatTab]);

  useEffect(() => {
    const initializeStorage = async () => {
      try {
        if (!chatStorage.isSupported()) {
          console.warn('IndexedDB not supported, chats will not persist');
          return;
        }

        await chatStorage.init();

        if (chatId) {
          let storedChat = await chatStorage.loadChat(chatId);

          if (!storedChat) {
            const backupKey = `chat_backup_${chatId}`;
            const backup = localStorage.getItem(backupKey);
            if (backup) {
              try {
                const backupData = JSON.parse(backup);
                // Convert the backup data to the expected format
                const backupChat = {
                  ...backupData,
                  createdAt: new Date(
                    backupData.createdAt || backupData.updatedAt
                  ),
                  updatedAt: new Date(backupData.updatedAt),
                  conversations: backupData.conversations.map((conv: any) => ({
                    ...conv,
                    timestamp: new Date(conv.timestamp),
                    user: conv.user
                      ? {
                          ...conv.user,
                          timestamp: new Date(conv.user.timestamp),
                        }
                      : undefined,
                    system: conv.system
                      ? {
                          ...conv.system,
                          timestamp: new Date(conv.system.timestamp),
                        }
                      : undefined,
                  })),
                };

                await chatStorage.saveChat(
                  chatId,
                  backupData.title,
                  backupChat.conversations
                );
                localStorage.removeItem(backupKey);
                storedChat = backupChat;
                console.log('Recovered chat from localStorage backup');
              } catch (error) {
                console.error('Failed to parse localStorage backup:', error);
                localStorage.removeItem(backupKey);
              }
            }
          }

          if (storedChat) {
            dispatch(setConversations(storedChat.conversations));

            // Update tab title only if it's currently a generic title
            if (storedChat.conversations.length > 0) {
              const currentTab = getChatTab(chatId);
              if (
                currentTab &&
                (currentTab.label === 'Untitled Chat' ||
                  currentTab.label === 'New Chat')
              ) {
                const firstUserMessage =
                  storedChat.conversations[0]?.user?.content;
                if (firstUserMessage) {
                  const chatTitle = extractChatTitle(
                    sanitizeHtmlForLLM(firstUserMessage)
                  );
                  updateChatTabLabel(chatId, chatTitle);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to initialize chat storage:', error);
        dispatch(setError('Failed to load chat history'));
      }
    };

    initializeStorage();
  }, [chatId]);

  // Save conversations to storage with debouncing
  useEffect(() => {
    if (chatId && state.conversations.length > 0) {
      const timeoutId = setTimeout(() => {
        saveConversationsToStorage().catch(console.error);
      }, 2000); // Debounce for 2 seconds

      return () => clearTimeout(timeoutId);
    }
  }, [chatId, state.conversations, saveConversationsToStorage]);

  // Update tab title when conversations change and title can be extracted (only for new or generic titles)
  useEffect(() => {
    if (chatId && state.conversations.length > 0) {
      const currentTab = getChatTab(chatId);
      if (
        currentTab &&
        (currentTab.label === 'Untitled Chat' ||
          currentTab.label === 'New Chat')
      ) {
        const firstUserMessage = state.conversations[0]?.user?.content;
        if (firstUserMessage) {
          const chatTitle = extractChatTitle(
            sanitizeHtmlForLLM(firstUserMessage)
          );
          updateChatTabLabel(chatId, chatTitle);
        }
      }
    }
  }, [chatId, state.conversations, updateChatTabLabel, getChatTab]);

  // Add beforeunload event listener to save data before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Use synchronous save for beforeunload to ensure it completes
      if (
        chatId &&
        state.conversations.length > 0 &&
        chatStorage.isSupported()
      ) {
        try {
          const chatTitle = state.conversations[0]?.user?.content
            ? extractChatTitle(
                sanitizeHtmlForLLM(state.conversations[0].user.content)
              )
            : 'New Chat';

          // Save synchronously using localStorage as fallback for beforeunload
          localStorage.setItem(
            `chat_backup_${chatId}`,
            JSON.stringify({
              id: chatId,
              title: chatTitle,
              conversations: state.conversations,
              updatedAt: new Date().toISOString(),
            })
          );

          // Also attempt async save (may or may not complete)
          saveConversationsToStorage().catch(console.error);
        } catch (error) {
          console.error('Failed to save chat during beforeunload:', error);
        }
      }
    };

    // Handle navigation-triggered saves
    const handleNavigationSave = () => {
      if (chatId && state.conversations.length > 0) {
        saveConversationsToStorage().catch(console.error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('navigation-save-trigger', handleNavigationSave);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener(
        'navigation-save-trigger',
        handleNavigationSave
      );
    };
  }, [chatId, state.conversations, saveConversationsToStorage]);

  const generateId = useCallback((): string => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const handleAddConversation = useCallback(
    (conversation: Omit<ConversationPair, 'timestamp'>) => {
      const newConversation: ConversationPair = {
        ...conversation,
        timestamp: new Date(),
      };
      dispatch(addConversation(newConversation));
    },
    []
  );

  const handleSetCurrentMessage = useCallback((message: string) => {
    dispatch(setCurrentMessage(message));
  }, []);

  const handleCancelStreaming = useCallback(() => {
    if (abortControllerRef.current && state.isStreaming) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      dispatch(setStreaming(false));
      dispatch(setLoading(false));
      dispatch(setError('Response generation was cancelled'));
    }
  }, [state.isStreaming]);

  const streamLLMResponse = useCallback(
    async (conversationId: string, conversationsToUse?: ConversationPair[]) => {
      try {
        // Create a new AbortController for this request
        abortControllerRef.current = new AbortController();

        dispatch(setStreaming(true));
        dispatch(setError(null));
        const conversations = conversationsToUse || state.conversations;

        const messages: Array<{
          role: EChatUserType;
          content: string;
        }> = [
          {
            role: EChatUserType.SYSTEM,
            content: SYSTEM_PROMPT,
          },
        ];

        const targetIndex = conversations.findIndex(
          conv => conv.id === conversationId
        );
        const conversationsUpToTarget = conversations.slice(0, targetIndex + 1);

        conversationsUpToTarget.forEach(conversation => {
          if (conversation.user?.content) {
            messages.push({
              role: EChatUserType.USER,
              content: sanitizeHtmlForLLM(conversation.user.content),
            });
          }
          // Only add LLM responses from conversations before the target
          if (
            conversation.id !== conversationId &&
            conversation.system?.content
          ) {
            messages.push({
              role: EChatUserType.SYSTEM,
              content: conversation.system.content,
            });
          }
        });

        const stream = await client.chat.completions.create(
          {
            model: 'gpt-4o',
            stream: true,
            messages,
          },
          {
            signal: abortControllerRef.current.signal,
          }
        );

        let streamedContent = '';

        dispatch(updateStreamingMessage(conversationId, ''));

        for await (const chunk of stream) {
          // Check if the request was cancelled
          if (abortControllerRef.current?.signal.aborted) {
            break;
          }

          const delta = chunk.choices[0]?.delta?.content;
          if (delta) {
            streamedContent += delta;
            dispatch(updateStreamingMessage(conversationId, streamedContent));
          }
        }

        // Only set streaming to false if not aborted
        if (!abortControllerRef.current?.signal.aborted) {
          dispatch(setStreaming(false));
          abortControllerRef.current = null;
        }
      } catch (err) {
        // Check if error is due to cancellation
        if (err instanceof Error && err.name === 'AbortError') {
          dispatch(setError('Response generation was cancelled'));
        } else {
          const errorMessage =
            err instanceof Error ? err.message : 'Failed to generate response';
          dispatch(setError(errorMessage));
        }
        dispatch(setStreaming(false));
        abortControllerRef.current = null;
      }
    },
    [state.conversations]
  );

  const handleUpdateEditingMessage = useCallback(
    (id: string, content: string) => {
      const conversation = state.conversations.find(
        conv => conv.user?.id === id || conv.system?.id === id
      );

      if (conversation) {
        const sender =
          conversation.user?.id === id
            ? EChatUserType.USER
            : EChatUserType.SYSTEM;
        dispatch(updateEditingMessage(conversation.id, content, sender));

        if (sender === EChatUserType.USER) {
          const updatedConversations = state.conversations.map(conv => {
            if (conv.id === conversation.id) {
              return {
                ...conv,
                user: conv.user ? { ...conv.user, content } : conv.user,
              };
            }
            return conv;
          });
          setTimeout(() => {
            streamLLMResponse(conversation.id, updatedConversations);
          }, 100);
        }
      }

      dispatch(setEditingMessageId(null));
      dispatch(setCurrentMessage(''));
    },
    [state.conversations, streamLLMResponse]
  );

  const handleClearCurrentMessage = useCallback(() => {
    dispatch(clearCurrentMessage());
  }, []);

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      const trimmedContent = content.trim();
      dispatch(setLoading(true));
      dispatch(setError(null));

      try {
        // Create a new AbortController for this request
        abortControllerRef.current = new AbortController();

        const isFirstMessage = state.conversations.length === 0;
        if (isFirstMessage && chatId) {
          const chatTitle = extractChatTitle(
            sanitizeHtmlForLLM(trimmedContent)
          );
          // Only update if the current tab has a generic title
          const currentTab = getChatTab(chatId);
          if (
            currentTab &&
            (currentTab.label === 'Untitled Chat' ||
              currentTab.label === 'New Chat')
          ) {
            updateChatTabLabel(chatId, chatTitle);
          }
        }

        const conversationId = generateId();

        const userMessage: Message = generateUser({
          id: generateId(),
          content: trimmedContent,
          sender: EChatUserType.USER,
          timestamp: new Date(),
        });

        const llmMessage: Message = generateUser({
          id: generateId(),
          content: '',
          sender: EChatUserType.SYSTEM,
          timestamp: new Date(),
        });

        const newConversation: ConversationPair = {
          id: conversationId,
          user: userMessage,
          system: llmMessage,
          timestamp: new Date(),
        };

        dispatch(addConversation(newConversation));
        handleClearCurrentMessage();

        dispatch(setLoading(false));
        dispatch(setStreaming(true));

        const messages: Array<{
          role: EChatUserType;
          content: string;
        }> = [
          {
            role: EChatUserType.SYSTEM,
            content: SYSTEM_PROMPT,
          },
        ];

        state.conversations.forEach(conversation => {
          if (conversation.user?.content) {
            messages.push({
              role: EChatUserType.USER,
              content: sanitizeHtmlForLLM(conversation.user.content),
            });
          }
          if (conversation.system?.content) {
            messages.push({
              role: EChatUserType.SYSTEM,
              content: conversation.system.content,
            });
          }
        });

        messages.push({
          role: EChatUserType.USER,
          content: sanitizeHtmlForLLM(trimmedContent),
        });

        const stream = await client.chat.completions.create(
          {
            model: 'gpt-4o',
            stream: true,
            messages,
          },
          {
            signal: abortControllerRef.current.signal,
          }
        );

        let streamedContent = '';

        for await (const chunk of stream) {
          // Check if the request was cancelled
          if (abortControllerRef.current?.signal.aborted) {
            break;
          }

          const delta = chunk.choices[0]?.delta?.content;
          if (delta) {
            streamedContent += delta;
            dispatch(updateStreamingMessage(conversationId, streamedContent));
          }
        }

        // Only set streaming to false if not aborted
        if (!abortControllerRef.current?.signal.aborted) {
          dispatch(setStreaming(false));
          abortControllerRef.current = null;
        }
      } catch (err) {
        // Check if error is due to cancellation
        if (err instanceof Error && err.name === 'AbortError') {
          dispatch(setError('Response generation was cancelled'));
        } else {
          const errorMessage =
            err instanceof Error ? err.message : 'Failed to send message';
          dispatch(setError(errorMessage));
        }
        dispatch(setStreaming(false));
        abortControllerRef.current = null;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [
      handleClearCurrentMessage,
      generateId,
      state.conversations,
      chatId,
      updateChatTabLabel,
      getChatTab,
    ]
  );

  const handleSetEditingMessageId = useCallback((id: string | null) => {
    dispatch(setEditingMessageId(id));
  }, []);

  const handleClearMessages = useCallback(async () => {
    dispatch(clearMessages());

    // Also clear from IndexedDB if chatId exists
    if (chatId && chatStorage.isSupported()) {
      try {
        await chatStorage.deleteChat(chatId);
      } catch (error) {
        console.error('Failed to clear chat from IndexedDB:', error);
      }
    }
  }, [chatId]);

  const contextValue: ChatContextType = {
    conversations: state.conversations,
    currentMessage: state.currentMessage,
    isLoading: state.isLoading,
    isStreaming: state.isStreaming,
    error: state.error,
    editingMessageId: state.editingMessageId,
    handleSetCurrentMessage,
    handleSendMessage,
    handleClearMessages,
    handleAddConversation,
    handleClearCurrentMessage,
    handleSetEditingMessageId,
    handleUpdateEditingMessage,
    handleCancelStreaming,
    saveConversationsToStorage,
  };

  return (
    <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
  );
};

export const useChatContext = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

export default ChatContext;
