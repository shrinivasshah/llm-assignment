import { EChatUserType } from '@/context/enums';
import type { Message } from '@/context/types';

export const extractChatTitle = (
  message: string,
  maxWords: number = 4
): string => {
  const words = message.trim().split(/\s+/);
  const titleWords = words.slice(0, maxWords);

  const title = titleWords.join(' ');
  return words.length > maxWords ? `${title}...` : title;
};

export const identifySender = (messages: Message[]) =>
  messages
    .map((msg, index) => ({ msg, index }))
    .filter(({ msg }) => msg.sender === EChatUserType.SYSTEM)
    .pop()?.index;
