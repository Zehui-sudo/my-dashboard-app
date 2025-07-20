'use client';

import React, { memo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { EditorView } from '@codemirror/view';
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';

interface CodeMirrorCodeBlockProps {
  value: string;
  onChange?: (value: string) => void;
  onBlur?: (value: string) => void;
  language: 'javascript' | 'python';
  height?: string;
  readOnly?: boolean;
  className?: string;
}

export const CodeMirrorCodeBlock = memo(function CodeMirrorCodeBlock({
  value,
  onChange,
  onBlur,
  language,
  height = '200px',
  readOnly = false,
  className = '',
}: CodeMirrorCodeBlockProps) {

  // Create custom theme extensions to match page background
  const themeExtension = EditorView.theme({
    '&': {
      backgroundColor: 'var(--background)',
      color: 'var(--foreground)',
    },
    '.cm-editor': {
      backgroundColor: 'var(--background)',
    },
    '.cm-editor.cm-focused': {
      outline: 'none',
    },
    '.cm-content': {
      backgroundColor: 'var(--background)',
      color: 'var(--foreground)',
      caretColor: 'var(--foreground)',
    },
    '.cm-scroller': {
      fontFamily: 'var(--font-mono)',
      backgroundColor: 'var(--background)',
    },
    '.cm-gutters': {
      backgroundColor: 'var(--background)',
      color: 'var(--muted-foreground)',
      borderRight: '1px solid var(--border)',
    },
    '.cm-gutter': {
      backgroundColor: 'var(--background)',
    },
    '.cm-lineNumbers': {
      backgroundColor: 'var(--background)',
    },
    '.cm-gutterElement': {
      backgroundColor: 'var(--background)',
      color: 'var(--muted-foreground)',
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'var(--muted)',
      color: 'var(--foreground)',
    },
    '.cm-activeLine': {
      backgroundColor: 'var(--accent)',
    },
    '.cm-selectionBackground': {
      backgroundColor: 'var(--accent)',
    },
    '&.cm-focused .cm-selectionBackground': {
      backgroundColor: 'var(--accent)',
    },
    '.cm-cursor, .cm-dropCursor': {
      borderLeftColor: 'var(--foreground)',
    },
    '.cm-focused .cm-cursor': {
      borderLeftColor: 'var(--foreground)',
    },
    '.cm-line': {
      padding: '0 2px 0 4px',
    },
    '.cm-tooltip': {
      backgroundColor: 'var(--popover)',
      color: 'var(--popover-foreground)',
      border: '1px solid var(--border)',
    },
    '.cm-tooltip-autocomplete': {
      '& > ul': {
        fontFamily: 'var(--font-mono)',
        backgroundColor: 'var(--popover)',
      },
      '& > ul > li[aria-selected]': {
        backgroundColor: 'var(--accent)',
        color: 'var(--accent-foreground)',
      },
    },
    '.cm-search': {
      backgroundColor: 'var(--popover)',
      color: 'var(--popover-foreground)',
    },
    '.cm-button': {
      backgroundColor: 'var(--primary)',
      color: 'var(--primary-foreground)',
    },
  });

  const languageExtension = language === 'javascript' 
    ? javascript({ jsx: true, typescript: true })
    : python();

  const blurExtension = EditorView.updateListener.of((update) => {
    if (update.focusChanged && !update.view.hasFocus && onBlur) {
      onBlur(update.state.doc.toString());
    }
  });

  return (
    <div 
      className={`border rounded-md overflow-hidden bg-background ${className}`}
    >
      <CodeMirror
        value={value}
        height={height}
        theme={undefined}
        extensions={[
          languageExtension, 
          themeExtension,
          syntaxHighlighting(defaultHighlightStyle),
          blurExtension,
        ]}
        onChange={onChange}
        readOnly={readOnly}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLine: !readOnly,
          highlightActiveLineGutter: !readOnly,
          foldGutter: true,
          dropCursor: true,
          allowMultipleSelections: false,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          rectangularSelection: false,
          crosshairCursor: false,
          highlightSelectionMatches: true,
          searchKeymap: false,
        }}
        style={{
          fontSize: '14px',
        }}
      />
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  return (
    prevProps.value === nextProps.value &&
    prevProps.language === nextProps.language &&
    prevProps.height === nextProps.height &&
    prevProps.readOnly === nextProps.readOnly &&
    prevProps.className === nextProps.className &&
    prevProps.onChange === nextProps.onChange &&
    prevProps.onBlur === nextProps.onBlur
  );
});