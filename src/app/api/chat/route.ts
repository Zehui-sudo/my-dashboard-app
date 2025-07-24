import { NextRequest, NextResponse } from 'next/server';
import { AIProvider, ChatAPIRequest, ChatAPIResponse, StreamChunk } from '@/types';
import { aiChatManager } from '@/services/ai';

export async function POST(request: NextRequest) {
  try {
    const body: ChatAPIRequest = await request.json();
    
    // 验证请求参数
    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    if (!body.provider || !Object.values(AIProvider).includes(body.provider)) {
      return NextResponse.json(
        { error: 'Valid provider is required' },
        { status: 400 }
      );
    }

    // 检查是否启用流式响应
    const stream = body.stream ?? false;

    if (stream) {
      // 流式响应
      const encoder = new TextEncoder();
      
      const streamResponse = new TransformStream();
      const writer = streamResponse.writable.getWriter();

      // 异步处理流式响应
      (async () => {
        try {
          await aiChatManager.chatStream(body, (chunk: StreamChunk) => {
            writer.write(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
          });
        } catch (error) {
          const errorChunk: StreamChunk = {
            id: body.messages.length.toString(),
            content: '',
            done: true,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
          writer.write(encoder.encode(`data: ${JSON.stringify(errorChunk)}\n\n`));
        } finally {
          writer.close();
        }
      })();

      return new Response(streamResponse.readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // 非流式响应
      const response = await aiChatManager.chat(body);
      return NextResponse.json(response);
    }
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

// 获取可用提供商
export async function GET() {
  try {
    const availableProviders = aiChatManager.getAvailableProviders();
    return NextResponse.json({ providers: availableProviders });
  } catch (error) {
    console.error('Get providers error:', error);
    return NextResponse.json(
      { error: 'Failed to get available providers' },
      { status: 500 }
    );
  }
}

// 配置最大请求体大小
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};