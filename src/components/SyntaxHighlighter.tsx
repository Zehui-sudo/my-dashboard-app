'use client';

import React, { useEffect, useState } from 'react';

interface SyntaxHighlighterProps {
  code: string;
  language?: string;
  className?: string;
}

// Basic syntax highlighting using regex patterns
const languagePatterns = {
  javascript: {
    keywords: /\b(const|let|var|function|return|if|else|for|while|class|extends|import|export|async|await|try|catch|finally)\b/g,
    strings: /(["'])((?:(?!\1)[^\\]|\\.)*)(\1)/g,
    comments: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
    numbers: /\b\d+(\.\d+)?\b/g,
    functions: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g,
  },
  typescript: {
    keywords: /\b(const|let|var|function|return|if|else|for|while|class|extends|import|export|async|await|try|catch|finally|interface|type|enum|namespace|declare|readonly|private|public|protected)\b/g,
    strings: /(["'])((?:(?!\1)[^\\]|\\.)*)(\1)/g,
    comments: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
    numbers: /\b\d+(\.\d+)?\b/g,
    types: /\b(string|number|boolean|void|any|unknown|never|object|Array)\b/g,
    functions: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g,
  },
  python: {
    keywords: /\b(def|class|import|from|if|else|elif|for|while|try|except|finally|with|as|lambda|return|yield|break|continue|pass|True|False|None)\b/g,
    strings: /(["'])((?:(?!\1)[^\\]|\\.)*)(\1)/g,
    comments: /(#.*$)/gm,
    numbers: /\b\d+(\.\d+)?\b/g,
    functions: /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g,
  },
  css: {
    keywords: /\b(html|body|div|span|class|id|@media|@import|@keyframes)\b/g,
    properties: /\b(color|background|margin|padding|width|height|display|position|top|left|right|bottom|font-size|font-family|border|border-radius)\b/g,
    values: /\b(red|blue|green|yellow|black|white|solid|dashed|none|block|inline|flex|grid|absolute|relative|fixed)\b/g,
    strings: /(["'])((?:(?!\1)[^\\]|\\.)*)(\1)/g,
    comments: /(\/\*[\s\S]*?\*\/)/gm,
  },
  html: {
    tags: /\b(\/?[a-zA-Z][a-zA-Z0-9-]*)/g,
    attributes: /\b([a-zA-Z-]+)(?==["'])/g,
    strings: /(["'])((?:(?!\1)[^\\]|\\.)*)(\1)/g,
    comments: /(\u003c!--[\s\S]*?--\u003e)/gm,
  },
};

function highlightCode(code: string, language: string) {
  const patterns = languagePatterns[language as keyof typeof languagePatterns];
  if (!patterns) return code;

  let highlightedCode = code;
  
  // Apply highlighting patterns
  Object.entries(patterns).forEach(([type, pattern]) => {
    highlightedCode = highlightedCode.replace(pattern, (match) => {
      switch (type) {
        case 'keywords':
          return `<span class="text-blue-600 dark:text-blue-400 font-semibold">${match}</span>`;
        case 'strings':
          return `<span class="text-green-600 dark:text-green-400">${match}</span>`;
        case 'comments':
          return `<span class="text-gray-500 dark:text-gray-400 italic">${match}</span>`;
        case 'numbers':
          return `<span class="text-purple-600 dark:text-purple-400">${match}</span>`;
        case 'functions':
          return `<span class="text-yellow-600 dark:text-yellow-400">${match}</span>`;
        case 'types':
          return `<span class="text-cyan-600 dark:text-cyan-400">${match}</span>`;
        case 'tags':
          return `<span class="text-blue-600 dark:text-blue-400">${match}</span>`;
        case 'attributes':
          return `<span class="text-red-600 dark:text-red-400">${match}</span>`;
        case 'properties':
          return `<span class="text-indigo-600 dark:text-indigo-400">${match}</span>`;
        case 'values':
          return `<span class="text-teal-600 dark:text-teal-400">${match}</span>`;
        default:
          return match;
      }
    });
  });

  return highlightedCode;
}

export function SyntaxHighlighter({ code, language = 'text', className }: SyntaxHighlighterProps) {
  const [highlightedCode, setHighlightedCode] = useState('');

  useEffect(() => {
    const highlighted = highlightCode(code, language);
    setHighlightedCode(highlighted);
  }, [code, language]);

  return (
    <pre className={className}>
      <code 
        dangerouslySetInnerHTML={{ __html: highlightedCode }}
        className="text-sm font-mono"
      />
    </pre>
  );
}

// Simple code block component with language detection
export function CodeBlock({ code, language, className }: SyntaxHighlighterProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayLanguage = language || 'text';

  return (
    <div className={`code-block ${className || ''}`}>
      <div className="code-header">
        <span className="code-language">{displayLanguage}</span>
        <button 
          className="copy-button"
          onClick={handleCopy}
          title="Copy code"
        >
          {copied ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          )}
        </button>
      </div>
      <div className="code-content">
        <SyntaxHighlighter code={code} language={language} />
      </div>
    </div>
  );
}