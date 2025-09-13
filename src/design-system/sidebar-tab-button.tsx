import classNames from 'classnames';
import type { SidebarTabType } from '@/components/sidebar/types';
import { cancelIcon } from '@/assets/svgs/chat-icons';
import { useState } from 'react';

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
  onRemove,
  isActive,
  type,
}: SidebarTabButtonProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const showDeleteButton = type === 'chat' && onRemove;

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isDeleting || !onRemove) {
      return;
    }

    setIsDeleting(true);
    try {
      await onRemove();
    } finally {
      // Reset after a short delay to prevent rapid clicks
      setTimeout(() => setIsDeleting(false), 1000);
    }
  };

  return (
    <div className='relative group'>
      <button
        type='button'
        className={classNames(
          'w-full text-left rounded-base p-1.6 hover:bg-gray-100 font-normal text-base px-0.8 py-1.2',
          {
            'bg-blue-25': isActive,
            'text-blue-600 font-medium': isActive,
          },
          showDeleteButton && 'pr-8'
        )}
        onClick={onClick}
      >
        {title}
      </button>
      {showDeleteButton && (
        <button
          type='button'
          className={classNames(
            'absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded hover:bg-gray-200 transition-opacity',
            {
              'opacity-0 group-hover:opacity-100': !isDeleting,
              'opacity-50 cursor-not-allowed': isDeleting,
            }
          )}
          onClick={handleDeleteClick}
          disabled={isDeleting}
          title={isDeleting ? 'Deleting...' : 'Delete chat'}
        >
          {cancelIcon}
        </button>
      )}
    </div>
  );
};

export default SidebarTabButton;
