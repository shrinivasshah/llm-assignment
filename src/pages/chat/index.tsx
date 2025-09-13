import { useEffect } from 'react';
import { useLoaderData } from 'react-router';
import Chat from '@/components/chat/chat';
import { ChatProvider } from '@/context/chat-context';
import { useChatTabsContext } from '@/context/chat-tabs-context';
import type { ChatLoaderData } from '@/loaders/chatLoader';

const ChatPage = () => {
  const { chatId, storedChat } = useLoaderData() as ChatLoaderData;
  const { addChatTab, getChatTab } = useChatTabsContext();

  useEffect(() => {
    const existingTab = getChatTab(chatId);
    if (!existingTab) {
      if (storedChat && storedChat.title && storedChat.title !== 'New Chat') {
        addChatTab(chatId, storedChat.title);
      } else {
        addChatTab(chatId);
      }
    }
  }, [chatId, storedChat, addChatTab, getChatTab]);

  return (
    <ChatProvider chatId={chatId}>
      <Chat />
    </ChatProvider>
  );
};

export default ChatPage;
