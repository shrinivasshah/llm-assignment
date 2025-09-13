import React from 'react';
import Header from '@/components/header/header';
import Sidebar from '@/components/sidebar/sidebar';
import SlidingSidenav from '@/components/sliding-sidenav/sliding-sidenav';
import { SidenavProvider } from '@/context/sidenav-context';
import { useScreenSize } from '@/hooks/useScreenSize';

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const { isIPadOrLess } = useScreenSize();

  return (
    <SidenavProvider>
      <div className='h-screen w-screen bg-primary-gradient overflow-hidden'>
        <div className='h-full w-full flex flex-col min-h-0 p-0.4 md:p-1.2'>
          <div className='flex-shrink-0'>
            <Header />
          </div>
          <div className='flex-1 min-h-0 w-full flex items-stretch gap-1.2'>
            {!isIPadOrLess && (
              <div className='basis-[20%] min-h-0 min-w-0'>
                <Sidebar />
              </div>
            )}
            <div className='min-h-0 min-w-0 flex-1 w-full md:basis-[80%]'>
              {children}
            </div>
          </div>
        </div>

        {/* Sliding Sidenav for tablet and mobile */}
        {isIPadOrLess && <SlidingSidenav />}
      </div>
    </SidenavProvider>
  );
};
export default Layout;
