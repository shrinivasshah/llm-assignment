import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import classNames from 'classnames';
import { EChatUserType } from '@/context/enums';
import { markdownComponents } from '@/helpers/markdown-components';
import type { Message } from '@/context/types';
import { editIcon } from '@/assets/svgs/chat-icons';
import ChatContext from '@/context/chat-context';
import { useContext } from 'react';

type MessageContentProps = {
  message: Message;
};

const MessageContent = ({ message }: MessageContentProps) => {
  const {
    handleSetEditingMessageId,
    isStreaming,
    handleSetCurrentMessage,
    editingMessageId,
  } = useContext(ChatContext)!;
  const isUser = message.sender === EChatUserType.USER;

  const handleEditClick = () => {
    if (isStreaming) return;
    handleSetEditingMessageId(message.id);
    handleSetCurrentMessage(message.content);
  };

  return (
    <div
      className={classNames(
        'text-gray-900',
        isUser && [
          'flex flex-col items-start p-2 gap-5',
          'min-w-20 min-h-[6.9rem]',
          'bg-blue-25',
          'rounded-[2rem_0_2rem_2rem]',
          'flex-none order-1 flex-grow-0',
          'text-sm',
        ],
        isUser &&
          editingMessageId &&
          'bg-gray-50 text-gray-500 transition-colors'
      )}
    >
      {message.sender === EChatUserType.SYSTEM ? (
        <div className='prose prose-lg max-w-none overflow-hidden'>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      ) : (
        <div className='flex flex-col gap-2'>
          <p className='whitespace-pre-wrap'>
            {!editingMessageId ? (
              message.content
            ) : (
              <span className='text-gray-500'>{message.content}</span>
            )}
          </p>
          <button
            type='button'
            className={classNames({
              'cursor-pointer': !isStreaming && !editingMessageId,
              'cursor-not-allowed': isStreaming || !!editingMessageId,
            })}
            aria-label='Edit message'
            onClick={handleEditClick}
            disabled={isStreaming || !!editingMessageId}
          >
            {editIcon}
          </button>
        </div>
      )}
    </div>
  );
};

export default MessageContent;
