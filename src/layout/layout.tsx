import React from 'react';
import Header from '@/components/header/header';
import Sidebar from '@/components/sidebar/sidebar';
type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className='h-screen w-screen bg-primary-gradient overflow-hidden'>
      <div className='h-full w-full p-1.2 flex flex-col min-h-0'>
        <div className='flex-shrink-0'>
          <Header />
        </div>
        <div className='flex-1 min-h-0 w-full flex items-stretch gap-1.2'>
          <div className='basis-[20%] min-h-0'>
            <Sidebar />
          </div>
          <div className='basis-[80%] min-h-0'>{children}</div>
        </div>
      </div>
    </div>
  );
};
export default Layout;
