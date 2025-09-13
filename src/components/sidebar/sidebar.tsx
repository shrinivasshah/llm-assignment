import SidebarBackButton from '@/design-system/sidebar-back-button';
import SidebarTabs from './tabs';
import SidebarFooter from './footer';
import { useLocation, useNavigate } from 'react-router';
import { useChatTabsContext } from '@/context/chat-tabs-context';
import { useStoredChats } from '@/hooks/useStoredChats';

type SidebarProps = {};

const Sidebar = (_props: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { tabs, isLoaded, removeChatTab } = useChatTabsContext();
  const { deleteChat } = useStoredChats();

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

  const handleTabRemove = async (tabId: string) => {
    // Extract chatId from tabId (format: 'chat-{chatId}')
    if (tabId.startsWith('chat-')) {
      const chatId = tabId.substring(5); // Remove 'chat-' prefix

      try {
        // Delete from storage
        await deleteChat(chatId);

        // Remove from tabs
        removeChatTab(chatId);

        // Navigate to home if the deleted chat was active
        const activeTabId = getActiveTabId();
        if (activeTabId === tabId) {
          navigate('/');
        }
      } catch (error) {
        console.error('Failed to delete chat:', error);
      }
    }
  };

  if (!isLoaded) {
    return (
      <div className='h-full flex items-center justify-center'>
        <div className='text-sm text-gray-500'>Loading...</div>
      </div>
    );
  }

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
