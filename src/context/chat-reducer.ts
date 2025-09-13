import type { ChatAction, ChatState, ConversationPair } from './types';
import { ChatActionType } from './enums';
import { EChatUserType } from './enums';

const updateState = <K extends keyof ChatState>(
  state: ChatState,
  key: K,
  value: ChatState[K]
): ChatState => ({
  ...state,
  [key]: value,
});

const updateConversationMessage = (
  conversations: ConversationPair[],
  conversationId: string,
  content: string,
  sender?: EChatUserType
): ConversationPair[] =>
  conversations.map(conversation => {
    if (conversation.id === conversationId) {
      const updatedConversation = { ...conversation };

      if (sender === EChatUserType.USER && updatedConversation.user) {
        updatedConversation.user = { ...updatedConversation.user, content };
      } else if (
        sender === EChatUserType.SYSTEM &&
        updatedConversation.system
      ) {
        updatedConversation.system = { ...updatedConversation.system, content };
      } else if (!sender && updatedConversation.system) {
        updatedConversation.system = { ...updatedConversation.system, content };
      }

      return updatedConversation;
    }
    return conversation;
  });

const updateStateWithConversationUpdate = (
  state: ChatState,
  conversationId: string,
  content: string,
  sender?: EChatUserType
): ChatState => ({
  ...state,
  conversations: updateConversationMessage(
    state.conversations,
    conversationId,
    content,
    sender
  ),
});

export const chatReducer = (
  state: ChatState,
  action: ChatAction
): ChatState => {
  switch (action.type) {
    case ChatActionType.SET_CONVERSATIONS:
      return updateState(state, 'conversations', action.payload);

    case ChatActionType.ADD_CONVERSATION:
      return updateState(state, 'conversations', [
        ...state.conversations,
        action.payload,
      ]);

    case ChatActionType.SET_CURRENT_MESSAGE:
      return updateState(state, 'currentMessage', action.payload);

    case ChatActionType.CLEAR_CURRENT_MESSAGE:
      return updateState(state, 'currentMessage', '');

    case ChatActionType.SET_LOADING:
      return updateState(state, 'isLoading', action.payload);

    case ChatActionType.SET_STREAMING:
      return updateState(state, 'isStreaming', action.payload);

    case ChatActionType.UPDATE_STREAMING_MESSAGE:
      return updateStateWithConversationUpdate(
        state,
        action.payload.conversationId,
        action.payload.content
      );

    case ChatActionType.UPDATE_EDITING_MESSAGE:
      return updateStateWithConversationUpdate(
        state,
        action.payload.conversationId,
        action.payload.content,
        action.payload.sender
      );

    case ChatActionType.SET_ERROR:
      return updateState(state, 'error', action.payload);

    case ChatActionType.CLEAR_MESSAGES:
      return { ...state, conversations: [], error: null };

    case ChatActionType.SET_EDITING_MESSAGE_ID:
      return updateState(state, 'editingMessageId', action.payload);

    default:
      return state;
  }
};
