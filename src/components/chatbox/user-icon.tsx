type UserIconProps = {
  initial?: string;
};

const UserIcon = ({ initial = 'U' }: UserIconProps) => (
  <div className='flex-shrink-0 w-2 h-2 rounded-full flex items-center justify-center text-white font-semibold bg-primary-gradient text-xs'>
    {initial}
  </div>
);

export default UserIcon;
