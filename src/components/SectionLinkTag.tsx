'use client';

import { SectionLink } from '@/types';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BookOpen } from 'lucide-react';

interface SectionLinkTagProps {
  link: SectionLink;
  onClick: (sectionId: string) => void;
}

export function SectionLinkTag({ link, onClick }: SectionLinkTagProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onClick(link.sectionId)}
            className="gap-1"
          >
            <BookOpen className="h-3 w-3" />
            {link.title}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>跳转到：{link.title}</p>
          {link.matchedKeywords && link.matchedKeywords.length > 0 && (
            <p className="text-xs text-muted-foreground">
              相关：{link.matchedKeywords.join(', ')}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}