'use client';

import { useEffect, useState } from 'react';
import { useLearningStore } from '@/store/learningStore';
import { NavigationSidebar } from './NavigationSidebar';
import { ContentDisplay } from './ContentDisplay';
import { AIChatSidebar } from './AIChatSidebar';
import { Button } from '@/components/ui/button';
import { Menu, MessageSquare, BookOpen } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import { Card } from '@/components/ui/card';

interface LearningPlatformProps {
  language?: string;
}

export function LearningPlatform({ language = 'python' }: LearningPlatformProps) {
  const { loadPath } = useLearningStore();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<'content' | 'chat'>('content');

  useEffect(() => {
    loadPath(language as 'python' | 'javascript');
  }, [language, loadPath]);

  // Desktop Layout
  const DesktopLayout = () => (
    <div className="hidden lg:flex h-screen w-full p-4 bg-background">
      <ResizablePanelGroup direction="horizontal" className="max-w-full">
        <ResizablePanel defaultSize={20} minSize={15}>
          <div className="p-4 h-full">
            <NavigationSidebar />
          </div>
        </ResizablePanel>
        <ResizableHandle className="bg-transparent" />
        <ResizablePanel defaultSize={55} className="p-1">
          <Card className="h-full w-full overflow-auto p-4 shadow-sm">
            <ContentDisplay />
          </Card>
        </ResizablePanel>
        <ResizableHandle className="bg-transparent" />
        <ResizablePanel defaultSize={25} minSize={20}>
          <div className="p-4 h-full bg-background rounded-lg">
            <AIChatSidebar />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );

  // Tablet Layout (Remains the same)
  const TabletLayout = () => (
    <div className="hidden md:grid md:grid-cols-[280px_1fr] lg:hidden h-screen">
      <div className="border-r bg-background">
        <NavigationSidebar />
      </div>
      <div className="bg-background">
        {activeMobileTab === 'content' ? <ContentDisplay /> : <AIChatSidebar />}
      </div>
    </div>
  );

  // Mobile Layout (Remains the same)
  const MobileLayout = () => (
    <div className="md:hidden h-screen flex flex-col">
      <header className="border-b p-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">CodePath</h1>
        <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <NavigationSidebar />
          </SheetContent>
        </Sheet>
      </header>
      <div className="flex-1 overflow-hidden">
        {activeMobileTab === 'content' ? <ContentDisplay /> : <AIChatSidebar />}
      </div>
      <nav className="border-t bg-background">
        <div className="flex">
          <button
            onClick={() => setActiveMobileTab('content')}
            className={`flex-1 py-3 flex flex-col items-center gap-1 ${
              activeMobileTab === 'content' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <BookOpen className="h-5 w-5" />
            <span className="text-xs">内容</span>
          </button>
          <button
            onClick={() => setActiveMobileTab('chat')}
            className={`flex-1 py-3 flex flex-col items-center gap-1 ${
              activeMobileTab === 'chat' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <MessageSquare className="h-5 w-5" />
            <span className="text-xs">AI助手</span>
          </button>
        </div>
      </nav>
    </div>
  );

  return (
    <div className="h-screen bg-background">
      <DesktopLayout />
      <TabletLayout />
      <MobileLayout />
    </div>
  );
}
