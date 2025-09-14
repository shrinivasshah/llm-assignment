export type SidebarTabType = 'home' | 'chat';

export type SidebarTab = {
  id: string;
  label: string;
  type: SidebarTabType;
  path: string;
};
