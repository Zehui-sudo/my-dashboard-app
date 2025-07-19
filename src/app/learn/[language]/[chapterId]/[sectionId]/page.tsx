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

  return <LearningPlatform language={language} />;
}