import { NextRequest, NextResponse } from 'next/server';
import { createAIProvider } from '@/services/ai';
import { getKnowledgeLinkService } from '@/services/knowledgeLinkService';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, provider = 'openai', model, contextReference, language } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Messages array is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const aiProvider = createAIProvider(provider);
    
    const aiStream = await aiProvider.chat({
      messages,
      model,
      contextReference,
      stream: true,
      language,
    });

    if (!(aiStream instanceof ReadableStream)) {
      return new Response(JSON.stringify(aiStream), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const knowledgeLinkService = getKnowledgeLinkService();
    let accumulatedContent = '';

    const transformStream = new TransformStream({
      transform(chunk, controller) {
        const textDelta = new TextDecoder().decode(chunk);
        accumulatedContent += textDelta;
        const outputChunk = JSON.stringify({ type: 'delta', content: textDelta });
        controller.enqueue(new TextEncoder().encode(outputChunk + '\n'));
      },
      flush(controller) {
        const links = knowledgeLinkService.identifyLinks(accumulatedContent, language);
        if (links.length > 0) {
          const linksChunk = JSON.stringify({ type: 'links', data: links });
          controller.enqueue(new TextEncoder().encode(linksChunk + '\n'));
        }
      }
    });

    const finalStream = aiStream.pipeThrough(transformStream);

    return new Response(finalStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Chat API error:', errorMessage, error);

    return new Response(JSON.stringify({
      error: 'Failed to get response from AI provider.',
      details: errorMessage,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}