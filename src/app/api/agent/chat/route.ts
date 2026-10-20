import { NextResponse } from 'next/server';
import { processAgentIntent, defaultPolicy } from '@/lib/agent-engine';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, policy } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const decision = await processAgentIntent(prompt, policy || defaultPolicy);
    return NextResponse.json(decision);
  } catch (error: any) {
    console.error('API /api/agent/chat error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal agent processing error' },
      { status: 500 }
    );
  }
}
