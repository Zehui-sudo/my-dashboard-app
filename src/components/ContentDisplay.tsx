'use client';

import { useRef, useEffect } from 'react';
import { useLearningStore } from '@/store/learningStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, BookOpen } from 'lucide-react';
import { EnhancedMarkdownRenderer } from './EnhancedMarkdownRenderer';
import { InteractiveCodeBlock } from './InteractiveCodeBlock';
import { useTextSelection } from '@/hooks/useTextSelection';

export function ContentDisplay() {
  const currentSection = useLearningStore((state) => state.currentSection);
  const loading = useLearningStore((state) => state.loading);
  const error = useLearningStore((state) => state.error);
  const fontSize = useLearningStore((state) => state.fontSize);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const currentSectionIdRef = useRef(currentSection?.id);
  
  // Enable text selection
  useTextSelection(contentRef);

  // Only reset scroll when section changes, not when content updates
  useEffect(() => {
    if (currentSectionIdRef.current !== currentSection?.id) {
      currentSectionIdRef.current = currentSection?.id;
      // Reset scroll position when navigating to a new section
      const scrollElement = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = 0;
      }
    }
  }, [currentSection?.id]);

  if (loading.section) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="space-y-4 w-full max-w-2xl">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-8 w-1/4" />
        </div>
      </div>
    );
  }

  if (error.section) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>加载失败</AlertTitle>
          <AlertDescription>
            {error.section}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!currentSection) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">选择学习内容</h3>
          <p className="text-sm text-muted-foreground">
            请从左侧导航栏选择一个章节开始学习
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}

      {/* Content */}
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div 
          ref={contentRef}
          className="p-6 pt-0 space-y-6 max-w-4xl mx-auto"
          style={{ 
            fontSize: `${fontSize}px`,
            lineHeight: fontSize >= 18 ? 1.8 : 1.6
          }}>
          {currentSection.contentBlocks.map((block, index) => (
            <div key={`block-${currentSection.id}-${index}`}>
              {block.type === 'markdown' && (
                <div className="max-w-none">
                  <EnhancedMarkdownRenderer content={block.content} fontSize={fontSize} />
                </div>
              )}
              
              {block.type === 'code' && (
                <InteractiveCodeBlock
                  key={`${currentSection.id}-${index}`}
                  language={block.language}
                  initialCode={block.code}
                  sectionId={currentSection.id}
                  fontSize={fontSize}
                />
              )}
            </div>
          ))}
          
          {currentSection.contentBlocks.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">内容准备中</h3>
              <p className="text-sm text-muted-foreground">
                这个章节的内容正在精心准备中，敬请期待��
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}