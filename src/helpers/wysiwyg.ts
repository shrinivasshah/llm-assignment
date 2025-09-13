export const setEmojis = ({ query }: { query: string }) => {
  // Simple emoji suggestions - you can expand this list
  const emojis = [
    { name: 'smile', emoji: '😊' },
    { name: 'heart', emoji: '❤️' },
    { name: 'thumbs_up', emoji: '👍' },
    { name: 'fire', emoji: '🔥' },
    { name: 'star', emoji: '⭐' },
    { name: 'party', emoji: '🎉' },
    { name: 'thinking', emoji: '🤔' },
    { name: 'cry', emoji: '😢' },
    { name: 'laugh', emoji: '😂' },
    { name: 'love', emoji: '😍' },
  ];

  return emojis
    .filter(item => item.name.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5);
};
