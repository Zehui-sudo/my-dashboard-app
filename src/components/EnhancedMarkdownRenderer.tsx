'use client';

import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { cn } from '@/lib/utils';
import { InteractiveCodeBlock } from './InteractiveCodeBlock';

// Import KaTeX CSS for math rendering
import 'katex/dist/katex.min.css';

interface EnhancedMarkdownRendererProps {
  content: string;
  className?: string;
  enableMath?: boolean;
  enableGfm?: boolean;
}

export function EnhancedMarkdownRenderer({
  content,
  className,
  enableMath = true,
  enableGfm = true
}: EnhancedMarkdownRendererProps) {
  const plugins = useMemo(() => {
    const plugins = [];
    if (enableGfm) plugins.push(remarkGfm);
    if (enableMath) plugins.push(remarkMath);
    return plugins;
  }, [enableGfm, enableMath]);

  const rehypePlugins = useMemo(() => {
    const plugins = [];
    if (enableMath) plugins.push(rehypeKatex);
    return plugins;
  }, [enableMath]);

  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={plugins}
        rehypePlugins={rehypePlugins}
        components={{
          p: ({ node, children }) => {
            // Check if the paragraph contains a table. If so, render children directly.
            const hasTable = node.children.some(child => child.type === 'element' && child.tagName === 'table');
            if (hasTable) {
              return <>{children}</>;
            }
            // Default paragraph rendering with Tailwind classes
            return <p className="my-4 text-base leading-relaxed">{children}</p>;
          },
          code: ({ node, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const codeContent = String(children).replace(/\n$/, '');

            // Render interactive code block for specified languages
            if (match && (match[1] === 'python' || match[1] === 'javascript')) {
              const sectionId = `markdown-block-${node.position?.start.line || Math.random()}`;
              return (
                <div className="my-6">
                  <InteractiveCodeBlock
                    language={match[1]}
                    initialCode={codeContent}
                    sectionId={sectionId}
                  />
                </div>
              );
            }

            // Render inline code
            return (
              <code className="bg-muted text-muted-foreground font-mono text-sm px-1.5 py-1 rounded-md" {...props}>
                {children}
              </code>
            );
          },
          h1: ({ children }) => <h1 className="text-4xl font-bold mt-8 mb-4 pb-2 border-b">{children}</h1>,
          h2: ({ children }) => <h2 className="text-3xl font-semibold mt-10 mb-4 pb-2 border-b">{children}</h2>,
          h3: ({ children }) => <h3 className="text-2xl font-semibold mt-8 mb-4">{children}</h3>,
          h4: ({ children }) => <h4 className="text-xl font-semibold mt-6 mb-4">{children}</h4>,
          h5: ({ children }) => <h5 className="text-lg font-semibold mt-4 mb-2">{children}</h5>,
          h6: ({ children }) => <h6 className="text-base font-semibold mt-4 mb-2">{children}</h6>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="my-6 overflow-hidden rounded-lg border border-border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  {children}
                </table>
              </div>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-muted">{children}</thead>,
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => <tr className="border-b border-border hover:bg-muted/50 last:border-b-0">{children}</tr>,
          th: ({ children }) => <th className="p-3 text-left font-semibold border-r border-border last:border-r-0">{children}</th>,
          td: ({ children }) => <td className="p-3 border-r border-border last:border-r-0">{children}</td>,
          blockquote: ({ children }) => <blockquote className="my-6 pl-4 border-l-4 border-primary bg-muted/50 italic py-2">{children}</blockquote>,
          ul: ({ children }) => <ul className="my-4 ml-6 list-disc space-y-2">{children}</ul>,
          ol: ({ children }) => <ol className="my-4 ml-6 list-decimal space-y-2">{children}</ol>,
          li: ({ children }) => <li className="pl-2">{children}</li>,
          hr: () => <hr className="my-8 border-border" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}