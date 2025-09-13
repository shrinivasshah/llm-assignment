import { sendIcon } from '@/assets/svgs/chat-icons';
import classNames from 'classnames';

type Props = {
  isSending?: boolean;
  title?: string;
};

const ChatSendButton = ({ isSending = false, title = 'Send' }: Props) => {
  return (
    <button
      type='submit'
      className={classNames(
        'flex items-center rounded-lg justify-center px-1.2 py-0.8 text-base gap-0.4 relative overflow-hidden',
        {
          'bg-blue-50': isSending,
          'bg-blue-600': !isSending,
          'hover:bg-blue-700': !isSending,
        }
      )}
    >
      {isSending ? (
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1.6 h-1.6 bg-blue-600 rounded animate-pulse'></div>
      ) : (
        <p
          className={classNames({
            'text-blue-600': isSending,
            'text-white': !isSending,
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
