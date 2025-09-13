export type SidebarTabType = 'home' | 'chat';

export interface SidebarTab {
  id: string;
  label: string;
  type: SidebarTabType;
  path: string;
}
