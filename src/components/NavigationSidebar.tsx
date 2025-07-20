'use client';

import { useLearningStore } from '@/store/learningStore';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Search, ChevronRight, CheckCircle2, Circle, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function NavigationSidebar() {
  const currentPath = useLearningStore((state) => state.currentPath);
  const currentSection = useLearningStore((state) => state.currentSection);
  const loadSection = useLearningStore((state) => state.loadSection);
  const loadPath = useLearningStore((state) => state.loadPath);
  const uiState = useLearningStore((state) => state.uiState);
  const updateUserCode = useLearningStore((state) => state.updateUserCode);
  const updateUIState = useLearningStore((state) => state.updateUIState);
  const { expandedChapters, searchQuery } = uiState;
  const currentSectionId = currentSection?.id || '';


  const filteredChapters = currentPath?.chapters.map(chapter => ({
    ...chapter,
    sections: chapter.sections.filter(section =>
      section.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(chapter => 
    chapter.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    chapter.sections.length > 0
  ) || [];

  const handleSectionClick = (section: { id: string; title: string; chapterId: string }) => {
    loadSection(section.id);
  };

  const handleLanguageChange = (language: 'python' | 'javascript') => {
    loadPath(language);
  };

  const isSectionCompleted = (_sectionId: string) => {
    let hash = 0;
    for (let i = 0; i < _sectionId.length; i++) {
      const char = _sectionId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash) % 10 > 7;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">课程目录</h2>
          {currentPath && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  {currentPath.language === 'python' ? 'Python' : 'JavaScript'}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleLanguageChange('python')}>
                  Python
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange('javascript')}>
                  JavaScript
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索章节..."
            value={searchQuery}
            onChange={(e) => updateUIState({ searchQuery: e.target.value })}
            className="pl-9 text-sm"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {filteredChapters.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">
              未找到匹配的章节
            </div>
          ) : (
            <Accordion
              type="multiple"
              value={expandedChapters}
              onValueChange={(value) => updateUIState({ expandedChapters: value })}
            >
              {filteredChapters.map((chapter, chapterIndex) => (
                <AccordionItem key={chapter.id} value={chapter.id}>
                  <AccordionTrigger className="px-0 py-3 hover:no-underline">
                    <div className="flex items-center gap-2 text-left">
                      <span className="text-xs font-mono text-muted-foreground">
                        {String(chapterIndex + 1).padStart(2, '0')}
                      </span>
                      <span className="font-medium">{chapter.title}</span>
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {chapter.sections.length}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="space-y-1">
                      {chapter.sections.map((section, sectionIndex) => (
                        <Button
                          key={section.id}
                          variant={currentSectionId === section.id ? "secondary" : "ghost"}
                          className="w-full justify-start text-left px-3 py-2 h-auto font-normal"
                          onClick={() => handleSectionClick(section)}
                        >
                          <div className="flex items-center gap-2 w-full">
                            {isSectionCompleted(section.id) ? (
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                            ) : (
                              <Circle className="h-3 w-3 text-muted-foreground" />
                            )}
                            <span className="text-sm">
                              {String(sectionIndex + 1).padStart(2, '0')} {section.title}
                            </span>
                            <ChevronRight className="h-3 w-3 ml-auto text-muted-foreground" />
                          </div>
                        </Button>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <div className="text-xs text-muted-foreground text-center">
          总进度: {currentPath?.chapters.reduce((acc, ch) => acc + ch.sections.length, 0) || 0} 章节
        </div>
      </div>
    </div>
  );
}
