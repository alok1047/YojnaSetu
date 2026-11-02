import { NextRequest, NextResponse } from 'next/server';
import { eligibilityEvaluateSchema } from '@/lib/validation/schemas';
import { evaluateMultipleSchemes } from '@/lib/eligibility/engine';
import { SAMPLE_SCHEMES } from '@/lib/data/sample-schemes';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = eligibilityEvaluateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { schemeIds, answers } = parsed.data;

    // Find matching schemes
    const schemes = SAMPLE_SCHEMES.filter((s) => schemeIds.includes(s.id));

    if (schemes.length === 0) {
      return NextResponse.json(
        { error: 'No matching schemes found for the provided IDs.' },
        { status: 404 }
      );
    }

    const results = evaluateMultipleSchemes(schemes, answers);

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Eligibility evaluation error:', error);
    return NextResponse.json(
      { error: 'An error occurred while evaluating eligibility.' },
      { status: 500 }
    );
  }
}
