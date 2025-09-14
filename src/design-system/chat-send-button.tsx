import { sendIcon } from '@/assets/svgs/chat-icons';
import classNames from 'classnames';

type ChatSendButtonProps = {
  isStreaming?: boolean;
  title?: string;
  handleStopStreaming?: () => void;
  disabled?: boolean;
};

const ChatSendButton = ({
  isStreaming = false,
  title = 'Send',
  handleStopStreaming,
  disabled = false,
}: ChatSendButtonProps) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isStreaming && handleStopStreaming) {
      e.preventDefault();
      handleStopStreaming();
    }
  };

  return (
    <button
      type='submit'
      aria-label='Send Message'
      disabled={disabled}
      onClick={handleClick}
      className={classNames(
        'flex items-center rounded-lg justify-center px-1.2 py-0.8 text-base gap-0.4 relative overflow-hidden transition-colors duration-200',
        {
          'bg-blue-50 hover:bg-red-50': isStreaming,
          'bg-blue-600': !isStreaming,
          'hover:bg-blue-700': !isStreaming,
          'cursor-not-allowed opacity-50': disabled,
        }
      )}
    >
      {isStreaming ? (
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1.6 h-1.6 bg-blue-600 hover:bg-red-600 rounded animate-pulse transition-colors duration-200'></div>
      ) : (
        <p
          className={classNames({
            'text-blue-600': isStreaming,
            'text-white': !isStreaming,
          })}
        >
          {title}
        </p>
      )}
      {sendIcon}
    </button>
  );
};

export default ChatSendButton;
