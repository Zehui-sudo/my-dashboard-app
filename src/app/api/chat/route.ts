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
    console.error('Chat API error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}