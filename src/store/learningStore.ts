import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LearningState, LearningActions, LearningPath, SectionContent, ChatMessage, ChatSession, PyodideStatus, ContextReference } from '@/types';
import { pyodideService } from '@/services/pyodideService';

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
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      const response = await fetch(`/content/${sectionId}.md`);
      
      if (!response.ok) {
        // If the file is not found, throw an error to be caught below
        throw new Error(`Markdown file not found for section: ${sectionId}`);
      }
      
      const markdownContent = await response.text();

      return {
        id: sectionId,
        contentBlocks: [
          {
            type: 'markdown',
            content: markdownContent,
          },
        ],
      };
    } catch (error) {
      console.warn(error);
      
      // Fallback content when fetch fails or file doesn't exist
      return {
        id: sectionId,
        contentBlocks: [
          {
            type: 'markdown',
            content: `# ${sectionId.split('-').pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}\n\n此章节的内容正在精心准备中，敬请期待！`
          }
        ]
      };
    }
  }
};

const createWelcomeMessage = (userName?: string, topic?: string): ChatMessage => ({
  id: Date.now().toString(),
  sender: 'ai',
  content: userName 
    ? `Hi, ${userName}! 我是你的AI学习助手。${topic ? `关于"${topic}"，` : ''}你有什么问题吗？`
    : `你好！我是你的AI学习助手。${topic ? `关于"${topic}"，` : ''}你有什么问题吗？我可以帮你解释概念、提供示例，或者解答你的疑问。`,
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
      pyodideStatus: 'unloaded' as PyodideStatus,
      pyodideError: null,
      fontSize: 16,
      selectedContent: null,
      userName: undefined,

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

          // Load Pyodide for Python language
          if (language === 'python' && get().pyodideStatus === 'unloaded') {
            get().loadPyodide();
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
        const state = get();
        const newSession: ChatSession = {
          id: `chat-${Date.now()}`,
          title: '新的对话',
          messages: [createWelcomeMessage(state.userName)],
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

      // Pyodide Actions
      loadPyodide: async () => {
        const state = get();
        if (state.pyodideStatus !== 'unloaded') {
          return;
        }

        set({ pyodideStatus: 'loading', pyodideError: null });

        try {
          await pyodideService.loadPyodide();
          set({ pyodideStatus: 'ready', pyodideError: null });
        } catch (error) {
          set({
            pyodideStatus: 'error',
            pyodideError: error instanceof Error ? error.message : 'Failed to load Pyodide'
          });
        }
      },

      setFontSize: (fontSize: number) => {
        set({ fontSize });
      },

      // Context Selection Actions
      setSelectedContent: (content: ContextReference | null) => {
        set({ selectedContent: content });
      },

      // User Actions
      setUserName: (name: string) => {
        set({ userName: name });
      },
    }),
    {
      name: 'learning-store',
      partialize: (state) => ({
        userCodeSnippets: state.userCodeSnippets,
        uiState: state.uiState,
        chatSessions: state.chatSessions,
        activeChatSessionId: state.activeChatSessionId,
        fontSize: state.fontSize,
        userName: state.userName,
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
  pyodideStatus: 'unloaded',
  pyodideError: null,
  selectedContent: null,
});