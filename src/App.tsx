import './App.css';
import { Outlet, useLocation } from 'react-router';
import { useEffect, useRef } from 'react';
import { ChatTabsProvider } from '@/context/chat-tabs-context';
import Layout from './layout/layout';

function App() {
  const location = useLocation();
  const previousLocationRef = useRef(location.pathname);

  const handleRouteChange = () => {
    window.dispatchEvent(
      new CustomEvent('navigation-save-trigger', {
        detail: {
          from: previousLocationRef.current,
          to: location.pathname,
        },
      })
    );

    previousLocationRef.current = location.pathname;
  };

  useEffect(() => {
    if (previousLocationRef.current !== location.pathname) {
      handleRouteChange();
    }
  }, [location.pathname]);

  return (
    <ChatTabsProvider>
      <Layout>
        <Outlet />
      </Layout>
    </ChatTabsProvider>
  );
}

export default App;
