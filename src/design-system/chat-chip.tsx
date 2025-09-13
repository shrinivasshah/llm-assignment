import { cancelIcon } from '@/assets/svgs/chat-icons';
import classNames from 'classnames';

type ChatChipProps = {
  fileName: string;
  onRemove?: () => void;
  className?: string;
};

const ChatChip = ({ fileName, onRemove, className = '' }: ChatChipProps) => {
  const getFileExtension = (name: string): string => {
    return name.split('.').pop()?.toUpperCase() || '';
  };

  const truncateFileName = (name: string, maxLength: number = 20): string => {
    if (name.length <= maxLength) return name;
    const extension = getFileExtension(name);
    const nameWithoutExt = name.substring(0, name.lastIndexOf('.'));
    const truncatedName =
      nameWithoutExt.substring(0, maxLength - extension.length - 4) + '...';
    return `${truncatedName}.${extension.toLowerCase()}`;
  };

  return (
    <div
      className={classNames(
        'inline-flex items-center gap-1.2 bg-gray-100 text-black px-1.2 py-0.8 rounded-full text-sm font-medium',
        className
      )}
    >
      <div className='flex flex-col'>
        <span className={classNames('font-medium text-black')} title={fileName}>
          {truncateFileName(fileName)}
        </span>
      </div>

      {onRemove && (
        <button
          onClick={onRemove}
          className={classNames('text-black hover:text-gray-800')}
          title='Remove file'
        >
          {cancelIcon}
        </button>
      )}
    </div>
  );
};

export default ChatChip;
