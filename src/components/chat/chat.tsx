import TiptapContainer from '../wysiwyg/custom-wysiwyg';
import Chatbox from '../chatbox/chatbox';
import { useChatContext } from '@/context/chat-context';

type ChatProps = {};

const Chat = (_props: ChatProps) => {
  const { conversations } = useChatContext();

  return (
    <div className='w-full h-full max-h-full flex flex-col items-stretch overflow-hidden min-w-0'>
      <div className='md:rounded-lg rounded-2xl w-full h-full flex flex-col min-h-0 gap-0.4 md:gap-1.2 overflow-hidden min-w-0'>
        <div className='flex-1 min-h-0 overflow-hidden min-w-0'>
          <Chatbox conversations={conversations} />
        </div>
        <div className='max-h-[25vh] sm:max-h-[30vh] md:max-h-[35vh] min-h-0 overflow-hidden min-w-0'>
          <TiptapContainer />
        </div>
      </div>
    </div>
  );
};

export default Chat;
