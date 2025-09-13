export const SAMPLE_MARKDOWN_CONTENT = `# Comprehensive Guide to Modern JavaScript

This guide covers the essential features of modern JavaScript (ES6 and beyond), designed to make you a more effective developer. We'll explore everything from variables to asynchronous programming.

## Chapter 1: Core Concepts

### Variables and Scoping
JavaScript has evolved from \`var\` to \`let\` and \`const\`.

- **\`let\`**: Allows you to declare block-scoped local variables.
- **\`const\`**: For variables that shouldn't be reassigned.

> **Best Practice**: Always use \`const\` by default and switch to \`let\` only when you need to reassign a variable. Avoid \`var\` completely in modern codebases.

Here's a code example demonstrating block scope:
\`\`\`javascript
function scopeTest() {
  if (true) {
    let blockScoped = "I'm only here!";
    const alsoBlockScoped = "Me too!";
    console.log(blockScoped); // Works
  }
  // console.log(blockScoped); // ReferenceError: blockScoped is not defined
}
\`\`\`

---

## Chapter 2: Functions & Arrow Functions

Arrow functions provide a more concise syntax for writing function expressions. They are especially useful for functions that you pass as arguments.

### Syntax Comparison
*Normal Function:*
\`\`\`javascript
const add = function(a, b) {
  return a + b;
};
\`\`\`

*Arrow Function:*
\`\`\`javascript
const addArrow = (a, b) => a + b;
\`\`\`

*This is a sentence with **bold**, _italic_, and ~~strikethrough~~ text.*

### Key Differences:
1.  **Concise Syntax**: Shorter and cleaner.
2.  **No \`this\` binding**: Arrow functions do not have their own \`this\` context. They inherit \`this\` from the parent scope.
3.  **Implicit Return**: If the function body is a single expression, you can omit the curly braces and the \`return\` keyword.

## Chapter 3: Asynchronous JavaScript

Handling asynchronous operations is crucial. Modern JavaScript offers \`async/await\` for cleaner asynchronous code.

### Using \`async/await\`
\`\`\`javascript
async function fetchData() {
  try {
    const response = await fetch('https://api.example.com/data');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Failed to fetch data:', error);
  }
}
\`\`\`

This is much more readable than using nested \`.then()\` callbacks. For more information, you can visit the [MDN Web Docs](https://developer.mozilla.org/).
`;

export const SAMPLE_CHAT_MESSAGES = {
  GREETING: 'Hello! How can I help you today?',
  USER_REQUEST:
    'I need a comprehensive overview of modern JavaScript features.',
  LLM_RESPONSE: SAMPLE_MARKDOWN_CONTENT,
};
