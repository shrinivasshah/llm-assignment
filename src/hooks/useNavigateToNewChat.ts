import { useNavigate } from 'react-router';
import { useChatTabsContext } from '@/context/chat-tabs-context';

export const useNavigateToNewChat = () => {
  const navigate = useNavigate();
  const { addChatTab } = useChatTabsContext();

  const navigateToNewChat = (label?: string) => {
    const chatId = crypto.randomUUID();
    addChatTab(chatId, label);
    void navigate(`/${chatId}`);
    return chatId;
  };

  return navigateToNewChat;
};
