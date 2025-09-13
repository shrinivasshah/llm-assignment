import { chatStorage, type StoredChat } from '@/utils/indexeddb';
import type { EChatUserType } from '@/context/enums';

// Export chat data as JSON for backup purposes
export const exportChatData = async (): Promise<string> => {
  if (!chatStorage.isSupported()) {
    throw new Error('IndexedDB not supported');
  }

  try {
    const chats = await chatStorage.loadAllChats();
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      chats: chats.map(chat => ({
        ...chat,
        createdAt: chat.createdAt.toISOString(),
        updatedAt: chat.updatedAt.toISOString(),
        conversations: chat.conversations.map(conv => ({
          ...conv,
          timestamp: conv.timestamp.toISOString(),
          user: conv.user
            ? {
                ...conv.user,
                timestamp: conv.user.timestamp.toISOString(),
              }
            : undefined,
          system: conv.system
            ? {
                ...conv.system,
                timestamp: conv.system.timestamp.toISOString(),
              }
            : undefined,
        })),
      })),
    };

    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Failed to export chat data:', error);
    throw new Error('Failed to export chat data');
  }
};

// Import chat data from JSON
export const importChatData = async (jsonData: string): Promise<void> => {
  if (!chatStorage.isSupported()) {
    throw new Error('IndexedDB not supported');
  }

  try {
    const importData = JSON.parse(jsonData) as {
      version?: string;
      exportDate?: string;
      chats?: Array<{
        id: string;
        title: string;
        createdAt: string;
        updatedAt: string;
        conversations: Array<{
          id: string;
          timestamp: string;
          user?: {
            id: string;
            content: string;
            sender: string;
            timestamp: string;
          };
          system?: {
            id: string;
            content: string;
            sender: string;
            timestamp: string;
          };
        }>;
      }>;
    };

    if (!importData.chats || !Array.isArray(importData.chats)) {
      throw new Error('Invalid chat data format');
    }

    for (const chatData of importData.chats) {
      const chat: StoredChat = {
        id: chatData.id,
        title: chatData.title,
        createdAt: new Date(chatData.createdAt),
        updatedAt: new Date(chatData.updatedAt),
        conversations: chatData.conversations.map(conv => ({
          id: conv.id,
          timestamp: new Date(conv.timestamp),
          user: conv.user
            ? {
                id: conv.user.id,
                content: conv.user.content,
                sender: conv.user.sender as EChatUserType,
                timestamp: new Date(conv.user.timestamp),
              }
            : undefined,
          system: conv.system
            ? {
                id: conv.system.id,
                content: conv.system.content,
                sender: conv.system.sender as EChatUserType,
                timestamp: new Date(conv.system.timestamp),
              }
            : undefined,
        })),
      };

      await chatStorage.saveChat(chat.id, chat.title, chat.conversations);
    }
  } catch (error) {
    console.error('Failed to import chat data:', error);
    throw new Error('Failed to import chat data');
  }
};

// Get storage usage statistics
export const getStorageStats = async (): Promise<{
  chatCount: number;
  totalMessages: number;
  oldestChat?: Date;
  newestChat?: Date;
}> => {
  if (!chatStorage.isSupported()) {
    return {
      chatCount: 0,
      totalMessages: 0,
    };
  }

  try {
    const chats = await chatStorage.loadAllChats();

    const totalMessages = chats.reduce((total, chat) => {
      return (
        total +
        chat.conversations.reduce((convTotal, conv) => {
          return convTotal + (conv.user ? 1 : 0) + (conv.system ? 1 : 0);
        }, 0)
      );
    }, 0);

    const dates = chats
      .map(chat => chat.createdAt)
      .sort((a, b) => a.getTime() - b.getTime());

    return {
      chatCount: chats.length,
      totalMessages,
      oldestChat: dates[0],
      newestChat: dates[dates.length - 1],
    };
  } catch (error) {
    console.error('Failed to get storage stats:', error);
    return {
      chatCount: 0,
      totalMessages: 0,
    };
  }
};

// Search through chat content
export const searchChats = async (
  query: string
): Promise<
  {
    chatId: string;
    title: string;
    matches: {
      conversationId: string;
      messageId: string;
      content: string;
      sender: string;
      timestamp: Date;
    }[];
  }[]
> => {
  if (!chatStorage.isSupported() || !query.trim()) {
    return [];
  }

  try {
    const chats = await chatStorage.loadAllChats();
    const searchResults: {
      chatId: string;
      title: string;
      matches: {
        conversationId: string;
        messageId: string;
        content: string;
        sender: string;
        timestamp: Date;
      }[];
    }[] = [];

    const searchTerm = query.toLowerCase();

    for (const chat of chats) {
      const matches: {
        conversationId: string;
        messageId: string;
        content: string;
        sender: string;
        timestamp: Date;
      }[] = [];

      for (const conversation of chat.conversations) {
        if (
          conversation.user &&
          conversation.user.content.toLowerCase().includes(searchTerm)
        ) {
          matches.push({
            conversationId: conversation.id,
            messageId: conversation.user.id,
            content: conversation.user.content,
            sender: conversation.user.sender,
            timestamp: conversation.user.timestamp,
          });
        }

        if (
          conversation.system &&
          conversation.system.content.toLowerCase().includes(searchTerm)
        ) {
          matches.push({
            conversationId: conversation.id,
            messageId: conversation.system.id,
            content: conversation.system.content,
            sender: conversation.system.sender,
            timestamp: conversation.system.timestamp,
          });
        }
      }

      if (matches.length > 0) {
        searchResults.push({
          chatId: chat.id,
          title: chat.title,
          matches,
        });
      }
    }

    return searchResults;
  } catch (error) {
    console.error('Failed to search chats:', error);
    return [];
  }
};

// Utility to download chat data as a file
export const downloadChatData = async (): Promise<void> => {
  try {
    const data = await exportChatData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `merkle-chat-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download chat data:', error);
    throw error;
  }
};

// Utility to upload and import chat data from a file
export const uploadChatData = (file: File): Promise<void> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async event => {
      try {
        const jsonData = event.target?.result as string;
        await importChatData(jsonData);
        resolve();
      } catch (error) {
        reject(
          error instanceof Error ? error : new Error('Unknown error occurred')
        );
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
};
