import { SectionLink } from '@/types';
import knowledgeIndexData from '@/lib/knowledge-index.json';

interface KnowledgeIndex {
  sectionId: string;
  title: string;
  keywords: string[];
  language: 'python' | 'javascript';
  chapterId: string;
}

class KnowledgeLinkService {
  private knowledgeIndex: KnowledgeIndex[] = [];

  constructor() {
    this.knowledgeIndex = knowledgeIndexData as KnowledgeIndex[];
    console.log(`Knowledge index loaded with ${this.knowledgeIndex.length} entries.`);
  }

  public identifyLinks(
    text: string,
    language?: 'python' | 'javascript'
  ): SectionLink[] {
    const lowerCaseText = text.toLowerCase();
    const foundSections = new Map<string, SectionLink>();

    for (const entry of this.knowledgeIndex) {
      if (language && entry.language !== language) {
        continue;
      }

      for (const keyword of entry.keywords) {
        if (lowerCaseText.includes(keyword.toLowerCase())) {
          if (!foundSections.has(entry.sectionId)) {
            foundSections.set(entry.sectionId, {
              sectionId: entry.sectionId,
              title: entry.title,
              chapterId: entry.chapterId,
              language: entry.language,
              matchedKeywords: [],
              relevanceScore: 0,
            });
          }
          const link = foundSections.get(entry.sectionId)!;
          link.matchedKeywords!.push(keyword);
          link.relevanceScore! += 1;
        }
      }
    }

    const sortedLinks = Array.from(foundSections.values()).sort(
      (a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0)
    );

    return sortedLinks.slice(0, 5);
  }
}

let knowledgeLinkServiceInstance: KnowledgeLinkService | null = null;

export function getKnowledgeLinkService(): KnowledgeLinkService {
  if (!knowledgeLinkServiceInstance) {
    knowledgeLinkServiceInstance = new KnowledgeLinkService();
  }
  return knowledgeLinkServiceInstance;
}