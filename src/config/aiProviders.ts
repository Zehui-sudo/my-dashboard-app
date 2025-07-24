// src/config/aiProviders.ts
export interface AIProviderConfig {
  id: string;
  name: string;
  apiKeyEnvVar: string;
  apiUrl: string;
  models: {
    id: string;
    name: string;
    description: string;
  }[];
}

export const AI_PROVIDERS: AIProviderConfig[] = [
  {
    id: 'deepseek',
    name: 'DeepSeek',
    apiKeyEnvVar: 'DEEPSEEK_API_KEY',
    apiUrl: 'https://api.deepseek.com/v1',
    models: [
      {
        id: 'deepseek-chat',
        name: 'DeepSeek Chat',
        description: 'DeepSeek的对话模型'
      }
    ]
  },
  {
    id: 'qwen',
    name: 'Qwen',
    apiKeyEnvVar: 'QWEN_API_KEY',
    apiUrl: 'https://dashscope.aliyuncs.com/api/v1',
    models: [
      {
        id: 'qwen-plus',
        name: 'Qwen Plus',
        description: '通义千问增强版'
      },
      {
        id: 'qwen-turbo',
        name: 'Qwen Turbo',
        description: '通义千问极速版'
      },
      {
        id: 'qwen-max',
        name: 'Qwen Max',
        description: '通义千问最大版'
      }
    ]
  },
  {
    id: 'doubao',
    name: 'Doubao',
    apiKeyEnvVar: 'DOUBAO_API_KEY',
    apiUrl: 'https://ark.cn-beijing.volces.com/api/v1', // 示例URL，需要根据实际情况调整
    models: [
      {
        id: 'doubao-pro',
        name: 'Doubao Pro',
        description: '豆包专业版'
      }
    ]
  }
];

export type AIProviderId = 'deepseek' | 'qwen' | 'doubao';
export type AIModelId = 'deepseek-chat' | 'qwen-plus' | 'qwen-turbo' | 'qwen-max' | 'doubao-pro';