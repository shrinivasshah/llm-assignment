import { useNavigateToNewChat } from '@/hooks/useNavigateToNewChat';

const Home = () => {
  const navigateToNewChat = useNavigateToNewChat();

  const handleCreateNewChat = () => {
    navigateToNewChat('New Chat');
  };

  return (
    <div className='h-full flex flex-col items-center justify-center p-8'>
      <div className='text-center space-y-6'>
        <h1 className='text-4xl font-bold text-white mb-4'>Welcome to Chat</h1>
        <p className='text-gray-300 text-lg mb-8'>
          Start a new conversation with our AI assistant
        </p>
        <button
          onClick={handleCreateNewChat}
          className='bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl'
        >
          Create New Chat
        </button>
      </div>
    </div>
  );
};

export default Home;
