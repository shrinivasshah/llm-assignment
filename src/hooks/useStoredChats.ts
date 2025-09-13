import { useState, useEffect, useCallback } from 'react';
import { chatStorage, type StoredChat } from '@/utils/indexeddb';

export interface ChatListItem {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  preview?: string;
}

export const useStoredChats = () => {
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all chats from IndexedDB
  const loadChats = useCallback(async () => {
    if (!chatStorage.isSupported()) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const storedChats = await chatStorage.loadAllChats();

      const chatListItems: ChatListItem[] = storedChats.map(
        (chat: StoredChat) => ({
          id: chat.id,
          title: chat.title,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
          preview:
            chat.conversations[0]?.user?.content?.substring(0, 100) || '',
        })
      );

      setChats(chatListItems);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load chats';
      setError(errorMessage);
      console.error('Failed to load stored chats:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete a chat
  const deleteChat = useCallback(async (chatId: string) => {
    if (!chatStorage.isSupported()) {
      return false;
    }

    try {
      await chatStorage.deleteChat(chatId);
      setChats(prev => prev.filter(chat => chat.id !== chatId));
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete chat';
      setError(errorMessage);
      console.error('Failed to delete chat:', err);
      return false;
    }
  }, []);

  // Update a chat's title
  const updateChatTitle = useCallback(
    async (chatId: string, newTitle: string) => {
      if (!chatStorage.isSupported()) {
        return false;
      }

      try {
        const chat = await chatStorage.loadChat(chatId);
        if (chat) {
          await chatStorage.saveChat(chatId, newTitle, chat.conversations);
          setChats(prev =>
            prev.map(c =>
              c.id === chatId
                ? { ...c, title: newTitle, updatedAt: new Date() }
                : c
            )
          );
          return true;
        }
        return false;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update chat title';
        setError(errorMessage);
        console.error('Failed to update chat title:', err);
        return false;
      }
    },
    []
  );

  // Clear all chats
  const clearAllChats = useCallback(async () => {
    if (!chatStorage.isSupported()) {
      return false;
    }

    try {
      await chatStorage.clearAll();
      setChats([]);
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to clear all chats';
      setError(errorMessage);
      console.error('Failed to clear all chats:', err);
      return false;
    }
  }, []);

  // Refresh the chat list
  const refreshChats = useCallback(() => {
    void loadChats();
  }, [loadChats]);

  // Load chats on mount
  useEffect(() => {
    void loadChats();
  }, [loadChats]);

  return {
    chats,
    isLoading,
    error,
    deleteChat,
    updateChatTitle,
    clearAllChats,
    refreshChats,
    isSupported: chatStorage.isSupported(),
  };
};
