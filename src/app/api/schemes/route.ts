import { NextRequest, NextResponse } from 'next/server';
import { schemeSearchSchema } from '@/lib/validation/schemas';
import { getAllSchemes } from '@/lib/data/custom-schemes';

export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams);
    const parsed = schemeSearchSchema.safeParse(params);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { query, category, state, page, limit } = parsed.data;
    let schemes = getAllSchemes();

    // Filter
    if (query) {
      const q = query.toLowerCase();
      schemes = schemes.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.summary.toLowerCase().includes(q) ||
          s.department.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
      );
    }
    if (category) {
      schemes = schemes.filter((s) => s.category === category);
    }
    if (state) {
      schemes = schemes.filter(
        (s) => s.jurisdiction === state || s.jurisdiction === 'National' || s.jurisdiction === 'Central'
      );
    }

    const total = schemes.length;
    const start = (page - 1) * limit;
    const paginated = schemes.slice(start, start + limit);

    return NextResponse.json({
      schemes: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'digest' in error &&
      (error as { digest: string }).digest === 'NEXT_PRERENDER_INTERRUPTED'
    ) {
      throw error;
    }
    console.error('Schemes API error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching schemes.' },
      { status: 500 }
    );
  }
}
