import {
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { Emoji } from '@tiptap/extension-emoji';
import classNames from 'classnames';
import { pictureIcon, downArrowIcon } from '@/assets/svgs/wysiwyg-icons';
import { TOOLBAR_BUTTONS } from '@/constants/wysiwyg';
import './tiptap-editor.css';
import { setEmojis } from '@/helpers/wysiwyg';
import ChatAttachButton from '@/design-system/chat-attach-button';
import ChatSendButton from '@/design-system/chat-send-button';
import ChatChip from '@/design-system/chat-chip';

// Types
type WysiwygEditorRef = {
  focus: () => void;
};

type WysiwygEditorProps = {
  value?: string;
  onChange?: (content: string) => void;
  handleSend?: (e: React.FormEvent<HTMLFormElement>) => void;
  handleAttach?: () => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
  autoFocus?: boolean;
};

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

const getButtonClasses = (isActive: boolean) =>
  classNames(
    'flex items-center justify-center border rounded cursor-pointer transition-all duration-200',
    'w-[2.8rem] h-[2.8rem]',
    'hover:bg-gray-100 hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-custom-blue/20',
    {
      'bg-blue-50 text-custom-blue border-custom-blue': isActive,
      'border-transparent text-gray-700': !isActive,
    }
  );

const getSelectClasses = () =>
  classNames(
    'px-1.2 py-1 border-r border-gray-300 text-[14px] text-gray-700 bg-transparent cursor-pointer',
    'focus:outline-none',
    'focus:ring-0 leading-normal'
  );

const WysiwygEditor = forwardRef<WysiwygEditorRef, WysiwygEditorProps>(
  (
    {
      value = '',
      onChange,
      handleSend,
      handleAttach,
      placeholder = 'Ask me anything ...',
      readOnly = false,
      className = '',
      autoFocus = false,
    },
    ref
  ) => {
    const imageInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

    const extensions = useMemo(
      () => [
        StarterKit,
        Underline,
        Placeholder.configure({
          placeholder,
        }),
        Emoji.configure({
          enableEmoticons: true,
          suggestion: {
            items: setEmojis,
          },
        }),
        Image.configure({
          HTMLAttributes: {
            class: 'editor-image',
          },
        }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: 'editor-link',
          },
        }),
        TextAlign.configure({
          types: ['heading', 'paragraph'],
        }),
      ],
      [placeholder]
    );

    const editor = useEditor({
      extensions,
      content: value,
      editable: !readOnly,
      onUpdate: ({ editor }) => {
        const text = editor.getText();
        onChange?.(text);
      },
      editorProps: {
        handleKeyDown: (view, event) => {
          if (event.key === 'Enter' && !event.shiftKey && handleSend) {
            event.preventDefault();

            const formEvent = {
              preventDefault: () => {},
              currentTarget: view.dom.closest('form'),
            } as React.FormEvent<HTMLFormElement>;

            handleSend(formEvent);
            return true;
          }
          return false;
        },
      },
    });

    const handleImageUpload = useCallback(() => {
      if (imageInputRef.current) {
        imageInputRef.current.click();
      }
    }, []);

    const handleImageInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = e => {
            const src = e.target?.result as string;
            editor?.chain().focus().setImage({ src }).run();
          };
          reader.readAsDataURL(file);
        }
      },
      [editor]
    );

    const handleFileAttachment = useCallback(() => {
      if (handleAttach) {
        handleAttach();
        return;
      }

      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }, [handleAttach]);

    const handleFileInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          setAttachedFiles(prev => [...prev, file]);
          console.log('File selected:', file.name, file.type, file.size);
        }
      },
      []
    );

    const handleRemoveFile = useCallback((fileToRemove: File) => {
      setAttachedFiles(prev => prev.filter(file => file !== fileToRemove));
    }, []);

    const handleHeadingChange = useCallback(
      (level: string) => {
        if (level === 'paragraph') {
          editor?.chain().focus().setParagraph().run();
        } else {
          editor
            ?.chain()
            .focus()
            .toggleHeading({ level: parseInt(level) as HeadingLevel })
            .run();
        }
      },
      [editor]
    );

    useEffect(() => {
      if (editor && value !== editor.getHTML()) {
        editor.commands.setContent(value);
      }
    }, [value, editor]);

    useEffect(() => {
      if (editor) {
        editor.setEditable(!readOnly);
      }
    }, [readOnly, editor]);

    useEffect(() => {
      if (editor && autoFocus) {
        editor.commands.focus();
      }
    }, [editor]);

    useImperativeHandle(
      ref,
      () => ({
        focus: () => {
          editor?.commands.focus();
        },
      }),
      [editor]
    );

    const getContainerClasses = useCallback(() => {
      return classNames(
        'relative rounded-lg bg-white overflow-hidden w-full flex flex-col max-h-full',
        className
      );
    }, [className]);

    const getEditorContentClasses = useCallback(() => {
      return classNames('tiptap-content flex-1 min-h-0');
    }, []);

    const getCurrentHeadingLevel = useCallback(() => {
      if (!editor) return 'paragraph';

      for (let level = 1; level <= 6; level++) {
        if (editor.isActive('heading', { level })) {
          return level.toString();
        }
      }
      return 'paragraph';
    }, [editor]);

    if (!editor) {
      return null;
    }

    return (
      <form onSubmit={handleSend} className={getContainerClasses()}>
        <input
          ref={imageInputRef}
          type='file'
          accept='image/*'
          style={{ display: 'none' }}
          onChange={handleImageInputChange}
        />
        <input
          ref={fileInputRef}
          type='file'
          accept='.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.bmp,.webp,.svg'
          style={{ display: 'none' }}
          onChange={handleFileInputChange}
        />

        <div
          className={classNames(
            'flex flex-wrap gap-2 bg-white border-b border-gray-200 items-center'
          )}
        >
          <div className='relative'>
            <select
              onChange={e => handleHeadingChange(e.target.value)}
              className={classNames(getSelectClasses(), 'appearance-none pr-4')}
              value={getCurrentHeadingLevel()}
            >
              <option value='paragraph'>Paragraph</option>
              <option value='1'>Heading 1</option>
              <option value='2'>Heading 2</option>
              <option value='3'>Heading 3</option>
              <option value='4'>Heading 4</option>
              <option value='5'>Heading 5</option>
              <option value='6'>Heading 6</option>
            </select>

            <div className='absolute top-1/2 right-0 transform -translate-y-1/2 pointer-events-none'>
              <div className='w-4 h-4 flex items-center justify-center'>
                {downArrowIcon}
              </div>
            </div>
          </div>

          {TOOLBAR_BUTTONS.map(({ action, icon, title, activeCheck }) => (
            <button
              key={action}
              onClick={() => editor.chain().focus()[action]().run()}
              className={getButtonClasses(editor.isActive(activeCheck))}
              type='button'
              title={title}
            >
              {icon}
            </button>
          ))}

          <button
            onClick={handleImageUpload}
            className={getButtonClasses(false)}
            type='button'
            title='Insert Image'
          >
            {pictureIcon}
          </button>
        </div>

        <EditorContent editor={editor} className={getEditorContentClasses()} />
        <div className='border-t border-gray-200 w-full bg-white p-1.2 flex-shrink-0'>
          {attachedFiles.length > 0 && (
            <div className='flex flex-wrap gap-1.2 mb-1.2'>
              {attachedFiles.map((file, index) => (
                <ChatChip
                  key={`${file.name}-${index}`}
                  fileName={file.name}
                  onRemove={() => handleRemoveFile(file)}
                />
              ))}
            </div>
          )}

          <div className='flex justify-between'>
            <ChatAttachButton onClick={handleFileAttachment} />
            <ChatSendButton title='Send' />
          </div>
        </div>
      </form>
    );
  }
);

WysiwygEditor.displayName = 'WysiwygEditor';

export default WysiwygEditor;
