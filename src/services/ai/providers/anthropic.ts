import { AIChatService } from '../types';
import { AIProvider, ChatAPIRequest, ChatAPIResponse, StreamChunk } from '@/types';

export class AnthropicProvider extends AIChatService {
  provider = AIProvider.ANTHROPIC;
  private apiKey: string;
  private baseURL: string;
  private defaultModel: string;

  constructor() {
    super();
    this.apiKey = process.env.ANTHROPIC_API_KEY || '';
    this.baseURL = process.env.ANTHROPIC_API_BASE || 'https://api.anthropic.com';
    this.defaultModel = process.env.ANTHROPIC_MODEL || 'claude-3-opus-20240229';
  }

  validateConfig(): boolean {
    return !!this.apiKey;
  }

  getModels(): string[] {
    return [
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
      'claude-3-5-sonnet-20241022'
    ];
  }

  async chat(request: ChatAPIRequest): Promise<ChatAPIResponse> {
    try {
      const response = await fetch(`${this.baseURL}/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: request.model || this.defaultModel,
          max_tokens: request.maxTokens || 2000,
          temperature: request.temperature || 0.7,
          messages: request.messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.content,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Anthropic API error');
      }

      const data = await response.json();
      return {
        content: data.content[0]?.text || '',
        provider: this.provider,
        model: data.model,
        usage: data.usage ? {
          promptTokens: data.usage.input_tokens,
          completionTokens: data.usage.output_tokens,
          totalTokens: data.usage.input_tokens + data.usage.output_tokens,
        } : undefined,
      };
    } catch (error) {
      return {
        content: '',
        provider: this.provider,
        model: request.model || this.defaultModel,
        error: {
          code: 'ANTHROPIC_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  async chatStream(
    request: ChatAPIRequest,
    onChunk: (chunk: StreamChunk) => void
  ): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: request.model || this.defaultModel,
          max_tokens: request.maxTokens || 2000,
          temperature: request.temperature || 0.7,
          messages: request.messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.content,
          })),
          stream: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Anthropic API error');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            try {
              const parsed = JSON.parse(data);
              
              if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                onChunk({
                  id: request.messages.length.toString(),
                  content: parsed.delta.text,
                  done: false,
                });
              } else if (parsed.type === 'message_stop') {
                onChunk({
                  id: request.messages.length.toString(),
                  content: '',
                  done: true,
                });
                return;
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      onChunk({
        id: request.messages.length.toString(),
        content: '',
        done: true,
        error: error instanceof Error ? error.message : 'Stream error',
      });
    }
  }
}