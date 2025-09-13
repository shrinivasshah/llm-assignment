import {
  boldIcon,
  codeIcon,
  italicIcon,
  mentionIcon,
  orderedListIcon,
  underlineIcon,
  unorderedListIcon,
} from '@/assets/svgs/wysiwyg-icons';

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

export const HEIGHT_VARIANTS = {
  sm: 'h-48',
  md: 'h-64',
  lg: 'h-80',
  xl: 'h-96',
} as const;

export const EDITOR_PLACEHOLDER = 'Ask me anything ...';
