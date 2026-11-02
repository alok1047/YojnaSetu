# DESIGN.md — Government Welfare Scheme Assistant

## 1. Product Vision

Create a trustworthy, calm, citizen-friendly portal that makes complex welfare scheme information easier to understand. The interface should feel like a modern public-service product: clear, respectful, accessible, and practical—not like a flashy AI demo.

Primary users:
- Citizens who do not know which scheme may apply to them.
- Helpdesk staff who need to find official scheme details quickly.
- Administrators who maintain the source-document collection.

Primary product promise:
**Understand your options. See the rules. Verify the source.**

Never imply that the product is an official government portal unless the deployment is genuinely authorized and branded as such.

## 2. Design Principles

1. **Trust before spectacle:** official sources, dates, citations, and uncertainty must be visible.
2. **Plain language:** explain government terminology in simple language without changing the underlying rule.
3. **Progressive disclosure:** show a clear summary first; expose detailed criteria and source excerpts when needed.
4. **Accessible by default:** keyboard-first navigation, semantic HTML, visible focus, screen-reader labels, and sufficient contrast.
5. **Mobile-first:** users may be on lower-end phones or slower connections.
6. **No dark patterns:** do not pressure users to disclose sensitive information or suggest that benefits are guaranteed.
7. **Consistent status language:** distinguish “likely eligible,” “more information needed,” and “not enough evidence.”
8. **Useful empty/error states:** tell users what happened and what they can do next.

## 3. Visual Direction

Use a clean editorial/public-service aesthetic:
- Warm off-white or very light neutral page background.
- Deep navy/ink text for readability.
- Restrained teal or green accent for primary actions and positive states.
- Muted amber for caution and incomplete information.
- Red only for errors or explicit unmet criteria, never as the sole signal.
- Thin neutral borders, subtle shadows, generous whitespace, medium corner radii.
- Clear typography hierarchy and readable line lengths.
- Simple line icons; avoid decorative gradients, excessive glassmorphism, neon colors, and large animated effects.

Suggested design tokens (adjust to the existing design system):
- `--color-bg: #F7F8F6`
- `--color-surface: #FFFFFF`
- `--color-text: #17212B`
- `--color-muted: #5D6872`
- `--color-border: #DCE2E0`
- `--color-primary: #176B5B`
- `--color-primary-hover: #105447`
- `--color-accent-soft: #E6F2EE`
- `--color-warning: #8A5A00`
- `--color-warning-soft: #FFF3D8`
- `--color-danger: #A83232`
- `--color-danger-soft: #FCEAEA`
- `--radius-card: 16px`
- `--radius-control: 10px`
- `--shadow-card: 0 4px 18px rgba(23, 33, 43, 0.05)`

Check text/background contrast rather than relying on these values blindly. Do not encode state using color alone.

Typography:
- Use a modern, highly legible sans-serif such as Inter or a system sans stack.
- Body text: approximately 16px on desktop and mobile.
- Body line height: 1.5–1.7.
- Headings should be clear and restrained; avoid oversized marketing-style hero type.
- Support Hindi/Devanagari gracefully if Hindi localization is implemented.

## 4. Information Architecture

Main navigation:
- Home
- Explore Schemes
- Ask Assistant
- Check Eligibility
- About / How it works

Optional admin navigation is visible only to authorized admins:
- Documents
- Ingestion status

Persistent trust elements:
- “Information based on cited official documents”
- Last-verified information when available
- “Not an official eligibility decision” disclaimer in eligibility flows
- Direct official-source links

## 5. Page Specifications

### A. Home / Landing Page

Goal: explain the service and lead users to the two main actions.

Layout:
1. Compact top navigation with wordmark, primary links, and a clear primary action.
2. Hero with a concise headline such as “Find welfare schemes that fit your situation.”
3. Supporting copy explaining that answers are based on source documents and include citations.
4. Two prominent action cards:
   - “Ask a question” — describe a situation in everyday language.
   - “Check eligibility” — answer a few relevant questions to explore possible matches.
5. Search input for scheme names or needs, such as education, housing, health, livelihood, or pensions.
6. A short “How it works” three-step section: Search official information → Understand requirements → Verify with the source.
7. A trust section explaining source citations, update dates, and limitations.
8. Footer with About, privacy, accessibility, official portal/source disclaimer, and contact/feedback placeholder only if configured.

Avoid fabricated statistics, government seals, fake testimonials, and claims such as “100% accurate.”

### B. Ask Assistant / Q&A Page

Goal: make asking a question simple while making evidence easy to inspect.

Desktop layout:
- Main content area with a centered chat column and a comfortable maximum width.
- Optional compact sidebar for filters/history only if it does not crowd the conversation.
- Chat messages should be readable and have clear role labels.
- User message and assistant response must be visually distinct.
- A fixed or sticky composer at the bottom of the chat area, without covering content.
- Enter submits; Shift+Enter adds a line break. Provide an accessible send button.
- Suggested prompt chips before the first message, for example:
  - “What support is available for students?”
  - “Show schemes for small farmers.”
  - “What documents are needed to apply?”
- Optional filters: state/jurisdiction, language, category. Keep them collapsed or compact until needed.

Assistant answer structure:
1. A direct short answer or summary.
2. “Why this may apply” or a concise explanation.
3. Eligibility conditions or application steps in bullets.
4. A clearly labeled “Sources” section with citation cards.
5. A follow-up suggestion, when useful.

Citation card:
- Document/scheme title.
- Department or issuing authority when available.
- Page number(s) when known.
- A short source excerpt or matching section label when available.
- “Open official source” link.
- Effective/publication date and last-verified date when known.

States:
- Initial: welcome copy, prompt suggestions, and privacy reminder not to submit Aadhaar/bank details.
- Loading: calm skeleton or “Searching the available documents…” status.
- No evidence: explain that the available documents did not establish the answer; suggest refining the question or browsing schemes.
- Error: clear message and retry action.
- Partial evidence/conflict: explicitly flag the missing or conflicting source information.

Do not use fake typing animations that delay answers. Keep motion minimal and respect reduced-motion preferences.

### C. Explore Schemes Page

Goal: help users browse without needing to know an exact scheme name.

Layout:
- Page heading and short explanation.
- Search field with placeholder such as “Search schemes, benefits, or eligibility.”
- Filters: state/jurisdiction, category, target group, language, and status/date only when reliable data exists.
- Active filters displayed as removable chips.
- Result count and sort controls.
- Responsive grid of scheme cards; on small screens use one column.

Scheme card content:
- Scheme name.
- Short plain-language summary.
- Department/jurisdiction tag.
- Category tag.
- A small eligibility hint only when supported by structured data.
- “View details” action.
- Source freshness indicator if known.

Provide pagination or “Load more” for large collections. Include a helpful no-results state with a “Clear filters” action. Do not fabricate scheme cards to fill empty space; clearly label any demonstration dataset.

### D. Scheme Detail Page

Suggested structure:
1. Breadcrumbs.
2. Scheme title and department/jurisdiction.
3. Plain-language summary and benefits.
4. Primary actions: “Check potential eligibility” and “Open official source.”
5. Eligibility requirements, with each condition shown separately.
6. Required documents.
7. How to apply: numbered steps.
8. Benefit amount/duration only if verified from the source; otherwise omit.
9. Important dates and exceptions, only when supported.
10. Official sources and page references.
11. Last verified date, separate from the document publication date.
12. Disclaimer that the responsible department makes final decisions.

Use accordions only for secondary details. Do not hide essential eligibility conditions behind several nested accordions.

### E. Eligibility Checker

Goal: guide users through the minimum relevant questions and give a transparent preliminary result.

Flow:
1. Intro screen explaining what the check does and does not do.
2. Ask for jurisdiction/state first if needed.
3. Ask only questions required by candidate schemes. Use progressive disclosure and clear “Why we ask” explanations for sensitive fields.
4. Use accessible controls: labeled inputs, radio groups, select menus, and “Prefer not to say” where appropriate.
5. Show progress, back navigation, and the ability to edit previous answers.
6. Show results grouped by outcome.

Result states:
- **Likely matches:** all known mandatory criteria appear to be met based on supplied answers.
- **May match:** some criteria appear to be met but one or more conditions require confirmation.
- **More information needed:** missing answers prevent a meaningful assessment.
- **Likely does not match:** at least one mandatory rule appears not to be met; explain the exact rule and source.

Every result includes:
- Scheme name and brief benefit summary.
- Criteria checklist with `Met`, `Not met`, or `Unknown` labels and text explanations.
- Citations next to the relevant criteria.
- Missing details or next steps.
- Official source link.
- Clear statement that this is preliminary guidance, not an official decision.

Do not show a single percentage “eligibility score”; it can imply unjustified precision. Do not require account creation for the basic check unless a real product requirement demands it.

### F. Admin Document Management

Goal: safely maintain the indexed source corpus.

Show:
- Document title and issuing authority.
- Official source URL.
- Jurisdiction and language.
- Publication/effective date, if known.
- Last ingested time.
- Status: queued, processing, indexed, failed, or OCR required.
- Extracted page count and chunk count when available.
- Error details that are safe to show to an admin.
- Retry/re-index actions with confirmation.

Protect all admin operations server-side. Do not rely on hiding UI controls as authorization.

### G. About / How It Works

Explain in plain language:
- What the assistant searches.
- How source citations work.
- How to interpret preliminary eligibility results.
- Why information may be incomplete or outdated.
- How to confirm with the responsible department.
- What data the application does and does not need.
- How to report an incorrect answer, if feedback handling is implemented.

## 6. Core Components

Build reusable components rather than styling each page independently:

- `AppHeader`
- `MobileNav`
- `AppFooter`
- `PageContainer`
- `PageHeading`
- `PrimaryButton` / `SecondaryButton`
- `SearchInput`
- `FilterPopover` / `FilterChips`
- `SchemeCard`
- `SchemeCategoryBadge`
- `ChatMessage`
- `ChatComposer`
- `SuggestedPrompt`
- `SourceCitationCard`
- `EvidenceNotice`
- `EligibilityCriterionRow`
- `EligibilityOutcomeBadge`
- `ProgressIndicator`
- `EmptyState`
- `ErrorState`
- `LoadingSkeleton`
- `DisclaimerNotice`

Use semantic HTML and accessible shadcn/ui primitives where helpful. Do not build a custom component library before the primary flows are working.

## 7. Responsive Behavior

Mobile:
- Single-column content.
- Navigation collapses into an accessible menu.
- Full-width search and composer.
- Citation cards wrap naturally; source links remain easy to tap.
- Filters use a drawer/sheet with visible applied-filter count.
- No horizontal scrolling at 320px viewport width.
- Keep the primary action visible without obscuring content.

Tablet:
- Two-column scheme cards where space permits.
- Chat remains a single readable column.

Desktop:
- Constrain body text and chat width for readability.
- Use a wider grid for scheme browsing.
- Keep admin tables scrollable or adapt them into cards at smaller breakpoints.

## 8. Accessibility Requirements

Target WCAG 2.2 AA where practical:
- Full keyboard navigation.
- Visible focus indicators.
- Correct heading hierarchy and landmark regions.
- Form labels and clear validation errors.
- Screen-reader announcements for chat updates and eligibility results.
- Do not use color as the only status indicator.
- Adequate contrast for text, controls, and focus rings.
- Minimum comfortable touch target sizes.
- Reduced-motion support.
- Links describe their destination; avoid repeated “click here.”
- Language metadata and appropriate Hindi text support when localized.

## 9. Content and Tone

Voice: calm, respectful, nonjudgmental, direct, and plain-spoken.

Prefer:
- “Based on the documents available, this scheme may be relevant.”
- “The source does not specify this detail.”
- “We need one more detail to assess this condition.”
- “Please confirm the current requirements with the responsible department.”

Avoid:
- “You are guaranteed to receive this benefit.”
- “You are officially eligible.”
- “The AI knows the answer.”
- Unexplained acronyms and legalistic language.
- Blaming users for missing information.

Use “citizen” only where appropriate; avoid assuming citizenship status if eligibility may include other resident categories.

## 10. Interaction and Motion

- Use small transitions for opening filters, accordions, and dialogs.
- Avoid scroll-jacking, autoplay, confetti, and unnecessary animation.
- Preserve entered question text after recoverable errors.
- Disable duplicate submissions while a request is pending.
- Show retry options for network/API failures.
- Confirm destructive admin actions.
- Do not clear an eligibility questionnaire unexpectedly.
- Show external-link indicators where useful and open official sources in a safe, predictable way.

## 11. Trust, Privacy, and Error Handling

- Display a concise privacy reminder near free-text inputs.
- Do not ask users to upload Aadhaar, bank statements, or identity documents for the MVP.
- Do not retain personal eligibility answers unless a documented need and consent exist.
- Distinguish official source material from explanatory AI-generated summaries.
- Show when a source date is unknown.
- Mark stale or conflicting information rather than silently treating it as current.
- Provide accessible errors without exposing stack traces or internal implementation details.

## 12. Acceptance Criteria for Design

The design is ready when:
- A first-time visitor can understand the service and its limitations within a few seconds.
- A user can ask a question and identify which source supports the answer.
- A user can browse schemes without entering personal information.
- A user can complete and review the eligibility questionnaire using keyboard alone.
- Results clearly distinguish known, unmet, and unknown criteria.
- Every main page has loading, empty, and error states.
- Layout works at 320px mobile width through large desktop widths.
- Text contrast, focus states, labels, and announcements are checked.
- No fabricated government branding, statistics, or official approval claims appear.
