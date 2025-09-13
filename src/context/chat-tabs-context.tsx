import React, { createContext, useContext } from 'react';
import { useChatTabs } from '@/hooks/useChatTabs';
import type { SidebarTab } from '@/components/sidebar/types';

type ChatTabsContextType = {
  tabs: SidebarTab[];
  addChatTab: (chatId: string, label?: string) => string;
  removeChatTab: (chatId: string) => void;
  getChatTab: (chatId: string) => SidebarTab | undefined;
  updateChatTabLabel: (chatId: string, newLabel: string) => void;
};

const ChatTabsContext = createContext<ChatTabsContextType | undefined>(
  undefined
);

export const ChatTabsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const chatTabs = useChatTabs();

  return (
    <ChatTabsContext.Provider value={chatTabs}>
      {children}
    </ChatTabsContext.Provider>
  );
};

export const useChatTabsContext = () => {
  const context = useContext(ChatTabsContext);
  if (context === undefined) {
    throw new Error(
      'useChatTabsContext must be used within a ChatTabsProvider'
    );
  }
  return context;
};
