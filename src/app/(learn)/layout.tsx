import { LearnNavBar } from '@/components/LearnNavBar';

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-full">
      <LearnNavBar />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}