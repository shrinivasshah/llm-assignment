import {
  createContext,
  useContext,
  useReducer,
  useCallback,
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
import { EChatUserType } from './enums';
import {
  createTab,
  setActiveTab,
  removeTab,
  addConversation,
  setCurrentMessage,
  clearCurrentMessage,
  setLoading,
  setError,
  setStreaming,
  clearMessages,
  setEditingMessageId,
  updateEditingMessage,
  updateStreamingMessage,
} from './chat-actions';
import { client } from '@/utils/openai';
import { SYSTEM_PROMPT } from '@/constants/openai';

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const initialState: ChatState = {
  tabs: {},
  activeTabId: null,
  currentMessage: '',
  isLoading: false,
  isStreaming: false,
  error: null,
  editingMessageId: null,
};

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const abortControllerRef = useRef<AbortController | null>(null);

  const handleCreateTab = useCallback(
    (tabId: string) => {
      dispatch(createTab(tabId));
      if (!state.activeTabId) {
        dispatch(setActiveTab(tabId));
      }
    },
    [state.activeTabId]
  );

  const handleSetActiveTab = useCallback((tabId: string) => {
    dispatch(setActiveTab(tabId));
  }, []);

  const handleRemoveTab = useCallback((tabId: string) => {
    dispatch(removeTab(tabId));
  }, []);

  const getTabIds = useCallback((): string[] => {
    return Object.keys(state.tabs);
  }, [state.tabs]);

  const getActiveTabConversations = useCallback((): ConversationPair[] => {
    if (!state.activeTabId || !state.tabs[state.activeTabId]) {
      return [];
    }
    return state.tabs[state.activeTabId];
  }, [state.tabs, state.activeTabId]);

  const handleSetCurrentMessage = useCallback((message: string) => {
    dispatch(setCurrentMessage(message));
  }, []);

  const handleSendMessage = useCallback(
    async (content: string, tabId?: string): Promise<void> => {
      if (!content.trim()) return;

      const targetTabId = tabId || state.activeTabId;
      if (!targetTabId) {
        const defaultTabId = `tab-${Date.now()}`;
        dispatch(createTab(defaultTabId));
        dispatch(setActiveTab(defaultTabId));
        return handleSendMessage(content, defaultTabId);
      }

      dispatch(setError(null));
      dispatch(setLoading(true));

      try {
        const userMessage: Message = {
          id: `user-${Date.now()}`,
          content: content.trim(),
          sender: EChatUserType.USER,
          timestamp: new Date(),
        };

        // Create the conversation pair with empty system message first
        const conversationId = `conv-${Date.now()}`;
        const systemMessage: Message = {
          id: `system-${Date.now()}`,
          content: '',
          sender: EChatUserType.SYSTEM,
          timestamp: new Date(),
        };

        const conversationPair: ConversationPair = {
          id: conversationId,
          user: userMessage,
          system: systemMessage,
          timestamp: new Date(),
        };

        // Add the conversation with empty system message to the specific tab
        dispatch(addConversation(targetTabId, conversationPair));
        dispatch(setLoading(false));
        dispatch(setStreaming(true));

        // Create abort controller for this request
        abortControllerRef.current = new AbortController();

        const completion = await client.chat.completions.create(
          {
            model: 'gpt-4o-mini',
            stream: true,
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content },
            ],
          },
          {
            signal: abortControllerRef.current.signal,
          }
        );

        let accumulatedContent = '';

        // Process the stream
        for await (const chunk of completion) {
          if (abortControllerRef.current?.signal.aborted) {
            break;
          }

          const delta = chunk.choices[0]?.delta?.content;
          if (delta) {
            accumulatedContent += delta;
            dispatch(
              updateStreamingMessage(
                targetTabId,
                conversationId,
                accumulatedContent
              )
            );
          }
        }

        dispatch(setStreaming(false));
        dispatch(clearCurrentMessage());
        abortControllerRef.current = null;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          // Request was cancelled, don't show error
          dispatch(setStreaming(false));
        } else {
          dispatch(
            setError(
              error instanceof Error ? error.message : 'An error occurred'
            )
          );
          dispatch(setStreaming(false));
        }
        dispatch(setLoading(false));
        abortControllerRef.current = null;
      }
    },
    [state.activeTabId]
  );

  const handleClearMessages = useCallback((tabId?: string) => {
    dispatch(clearMessages(tabId));
    dispatch(clearCurrentMessage());
    dispatch(setError(null));
  }, []);

  const handleAddConversation = useCallback(
    (conversation: Omit<ConversationPair, 'timestamp'>, tabId?: string) => {
      const targetTabId = tabId || state.activeTabId;
      if (!targetTabId) {
        // Create a default tab if none exists
        const defaultTabId = `tab-${Date.now()}`;
        dispatch(createTab(defaultTabId));
        dispatch(setActiveTab(defaultTabId));
        return handleAddConversation(conversation, defaultTabId);
      }

      const conversationWithTimestamp: ConversationPair = {
        ...conversation,
        timestamp: new Date(),
      };
      dispatch(addConversation(targetTabId, conversationWithTimestamp));
    },
    [state.activeTabId]
  );

  const handleClearCurrentMessage = useCallback(() => {
    dispatch(clearCurrentMessage());
  }, []);

  const handleSetEditingMessageId = useCallback((id: string | null) => {
    dispatch(setEditingMessageId(id));
  }, []);

  const handleUpdateEditingMessage = useCallback(
    async (id: string, content: string) => {
      let targetTabId: string | null = null;
      let conversation: ConversationPair | null = null;

      for (const tabId of Object.keys(state.tabs)) {
        const foundConversation = state.tabs[tabId].find(
          conv => conv.user?.id === id || conv.system?.id === id
        );
        if (foundConversation) {
          targetTabId = tabId;
          conversation = foundConversation;
          break;
        }
      }

      if (conversation && targetTabId) {
        const isUserMessage = conversation.user?.id === id;
        const sender = isUserMessage
          ? EChatUserType.USER
          : EChatUserType.SYSTEM;

        dispatch(
          updateEditingMessage(targetTabId, conversation.id, content, sender)
        );

        dispatch(setEditingMessageId(null));
        dispatch(clearCurrentMessage());

        if (isUserMessage && content.trim()) {
          dispatch(setLoading(true));
          dispatch(setError(null));

          try {
            const currentTab = state.tabs[targetTabId];
            const conversationIndex = currentTab.findIndex(
              conv => conv.id === conversation.id
            );
            const previousConversations = currentTab.slice(
              0,
              conversationIndex
            );

            const messages: Array<{
              role: EChatUserType;
              content: string;
            }> = [{ role: EChatUserType.SYSTEM, content: SYSTEM_PROMPT }];

            previousConversations.forEach(conv => {
              if (conv.user?.content) {
                messages.push({
                  role: EChatUserType.USER,
                  content: conv.user.content,
                });
              }
              if (conv.system?.content) {
                messages.push({
                  role: EChatUserType.SYSTEM,
                  content: conv.system.content,
                });
              }
            });

            messages.push({ role: EChatUserType.USER, content: content });

            dispatch(setLoading(false));
            dispatch(setStreaming(true));

            abortControllerRef.current = new AbortController();

            const completion = await client.chat.completions.create(
              {
                model: 'gpt-4o-mini',
                stream: true,
                messages,
              },
              {
                signal: abortControllerRef.current.signal,
              }
            );

            let accumulatedContent = '';
            for await (const chunk of completion) {
              if (abortControllerRef.current?.signal.aborted) {
                break;
              }

              const delta = chunk.choices[0]?.delta?.content;
              if (delta) {
                accumulatedContent += delta;
                dispatch(
                  updateStreamingMessage(
                    targetTabId,
                    conversation.id,
                    accumulatedContent
                  )
                );
              }
            }

            dispatch(setStreaming(false));
            abortControllerRef.current = null;
          } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
              dispatch(setStreaming(false));
            } else {
              dispatch(
                setError(
                  error instanceof Error
                    ? error.message
                    : 'An error occurred while regenerating response'
                )
              );
              dispatch(setStreaming(false));
            }
            dispatch(setLoading(false));
            abortControllerRef.current = null;
          }
        }
      }
    },
    [state.tabs]
  );

  const handleCancelStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    dispatch(setStreaming(false));
    dispatch(setLoading(false));
  }, []);

  const contextValue: ChatContextType = {
    tabs: state.tabs,
    activeTabId: state.activeTabId,
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
    handleCreateTab,
    handleSetActiveTab,
    handleRemoveTab,
    getTabIds,
    getActiveTabConversations,
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
