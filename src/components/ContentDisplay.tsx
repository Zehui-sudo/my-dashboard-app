'use client';

import { useEffect } from 'react';
import { useLearningStore } from '@/store/learningStore';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, BookOpen } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { InteractiveCodeBlock } from './InteractiveCodeBlock';
import { useParams } from 'next/navigation';

export function ContentDisplay() {
  const { 
    currentSection, 
    loading, 
    error, 
    loadSection 
  } = useLearningStore();
  
  const params = useParams();
  const sectionId = params.sectionId as string;

  useEffect(() => {
    if (sectionId) {
      loadSection(sectionId);
    }
  }, [sectionId]);

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
      <div className="border-b p-4">
        <h1 className="text-2xl font-bold">{currentSection.id.split('-').pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          交互式学习体验，边学边练
        </p>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
          {currentSection.contentBlocks.map((block, index) => (
            <div key={index}>
              {block.type === 'markdown' && (
                <Card>
                  <CardContent className="pt-6">
                    <MarkdownRenderer content={block.content} />
                  </CardContent>
                </Card>
              )}
              
              {block.type === 'code' && (
                <InteractiveCodeBlock
                  language={block.language}
                  initialCode={block.code}
                  sectionId={currentSection.id}
                />
              )}
            </div>
          ))}
          
          {currentSection.contentBlocks.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">内容准备中</h3>
                  <p className="text-sm text-muted-foreground">
                    这个章节的内容正在精心准备中，敬请期待！
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}