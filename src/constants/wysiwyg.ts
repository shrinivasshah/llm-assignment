import {
  boldIcon,
  codeIcon,
  italicIcon,
  mentionIcon,
  orderedListIcon,
  underlineIcon,
  unorderedListIcon,
} from '@/assets/svgs/wysiwyg-icons';

// Toolbar button configuration
export const TOOLBAR_BUTTONS = [
  {
    action: 'toggleBold',
    icon: boldIcon,
    title: 'Bold',
    activeCheck: 'bold',
  },
  {
    action: 'toggleItalic',
    icon: italicIcon,
    title: 'Italic',
    activeCheck: 'italic',
  },
  {
    action: 'toggleUnderline',
    icon: underlineIcon,
    title: 'Underline',
    activeCheck: 'underline',
  },
  {
    action: 'toggleBulletList',
    icon: unorderedListIcon,
    title: 'Bullet List',
    activeCheck: 'bulletList',
  },
  {
    action: 'toggleOrderedList',
    icon: orderedListIcon,
    title: 'Numbered List',
    activeCheck: 'orderedList',
  },
  {
    action: 'toggleBlockquote',
    icon: mentionIcon,
    title: 'Quote',
    activeCheck: 'blockquote',
  },
  {
    action: 'toggleCodeBlock',
    icon: codeIcon,
    title: 'Code Block',
    activeCheck: 'codeBlock',
  },
] as const;

// Constants
export const HEIGHT_VARIANTS = {
  sm: 'h-48', // 192px
  md: 'h-64', // 256px
  lg: 'h-80', // 320px
  xl: 'h-96', // 384px
} as const;
