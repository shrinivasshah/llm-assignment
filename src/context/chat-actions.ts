import { ChatActionType } from './enums';
import type { ChatAction, ConversationPair } from './types';
import type { EChatUserType } from './enums';

export const setConversations = (
  conversations: ConversationPair[]
): ChatAction => ({
  type: ChatActionType.SET_CONVERSATIONS,
  payload: conversations,
});

export const addConversation = (
  conversation: ConversationPair
): ChatAction => ({
  type: ChatActionType.ADD_CONVERSATION,
  payload: conversation,
});

export const setCurrentMessage = (message: string): ChatAction => ({
  type: ChatActionType.SET_CURRENT_MESSAGE,
  payload: message,
});

export const clearCurrentMessage = (): ChatAction => ({
  type: ChatActionType.CLEAR_CURRENT_MESSAGE,
});

export const setLoading = (isLoading: boolean): ChatAction => ({
  type: ChatActionType.SET_LOADING,
  payload: isLoading,
});

export const setStreaming = (isStreaming: boolean): ChatAction => ({
  type: ChatActionType.SET_STREAMING,
  payload: isStreaming,
});

export const updateStreamingMessage = (
  conversationId: string,
  content: string
): ChatAction => ({
  type: ChatActionType.UPDATE_STREAMING_MESSAGE,
  payload: { conversationId, content },
});

export const setError = (error: string | null): ChatAction => ({
  type: ChatActionType.SET_ERROR,
  payload: error,
});

export const clearMessages = (): ChatAction => ({
  type: ChatActionType.CLEAR_MESSAGES,
});

export const setEditingMessageId = (id: string | null): ChatAction => ({
  type: ChatActionType.SET_EDITING_MESSAGE_ID,
  payload: id,
});

export const updateEditingMessage = (
  conversationId: string,
  content: string,
  sender: EChatUserType
): ChatAction => ({
  type: ChatActionType.UPDATE_EDITING_MESSAGE,
  payload: { conversationId, content, sender },
});
