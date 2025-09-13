import UserIcon from './user-icon';

type LoadingMessageProps = {
  query?: string;
};

const LoadingMessage = ({ query = '' }: LoadingMessageProps) => {
  return (
    <div className='flex items-start flex-row gap-1'>
      <UserIcon initial='T' />
      <div className='text-gray-900 prose prose-sm sm:prose-lg max-w-none overflow-hidden break-words'>
        <div className='flex items-center gap-2'>
          <span className='text-gray-600 animate-pulse'>
            {query ? `Searching for "${query}"` : 'Searching for...'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoadingMessage;
