import { useEffect } from 'react';
import { useParams } from 'react-router';
import Chat from '@/components/chat/chat';
import { ChatProvider } from '@/context/chat-context';
import { useChatTabsContext } from '@/context/chat-tabs-context';

const ChatPage = () => {
  const { id } = useParams<{ id: string }>();
  const { addChatTab, getChatTab } = useChatTabsContext();

  useEffect(() => {
    if (id) {
      // Check if tab already exists, if not create it
      const existingTab = getChatTab(id);
      if (!existingTab) {
        addChatTab(id);
      }
    }
  }, [id, addChatTab, getChatTab]);

  if (!id) {
    return <div>Invalid chat ID</div>;
  }

  return (
    <ChatProvider chatId={id}>
      <Chat />
    </ChatProvider>
  );
};

export default ChatPage;
