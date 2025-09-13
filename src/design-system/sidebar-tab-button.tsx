import classNames from 'classnames';
import type { SidebarTabType } from '@/types/sidebar';

type SidebarTabButtonProps = {
  title: string;
  onClick?: () => void;
  onRemove?: () => void;
  isActive?: boolean;
  type?: SidebarTabType;
};

const SidebarTabButton = ({
  title,
  onClick,
  isActive,
}: SidebarTabButtonProps) => {
  return (
    <button
      type='button'
      className={classNames(
        'w-full text-left rounded-base p-1.6 hover:bg-gray-100 font-normal text-base px-0.8 py-1.2',
        {
          'bg-blue-25': isActive,
          'text-blue-600 font-medium': isActive,
        }
      )}
      onClick={onClick}
    >
      {title}
    </button>
  );
};

export default SidebarTabButton;
