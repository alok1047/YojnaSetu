import { NextRequest, NextResponse } from 'next/server';
import { extractText } from 'unpdf';
import { createAIProvider } from '@/lib/ai/provider';

function checkAuth(request: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET || 'admin123';
  const headerKey = request.headers.get('x-admin-key');
  return headerKey === secret;
}

const EXTRACT_PROMPT = `You are an expert government document parser for Indian Welfare Schemes.
Analyze the provided government gazette, scheme notification, or operational circular and extract the scheme metadata into a strict JSON object.

Valid categories are ONLY one of:
- education
- health
- housing
- agriculture
- employment
- social_security
- women_children
- disability
- pension
- other

Respond ONLY with a valid JSON object matching this exact format (no markdown formatting, no code block backticks):
{
  "name": "Full official scheme name",
  "category": "one of the valid categories above",
  "department": "Ministry or Department issuing the scheme",
  "jurisdiction": "Central or state name",
  "targetGroup": "Key target beneficiary group",
  "summary": "Concise 2-3 sentence summary of what the scheme provides",
  "description": "Detailed explanation of scheme objectives, funding, and scope",
  "benefits": [
    "Benefit 1 with financial amounts if specified",
    "Benefit 2",
    "Benefit 3"
  ],
  "requiredDocuments": [
    "Document 1 (e.g. Aadhaar Card)",
    "Document 2 (e.g. Bank Account / Passbook)"
  ],
  "applicationSteps": [
    "Step 1: Where and how to register",
    "Step 2: Verification process",
    "Step 3: Disbursement"
  ],
  "officialUrl": "Official website URL if mentioned or leave empty string",
  "sourceTitle": "Title of the gazette circular or guidelines document"
}`;

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'Please upload a valid PDF document.' }, { status: 400 });
    }

    // Extract text using unpdf
    const arrayBuffer = await file.arrayBuffer();
    const { text, totalPages } = await extractText(new Uint8Array(arrayBuffer), { mergePages: true });

    const rawText = Array.isArray(text) ? text.join('\n\n') : (text || '');

    if (rawText.trim().length < 40) {
      return NextResponse.json(
        { error: 'Could not extract readable text from this PDF. Please ensure it is not a pure image scan or password-protected.' },
        { status: 400 }
      );
    }

    // Truncate to first ~12,000 characters to stay within fast context limits
    const truncatedText = rawText.slice(0, 12000);

    const provider = createAIProvider();
    const response = await provider.complete({
      systemPrompt: EXTRACT_PROMPT,
      userMessage: `Analyze this government document and extract structured scheme details:\n\n${truncatedText}`,
      maxTokens: 1500,
      temperature: 0.1,
    });

    let cleaned = response.content.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();
    }

    try {
      const parsed = JSON.parse(cleaned);
      return NextResponse.json({
        success: true,
        extracted: parsed,
        rawText: truncatedText,
        totalPages,
        filename: file instanceof File ? file.name : 'uploaded.pdf',
      });
    } catch {
      return NextResponse.json(
        {
          error: 'AI extracted details could not be parsed as JSON. Raw output: ' + cleaned.slice(0, 200),
          raw: cleaned,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('PDF parsing error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to parse PDF document' },
      { status: 500 }
    );
  }
}
