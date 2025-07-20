import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LearningState, LearningActions, LearningPath, SectionContent, ChatMessage, ChatSession } from '@/types';

// Mock API functions - replace with real API calls
const mockLearningApi = {
  getLearningPath: async (language: 'python' | 'javascript'): Promise<LearningPath> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      id: `${language}-basics`,
      title: `${language === 'python' ? 'Python' : 'JavaScript'} 核心基础`,
      language,
      chapters: [
        {
          id: `${language}-ch-1-basics`,
          title: '基础语法',
          sections: [
            {
              id: `${language}-sec-1-1-variables`,
              title: '变量与数据类型',
              chapterId: `${language}-ch-1-basics`
            },
            {
              id: `${language}-sec-1-2-operators`,
              title: '运算符',
              chapterId: `${language}-ch-1-basics`
            }
          ]
        },
        {
          id: `${language}-ch-2-control`,
          title: '控制流程',
          sections: [
            {
              id: `${language}-sec-2-1-conditionals`,
              title: '条件语句',
              chapterId: `${language}-ch-2-control`
            },
            {
              id: `${language}-sec-2-2-loops`,
              title: '循环语句',
              chapterId: `${language}-ch-2-control`
            }
          ]
        }
      ]
    };
  },

  getSectionContent: async (sectionId: string): Promise<SectionContent> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const isPython = sectionId.includes('python');
    const lang = isPython ? 'python' : 'javascript';
    
    // Mock content for different sections
    if (sectionId.includes('variables')) {
      return {
        id: sectionId,
        contentBlocks: [
          {
            type: 'markdown',
            content: `# 变量与数据类型

在${lang === 'python' ? 'Python' : 'JavaScript'}中，变量是存储数据的容器。

## 基本语法

${lang === 'python' ? '```python\nname = "Alice"\nage = 25\n```' : '```javascript\nlet name = "Alice";\nconst age = 25;\n```'}

变量名需要遵循命名规则：
- 只能包含字母、数字和下划线
- 不能以数字开头
- 区分大小写`
          },
          {
            type: 'code',
            language: lang,
            code: `${lang === 'python' ? '# 创建变量\nname = "Alice"\nage = 25\nprint(f"Hello, {name}! You are {age} years old.")' : '// 创建变量\nlet name = "Alice";\nconst age = 25;\nconsole.log(`Hello, ${name}! You are ${age} years old.`);'} `,
            isInteractive: true
          }
        ]
      };
    }
    
    if (sectionId.includes('conditionals')) {
      return {
        id: sectionId,
        contentBlocks: [
          {
            type: 'markdown',
            content: `# 条件语句

条件语句用于根据不同的条件执行不同的代码块。

## if 语句

${lang === 'python' ? '```python\nif condition:\n    # 条件为真时执行\nelse:\n    # 条件为假时执行\n```' : '```javascript\nif (condition) {\n    // 条件为真时执行\n} else {\n    // 条件为假时执行\n}\n```'}

## 示例场景

判断一个数字是正数、负数还是零。`
          },
          {
            type: 'code',
            language: lang,
            code: `${lang === 'python' ? '# 判断数字类型\nnumber = 10\n\nif number > 0:\n    print("正数")\nelif number < 0:\n    print("负数")\nelse:\n    print("零")' : '// 判断数字类型\nlet number = 10;\n\nif (number > 0) {\n    console.log("正数");\n} else if (number < 0) {\n    console.log("负数");\n} else {\n    console.log("零");\n}'}`,
            isInteractive: true
          }
        ]
      };
    }

    // Default content
    return {
      id: sectionId,
      contentBlocks: [
        {
          type: 'markdown',
          content: `# ${sectionId.split('-').pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}

这是关于 ${sectionId} 的内容。

## 即将推出

此章节的内容正在精心准备中，敬请期待！`
        }
      ]
    };
  }
};

const createWelcomeMessage = (topic?: string): ChatMessage => ({
  id: Date.now().toString(),
  sender: 'ai',
  content: `你好！我是你的AI学习助手。${topic ? `关于“${topic}”，` : ''}你有什么问题吗？我可以帮你解释概念、提供示例，或者解答你的疑问。`,
  timestamp: Date.now(),
});

export const useLearningStore = create<LearningState & LearningActions>()(
  persist(
    (set, get) => ({
      // State
      currentPath: null,
      currentSection: null,
      loading: {
        path: false,
        section: false,
      },
      error: {
        path: null,
        section: null,
      },
      userCodeSnippets: {},
      uiState: {
        expandedChapters: [],
        searchQuery: '',
      },
      chatSessions: [],
      activeChatSessionId: null,

      // Actions
      loadPath: async (language: 'python' | 'javascript') => {
        const state = get();
        if (state.loading.path || state.currentPath?.language === language) {
          return;
        }
        
        set(state => ({
          loading: { ...state.loading, path: true },
          error: { ...state.error, path: null }
        }));

        try {
          const path = await mockLearningApi.getLearningPath(language);
          set({
            currentPath: path,
            loading: { ...get().loading, path: false },
            error: { ...get().error, path: null }
          });
          
          // If no chats exist, create a default one
          if (get().chatSessions.length === 0) {
            get().createNewChat();
          }

        } catch (error) {
          set({
            loading: { ...get().loading, path: false },
            error: { ...get().error, path: error instanceof Error ? error.message : 'Failed to load learning path' }
          });
        }
      },

      loadSection: async (sectionId: string) => {
        const state = get();
        if (state.loading.section || state.currentSection?.id === sectionId) {
          return;
        }
        
        set(state => ({
          loading: { ...state.loading, section: true },
          error: { ...state.error, section: null }
        }));

        try {
          const content = await mockLearningApi.getSectionContent(sectionId);
          set({
            currentSection: content,
            loading: { ...get().loading, section: false },
            error: { ...get().error, section: null }
          });
        } catch (error) {
          set({
            loading: { ...get().loading, section: false },
            error: { ...state.error, section: error instanceof Error ? error.message : 'Failed to load section content' }
          });
        }
      },

      updateUserCode: (sectionId: string, code: string) => {
        set(state => ({
          userCodeSnippets: {
            ...state.userCodeSnippets,
            [sectionId]: code
          }
        }));
      },

      updateUIState: (uiState: Partial<{ expandedChapters: string[]; searchQuery: string }>) => {
        set((state) => ({
          uiState: {
            ...state.uiState,
            ...uiState
          }
        }));
      },

      // --- Chat Actions ---
      createNewChat: () => {
        const newSession: ChatSession = {
          id: `chat-${Date.now()}`,
          title: '新的对话',
          messages: [createWelcomeMessage()],
          createdAt: Date.now(),
        };
        set(state => ({
          chatSessions: [...state.chatSessions, newSession],
          activeChatSessionId: newSession.id,
        }));
      },

      switchChat: (sessionId: string) => {
        if (get().chatSessions.some(s => s.id === sessionId)) {
          set({ activeChatSessionId: sessionId });
        }
      },

      deleteChat: (sessionId: string) => {
        set(state => {
          const remainingSessions = state.chatSessions.filter(s => s.id !== sessionId);
          let newActiveId = state.activeChatSessionId;

          if (newActiveId === sessionId) {
            newActiveId = remainingSessions.length > 0 ? remainingSessions[0].id : null;
          }
          
          return {
            chatSessions: remainingSessions,
            activeChatSessionId: newActiveId,
          };
        });
      },
      
      renameChat: (sessionId: string, newTitle: string) => {
        set(state => ({
          chatSessions: state.chatSessions.map(session => 
            session.id === sessionId ? { ...session, title: newTitle } : session
          ),
        }));
      },

      addMessageToActiveChat: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
        set(state => {
          const activeId = state.activeChatSessionId;
          if (!activeId) return {};

          const newMessage: ChatMessage = {
            ...message,
            id: `${message.sender}-${Date.now()}`,
            timestamp: Date.now(),
          };

          return {
            chatSessions: state.chatSessions.map(session => {
              if (session.id === activeId) {
                // If it's the first user message, update the chat title
                const isFirstUserMessage = session.messages.filter(m => m.sender === 'user').length === 0 && message.sender === 'user';
                return {
                  ...session,
                  title: isFirstUserMessage ? message.content.substring(0, 20) : session.title,
                  messages: [...session.messages, newMessage],
                };
              }
              return session;
            }),
          };
        });
      },
    }),
    {
      name: 'learning-store',
      partialize: (state) => ({
        userCodeSnippets: state.userCodeSnippets,
        uiState: state.uiState,
        chatSessions: state.chatSessions,
        activeChatSessionId: state.activeChatSessionId,
      }),
    }
  )
);

// Initial state for non-persisted parts
useLearningStore.setState({
  currentPath: null,
  currentSection: null,
  loading: { path: false, section: false },
  error: { path: null, section: null },
});