type HeaderProps = {};

const Header = (_props: HeaderProps) => {
  return (
    <header className='h-4 w-full flex items-center justify-between gap-1.2'>
      <div className='basis-[20%]'>
        <img
          className='w-[195.67px] h-[33.13px] pb-1'
          fetchPriority='high'
          src='/assets/brand-logo.avif'
          alt='Brand Logo'
        />
      </div>
      <h1 className='text-base text-white font-medium basis-[80%]'>
        Tracker Chat
      </h1>
    </header>
  );
};

export default Header;
