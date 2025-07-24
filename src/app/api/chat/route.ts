import { NextRequest, NextResponse } from 'next/server';
import { ChatMessage } from '@/types';
import { AIProvider, createAIProvider } from '@/services/ai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, provider = 'openai', model, contextReference } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Create AI provider instance
    const aiProvider = createAIProvider(provider);
    
    // Get response from AI
    const response = await aiProvider.chat({
      messages,
      model,
      contextReference,
    });

    return NextResponse.json(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Chat API error:', errorMessage, error);

    return NextResponse.json(
      {
        error: 'Failed to get response from AI provider.',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}