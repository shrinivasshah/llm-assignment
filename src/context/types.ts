import type { ReactNode } from 'react';
import type { ChatActionType } from './enums';
import type { EChatUserType } from './enums';
export type Message = {
  id: string;
  content: string;
  sender: EChatUserType;
  timestamp: Date;
};

export type ConversationPair = {
  id: string;
  user?: Message;
  system?: Message;
  timestamp: Date;
};

export type TabConversations = Record<string, ConversationPair[]>;

export type ChatboxProps = {
  conversations?: ConversationPair[];
};

export type ChatContextType = {
  tabs: TabConversations;
  activeTabId: string | null;
  currentMessage: string;
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  editingMessageId: string | null;
  handleSetCurrentMessage: (message: string) => void;
  handleSendMessage: (content: string, tabId?: string) => Promise<void>;
  handleClearMessages: (tabId?: string) => void;
  handleAddConversation: (
    conversation: Omit<ConversationPair, 'timestamp'>,
    tabId?: string
  ) => void;
  handleClearCurrentMessage: () => void;
  handleSetEditingMessageId: (id: string | null) => void;
  handleUpdateEditingMessage: (id: string, content: string) => Promise<void>;
  handleCancelStreaming: () => void;
  handleCreateTab: (tabId: string) => void;
  handleSetActiveTab: (tabId: string) => void;
  handleRemoveTab: (tabId: string) => void;
  getTabIds: () => string[];
  getActiveTabConversations: () => ConversationPair[];
};

export type ChatProviderProps = {
  children: ReactNode;
  chatId?: string;
};

export type ChatAction =
  | { type: ChatActionType.SET_TABS; payload: TabConversations }
  | { type: ChatActionType.CREATE_TAB; payload: string }
  | { type: ChatActionType.REMOVE_TAB; payload: string }
  | { type: ChatActionType.SET_ACTIVE_TAB; payload: string }
  | {
      type: ChatActionType.SET_CONVERSATIONS;
      payload: { tabId: string; conversations: ConversationPair[] };
    }
  | {
      type: ChatActionType.ADD_CONVERSATION;
      payload: { tabId: string; conversation: ConversationPair };
    }
  | { type: ChatActionType.SET_CURRENT_MESSAGE; payload: string }
  | { type: ChatActionType.CLEAR_CURRENT_MESSAGE }
  | { type: ChatActionType.SET_LOADING; payload: boolean }
  | { type: ChatActionType.SET_STREAMING; payload: boolean }
  | {
      type: ChatActionType.UPDATE_STREAMING_MESSAGE;
      payload: { tabId: string; conversationId: string; content: string };
    }
  | { type: ChatActionType.SET_ERROR; payload: string | null }
  | { type: ChatActionType.CLEAR_MESSAGES; payload?: string }
  | { type: ChatActionType.SET_EDITING_MESSAGE_ID; payload: string | null }
  | {
      type: ChatActionType.UPDATE_EDITING_MESSAGE;
      payload: {
        tabId: string;
        conversationId: string;
        content: string;
        sender: EChatUserType;
      };
    };

export type ChatState = {
  tabs: TabConversations;
  activeTabId: string | null;
  currentMessage: string;
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  editingMessageId: string | null;
};
