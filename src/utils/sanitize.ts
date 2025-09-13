/**
 * Sanitizes HTML content by removing HTML tags and preserving only the text content.
 * This is used to clean user input before sending to LLM while preserving the original
 * HTML for display purposes.
 *
 * @param html - The HTML string to sanitize
 * @returns Clean text content without HTML tags
 */
export const sanitizeHtmlForLLM = (html: string): string => {
  // Create a temporary DOM element to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Get text content which automatically strips HTML tags
  const textContent = tempDiv.textContent || tempDiv.innerText || '';

  // Clean up any extra whitespace while preserving intentional line breaks
  return textContent
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim(); // Remove leading/trailing whitespace
};

/**
 * Alternative sanitization method using regex for environments where DOM manipulation
 * might not be available or preferred.
 *
 * @param html - The HTML string to sanitize
 * @returns Clean text content without HTML tags
 */
export const sanitizeHtmlForLLMRegex = (html: string): string => {
  return html
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
    .replace(/&amp;/g, '&') // Replace HTML entities
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim(); // Remove leading/trailing whitespace
};
