import { promises as fs } from 'fs';
import path from 'path';

async function buildKnowledgeIndex() {
  console.log('Building knowledge index...');
  
  const languages = ['javascript']; // Add 'python' when available
  const allSections = [];

  for (const lang of languages) {
    const filePath = path.join(process.cwd(), 'public', `${lang}-learning-path.md`);
    try {
      const markdown = await fs.readFile(filePath, 'utf-8');
      const lines = markdown.split('\n');
      let currentChapterId = '';
      const idRegex = /\(id: (.*?)\)/;

      for (const line of lines) {
        if (line.startsWith('## ')) {
          const idMatch = line.match(idRegex);
          if (idMatch) currentChapterId = idMatch[1];
        } else if (line.startsWith('### ') && currentChapterId) {
          const title = line.replace('### ', '').replace(idRegex, '').trim();
          const idMatch = line.match(idRegex);
          if (idMatch) {
            allSections.push({
              id: idMatch[1],
              title,
              chapterId: currentChapterId,
              language: lang,
            });
          }
        }
      }
    } catch (e) {
      console.error(`Failed to process ${filePath}`, e);
      continue;
    }
  }

  const extractKeywords = (text) => {
    const commonWords = new Set(['a', 'an', 'the', 'is', 'in', 'of', 'to', 'and', 'with', 'what', 'how', 'why']);
    return text
      .toLowerCase()
      .replace(/[`'"]/g, '')
      .split(/[\s,.:;?()\[\]{}]+/)
      .filter(word => word.length > 2 && !commonWords.has(word) && isNaN(Number(word)));
  };

  const index = allSections.map(section => {
    const keywords = extractKeywords(section.title);
    keywords.push(section.title.toLowerCase());
    
    // Future enhancement: Read content from `public/content/${section.id}.md` to extract more keywords
    
    return {
      sectionId: section.id,
      title: section.title,
      keywords: [...new Set(keywords)],
      language: section.language,
      chapterId: section.chapterId,
    };
  });

  const outputPath = path.join(process.cwd(), 'src', 'lib', 'knowledge-index.json');
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(index, null, 2));

  console.log(`Knowledge index built successfully with ${index.length} entries at ${outputPath}`);
}

buildKnowledgeIndex();