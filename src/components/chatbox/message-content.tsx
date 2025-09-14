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
  isStreamingMessage?: boolean;
};

const MessageContent = ({
  message,
  isStreamingMessage = false,
}: MessageContentProps) => {
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
        isStreamingMessage && isStreaming && 'animate-stream-fade',
        isUser && [
          'flex flex-col items-start p-1.5 sm:p-2 gap-3 sm:gap-5',
          'bg-blue-25',
          'rounded-[2rem_0_2rem_2rem]',
          'inline-block max-w-[80%] w-auto',
          'text-xs sm:text-sm',
          'text-blue-700 italic',
        ],
        isUser &&
          editingMessageId &&
          'bg-gray-50 text-gray-500 transition-colors'
      )}
    >
      {message.sender === EChatUserType.SYSTEM ? (
        <div
          className={classNames(
            'prose prose-sm sm:prose-lg max-w-none overflow-hidden break-words',
            // Apply streaming animation to system messages
            isStreamingMessage && isStreaming && 'animate-stream-fade'
          )}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      ) : (
        <div className='flex flex-col gap-2'>
          <div className='whitespace-pre-wrap'>
            {!editingMessageId ? (
              <div dangerouslySetInnerHTML={{ __html: message.content }} />
            ) : (
              <span
                className='text-gray-500'
                dangerouslySetInnerHTML={{ __html: message.content }}
              />
            )}
          </div>
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
