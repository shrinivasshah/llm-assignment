import type { Message, ConversationPair } from '@/context/types';
import { EChatUserType } from '@/context/enums';

export const generateUser = ({
  id,
  content,
  sender,
  timestamp,
}: Message): Message => ({
  id,
  content,
  sender,
  timestamp,
});

export const createConfigurationErrorConversation = (
  userContent: string
): ConversationPair => {
  const userMessage: Message = {
    id: `user-${Date.now()}`,
    content: userContent.trim(),
    sender: EChatUserType.USER,
    timestamp: new Date(),
  };

  const systemMessage: Message = {
    id: `system-${Date.now()}`,
    content: `**OpenAI Not Configured**\n\nOpenAI API key is not configured. Please configure your API key properly in the environment variables.\n\n**To fix this:**\n1. Get your OpenAI API key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys)\n2. Update your \`.env.local\` file with: \`VITE_OPENAI_API_KEY=your-actual-api-key\`\n3. Add the model: \`VITE_OPENAI_MODEL=gpt-3.5-turbo\`\n4. Refresh the page`,
    sender: EChatUserType.SYSTEM,
    timestamp: new Date(),
  };

  return {
    id: `conv-${Date.now()}`,
    user: userMessage,
    system: systemMessage,
    timestamp: new Date(),
  };
};
