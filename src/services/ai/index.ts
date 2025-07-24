import { AIProvider, ChatAPIRequest, ChatAPIResponse, StreamChunk } from '@/types';
import { OpenAIProvider } from './providers/openai';
import { AnthropicProvider } from './providers/anthropic';
import { DeepSeekProvider } from './providers/deepseek';
import { DoubaoProvider } from './providers/doubao';
import { AIChatService } from './types';

export class AIChatManager {
  private providers: Map<AIProvider, AIChatService> = new Map();

  constructor() {
    this.providers.set(AIProvider.OPENAI, new OpenAIProvider());
    this.providers.set(AIProvider.ANTHROPIC, new AnthropicProvider());
    this.providers.set(AIProvider.DEEPSEEK, new DeepSeekProvider());
    this.providers.set(AIProvider.DOUBAO, new DoubaoProvider());
  }

  getProvider(provider: AIProvider): AIChatService | undefined {
    return this.providers.get(provider);
  }

  getAvailableProviders(): AIProvider[] {
    return Array.from(this.providers.keys()).filter(provider => {
      const service = this.providers.get(provider);
      return service?.validateConfig() || false;
    });
  }

  async chat(request: ChatAPIRequest): Promise<ChatAPIResponse> {
    const provider = this.getProvider(request.provider);
    if (!provider) {
      return {
        content: '',
        provider: request.provider,
        model: request.model || '',
        error: {
          code: 'PROVIDER_NOT_FOUND',
          message: `Provider ${request.provider} not found`,
        },
      };
    }

    if (!provider.validateConfig()) {
      return {
        content: '',
        provider: request.provider,
        model: request.model || '',
        error: {
          code: 'INVALID_CONFIG',
          message: `Provider ${request.provider} not properly configured`,
        },
      };
    }

    return provider.chat(request);
  }

  async chatStream(
    request: ChatAPIRequest,
    onChunk: (chunk: StreamChunk) => void
  ): Promise<void> {
    const provider = this.getProvider(request.provider);
    if (!provider || !provider.validateConfig()) {
      onChunk({
        id: request.messages.length.toString(),
        content: '',
        done: true,
        error: `Provider ${request.provider} not available`,
      });
      return;
    }

    return provider.chatStream(request, onChunk);
  }

  getModels(provider: AIProvider): string[] {
    const service = this.getProvider(provider);
    return service?.getModels() || [];
  }
}

export const aiChatManager = new AIChatManager();