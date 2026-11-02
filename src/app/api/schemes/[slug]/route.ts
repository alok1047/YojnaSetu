import { NextRequest, NextResponse } from 'next/server';
import { SAMPLE_SCHEMES } from '@/lib/data/sample-schemes';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const scheme = SAMPLE_SCHEMES.find((s) => s.slug === slug);

    if (!scheme) {
      return NextResponse.json(
        { error: 'Scheme not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ scheme });
  } catch (error) {
    console.error('Scheme detail API error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching scheme details.' },
      { status: 500 }
    );
  }
}
