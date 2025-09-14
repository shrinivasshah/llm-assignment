import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import Chat from '@/components/chat/chat';
import { useChatContext } from '@/context/chat-context';

const ChatPage = () => {
  const { tabId } = useParams<{ tabId: string }>();
  const navigate = useNavigate();
  const { handleCreateTab, handleSetActiveTab, getTabIds } = useChatContext();

  useEffect(() => {
    if (tabId) {
      const existingTabIds = getTabIds();
      if (!existingTabIds.includes(tabId)) {
        if (existingTabIds.length === 0) {
          navigate('/', { replace: true });
          return;
        }
        handleCreateTab(tabId);
      }
      handleSetActiveTab(tabId);
    }
  }, [tabId, handleCreateTab, handleSetActiveTab, getTabIds, navigate]);

  return <Chat />;
};

export default ChatPage;
