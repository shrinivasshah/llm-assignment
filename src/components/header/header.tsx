import HeaderMenuButton from '@/design-system/header-menu-button';
import useScreenSize from '@/hooks/useScreenSize';

type HeaderProps = {
  onToggleSidenav?: () => void;
};

const Header = ({ onToggleSidenav }: HeaderProps) => {
  const { isTablet, isMobile } = useScreenSize();

  return (
    <header className='lg:h-4 h-6 w-full flex items-center justify-between gap-1.2 p-1.2 md:p-0'>
      <div className='lg:basis-[20%] flex items-center gap-1'>
        {(isTablet || isMobile) && onToggleSidenav && (
          <HeaderMenuButton onClick={onToggleSidenav} />
        )}
        <img
          className='lg:w-[195.67px] lg:h-[33.13px] w-[15rem] lg:pb-1'
          fetchPriority='high'
          src='/assets/brand-logo.avif'
          alt='Brand Logo'
        />
      </div>
      <h1 className='text-base text-white font-medium lg:basis-[80%]'>
        Tracker Chat
      </h1>
    </header>
  );
};

export default Header;
