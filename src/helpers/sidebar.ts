import type { SidebarTab, SidebarTabType } from '@/components/sidebar/types';

export type SidebarItem = {
  id: string;
  label: string;
  type: SidebarTabType;
};

// Generate a sample UUID for demo purposes
const generateSampleUUID = () => crypto.randomUUID();

export const sidebarTabs: SidebarTab[] = [
  { id: 'home', label: 'Home', type: 'home', path: '/' },
  {
    id: 'chat-1',
    label: 'Chat 1',
    type: 'chat',
    path: `/${generateSampleUUID()}`,
  },
  {
    id: 'chat-2',
    label: 'Chat 2',
    type: 'chat',
    path: `/${generateSampleUUID()}`,
  },
  {
    id: 'chat-3',
    label: 'Chat 3',
    type: 'chat',
    path: `/${generateSampleUUID()}`,
  },
];

// Legacy export for backward compatibility
export const sidebarItems: SidebarItem[] = [
  { id: 'tab1', label: 'Tab 1', type: 'chat' },
  { id: 'tab2', label: 'Tab 2', type: 'chat' },
  { id: 'tab3', label: 'Tab 3', type: 'chat' },
];
