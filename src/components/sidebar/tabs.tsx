import SidebarTabButton from '@/design-system/sidebar-tab-button';
import type { SidebarItem } from '@/helpers/sidebar';

type TabsProps = {
  data: SidebarItem[];
  selectedTabId: string;
  onTabSelect: (id: string) => void;
  onTabRemove?: (id: string) => void;
};

const Tabs = ({ data, selectedTabId, onTabSelect, onTabRemove }: TabsProps) => {
  return (
    <div className='flex-1 pt-1.6 flex flex-col gap-0.8'>
      {data.map(item => (
        <SidebarTabButton
          key={item.id}
          title={item.label}
          type={item.type}
          isActive={item.id === selectedTabId}
          onClick={() => onTabSelect(item.id)}
          onRemove={onTabRemove ? () => onTabRemove(item.id) : undefined}
        />
      ))}
    </div>
  );
};

export default Tabs;
