import { useRef, useEffect } from 'react';
import WysiwygEditor from './tiptap-editor';
import { useChatContext } from '@/context/chat-context';

type WysiwygEditorRef = {
  focus: () => void;
};

type TiptapContainerProps = {};

const TiptapContainer = (_props: TiptapContainerProps) => {
  const {
    currentMessage,
    handleSetCurrentMessage,
    handleSendMessage,
    handleUpdateEditingMessage,
    editingMessageId,
    isStreaming,
    isLoading,
    handleCancelStreaming,
  } = useChatContext();
  const editorRef = useRef<WysiwygEditorRef>(null);

  useEffect(() => {
    if (editingMessageId && editorRef.current) {
      setTimeout(() => {
        editorRef.current?.focus();
      }, 100);
    }
  }, [editingMessageId]);

  const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (currentMessage.trim() && !editingMessageId) {
      await handleSendMessage(currentMessage);
    } else if (editingMessageId) {
      handleUpdateEditingMessage(editingMessageId, currentMessage);
    }
  };

  return (
    <WysiwygEditor
      ref={editorRef}
      value={currentMessage}
      onChange={handleSetCurrentMessage}
      handleSend={handleSend}
      isStreaming={isStreaming}
      isLoading={isLoading}
      handleStopStreaming={handleCancelStreaming}
    />
  );
};

export default TiptapContainer;
