import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { Emoji } from '@tiptap/extension-emoji';
import { setEmojis } from './wysiwyg';
import { EDITOR_PLACEHOLDER } from '@/constants/wysiwyg';

export const getTiptapExtensions = () => [
  StarterKit,
  Underline,
  Placeholder.configure({
    placeholder: EDITOR_PLACEHOLDER,
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
];
