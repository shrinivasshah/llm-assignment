import classNames from 'classnames';
import UserIcon from './user-icon';
import MessageContent from './message-content';
import type { Message } from '@/context/types';

type ChatMessageProps = {
  message: Message;
};

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.sender === 'user';

  return (
    <div
      className={classNames(
        'flex items-start',
        isUser ? 'flex-row-reverse space-x-reverse gap-1' : 'flex-row gap-1'
      )}
    >
      {isUser ? <UserIcon initial='U' /> : <UserIcon initial='T' />}
      <MessageContent message={message} />
    </div>
  );
};

export default ChatMessage;
