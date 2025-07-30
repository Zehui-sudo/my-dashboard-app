'use client';

import { LearnNavBar } from '@/components/LearnNavBar';
import { NavigationSidebar } from '@/components/NavigationSidebar';
import { AIChatSidebar } from '@/components/AIChatSidebar';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import { Card } from '@/components/ui/card';

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen">
      <LearnNavBar />
      <main className="flex-1 overflow-hidden">
        {/* TODO: Add mobile and tablet layouts */}
        <div className="hidden lg:flex h-full w-full p-4 bg-background">
          <ResizablePanelGroup direction="horizontal" className="max-w-full">
            <ResizablePanel defaultSize={20} minSize={15}>
              <div className="h-full overflow-hidden">
                <NavigationSidebar />
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle className="opacity-0" />
            <ResizablePanel defaultSize={55}>
              <Card className="h-full w-full p-4 shadow-sm overflow-auto">
                {children}
              </Card>
            </ResizablePanel>
            <ResizableHandle withHandle className="opacity-0" />
            <ResizablePanel defaultSize={25} minSize={15}>
              <div className="h-full pl-4">
                <AIChatSidebar />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
        <div className="lg:hidden h-full w-full">
          {/* For now, just show content on smaller screens */}
          {children}
        </div>
      </main>
    </div>
  );
}
