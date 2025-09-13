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
  const { updateChatTabLabel } = useChatTabsContext();

  // AbortController to cancel streaming requests
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize IndexedDB and load chat data
  useEffect(() => {
    const initializeStorage = async () => {
      try {
        if (!chatStorage.isSupported()) {
          console.warn('IndexedDB not supported, chats will not persist');
          return;
        }

        await chatStorage.init();

        if (chatId) {
          const storedChat = await chatStorage.loadChat(chatId);
          if (storedChat) {
            dispatch(setConversations(storedChat.conversations));
          }
        }
      } catch (error) {
        console.error('Failed to initialize chat storage:', error);
        dispatch(setError('Failed to load chat history'));
      }
    };

    initializeStorage();
  }, [chatId]);

  // Save conversations to IndexedDB whenever they change
  useEffect(() => {
    const saveConversations = async () => {
      if (
        !chatId ||
        state.conversations.length === 0 ||
        !chatStorage.isSupported()
      ) {
        return;
      }

      try {
        // Get chat title from first conversation or use default
        const chatTitle = state.conversations[0]?.user?.content
          ? extractChatTitle(state.conversations[0].user.content)
          : 'New Chat';

        await chatStorage.saveChat(chatId, chatTitle, state.conversations);
      } catch (error) {
        console.error('Failed to save chat to IndexedDB:', error);
      }
    };

    // Debounce saves to avoid excessive writes during streaming
    const timeoutId = setTimeout(saveConversations, 1000);
    return () => clearTimeout(timeoutId);
  }, [chatId, state.conversations]);

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
              content: conversation.user.content,
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
          const chatTitle = extractChatTitle(trimmedContent);
          updateChatTabLabel(chatId, chatTitle);
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
              content: conversation.user.content,
            });
          }
          if (conversation.system?.content) {
            messages.push({
              role: EChatUserType.SYSTEM,
              content: conversation.system.content,
            });
          }
        });

        messages.push({ role: EChatUserType.USER, content: trimmedContent });

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
