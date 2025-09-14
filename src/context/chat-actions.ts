import { ChatActionType } from './enums';
import type { ChatAction, ConversationPair, TabConversations } from './types';
import type { EChatUserType } from './enums';

// TABS
export const setTabs = (tabs: TabConversations): ChatAction => ({
  type: ChatActionType.SET_TABS,
  payload: tabs,
});

export const createTab = (tabId: string): ChatAction => ({
  type: ChatActionType.CREATE_TAB,
  payload: tabId,
});

export const removeTab = (tabId: string): ChatAction => ({
  type: ChatActionType.REMOVE_TAB,
  payload: tabId,
});

export const setActiveTab = (tabId: string): ChatAction => ({
  type: ChatActionType.SET_ACTIVE_TAB,
  payload: tabId,
});

// CONVERSATIONS
export const setConversations = (
  tabId: string,
  conversations: ConversationPair[]
): ChatAction => ({
  type: ChatActionType.SET_CONVERSATIONS,
  payload: { tabId, conversations },
});

export const addConversation = (
  tabId: string,
  conversation: ConversationPair
): ChatAction => ({
  type: ChatActionType.ADD_CONVERSATION,
  payload: { tabId, conversation },
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
  tabId: string,
  conversationId: string,
  content: string
): ChatAction => ({
  type: ChatActionType.UPDATE_STREAMING_MESSAGE,
  payload: { tabId, conversationId, content },
});

export const setError = (error: string | null): ChatAction => ({
  type: ChatActionType.SET_ERROR,
  payload: error,
});

export const clearMessages = (tabId?: string): ChatAction => ({
  type: ChatActionType.CLEAR_MESSAGES,
  payload: tabId,
});

export const setEditingMessageId = (id: string | null): ChatAction => ({
  type: ChatActionType.SET_EDITING_MESSAGE_ID,
  payload: id,
});

export const updateEditingMessage = (
  tabId: string,
  conversationId: string,
  content: string,
  sender: EChatUserType
): ChatAction => ({
  type: ChatActionType.UPDATE_EDITING_MESSAGE,
  payload: { tabId, conversationId, content, sender },
});
