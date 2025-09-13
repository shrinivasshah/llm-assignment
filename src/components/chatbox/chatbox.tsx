import type { ChatboxProps } from '@/context/types';
import ChatEmptyState from './chat-empty-state';
import ChatMessage from './chat-message';
import LoadingMessage from './loading-message';
import classNames from 'classnames';
import { useContext, useEffect, useRef } from 'react';
import ChatContext from '@/context/chat-context';

type ChatboxComponentProps = {
  conversations?: ChatboxProps['conversations'];
};

const Chatbox = ({ conversations = [] }: ChatboxComponentProps) => {
  const { isLoading, isStreaming, currentMessage } = useContext(ChatContext)!;
  const chatboxRef = useRef<HTMLDivElement>(null);

  const messages = conversations.flatMap(conversation => {
    const msgs = [];
    if (conversation.user) {
      msgs.push(conversation.user);
    }
    if (conversation.system) {
      msgs.push(conversation.system);
    }
    return msgs;
  });

  const getUserQuery = () => {
    if (isLoading && currentMessage) {
      return currentMessage;
    } else if (isStreaming && conversations.length > 0) {
      const lastConversation = conversations[conversations.length - 1];
      return lastConversation?.user?.content || '';
    }
    return '';
  };

  const userQuery = getUserQuery();

  useEffect(() => {
    if (chatboxRef.current && (isStreaming || isLoading)) {
      chatboxRef.current.scrollTo({
        top: chatboxRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [isStreaming, isLoading, conversations, messages]);

  return (
    <div
      ref={chatboxRef}
      className={classNames(
        'flex-1 h-full w-full rounded-lg overflow-y-auto overflow-x-hidden p-4 space-y-4 scroll-smooth',
        {
          'bg-white': messages.length > 0 || isLoading || isStreaming,
          'backdrop-blur-md bg-white/20':
            messages.length === 0 && !isLoading && !isStreaming,
        }
      )}
    >
      {messages.length === 0 && !isLoading && !isStreaming ? (
        <ChatEmptyState />
      ) : (
        <>
          {messages.map(message => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && !isStreaming && <LoadingMessage query={userQuery} />}
        </>
      )}
    </div>
  );
};

export default Chatbox;
