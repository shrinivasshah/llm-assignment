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

export type ChatboxProps = {
  conversations?: ConversationPair[];
};

export type ChatContextType = {
  conversations: ConversationPair[];
  currentMessage: string;
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  editingMessageId: string | null;
  handleSetCurrentMessage: (message: string) => void;
  handleSendMessage: (content: string) => Promise<void>;
  handleClearMessages: () => void;
  handleAddConversation: (
    conversation: Omit<ConversationPair, 'timestamp'>
  ) => void;
  handleClearCurrentMessage: () => void;
  handleSetEditingMessageId: (id: string | null) => void;
  handleUpdateEditingMessage: (id: string, content: string) => void;
};

export type ChatProviderProps = {
  children: ReactNode;
};

export type ChatAction =
  | { type: ChatActionType.SET_CONVERSATIONS; payload: ConversationPair[] }
  | { type: ChatActionType.ADD_CONVERSATION; payload: ConversationPair }
  | { type: ChatActionType.SET_CURRENT_MESSAGE; payload: string }
  | { type: ChatActionType.CLEAR_CURRENT_MESSAGE }
  | { type: ChatActionType.SET_LOADING; payload: boolean }
  | { type: ChatActionType.SET_STREAMING; payload: boolean }
  | {
      type: ChatActionType.UPDATE_STREAMING_MESSAGE;
      payload: { conversationId: string; content: string };
    }
  | { type: ChatActionType.SET_ERROR; payload: string | null }
  | { type: ChatActionType.CLEAR_MESSAGES }
  | { type: ChatActionType.SET_EDITING_MESSAGE_ID; payload: string | null }
  | {
      type: ChatActionType.UPDATE_EDITING_MESSAGE;
      payload: {
        conversationId: string;
        content: string;
        sender: EChatUserType;
      };
    };

export type ChatState = {
  conversations: ConversationPair[];
  currentMessage: string;
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  editingMessageId: string | null;
};
