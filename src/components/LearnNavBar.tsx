
"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useLearningStore } from "@/store/learningStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Home, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";

export function LearnNavBar() {
  const { currentPath, currentSection, loadPath, loadSection } = useLearningStore();

  const {
    allSections,
    currentSectionIndex,
    currentChapterTitle,
    progressValue,
    language,
  } = useMemo(() => {
    if (!currentPath || !currentSection) {
      return {
        allSections: [],
        currentSectionIndex: -1,
        currentChapterTitle: "",
        progressValue: 0,
        language: '',
        sectionId: ''
      };
    }

    const sections = currentPath.chapters.flatMap((ch) => ch.sections);
    const currentIndex = sections.findIndex((s) => s.id === currentSection.id);
    const chapter = currentPath.chapters.find((ch) => 
      ch.sections.some(section => section.id === currentSection.id)
    );
    const progress = sections.length > 0 ? ((currentIndex + 1) / sections.length) * 100 : 0;

    return {
      allSections: sections,
      currentSectionIndex: currentIndex,
      currentChapterTitle: chapter?.title || "",
      progressValue: progress,
      language: currentPath.language,
      sectionId: currentSection.id
    };
  }, [currentPath, currentSection]);

  const handleLanguageChange = (newLang: "python" | "javascript") => {
    if (newLang !== language) {
      loadPath(newLang);
    }
  };

  const navigateToSection = (offset: number) => {
    const newIndex = currentSectionIndex + offset;
    if (newIndex >= 0 && newIndex < allSections.length) {
      const newSection = allSections[newIndex];
      loadSection(newSection.id);
    }
  };

  if (!currentPath) {
    // You might want a more sophisticated loading skeleton here
    return (
      <div className="flex items-center justify-between px-4 py-2 border-b bg-background h-16">
        <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
        <div className="animate-pulse bg-gray-200 h-8 w-48 rounded"></div>
        <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <header className="flex items-center justify-between h-16 px-4 md:px-6 border-b">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <BookOpen className="h-6 w-6" />
            <span className="hidden sm:inline-block">My Dashboard</span>
          </Link>
          <Select
            value={language as string}
            onValueChange={(value) => handleLanguageChange(value as "python" | "javascript")}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="选择语言" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="javascript">JavaScript</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Center Section */}
        <div className="flex-1 flex items-center justify-center gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateToSection(-1)}
                disabled={currentSectionIndex <= 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>上一节</p>
            </TooltipContent>
          </Tooltip>
          <div className="text-center">
            <p className="text-sm font-medium truncate">{currentChapterTitle}</p>
            <p className="text-xs text-muted-foreground truncate">
              {allSections[currentSectionIndex]?.title}
            </p>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateToSection(1)}
                disabled={currentSectionIndex >= allSections.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>下一节</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 w-32">
            <Progress value={progressValue} className="w-full" />
            <span className="text-xs text-muted-foreground">
              {currentSectionIndex + 1}/{allSections.length}
            </span>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/">
                  <Home className="h-4 w-4" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>返回主页</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </header>
    </TooltipProvider>
  );
}
