export const extractChatTitle = (
  message: string,
  maxWords: number = 4
): string => {
  const words = message.trim().split(/\s+/);
  const titleWords = words.slice(0, maxWords);

  const title = titleWords.join(' ');
  return words.length > maxWords ? `${title}...` : title;
};
