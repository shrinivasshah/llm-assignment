import classNames from 'classnames';
import UserIcon from './user-icon';
import MessageContent from './message-content';
import type { Message } from '@/context/types';

type ChatMessageProps = {
  message: Message;
  isLastSystemMessage?: boolean;
};

const ChatMessage = ({
  message,
  isLastSystemMessage = false,
}: ChatMessageProps) => {
  const isUser = message.sender === 'user';
  const isStreamingMessage = isLastSystemMessage && message.sender === 'system';

  return (
    <div
      className={classNames(
        'flex items-start min-w-0 max-w-full pt-1.2',
        isUser
          ? 'flex-row-reverse space-x-reverse gap-1 sm:gap-2 justify-start'
          : 'flex-row gap-1 sm:gap-2'
      )}
    >
      {isUser ? <UserIcon initial='U' /> : <UserIcon initial='T' />}
      {isUser ? (
        <MessageContent message={message} />
      ) : (
        <div className='min-w-0 flex-1'>
          <MessageContent
            message={message}
            isStreamingMessage={isStreamingMessage}
          />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
