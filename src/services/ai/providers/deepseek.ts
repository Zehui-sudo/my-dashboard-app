import { OpenAIProvider } from './openai';
import { ChatRequest, ChatResponse } from '../types';

export class DeepSeekProvider extends OpenAIProvider {
  constructor() {
    super();
    // Override with DeepSeek specific settings
    this.apiKey = process.env.DEEPSEEK_API_KEY || '';
    this.model = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
    this.apiBase = process.env.DEEPSEEK_API_BASE || 'https://api.deepseek.com/v1';
  }

  isConfigured(): boolean {
    return !!process.env.DEEPSEEK_API_KEY;
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    // DeepSeek uses OpenAI-compatible API
    const response = await super.chat(request);
    return {
      ...response,
      provider: 'deepseek',
    };
  }
}