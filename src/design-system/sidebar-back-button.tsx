import { SidebarToggleIcon } from '@/assets/svgs';
import classNames from 'classnames';

type SidebarBackButtonProps = {
  onClick?: () => void;
  extraClasses?: string;
};

const SidebarBackButton = ({
  onClick,
  extraClasses,
}: SidebarBackButtonProps) => {
  return (
    <button
      type='button'
      className={classNames(
        'shadow-toggle p-0.8 hover:bg-blue-25 transition-colors',
        extraClasses
      )}
      aria-label='Toggle Sidebar'
      onClick={onClick}
    >
      <SidebarToggleIcon />
    </button>
  );
};
export default SidebarBackButton;
