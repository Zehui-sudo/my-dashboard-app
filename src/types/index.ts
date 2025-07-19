// 一级目录: 学习路径 (代表一门课程)
export interface LearningPath {
  id: string; // e.g., "python-basics"
  title: string; // e.g., "Python 核心基础"
  language: 'python' | 'javascript';
  chapters: Chapter[];
}

// 二级目录: 章 (代表一个知识模块)
export interface Chapter {
  id: string; // e.g., "py-ch-2-control-flow"
  title: string; // e.g., "控制流程"
  sections: Section[];
}

// 三级目录: 节 (代表一个具体知识点)
export interface Section {
  id: string; // e.g., "py-sec-2-1-if-statement"
  title: string; // e.g., "if 条件语句"
  chapterId: string; // 父章节的ID
}

// 节内容 (由内容块数组组成)
export interface SectionContent {
  id: string; // 与 Section.id 对应
  contentBlocks: (MarkdownBlock | InteractiveCodeBlock)[];
}

// 内容块1: Markdown 静态内容
export interface MarkdownBlock {
  type: 'markdown';
  content: string;
}

// 内容块2: 交互式代码
export interface InteractiveCodeBlock {
  type: 'code';
  language: 'python' | 'javascript';
  code: string;
  isInteractive: true;
}

// 全局状态类型
export interface LearningState {
  currentPath: LearningPath | null;
  currentSection: SectionContent | null;
  loading: {
    path: boolean;
    section: boolean;
  };
  error: {
    path: string | null;
    section: string | null;
  };
  userCodeSnippets: Record<string, string>; // Key: SectionID, Value: User's code
}

export interface LearningActions {
  loadPath: (language: 'python' | 'javascript') => Promise<void>;
  loadSection: (sectionId: string) => Promise<void>;
  updateUserCode: (sectionId: string, code: string) => void;
}

// API 响应类型
export interface LearningApi {
  getLearningPath: (language: 'python' | 'javascript') => Promise<LearningPath>;
  getSectionContent: (sectionId: string) => Promise<SectionContent>;
}