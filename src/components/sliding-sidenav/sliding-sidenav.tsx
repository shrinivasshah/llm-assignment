import React from 'react';
import Sidebar from '@/components/sidebar/sidebar';
import classNames from 'classnames';

type SlidingSidenavProps = {
  className?: string;
  isOpen: boolean;
  toggleSidenav: () => void;
};

const SlidingSidenav: React.FC<SlidingSidenavProps> = ({
  className,
  isOpen,
  toggleSidenav,
}) => {
  return (
    <>
      <div
        className={classNames(
          'fixed inset-0 bg-black z-40 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
          isOpen ? 'bg-opacity-50 visible' : 'bg-opacity-0 invisible'
        )}
        onClick={toggleSidenav}
        aria-hidden='true'
      />

      <div
        className={classNames(
          'fixed top-0 left-0 h-full z-50',
          'w-80 max-w-[85vw]',
          'bg-white shadow-[0_8px_10px_-5px_rgba(0,0,0,0.2),0_16px_24px_2px_rgba(0,0,0,0.14),0_6px_30px_5px_rgba(0,0,0,0.12)]',
          'transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          className
        )}
        role='dialog'
        aria-modal='true'
        aria-label='Navigation menu'
      >
        <div className='flex-1 h-full overflow-hidden'>
          <div className='h-full p-1.2'>
            <Sidebar />
          </div>
        </div>
      </div>
    </>
  );
};

export default SlidingSidenav;
