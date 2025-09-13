import { createContext, useContext, useReducer, useCallback } from 'react';
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

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

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

  // Isolated streaming logic function
  const streamLLMResponse = useCallback(
    async (conversationId: string, conversationsToUse?: ConversationPair[]) => {
      try {
        dispatch(setStreaming(true));
        dispatch(setError(null));

        // Use provided conversations or current state
        const conversations = conversationsToUse || state.conversations;

        // Build messages array for API call
        const messages: Array<{
          role: EChatUserType;
          content: string;
        }> = [
          {
            role: EChatUserType.SYSTEM,
            content: SYSTEM_PROMPT,
          },
        ];

        // Add conversation history up to and including the target conversation
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

        const stream = await client.chat.completions.create({
          model: 'gpt-4o',
          stream: true,
          messages,
        });

        let streamedContent = '';

        // Reset the LLM message content before streaming
        dispatch(updateStreamingMessage(conversationId, ''));

        // Process streaming response
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) {
            streamedContent += delta;
            dispatch(updateStreamingMessage(conversationId, streamedContent));
          }
        }

        dispatch(setStreaming(false));
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to generate response';
        dispatch(setError(errorMessage));
        dispatch(setStreaming(false));
      }
    },
    [state.conversations]
  );

  const handleUpdateEditingMessage = useCallback(
    (id: string, content: string) => {
      // Find the conversation and determine which message to update
      const conversation = state.conversations.find(
        conv => conv.user?.id === id || conv.system?.id === id
      );

      if (conversation) {
        const sender =
          conversation.user?.id === id
            ? EChatUserType.USER
            : EChatUserType.SYSTEM;
        dispatch(updateEditingMessage(conversation.id, content, sender));

        // If updating a user message, retrigger the LLM response
        if (sender === EChatUserType.USER) {
          // Create updated conversations array with the new user message content
          const updatedConversations = state.conversations.map(conv => {
            if (conv.id === conversation.id) {
              return {
                ...conv,
                user: conv.user ? { ...conv.user, content } : conv.user,
              };
            }
            return conv;
          });

          // Use setTimeout to ensure state update completes first
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
        // Create a new conversation ID
        const conversationId = generateId();

        // Create user message
        const userMessage: Message = generateUser({
          id: generateId(),
          content: trimmedContent,
          sender: EChatUserType.USER,
          timestamp: new Date(),
        });

        // Create empty LLM message for streaming
        const llmMessage: Message = generateUser({
          id: generateId(),
          content: '',
          sender: EChatUserType.SYSTEM,
          timestamp: new Date(),
        });

        // Create conversation pair
        const newConversation: ConversationPair = {
          id: conversationId,
          user: userMessage,
          system: llmMessage,
          timestamp: new Date(),
        };

        // Add the conversation
        dispatch(addConversation(newConversation));

        // Clear the current message input immediately
        handleClearCurrentMessage();

        // Stop loading and start streaming
        dispatch(setLoading(false));
        dispatch(setStreaming(true));

        // Build messages array for API call from all conversations
        const messages: Array<{
          role: EChatUserType;
          content: string;
        }> = [
          {
            role: EChatUserType.SYSTEM,
            content: SYSTEM_PROMPT,
          },
        ];

        // Add conversation history from current state
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

        // Add the current user message
        messages.push({ role: EChatUserType.USER, content: trimmedContent });

        const stream = await client.chat.completions.create({
          model: 'gpt-4o',
          stream: true,
          messages,
        });

        let streamedContent = '';

        // Process streaming response
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) {
            streamedContent += delta;
            dispatch(updateStreamingMessage(conversationId, streamedContent));
          }
        }

        dispatch(setStreaming(false));
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to send message';
        dispatch(setError(errorMessage));
        dispatch(setStreaming(false));
      } finally {
        dispatch(setLoading(false));
      }
    },
    [handleClearCurrentMessage, generateId, state.conversations]
  );

  const handleSetEditingMessageId = useCallback((id: string | null) => {
    dispatch(setEditingMessageId(id));
  }, []);

  const handleClearMessages = useCallback(() => {
    dispatch(clearMessages());
  }, []);

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
