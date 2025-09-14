import TiptapContainer from '../wysiwyg/custom-wysiwyg';
import Chatbox from '../chatbox/chatbox';
import { useChatContext } from '@/context/chat-context';

type ChatProps = {};

const Chat = (_props: ChatProps) => {
  const { getActiveTabConversations } = useChatContext();
  const conversations = getActiveTabConversations();

  return (
    <div className='w-full h-full max-h-full flex flex-col items-stretch overflow-hidden min-w-0'>
      <div className='md:rounded-lg w-full h-full flex flex-col min-h-0 gap-0 md:gap-1.2 overflow-hidden min-w-0'>
        <div className='flex-1 min-h-0 p-0.4 pb-0 md:p-0 md:pb-0 overflow-hidden min-w-0'>
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
