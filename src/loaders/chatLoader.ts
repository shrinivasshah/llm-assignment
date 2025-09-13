import type { LoaderFunctionArgs } from 'react-router';
import { chatStorage } from '@/utils/indexeddb';
import type { ConversationPair } from '@/context/types';

export interface ChatLoaderData {
  chatId: string;
  storedChat: {
    id: string;
    title: string;
    conversations: ConversationPair[];
  } | null;
}

export const chatLoader = async ({
  params,
}: LoaderFunctionArgs): Promise<ChatLoaderData> => {
  const { id } = params;

  if (!id) {
    throw new Error('Chat ID is required');
  }

  let storedChat = null;

  if (chatStorage.isSupported()) {
    try {
      await chatStorage.init();
      storedChat = await chatStorage.loadChat(id);
    } catch (error) {
      console.error('Failed to load stored chat:', error);
      // Don't throw here, just return null for storedChat
    }
  }

  return {
    chatId: id,
    storedChat,
  };
};
