'use client';

import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { SectionLink } from '@/types';
import { useLearningStore } from '@/store/learningStore';
import { useRouter } from 'next/navigation';

interface SectionLinkTagProps {
  link: SectionLink;
  onClick: (sectionId: string) => void;
}

export function SectionLinkTag({ link, onClick }: SectionLinkTagProps) {
  const router = useRouter();
  const { loadPath, loadSection } = useLearningStore();
  const languageLabel = link.language === 'javascript' ? 'JS' : 'PY';
  
  const handleClick = async () => {
    // 如果是跨语言跳转，先切换到对应语言的页面
    const currentPath = useLearningStore.getState().currentPath;
    if (currentPath?.language !== link.language) {
      // 先导航到对应语言的学习页面
      router.push('/learn');
      // 加载对应语言的路径
      await loadPath(link.language);
    }
    // 加载对应的章节
    await loadSection(link.sectionId);
    // 调用传入的 onClick 回调
    onClick(link.sectionId);
  };
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClick}
            className="gap-1 h-7 px-2 text-xs"
          >
            <span className="font-mono text-[10px] text-muted-foreground">[{languageLabel}]</span>
            <BookOpen className="h-3 w-3" />
            {link.title}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-medium">跳转到：{link.title}</p>
            <p className="text-xs text-muted-foreground">
              语言：{link.language === 'javascript' ? 'JavaScript' : 'Python'}
            </p>
            {link.chapterTitle && (
              <p className="text-xs text-muted-foreground">
                章节：{link.chapterTitle}
              </p>
            )}
            {link.matchedKeywords && link.matchedKeywords.length > 0 && (
              <p className="text-xs text-muted-foreground">
                相关：{link.matchedKeywords.slice(0, 3).join(', ')}
              </p>
            )}
            {link.relevanceScore !== undefined && (
              <p className="text-xs text-muted-foreground">
                相关度：{Math.round(link.relevanceScore * 100)}%
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}