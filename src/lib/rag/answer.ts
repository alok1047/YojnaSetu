import type { ChatResponse, RetrievedChunk, SourceCitation } from '@/lib/types';
import { createAIProvider } from '@/lib/ai/provider';
import { RAG_SYSTEM_PROMPT, RAG_CONTEXT_TEMPLATE } from './prompts';
import { retrieveChunks } from './retriever';
import { v4 as uuidv4 } from 'uuid';

function chunksToCitations(chunks: RetrievedChunk[]): SourceCitation[] {
  // Deduplicate by documentId + pageNumber
  const seen = new Set<string>();
  const citations: SourceCitation[] = [];

  for (const chunk of chunks) {
    const key = `${chunk.documentId}-${chunk.pageNumber}`;
    if (seen.has(key)) continue;
    seen.add(key);

    citations.push({
      documentId: chunk.documentId,
      title: chunk.documentTitle,
      sourceUrl: chunk.sourceUrl,
      pageNumber: chunk.pageNumber,
      chunkId: chunk.id,
      excerpt: chunk.text.length > 200 ? chunk.text.slice(0, 200) + '…' : chunk.text,
    });
  }

  return citations;
}

function generateFollowUpSuggestions(_query: string, chunks: RetrievedChunk[]): string[] {
  const suggestions: string[] = [];
  const hasEligibility = chunks.some((c) => c.text.toLowerCase().includes('eligib'));
  const hasDocuments = chunks.some((c) => c.text.toLowerCase().includes('document'));
  const hasApplication = chunks.some(
    (c) => c.text.toLowerCase().includes('apply') || c.text.toLowerCase().includes('application')
  );

  if (!hasEligibility) suggestions.push('What are the eligibility requirements?');
  if (!hasDocuments) suggestions.push('What documents are needed to apply?');
  if (!hasApplication) suggestions.push('How do I apply for this scheme?');
  if (suggestions.length < 3) suggestions.push('Are there similar schemes available?');

  return suggestions.slice(0, 3);
}

export async function generateRAGAnswer(
  question: string,
  filters?: { state?: string; category?: string }
): Promise<ChatResponse> {
  // Step 1: Retrieve relevant chunks
  const retrievedChunks = await retrieveChunks(question, {
    state: filters?.state,
    category: filters?.category,
    maxResults: 5,
  });

  // Step 2: Build citations from retrieved chunks (server-mapped, not LLM-generated)
  const citations = chunksToCitations(retrievedChunks);

  // Step 3: Handle greetings or check if we have enough context
  const GREETING_REGEX = /^(hi|hello|hey|namaste|greetings|help|what can you do|who are you|how can you help|kya kar sakte ho|intro)[!?.]*$/i;
  const isGreeting = GREETING_REGEX.test(question.trim().toLowerCase());

  if (isGreeting) {
    try {
      const provider = createAIProvider();
      const response = await provider.complete({
        systemPrompt:
          'You are YojnaSetu AI, an expert, polite assistant for Indian Government Welfare Schemes. Respond warmly to the citizen greeting, briefly introduce how you help citizens find welfare schemes, check eligibility, and understand application steps. Offer 3 practical examples of questions they can ask (such as PM-KISAN, Ayushman Bharat, or education scholarships). Keep your answer concise, respectful, and well-structured.',
        userMessage: question,
        maxTokens: 512,
        temperature: 0.5,
      });

      return {
        answer: response.content,
        citations: [],
        followUpSuggestions: [
          'What are the eligibility criteria for PM-KISAN?',
          'How does Ayushman Bharat ₹5 Lakh health cover work?',
          'Which scholarships are available for students?',
        ],
        conversationId: uuidv4(),
        retrievedChunks: [],
      };
    } catch {
      return {
        answer:
          'Namaste! Welcome to **YojnaSetu** — your public information assistant for central and state welfare schemes.\n\nI can help you with:\n• Finding welfare initiatives across agriculture, healthcare, education, and housing\n• Verifying eligibility rules from official government guidelines\n• Step-by-step application instructions and required documentation checklists\n\nHow may I assist you today?',
        citations: [],
        followUpSuggestions: [
          'Check PM-KISAN eligibility',
          'Explore Ayushman Bharat health cover',
          'Search education scholarships',
        ],
        conversationId: uuidv4(),
        retrievedChunks: [],
      };
    }
  }

  // Step 3b: Handle catalog count questions (e.g. "how many schemes are there")
  const COUNT_REGEX = /(how many|total|number of|count of|kitni|kitne).*(schemes?|yojanas?|yojna)/i;
  const isCountQuery = COUNT_REGEX.test(question.trim().toLowerCase());

  if (isCountQuery) {
    return {
      answer: `There are currently **637 verified, active welfare schemes** indexed in YojnaSetu, covering both Central and State government programs:

### 🏛️ Jurisdiction Distribution
- **Central Government Schemes:** **527 schemes** spanning all Union Ministries (Education, Agriculture, Health, MSME, Finance, Housing, etc.)
- **State & UT Schemes:** **110 schemes** across Gujarat, Maharashtra, Uttar Pradesh, Tamil Nadu, Andhra Pradesh, Karnataka, Punjab, Lakshadweep, and other states/UTs.

### 📋 Category Breakdown
- **Education & Learning:** **184 schemes** (Scholarships, fellowships, study abroad loans)
- **Social Security & Welfare:** **142 schemes** (Financial grants, SC/ST/OBC aid, basic security)
- **Employment, MSME & Livelihood:** **83 schemes** (Artisan loans, startup grants, skill training)
- **Agriculture & Allied Sectors:** **74 schemes** (PM-KISAN, crop insurance, equipment subsidies)
- **Women & Child Development:** **44 schemes** (Sukanya Samriddhi, maternity support, girl child incentives)
- **Health & Wellness:** **38 schemes** (Ayushman Bharat, medical assistance, diagnostic covers)
- **Pensions & Senior Citizens:** **34 schemes** (Atal Pension, old age pensions, retirement safety)
- **Disability Welfare (Divyangjan):** **24 schemes** (Assistive appliances, specialized pensions)
- **Housing & Urban/Rural Shelter:** **14 schemes** (PMAY Urban & Gramin, construction assistance)

You can browse and search all 637 schemes in our **[Explore Schemes Directory](/schemes)** or verify your eligibility using the **[Eligibility Checker](/eligibility)**.`,
      citations: [],
      followUpSuggestions: [
        'Which scholarships are available in education?',
        'What schemes exist for agriculture and farmers?',
        'How do I check my eligibility for schemes?',
      ],
      conversationId: uuidv4(),
      retrievedChunks: [],
    };
  }

  if (retrievedChunks.length === 0) {
    return {
      answer:
        'The available source documents do not contain sufficient information to answer this question. You could try:\n\n• Rephrasing your question with different terms\n• Browsing the scheme directory to find relevant schemes\n• Checking with the responsible government department directly\n\nNote: This assistant can only answer based on officially indexed documents.',
      citations: [],
      followUpSuggestions: [
        'Show me all available schemes',
        'What categories of schemes are available?',
        'How do I browse schemes?',
      ],
      conversationId: uuidv4(),
      retrievedChunks: [],
    };
  }

  // Step 4: Try to generate answer with AI provider
  try {
    const provider = createAIProvider();
    const context = RAG_CONTEXT_TEMPLATE(
      retrievedChunks.map((c) => ({
        text: c.text,
        title: c.documentTitle,
        pageNumber: c.pageNumber,
      }))
    );

    const response = await provider.complete({
      systemPrompt: RAG_SYSTEM_PROMPT,
      userMessage: `Context from official documents:\n\n${context}\n\nQuestion: ${question}`,
      maxTokens: 1024,
      temperature: 0.3,
    });

    return {
      answer: response.content,
      citations,
      followUpSuggestions: generateFollowUpSuggestions(question, retrievedChunks),
      conversationId: uuidv4(),
      retrievedChunks,
    };
  } catch (error) {
    // If AI provider is not configured, return a structured answer from retrieved chunks
    const schemeNames = [...new Set(retrievedChunks.map((c) => c.documentTitle))];
    const answer = `Based on the indexed documents, I found relevant information from the following sources:\n\n${schemeNames.map((name, i) => `${i + 1}. ${name}`).join('\n')}\n\nPlease review the source citations below for details. For a complete AI-generated answer, configure an AI provider (Gemini or OpenAI) in your .env.local file.\n\n⚠️ AI provider not configured: ${error instanceof Error ? error.message : 'Unknown error'}`;

    return {
      answer,
      citations,
      followUpSuggestions: generateFollowUpSuggestions(question, retrievedChunks),
      conversationId: uuidv4(),
      retrievedChunks,
    };
  }
}
