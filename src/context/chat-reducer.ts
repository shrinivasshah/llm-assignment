import type {
  ChatAction,
  ChatState,
  ConversationPair,
  TabConversations,
} from './types';
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

const updateTabConversation = (
  tabs: TabConversations,
  tabId: string,
  conversationId: string,
  content: string,
  sender?: EChatUserType
): TabConversations => {
  if (!tabs[tabId]) return tabs;

  return {
    ...tabs,
    [tabId]: updateConversationMessage(
      tabs[tabId],
      conversationId,
      content,
      sender
    ),
  };
};

export const chatReducer = (
  state: ChatState,
  action: ChatAction
): ChatState => {
  switch (action.type) {
    case ChatActionType.SET_TABS:
      return updateState(state, 'tabs', action.payload);

    case ChatActionType.CREATE_TAB:
      return updateState(state, 'tabs', {
        ...state.tabs,
        [action.payload]: [],
      });

    case ChatActionType.REMOVE_TAB: {
      const newTabs = { ...state.tabs };
      delete newTabs[action.payload];
      const newState = updateState(state, 'tabs', newTabs);

      if (state.activeTabId === action.payload) {
        const remainingTabs = Object.keys(newTabs);
        return updateState(
          newState,
          'activeTabId',
          remainingTabs.length > 0 ? remainingTabs[0] : null
        );
      }

      return newState;
    }

    case ChatActionType.SET_ACTIVE_TAB:
      return updateState(state, 'activeTabId', action.payload);

    case ChatActionType.SET_CONVERSATIONS:
      return updateState(state, 'tabs', {
        ...state.tabs,
        [action.payload.tabId]: action.payload.conversations,
      });

    case ChatActionType.ADD_CONVERSATION:
      return updateState(state, 'tabs', {
        ...state.tabs,
        [action.payload.tabId]: [
          ...(state.tabs[action.payload.tabId] || []),
          action.payload.conversation,
        ],
      });

    case ChatActionType.SET_CURRENT_MESSAGE:
      return updateState(state, 'currentMessage', action.payload);

    case ChatActionType.CLEAR_CURRENT_MESSAGE:
      return updateState(state, 'currentMessage', '');

    case ChatActionType.SET_LOADING:
      return updateState(state, 'isLoading', action.payload);

    case ChatActionType.SET_STREAMING:
      return updateState(state, 'isStreaming', action.payload);

    case ChatActionType.UPDATE_STREAMING_MESSAGE:
      return updateState(
        state,
        'tabs',
        updateTabConversation(
          state.tabs,
          action.payload.tabId,
          action.payload.conversationId,
          action.payload.content
        )
      );

    case ChatActionType.UPDATE_EDITING_MESSAGE:
      return updateState(
        state,
        'tabs',
        updateTabConversation(
          state.tabs,
          action.payload.tabId,
          action.payload.conversationId,
          action.payload.content,
          action.payload.sender
        )
      );

    case ChatActionType.SET_ERROR:
      return updateState(state, 'error', action.payload);

    case ChatActionType.CLEAR_MESSAGES:
      if (action.payload) {
        return updateState(state, 'tabs', {
          ...state.tabs,
          [action.payload]: [],
        });
      } else {
        const clearedTabs: TabConversations = {};
        Object.keys(state.tabs).forEach(tabId => {
          clearedTabs[tabId] = [];
        });
        return { ...state, tabs: clearedTabs, error: null };
      }

    case ChatActionType.SET_EDITING_MESSAGE_ID:
      return updateState(state, 'editingMessageId', action.payload);

    default:
      return state;
  }
};
