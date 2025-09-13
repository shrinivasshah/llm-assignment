type ChatEmptyStateProps = {
  // No props needed for this component
};

const ChatEmptyState = (_props: ChatEmptyStateProps) => (
  <div className='w-full flex items-center justify-center h-full text-gray-500'>
    <p className='font-medium text-white text-5xl'>
      Ask anything about blockchain, cryptocurrency
    </p>
  </div>
);

export default ChatEmptyState;
