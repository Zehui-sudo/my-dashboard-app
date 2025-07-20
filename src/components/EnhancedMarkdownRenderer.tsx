'use client';

import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { cn } from '@/lib/utils';
import { SyntaxHighlighter } from './SyntaxHighlighter';

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
    <div className={cn("markdown", className)}>
      <ReactMarkdown
        remarkPlugins={plugins}
        rehypePlugins={rehypePlugins}
        components={{
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const codeContent = String(children).replace(/\n$/, '');
            
            // Check if this is a block-level code element
            const isBlock = !className?.includes('inline');
            
            if (isBlock && match) {
              return (
                <div className="code-block">
                  <div className="code-header">
                    <span className="code-language">{match[1]}</span>
                    <div className="code-actions">
                      <button 
                        className="copy-button"
                        onClick={() => navigator.clipboard.writeText(codeContent)}
                        title="Copy code"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="code-content">
                    <SyntaxHighlighter 
                      code={codeContent} 
                      language={match[1]} 
                    />
                  </div>
                </div>
              );
            }
            
            return (
              <code className={cn("bg-muted px-1 py-0.5 rounded text-xs", className)} {...props}>
                {children}
              </code>
            );
          },
          h1: ({ children }) => <h1>{children}</h1>,
          h2: ({ children }) => <h2>{children}</h2>,
          h3: ({ children }) => <h3>{children}</h3>,
          h4: ({ children }) => <h4>{children}</h4>,
          h5: ({ children }) => <h5>{children}</h5>,
          h6: ({ children }) => <h6>{children}</h6>,
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
            <div className="overflow-x-auto">
              <table className="table-auto">
                {children}
              </table>
            </div>
          ),
          blockquote: ({ children }) => <blockquote>{children}</blockquote>,
          ul: ({ children }) => <ul>{children}</ul>,
          ol: ({ children }) => <ol>{children}</ol>,
          li: ({ children }) => <li>{children}</li>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}