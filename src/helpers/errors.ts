export const getErrorMessage = (error: unknown): string => {
  let errorMessage = 'Something went wrong. Please try again.';

  if (error instanceof Error) {
    if (error.message.includes('401')) {
      errorMessage =
        'Invalid API key. Please configure your OpenAI API key properly.';
    } else if (error.message.includes('429')) {
      errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
    } else if (error.message.includes('403')) {
      errorMessage = 'Access forbidden. Please check your API key permissions.';
    } else if (error.message.includes('404')) {
      errorMessage =
        'Model not found. Please check your OpenAI model configuration.';
    } else if (
      error.message.includes('network') ||
      error.message.includes('fetch')
    ) {
      errorMessage =
        'Network error. Please check your internet connection and try again.';
    } else if (error.message.includes('timeout')) {
      errorMessage = 'Request timed out. Please try again.';
    } else {
      errorMessage = error.message || 'Something went wrong. Please try again.';
    }
  }

  return errorMessage;
};
