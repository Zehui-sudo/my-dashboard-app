import { AIProvider, ChatAPIRequest, ChatAPIResponse, StreamChunk } from '@/types';

export abstract class AIChatService {
  abstract provider: AIProvider;
  abstract chat(request: ChatAPIRequest): Promise<ChatAPIResponse>;
  abstract chatStream(
    request: ChatAPIRequest,
    onChunk: (chunk: StreamChunk) => void
  ): Promise<void>;
  abstract getModels(): string[];
  abstract validateConfig(): boolean;
}