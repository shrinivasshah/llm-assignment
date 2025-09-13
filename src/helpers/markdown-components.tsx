import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Components } from 'react-markdown';

export const markdownComponents: Components = {
  code: ({ className, children, inline, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : 'text';

    // Use the inline prop from react-markdown to determine if it's inline or block code
    if (inline) {
      return (
        <code
          className='bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-800'
          {...props}
        >
          {children}
        </code>
      );
    }

    // Block code - render with syntax highlighter
    return (
      <div className='my-4'>
        <SyntaxHighlighter
          style={tomorrow as React.CSSProperties}
          language={language}
          PreTag='div'
          customStyle={{
            background: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '8px',
            padding: '1rem',
            margin: 0,
            fontSize: '14px',
          }}
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      </div>
    );
  },
  pre: ({ children, ...props }: any) => {
    // Just return the children, let the code component handle the styling
    return <div {...props}>{children}</div>;
  },
  h1: ({ children }) => (
    <h1 className='text-2xl font-bold mb-4 text-white lg:text-gray-900'>
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className='text-xl font-bold mb-3 text-white lg:text-gray-900'>
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className='text-lg font-semibold mb-2 text-white lg:text-gray-900'>
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className='text-base leading-7 mb-4 text-white lg:text-gray-900'>
      {children}
    </p>
  ),
  blockquote: ({ children }) => (
    <blockquote className='border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 italic mb-4 text-gray-700'>
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
  li: ({ children }) => (
    <li className='mb-1 text-white lg:text-gray-900'>{children}</li>
  ),
  strong: ({ children }) => (
    <strong className='font-semibold text-white lg:text-gray-900'>
      {children}
    </strong>
  ),
  em: ({ children }) => (
    <em className='italic text-white lg:text-gray-900'>{children}</em>
  ),
  hr: () => <hr className='my-6 border-gray-300' />,
  table: ({ children }) => (
    <div className='overflow-x-auto mb-4'>
      <table className='min-w-full border-collapse border border-gray-300'>
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => <thead className='bg-gray-50'>{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => (
    <tr className='border-b border-gray-300'>{children}</tr>
  ),
  th: ({ children }) => (
    <th className='border border-gray-300 px-4 py-2 text-left font-semibold text-white lg:text-gray-900'>
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className='border border-gray-300 px-4 py-2 text-white lg:text-gray-900'>
      {children}
    </td>
  ),
};
