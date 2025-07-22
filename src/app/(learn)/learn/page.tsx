'use client';

import { useEffect } from 'react';
import { useLearningStore } from '@/store/learningStore';
import { ContentDisplay } from '@/components/ContentDisplay';

interface LearnPageProps {
  language?: string;
}

export default function LearnPage({ language = 'python' }: LearnPageProps) {
  const loadPath = useLearningStore((state) => state.loadPath);

  useEffect(() => {
    loadPath(language as 'python' | 'javascript');
  }, [language, loadPath]);

  // The layout is now handled by the parent layout.tsx
  // This component is only responsible for displaying the content.
  return <ContentDisplay />;
}
