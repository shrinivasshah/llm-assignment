import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
const model = import.meta.env.VITE_OPENAI_MODEL;

if (!apiKey) {
  console.warn(
    'VITE_OPENAI_API_KEY is not configured. Please add your OpenAI API key to the environment variables.'
  );
}

if (!model) {
  console.warn(
    'VITE_OPENAI_MODEL is not configured. Please add your OpenAI model to the environment variables.'
  );
}

export const client = new OpenAI({
  apiKey: apiKey || 'missing-api-key',
  dangerouslyAllowBrowser: true,
});

export const getConfigurationError = (): string | null => {
  if (!apiKey) {
    return 'OpenAI API key is not configured. Please configure your API key properly in the environment variables.';
  }
  if (!model) {
    return 'OpenAI model is not configured. Please configure your model properly in the environment variables.';
  }
  return null;
};

export const isConfigured = (): boolean => {
  return !!(apiKey && model);
};
