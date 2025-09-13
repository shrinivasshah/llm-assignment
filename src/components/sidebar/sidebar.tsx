import SidebarBackButton from '@/design-system/sidebar-back-button';
import SidebarTabs from './tabs';
import SidebarFooter from './footer';
import { useLocation, useNavigate } from 'react-router';
import { useChatTabsContext } from '@/context/chat-tabs-context';

type SidebarProps = {};

const Sidebar = (_props: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { tabs } = useChatTabsContext();

  const getActiveTabId = () => {
    if (location.pathname === '/') {
      return 'home';
    }

    const activeTab = tabs.find(tab => tab.path === location.pathname);
    return activeTab?.id || 'home';
  };

  const handleTabSelect = (tabId: string) => {
    const selectedTab = tabs.find(tab => tab.id === tabId);
    if (selectedTab) {
      navigate(selectedTab.path);
    }
  };

  return (
    <div className='h-full flex flex-col gap-0.8 overflow-hidden'>
      <div className='bg-white rounded-lg w-full flex-1 min-h-0 overflow-hidden'>
        <div className='p-1.6 flex flex-col h-full min-h-0'>
          <SidebarBackButton extraClasses='self-baseline' />

          <div className='flex-1 min-h-0 overflow-y-auto'>
            <SidebarTabs
              data={tabs.map(tab => ({
                id: tab.id,
                label: tab.label,
                type: tab.type,
              }))}
              selectedTabId={getActiveTabId()}
              onTabSelect={handleTabSelect}
            />
          </div>
          <SidebarFooter />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
