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

// UI状态类型
export interface UIState {
  expandedChapters: string[];
  searchQuery: string;
}

// Pyodide状态类型
export type PyodideStatus = 'unloaded' | 'loading' | 'ready' | 'error';

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
  uiState: UIState;
  // AI Chat State
  chatSessions: ChatSession[];
  activeChatSessionId: string | null;
  // AI Provider State
  aiProvider: AIProviderType;
  sendingMessage: boolean;
  // Pyodide State
  pyodideStatus: PyodideStatus;
  pyodideError: string | null;
  // Font Size State
  fontSize: number;
  // Context Selection State
  selectedContent: ContextReference | null;
  // User Info
  userName?: string;
}

// AI 对话消息
export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: number; // 使用时间戳以方便序列化
  contextReference?: ContextReference; // 引用的上下文内容
}

// 上下文引用
export interface ContextReference {
  text: string; // 引用的文本内容
  source?: string; // 来源（如章节标题）
  type?: 'markdown' | 'code'; // 内容类型
}

// AI 对话会话
export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
}

export interface LearningActions {
  loadPath: (language: 'python' | 'javascript') => Promise<void>;
  loadSection: (sectionId: string) => Promise<void>;
  updateUserCode: (sectionId: string, code: string) => void;
  updateUIState: (uiState: Partial<UIState>) => void;
  // AI Chat Actions
  createNewChat: () => void;
  switchChat: (sessionId: string) => void;
  deleteChat: (sessionId: string) => void;
  renameChat: (sessionId: string, newTitle: string) => void;
  addMessageToActiveChat: (message: Partial<ChatMessage> & { sender: 'user' | 'ai', content: string }) => void;
  updateMessageContent: (sessionId: string, messageId: string, content: string) => void;
  // AI Provider Actions
  setAIProvider: (provider: AIProviderType) => void;
  sendChatMessage: (content: string) => Promise<void>;
  // Pyodide Actions
  loadPyodide: () => Promise<void>;
  // Font Size Actions
  setFontSize: (fontSize: number) => void;
  // Context Selection Actions
  setSelectedContent: (content: ContextReference | null) => void;
  // User Actions
  setUserName: (name: string) => void;
}

// API 响应类型
export interface LearningApi {
  getLearningPath: (language: 'python' | 'javascript') => Promise<LearningPath>;
  getSectionContent: (sectionId: string) => Promise<SectionContent>;
}

// AI Provider Types
export type AIProviderType = 'openai' | 'anthropic' | 'deepseek' | 'doubao';

// AI Chat API Types
export interface ChatAPIRequest {
  messages: ChatMessage[];
  provider: AIProviderType;
  model?: string;
  contextReference?: ContextReference;
}

export interface ChatAPIResponse {
  content: string;
  provider: AIProviderType;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  error?: string;
}