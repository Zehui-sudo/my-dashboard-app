import { AIProvider, ChatRequest, ChatResponse } from '../types';
import { ChatMessage } from '@/types';

export class OpenAIProvider extends AIProvider {
  protected apiKey: string;
  protected model: string;
  protected apiBase: string;

  constructor() {
    super();
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
    this.apiBase = process.env.OPENAI_API_BASE || 'https://api.openai.com/v1';
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  getDefaultModel(): string {
    return this.model;
  }

  private formatMessages(messages: ChatMessage[]) {
    let processedMessages = [...messages];

    if (processedMessages.length > 1 && processedMessages[0].sender === 'ai') {
      processedMessages.shift();
    }

    return processedMessages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.content,
    }));
  }

  private _createParserStream(stream: ReadableStream): ReadableStream {
    let buffer = '';
    const decoder = new TextDecoder();
    const transformStream = new TransformStream({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split('\n');
        
        // The last line might be incomplete, so we keep it in the buffer for the next chunk.
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '' || !line.trim().startsWith('data:')) {
            continue;
          }
          const jsonStr = line.replace(/^data: /, '');
          if (jsonStr === '[DONE]') {
            controller.terminate();
            return;
          }
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices[0]?.delta?.content;
            if (delta) {
              controller.enqueue(new TextEncoder().encode(delta));
            }
          } catch (e) {
            // This can happen if the JSON is still incomplete. We'll wait for more chunks.
            console.error('Failed to parse stream chunk, will retry with more data. Chunk:', line);
          }
        }
      },
    });

    return stream.pipeThrough(transformStream);
  }

  async chat(request: ChatRequest): Promise<ChatResponse | ReadableStream> {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API key not configured');
    }

    const { messages, model = this.model, temperature = 0.7, maxTokens = 2000, contextReference, stream = false, language } = request;

    let formattedMessages = this.formatMessages(messages);
    if (contextReference) {
      const sourceText = contextReference.source ? `的[${contextReference.source}]这一章节` : '';
      const languageText = language ? `的[${language}]` : '';
      
      const contextMessage = {
        role: 'system',
        content: `你是一个AI学习助手。用户现在正在学习${languageText}${sourceText}的知识点，并勾画了内容：“${contextReference.text}”。请你根据用户勾画的内容和具体提问来解答用户的问题，回答需要自然、友好、易于理解。`
      };
      formattedMessages = [contextMessage, ...formattedMessages];
    }

    try {
      const response = await fetch(`${this.apiBase}/chat/completions`, {
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
          stream,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `OpenAI API error: ${response.status}`);
      }

      if (stream) {
        if (!response.body) {
          throw new Error('Response body is null for streaming request');
        }
        return this._createParserStream(response.body);
      }

      const data = await response.json();
      
      return {
        content: data.choices[0].message.content,
        provider: 'openai',
        model,
        usage: data.usage ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        } : undefined,
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }
}