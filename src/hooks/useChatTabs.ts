import { useState, useCallback } from 'react';
import type { SidebarTab } from '@/types/sidebar';

const initialTabs: SidebarTab[] = [
  { id: 'home', label: 'Home', type: 'home', path: '/' },
];

export const useChatTabs = () => {
  const [tabs, setTabs] = useState<SidebarTab[]>(initialTabs);

  const addChatTab = useCallback((chatId: string, label?: string) => {
    const newTab: SidebarTab = {
      id: `chat-${chatId}`,
      label: label || `Chat ${chatId.slice(0, 8)}...`,
      type: 'chat',
      path: `/${chatId}`,
    };

    setTabs(prevTabs => {
      // Check if tab already exists
      const exists = prevTabs.some(tab => tab.path === newTab.path);
      if (exists) return prevTabs;

      return [...prevTabs, newTab];
    });

    return newTab.path;
  }, []);

  const removeChatTab = useCallback((chatId: string) => {
    setTabs(prevTabs => prevTabs.filter(tab => tab.id !== `chat-${chatId}`));
  }, []);

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
  };
};
