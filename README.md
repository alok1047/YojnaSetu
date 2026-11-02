# Government Welfare Scheme Assistant

A trustworthy, accessible web application that helps citizens discover government welfare schemes, understand eligibility criteria, and find application instructions — all grounded in official source documents with verifiable citations.

> **Important:** This is an informational assistant, not an official government portal. Eligibility assessments are preliminary and do not constitute official approval.

## Features

- **Ask a Question** — Natural language Q&A powered by RAG (Retrieval-Augmented Generation) with source citations
- **Explore Schemes** — Browse and filter welfare schemes with search, category, and jurisdiction filters
- **Check Eligibility** — Step-by-step questionnaire with deterministic rule-based evaluation
- **Source Citations** — Every answer links back to the source document, page number, and official URL
- **Responsive UI** — Mobile-first design that works from 320px to large desktop widths
- **Accessible** — Keyboard navigation, screen reader support, focus indicators, and WCAG 2.2 AA targets

## Tech Stack

- **Framework:** Next.js 16 (App Router) with TypeScript
- **Styling:** Tailwind CSS 4 with custom design tokens
- **Validation:** Zod + React Hook Form
- **AI Provider:** Gemini or OpenAI (configurable via environment variables)
- **Icons:** Lucide React + inline SVG
- **Testing:** Vitest

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm 9+

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd sprint2

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys (see Configuration below)

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Configuration

Copy `.env.example` to `.env.local` and configure:

#### AI Provider (for RAG Q&A)

Choose one:

**Google Gemini (recommended):**
```env
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.0-flash
GEMINI_EMBEDDING_MODEL=text-embedding-004
```

Get a key at [Google AI Studio](https://aistudio.google.com/apikey).

**OpenAI:**
```env
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

> **Note:** If no AI provider is configured, the chat feature will still return retrieved source documents but without AI-generated summaries. The eligibility checker works entirely without AI — it uses deterministic rule evaluation.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/
│   │   ├── chat/           # POST /api/chat — RAG Q&A
│   │   ├── eligibility/    # POST /api/eligibility/evaluate
│   │   └── schemes/        # GET /api/schemes, GET /api/schemes/[slug]
│   ├── ask/                # Ask Assistant page
│   ├── eligibility/        # Eligibility checker page
│   ├── schemes/            # Scheme listing and detail pages
│   └── about/              # About / How it works
├── components/
│   ├── chat/               # Chat UI components
│   ├── schemes/            # Scheme listing/detail components
│   └── ui/                 # Reusable UI primitives
└── lib/
    ├── ai/                 # AI provider adapter (Gemini/OpenAI)
    ├── data/               # Sample/seed data
    ├── eligibility/        # Rule-based evaluation engine
    ├── rag/                # Retrieval, prompts, answer generation
    ├── types/              # TypeScript domain types
    └── validation/         # Zod schemas
```

## Sample Data

The application ships with **clearly labeled sample schemes** for demonstration purposes. These are fictional examples and do NOT represent real government programs. In production, scheme data would be sourced from officially ingested documents.

Sample schemes include:
- [Sample] National Meritorious Higher Education Scholarship
- [Sample] Arogya Suraksha Universal Health Assurance
- [Sample] Resilient Gramin Pucca Awas Housing Grant
- [Sample] Kisan Samridhi Crop Input Support Scheme
- [Sample] Yuva Rojgar Skilled Apprenticeship Program
- [Sample] Vridha Jeevan Senior Citizen Security Pension

## Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Run ESLint
npx tsc --noEmit   # Type check
npx vitest run     # Run tests
```

## Architecture Decisions

1. **No fabricated data:** All sample content is clearly labeled. The system never presents AI-generated content as official government information.

2. **Server-mapped citations:** Citations are mapped on the server from actual retrieved chunks — the AI model never generates citation references.

3. **Deterministic eligibility:** The eligibility checker uses pure rule evaluation in TypeScript code, independent of any AI model. This ensures consistent, auditable results.

4. **Provider abstraction:** The AI provider layer supports both Gemini and OpenAI through a clean adapter interface. Graceful degradation when no provider is configured.

5. **Progressive enhancement:** Core functionality (scheme browsing, eligibility checking) works without AI. The chat feature degrades gracefully to showing source documents when AI is unavailable.

## License

This project is for educational purposes.
