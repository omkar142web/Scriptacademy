import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function CodeBlockHeader({ language }) {
  return (
    <div className="code-block-header">{language}</div>
  );
}

export default function MarkdownRenderer({ content }) {
  return (
    <article className="markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          pre({ children }) {
            const child = children
              ? children.props || {}
              : {};

            const className = child.className || '';
            const match = /language-([\w-]+)/.exec(className);

            return (
              <div className="code-block">
                {match && (
                  <CodeBlockHeader
                    language={match[1]}
                  />
                )}
                <pre>{children}</pre>
              </div>
            );
          },

          code({ className, children }) {
            if (className && /language-/.test(className)) {
              return <code className={className}>{children}</code>;
            }

            return <code className="inline-code">{children}</code>;
          },

          a({ href, children }) {
            const isExternal = /^https?:/.test(href || '');

            return (
              <a
                href={href}
                target={
                  isExternal ? '_blank' : undefined
                }
                rel={
                  isExternal ? 'noreferrer' : undefined
                }
              >
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}