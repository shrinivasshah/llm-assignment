import { useState, useCallback, useEffect } from 'react';
import type { SidebarTab } from '@/components/sidebar/types';
import { chatStorage, type StoredTab } from '@/utils/indexeddb';

const initialTabs: SidebarTab[] = [
  { id: 'home', label: 'Home', type: 'home', path: '/' },
];

export const useChatTabs = () => {
  const [tabs, setTabs] = useState<SidebarTab[]>(initialTabs);
  const [isLoaded, setIsLoaded] = useState(false);

  // Save tabs to storage
  const saveTabsToStorage = useCallback(async (tabsToSave: SidebarTab[]) => {
    if (!chatStorage.isSupported()) return;

    try {
      const storedTabs: StoredTab[] = tabsToSave.map((tab, index) => ({
        id: tab.id,
        label: tab.label,
        type: tab.type,
        path: tab.path,
        order: index,
      }));

      await chatStorage.saveTabs(storedTabs);
    } catch (error) {
      console.error('Failed to save tabs to storage:', error);
    }
  }, []);

  // Initialize tabs from storage
  useEffect(() => {
    const initializeTabs = async () => {
      if (!chatStorage.isSupported()) {
        setIsLoaded(true);
        return;
      }

      try {
        await chatStorage.init();
        const storedTabs = await chatStorage.loadTabs();

        if (storedTabs.length > 0) {
          const loadedTabs: SidebarTab[] = storedTabs.map(tab => ({
            id: tab.id,
            label: tab.label,
            type: tab.type,
            path: tab.path,
          }));
          setTabs(loadedTabs);
        } else {
          // If no tabs are stored, restore them from stored chats
          const storedChats = await chatStorage.loadAllChats();
          const chatTabs: SidebarTab[] = storedChats.map(chat => ({
            id: `chat-${chat.id}`,
            label: chat.title,
            type: 'chat' as const,
            path: `/${chat.id}`,
          }));

          const allTabs = [...initialTabs, ...chatTabs];
          setTabs(allTabs);

          // Save the restored tabs
          if (chatTabs.length > 0) {
            await saveTabsToStorage(allTabs);
          }
        }
      } catch (error) {
        console.error('Failed to load tabs from storage:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    if (!isLoaded) {
      void initializeTabs();
    }
  }, [isLoaded, saveTabsToStorage]);

  const addChatTab = useCallback(
    (chatId: string, label?: string) => {
      const newTab: SidebarTab = {
        id: `chat-${chatId}`,
        label: label || 'Untitled Chat',
        type: 'chat',
        path: `/${chatId}`,
      };

      setTabs(prevTabs => {
        // Check if tab already exists
        const exists = prevTabs.some(tab => tab.path === newTab.path);
        if (exists) return prevTabs;

        const updatedTabs = [...prevTabs, newTab];
        // Save to storage
        void saveTabsToStorage(updatedTabs);
        return updatedTabs;
      });

      return newTab.path;
    },
    [saveTabsToStorage]
  );

  const removeChatTab = useCallback(
    (chatId: string) => {
      setTabs(prevTabs => {
        const updatedTabs = prevTabs.filter(tab => tab.id !== `chat-${chatId}`);
        // Save to storage
        void saveTabsToStorage(updatedTabs);
        return updatedTabs;
      });
    },
    [saveTabsToStorage]
  );

  const updateChatTabLabel = useCallback(
    (chatId: string, newLabel: string) => {
      setTabs(prevTabs => {
        const updatedTabs = prevTabs.map(tab =>
          tab.id === `chat-${chatId}` ? { ...tab, label: newLabel } : tab
        );
        // Save to storage
        void saveTabsToStorage(updatedTabs);
        return updatedTabs;
      });
    },
    [saveTabsToStorage]
  );

  const getChatTab = useCallback(
    (chatId: string) => {
      return tabs.find(tab => tab.path === `/${chatId}`);
    },
    [tabs]
  );

  return {
    tabs,
    addChatTab,
    removeChatTab,
    getChatTab,
    updateChatTabLabel,
    isLoaded,
  };
};
