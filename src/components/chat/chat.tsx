import TiptapContainer from '../wysiwyg/custom-wysiwyg';
import Chatbox from '../chatbox/chatbox';
import { useChatContext } from '@/context/chat-context';

type ChatProps = {};

const Chat = (_props: ChatProps) => {
  const { conversations } = useChatContext();

  return (
    <div className='w-full h-full max-h-full flex flex-col items-stretch overflow-hidden'>
      <div className='rounded-lg w-full h-full flex flex-col min-h-0 gap-1.2 overflow-hidden'>
        <div className='flex-1 min-h-0 overflow-hidden'>
          <Chatbox conversations={conversations} />
        </div>
        <div className='max-h-[35vh] min-h-0 overflow-hidden'>
          <TiptapContainer />
        </div>
      </div>
    </div>
  );
};

export default Chat;
