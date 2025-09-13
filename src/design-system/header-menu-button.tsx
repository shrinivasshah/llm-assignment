import { hamburgerMenuIcon } from '@/assets/svgs/header';
import classNames from 'classnames';

type HeaderMenuButtonProps = {
  onClick?: () => void;
  extraClasses?: string;
};

const HeaderMenuButton = ({ onClick, extraClasses }: HeaderMenuButtonProps) => {
  return (
    <button
      type='button'
      className={classNames(
        'bg-white border border-gray-200',
        // Shadow & Border Radius
        'shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] rounded-base p-0.8',
        'hover:bg-blue-25 transition-colors',
        extraClasses
      )}
      aria-label='Toggle Sidebar'
      onClick={onClick}
    >
      {hamburgerMenuIcon}
    </button>
  );
};
export default HeaderMenuButton;
