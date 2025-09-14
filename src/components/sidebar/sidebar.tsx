import SidebarBackButton from '@/design-system/sidebar-back-button';
import SidebarTabs from './tabs';
import SidebarFooter from './footer';
import { useLocation, useNavigate } from 'react-router';
import { useChatContext } from '@/context/chat-context';
import type { SidebarTabType } from './types';

type SidebarProps = {};

const Sidebar = (_props: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getTabIds, activeTabId, handleSetActiveTab, handleRemoveTab } =
    useChatContext();

  const tabIds = getTabIds();

  const getActiveTabId = () => {
    if (location.pathname === '/') {
      return 'home';
    }
    return activeTabId || 'home';
  };

  const handleTabSelect = (tabId: string) => {
    if (tabId === 'home') {
      navigate('/');
    } else {
      handleSetActiveTab(tabId);
      navigate(`/${tabId}`);
    }
  };

  const handleTabRemove = async (tabId: string) => {
    try {
      const wasActiveTab = activeTabId === tabId;
      if (wasActiveTab) {
        navigate('/');
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      handleRemoveTab(tabId);
    } catch (error) {
      console.error('Failed to delete tab:', error);
    }
  };

  const tabsData = [
    { id: 'home', label: 'Home', type: 'home' as SidebarTabType },
    ...tabIds.map((tabId, index) => ({
      id: tabId,
      label: `Chat #${index + 1}`,
      type: 'chat' as SidebarTabType,
    })),
  ];

  return (
    <div className='h-full flex flex-col gap-0.8 overflow-hidden'>
      <div className='bg-white rounded-lg w-full flex-1 min-h-0 overflow-hidden'>
        <div className='p-1.6 flex flex-col h-full min-h-0'>
          <SidebarBackButton extraClasses='self-baseline' />

          <div className='flex-1 min-h-0 overflow-y-auto'>
            <SidebarTabs
              data={tabsData}
              selectedTabId={getActiveTabId()}
              onTabSelect={handleTabSelect}
              onTabRemove={handleTabRemove}
            />
          </div>
          <SidebarFooter />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
