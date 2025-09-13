import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Components } from 'react-markdown';

export const markdownComponents: Components = {
  code: ({ className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    const isInline = !match;
    return !isInline ? (
      <SyntaxHighlighter
        style={tomorrow as React.CSSProperties}
        language={match[1]}
        PreTag='div'
        {...props}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    ) : (
      <code
        className='bg-gray-100 px-1 py-0.5 rounded text-sm font-mono'
        {...props}
      >
        {children}
      </code>
    );
  },
  h1: ({ children }) => (
    <h1 className='text-2xl font-bold mb-4 text-gray-900'>{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className='text-xl font-bold mb-3 text-gray-900'>{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className='text-lg font-semibold mb-2 text-gray-900'>{children}</h3>
  ),
  p: ({ children }) => (
    <p className='text-base leading-7 mb-4 text-gray-900'>{children}</p>
  ),
  blockquote: ({ children }) => (
    <blockquote className='border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 italic mb-4'>
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => (
    <a href={href} className='text-blue-600 hover:underline'>
      {children}
    </a>
  ),
  ul: ({ children }) => <ul className='mb-4 pl-6 list-disc'>{children}</ul>,
  ol: ({ children }) => <ol className='mb-4 pl-6 list-decimal'>{children}</ol>,
  li: ({ children }) => <li className='mb-1'>{children}</li>,
};
