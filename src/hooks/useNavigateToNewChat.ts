import { useNavigate } from 'react-router';
import { useChatContext } from '@/context/chat-context';

export const useNavigateToNewChat = () => {
  const navigate = useNavigate();
  const { handleCreateTab, handleSetActiveTab } = useChatContext();

  const navigateToNewChat = (_label?: string) => {
    const tabId = `tab-${Date.now()}`;
    handleCreateTab(tabId);
    handleSetActiveTab(tabId);
    void navigate(`/${tabId}`);
    return tabId;
  };

  return navigateToNewChat;
};
