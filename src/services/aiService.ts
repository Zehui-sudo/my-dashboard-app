// src/services/aiService.ts
import { AIProviderId, AIModelId, AI_PROVIDERS } from '@/config/aiProviders';
import type { ChatMessage } from '@/types';

// 定义API请求和响应类型
interface ChatCompletionRequest {
  model: string;
  messages: {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }[];
  temperature?: number;
  max_tokens?: number;
}

interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// 定义错误类型
class AIError extends Error {
  constructor(
    message: string,
    public code: string,
    public provider: AIProviderId
  ) {
    super(message);
    this.name = 'AIError';
  }
}

// 获取当前配置的提供商
function getProviderConfig(providerId: AIProviderId) {
  const provider = AI_PROVIDERS.find(p => p.id === providerId);
  if (!provider) {
    throw new Error(`Unsupported AI provider: ${providerId}`);
  }
  return provider;
}

// 获取API密钥
function getApiKey(providerId: AIProviderId): string {
  const provider = getProviderConfig(providerId);
  const apiKey = process.env[provider.apiKeyEnvVar];
  
  if (!apiKey) {
    throw new AIError(
      `API key not configured for ${provider.name}. Please set ${provider.apiKeyEnvVar} in your environment variables.`,
      'MISSING_API_KEY',
      providerId
    );
  }
  
  return apiKey;
}

// 格式化消息历史记录
function formatMessagesHistory(messages: ChatMessage[]): { role: string; content: string }[] {
  return messages.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'assistant',
    content: msg.content
  }));
}

// DeepSeek API调用
async function callDeepSeekAPI(
  messages: ChatMessage[],
  modelId: string,
  signal?: AbortSignal
): Promise<string> {
  const apiKey = getApiKey('deepseek');
  const formattedMessages = formatMessagesHistory(messages);
  
  const requestBody: ChatCompletionRequest = {
    model: modelId,
    messages: [
      {
        role: 'system',
        content: '你是一个编程学习助手，专门帮助用户学习Python和JavaScript。请用简洁明了的语言回答问题，并提供代码示例。'
      },
      ...formattedMessages
    ],
    temperature: 0.7,
    max_tokens: 1000
  };
  
  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody),
      signal
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new AIError(
        `DeepSeek API error: ${response.status} ${response.statusText} - ${errorText}`,
        'API_ERROR',
        'deepseek'
      );
    }
    
    const data: ChatCompletionResponse = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new AIError(
        'DeepSeek API returned empty response',
        'EMPTY_RESPONSE',
        'deepseek'
      );
    }
    
    return data.choices[0].message.content.trim();
  } catch (error) {
    if (error instanceof AIError) {
      throw error;
    }
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new AIError(
        'Request was cancelled',
        'REQUEST_CANCELLED',
        'deepseek'
      );
    }
    
    throw new AIError(
      `Failed to call DeepSeek API: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'NETWORK_ERROR',
      'deepseek'
    );
  }
}

// Qwen API调用
async function callQwenAPI(
  messages: ChatMessage[],
  modelId: string,
  signal?: AbortSignal
): Promise<string> {
  const apiKey = getApiKey('qwen');
  const formattedMessages = formatMessagesHistory(messages);
  
  // 根据模型ID映射到DashScope的模型名称
  const modelMap: Record<string, string> = {
    'qwen-plus': 'qwen-plus',
    'qwen-turbo': 'qwen-turbo',
    'qwen-max': 'qwen-max'
  };
  
  const dashScopeModel = modelMap[modelId] || 'qwen-plus';
  
  const requestBody = {
    model: dashScopeModel,
    input: {
      messages: [
        {
          role: 'system',
          content: '你是一个编程学习助手，专门帮助用户学习Python和JavaScript。请用简洁明了的语言回答问题，并提供代码示例。'
        },
        ...formattedMessages
      ]
    },
    parameters: {
      temperature: 0.7,
      max_tokens: 1000
    }
  };
  
  try {
    const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-DashScope-SSE': 'disable'
      },
      body: JSON.stringify(requestBody),
      signal
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new AIError(
        `Qwen API error: ${response.status} ${response.statusText} - ${errorText}`,
        'API_ERROR',
        'qwen'
      );
    }
    
    const data = await response.json();
    
    if (data.code) {
      throw new AIError(
        `Qwen API error: ${data.message || data.code}`,
        data.code,
        'qwen'
      );
    }
    
    if (!data.output || !data.output.text) {
      throw new AIError(
        'Qwen API returned empty response',
        'EMPTY_RESPONSE',
        'qwen'
      );
    }
    
    return data.output.text.trim();
  } catch (error) {
    if (error instanceof AIError) {
      throw error;
    }
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new AIError(
        'Request was cancelled',
        'REQUEST_CANCELLED',
        'qwen'
      );
    }
    
    throw new AIError(
      `Failed to call Qwen API: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'NETWORK_ERROR',
      'qwen'
    );
  }
}

// Doubao API调用 (需要根据实际情况调整)
async function callDoubaoAPI(
  messages: ChatMessage[],
  modelId: string,
  signal?: AbortSignal
): Promise<string> {
  const apiKey = getApiKey('doubao');
  const formattedMessages = formatMessagesHistory(messages);
  
  // 这里需要根据豆包API的实际文档调整
  const requestBody = {
    model: modelId,
    messages: [
      {
        role: 'system',
        content: '你是一个编程学习助手，专门帮助用户学习Python和JavaScript。请用简洁明了的语言回答问题，并提供代码示例。'
      },
      ...formattedMessages
    ],
    parameters: {
      temperature: 0.7,
      max_tokens: 1000
    }
  };
  
  try {
    // 示例URL，需要根据实际情况调整
    const response = await fetch('https://ark.cn-beijing.volces.com/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody),
      signal
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new AIError(
        `Doubao API error: ${response.status} ${response.statusText} - ${errorText}`,
        'API_ERROR',
        'doubao'
      );
    }
    
    const data: ChatCompletionResponse = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new AIError(
        'Doubao API returned empty response',
        'EMPTY_RESPONSE',
        'doubao'
      );
    }
    
    return data.choices[0].message.content.trim();
  } catch (error) {
    if (error instanceof AIError) {
      throw error;
    }
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new AIError(
        'Request was cancelled',
        'REQUEST_CANCELLED',
        'doubao'
      );
    }
    
    throw new AIError(
      `Failed to call Doubao API: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'NETWORK_ERROR',
      'doubao'
    );
  }
}

// 主要的AI调用函数
export async function callAI(
  providerId: AIProviderId,
  modelId: string,
  messages: ChatMessage[],
  signal?: AbortSignal
): Promise<string> {
  switch (providerId) {
    case 'deepseek':
      return callDeepSeekAPI(messages, modelId, signal);
    case 'qwen':
      return callQwenAPI(messages, modelId, signal);
    case 'doubao':
      return callDoubaoAPI(messages, modelId, signal);
    default:
      throw new AIError(
        `Unsupported AI provider: ${providerId}`,
        'UNSUPPORTED_PROVIDER',
        providerId
      );
  }
}

// 获取默认模型
export function getDefaultModel(providerId: AIProviderId): string {
  const provider = getProviderConfig(providerId);
  return provider.models[0]?.id || '';
}