import { AIProvider, ChatRequest, ChatResponse } from '../types';
import { ChatMessage } from '@/types';

export class DoubaoProvider extends AIProvider {
  private apiKey: string;
  private model: string;
  private apiBase: string;

  constructor() {
    super();
    this.apiKey = process.env.DOUBAO_API_KEY || '';
    this.model = process.env.DOUBAO_MODEL || 'doubao-lite-4k';
    this.apiBase = process.env.DOUBAO_API_BASE || 'https://maas-api.ml-platform-cn-beijing.volces.com';
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  getDefaultModel(): string {
    return this.model;
  }

  private formatMessages(messages: ChatMessage[]) {
    return messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.content,
    }));
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    if (!this.isConfigured()) {
      throw new Error('Doubao API key not configured');
    }

    const { messages, model = this.model, temperature = 0.7, maxTokens = 2000, contextReference } = request;

    let formattedMessages = this.formatMessages(messages);
    if (contextReference) {
      const contextMessage = {
        role: 'system',
        content: `参考上下文 (${contextReference.source}): ${contextReference.text}`
      };
      formattedMessages = [contextMessage, ...formattedMessages];
    }

    try {
      // Doubao API is similar to OpenAI format but with some differences
      const response = await fetch(`${this.apiBase}/api/v3/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: formattedMessages,
          temperature,
          max_tokens: maxTokens,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `Doubao API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        content: data.choices[0].message.content,
        provider: 'doubao',
        model,
        usage: data.usage ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        } : undefined,
      };
    } catch (error) {
      console.error('Doubao API error:', error);
      throw error;
    }
  }
}