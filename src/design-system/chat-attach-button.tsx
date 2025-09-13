import { attachmentIcon } from '@/assets/svgs/chat-icons';

type ChatButtonProps = {
  onClick?: () => void;
};

const ChatAttachButton = ({ onClick }: ChatButtonProps) => {
  return (
    <button
      className='py-0.8 px-1.2 shadow-toggle rounded-lg hover:bg-blue-25 transition-colors'
      onClick={onClick}
    >
      {attachmentIcon}
    </button>
  );
};

export default ChatAttachButton;
