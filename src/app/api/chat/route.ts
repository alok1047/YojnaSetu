import { NextRequest, NextResponse } from 'next/server';
import { chatRequestSchema } from '@/lib/validation/schemas';
import { generateRAGAnswer } from '@/lib/rag/answer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = chatRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { question, filters } = parsed.data;
    const response = await generateRAGAnswer(question, {
      state: filters?.state,
      category: filters?.category,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your question. Please try again.' },
      { status: 500 }
    );
  }
}
