import { LearnNavBar } from '@/components/LearnNavBar';
import { LearningPlatform } from '@/components/LearningPlatform';

interface LearningPageProps {
  params: Promise<{
    language: string;
    chapterId: string;
    sectionId: string;
  }>;
}

export default async function LearningPage({ params }: LearningPageProps) {
  const { language } = await params;

  // Validate language parameter
  if (!['python', 'javascript'].includes(language)) {
    throw new Error('Invalid language');
  }

  return (
    <div className="flex flex-col h-screen">
      <LearnNavBar />
      <main className="flex-1 overflow-auto">
        <LearningPlatform language={language as 'python' | 'javascript'} />
      </main>
    </div>
  );
}