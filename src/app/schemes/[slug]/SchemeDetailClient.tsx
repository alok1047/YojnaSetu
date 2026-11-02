'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Bookmark,
  Share2,
  ExternalLink,
  CheckCircle2,
  ChevronDown,
  ThumbsUp,
  ThumbsDown,
  Check,
} from 'lucide-react';
import type { Scheme } from '@/lib/types';
import { SCHEME_CATEGORIES } from '@/lib/data/sample-schemes';

interface SchemeDetailClientProps {
  scheme: Scheme;
}

const NAV_TABS = [
  { id: 'details', label: 'Details' },
  { id: 'benefits', label: 'Benefits' },
  { id: 'eligibility', label: 'Eligibility' },
  { id: 'application-process', label: 'Application Process' },
  { id: 'documents-required', label: 'Documents Required' },
  { id: 'faqs', label: 'Frequently Asked Questions' },
  { id: 'sources', label: 'Sources And References' },
  { id: 'feedback', label: 'Feedback' },
];

export function SchemeDetailClient({ scheme }: SchemeDetailClientProps) {
  const [activeSection, setActiveSection] = useState<string>('details');
  const [isBookmarked, setIsBookmarked] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('yojnasetu_bookmarks');
        if (saved) {
          const list = JSON.parse(saved);
          if (Array.isArray(list)) {
            return list.includes(scheme.id);
          }
        }
      } catch {
        return false;
      }
    }
    return false;
  });
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [feedbackVote, setFeedbackVote] = useState<'yes' | 'no' | null>(null);

  const toggleBookmark = () => {
    try {
      const saved = localStorage.getItem('yojnasetu_bookmarks');
      let list: string[] = saved ? JSON.parse(saved) : [];
      if (!Array.isArray(list)) list = [];

      if (isBookmarked) {
        list = list.filter((id) => id !== scheme.id);
        setIsBookmarked(false);
      } else {
        list.push(scheme.id);
        setIsBookmarked(true);
      }
      localStorage.setItem('yojnasetu_bookmarks', JSON.stringify(list));
    } catch {
      setIsBookmarked(!isBookmarked);
    }
  };

  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: scheme.name,
          text: scheme.summary,
          url,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    await navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const topOffset = element.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
    }
  };

  // Scrollspy: update active section as user scrolls
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 120;
      for (let i = NAV_TABS.length - 1; i >= 0; i--) {
        const el = document.getElementById(NAV_TABS[i].id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(NAV_TABS[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Compute tag pills
  const tags = useMemo(() => {
    const list: string[] = [];
    const catLabel = SCHEME_CATEGORIES[scheme.category] || scheme.category;
    list.push(catLabel);

    if (scheme.name.toLowerCase().includes('foreign') || scheme.slug.includes('foreign')) {
      list.push('Foreign');
    }
    if (scheme.name.toLowerCase().includes('loan') || scheme.summary.toLowerCase().includes('loan')) {
      list.push('Loan');
    }
    if (scheme.targetGroup?.toLowerCase().includes('student') || scheme.category === 'education') {
      list.push('Student');
    }
    if (scheme.description.toLowerCase().includes('university') || scheme.name.toLowerCase().includes('study')) {
      list.push('University');
    }
    if (scheme.category === 'agriculture' || scheme.name.toLowerCase().includes('kisan')) {
      list.push('Agriculture', 'Farmers', 'DBT');
    }
    if (scheme.category === 'health' || scheme.name.toLowerCase().includes('arogya') || scheme.name.toLowerCase().includes('swasthya')) {
      list.push('Healthcare', 'Insurance', 'Cashless');
    }
    if (scheme.category === 'housing' || scheme.name.toLowerCase().includes('awas')) {
      list.push('Housing', 'Pucca House', 'Subsidy');
    }

    // Deduplicate and slice top 5
    return Array.from(new Set(list)).slice(0, 5);
  }, [scheme]);

  // Frequently Asked Questions tailored to the scheme
  const faqs = useMemo(() => {
    return [
      {
        q: `Who is eligible to apply for ${scheme.name}?`,
        a: scheme.targetGroup
          ? `This scheme primarily benefits: ${scheme.targetGroup}. Applicants must satisfy all income, category, and domicile criteria laid out in official guidelines.`
          : `Eligible citizens residing in ${scheme.jurisdiction} meeting prescribed guidelines can apply.`,
      },
      {
        q: `What financial assistance or tangible benefits are provided?`,
        a: scheme.benefits.length > 0
          ? `Key benefits include: ${scheme.benefits.slice(0, 3).join('; ')}.`
          : 'Financial grants, subsidies, or services disbursed as per official department policy.',
      },
      {
        q: `What documents do I need to keep ready?`,
        a: scheme.requiredDocuments.length > 0
          ? `Essential documents required: ${scheme.requiredDocuments.slice(0, 4).join(', ')}.`
          : 'Aadhaar Card, address proof, income certificate, and active bank account passbook.',
      },
      {
        q: `How do I track my submitted application?`,
        a: `Applications submitted through ${scheme.officialUrl ? scheme.officialUrl : 'the state/central portal'} can be tracked online using your registered Application Reference Number or mobile OTP.`,
      },
    ];
  }, [scheme]);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top Back Navigation */}
        <div className="mb-6">
          <Link
            href="/schemes"
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>
        </div>

        {/* Two-Column Layout */}
        <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
          {/* Left Sticky Sidebar Navigation */}
          <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-20 z-10 bg-white">
            <nav
              aria-label="Scheme section navigation"
              className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-none border-b lg:border-b-0 border-slate-100"
            >
              {NAV_TABS.map((tab) => {
                const isActive = activeSection === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => scrollToSection(tab.id)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-slate-100 font-bold text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Right Main Content */}
          <main className="flex-1 min-w-0 max-w-4xl space-y-12 pb-24">
            {/* Top Scheme Header */}
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-slate-500 tracking-wide">
                  {scheme.jurisdiction}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleBookmark}
                    title={isBookmarked ? 'Remove bookmark' : 'Bookmark this scheme'}
                    className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                      isBookmarked
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-600'
                        : 'border-emerald-400 text-emerald-600 hover:bg-emerald-50'
                    }`}
                    aria-label="Bookmark scheme"
                  >
                    <Bookmark
                      className={`w-4 h-4 ${isBookmarked ? 'fill-emerald-600' : ''}`}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={handleShare}
                    title="Share scheme link"
                    className="w-9 h-9 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Share scheme"
                  >
                    {copiedLink ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Share2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {scheme.name}
              </h1>

              {/* Category / Keyword Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3.5 py-0.5 rounded-full text-xs font-medium border border-emerald-600 text-emerald-800 bg-emerald-50/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href={`/eligibility?scheme=${scheme.slug}`}
                  className="px-5 py-2.5 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold text-sm transition-colors shadow-2xs inline-flex items-center gap-2 cursor-pointer"
                >
                  Check Eligibility
                </Link>

                {scheme.officialUrl && (
                  <a
                    href={scheme.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-sm transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>Official Portal</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                )}
              </div>
            </div>

            {/* SECTION 1: Details */}
            <section id="details" className="scroll-mt-24 space-y-4 pt-4 border-t border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900">Details</h2>
              <div className="text-slate-700 leading-relaxed text-sm sm:text-base space-y-3">
                <p>{scheme.description || scheme.summary}</p>
                {scheme.department && (
                  <p className="text-xs text-slate-500 pt-1">
                    <strong className="font-semibold text-slate-700">Administering Department:</strong>{' '}
                    {scheme.department}
                  </p>
                )}
                {scheme.targetGroup && (
                  <p className="text-xs text-slate-500">
                    <strong className="font-semibold text-slate-700">Target Beneficiary Group:</strong>{' '}
                    {scheme.targetGroup}
                  </p>
                )}
              </div>
            </section>

            {/* SECTION 2: Benefits */}
            <section id="benefits" className="scroll-mt-24 space-y-4 pt-4 border-t border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900">Benefits</h2>
              <div className="space-y-3.5">
                {scheme.benefits.map((benefit, idx) => {
                  const colonIndex = benefit.indexOf(':');
                  const hasKey = colonIndex > 0 && colonIndex < 40;
                  return (
                    <div
                      key={idx}
                      className="text-slate-800 text-sm sm:text-base leading-relaxed flex items-start gap-2.5"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-600 mt-2 shrink-0" />
                      <div>
                        {hasKey ? (
                          <>
                            <strong className="font-bold underline decoration-slate-400 underline-offset-2 text-slate-900">
                              {benefit.slice(0, colonIndex + 1)}
                            </strong>
                            <span className="text-slate-800">{benefit.slice(colonIndex + 1)}</span>
                          </>
                        ) : (
                          <span className="text-slate-800">{benefit}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* SECTION 3: Eligibility */}
            <section id="eligibility" className="scroll-mt-24 space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">Eligibility</h2>
                <Link
                  href={`/eligibility?scheme=${scheme.slug}`}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  Verify your profile →
                </Link>
              </div>

              {scheme.eligibilityCriteria.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {scheme.eligibilityCriteria.map((criterion) => (
                    <div
                      key={criterion.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-sm text-slate-900">
                          {criterion.label}
                        </h3>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {criterion.required ? 'Mandatory' : 'Optional'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {criterion.description}
                      </p>
                      {criterion.sourceExcerpt && (
                        <p className="text-[11px] italic text-slate-500 pt-1.5 border-t border-slate-100 mt-2">
                          &ldquo;{criterion.sourceExcerpt}&rdquo;
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-600">
                  Applicants residing in {scheme.jurisdiction} belonging to the target beneficiary
                  group ({scheme.targetGroup || 'General citizens'}) are eligible as per official
                  gazette norms.
                </p>
              )}
            </section>

            {/* SECTION 4: Application Process */}
            <section
              id="application-process"
              className="scroll-mt-24 space-y-4 pt-4 border-t border-slate-100"
            >
              <h2 className="text-2xl font-bold text-slate-900">Application Process</h2>
              <div className="space-y-3">
                {scheme.applicationSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3.5 p-4 rounded-xl border border-slate-200 bg-white shadow-2xs"
                  >
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-sm text-slate-800 leading-relaxed pt-0.5">{step}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION 5: Documents Required */}
            <section
              id="documents-required"
              className="scroll-mt-24 space-y-4 pt-4 border-t border-slate-100"
            >
              <h2 className="text-2xl font-bold text-slate-900">Documents Required</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {scheme.requiredDocuments.map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-200 bg-slate-50/60"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-slate-800">{doc}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION 6: Frequently Asked Questions */}
            <section id="faqs" className="scroll-mt-24 space-y-4 pt-4 border-t border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
              <div className="space-y-2">
                {faqs.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div
                      key={idx}
                      className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between p-4 text-left font-semibold text-sm text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-400 transition-transform ${
                            isOpen ? 'rotate-180 text-emerald-600' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* SECTION 7: Sources And References */}
            <section id="sources" className="scroll-mt-24 space-y-4 pt-4 border-t border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900">Sources And References</h2>
              <div className="space-y-3">
                {scheme.sources.map((src, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div>
                      <h3 className="font-semibold text-sm text-slate-900">{src.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {src.department || scheme.department}
                        {src.publicationDate ? ` • Published: ${src.publicationDate}` : ''}
                      </p>
                    </div>
                    {src.sourceUrl && (
                      <a
                        href={src.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 shrink-0"
                      >
                        <span>View Document</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION 8: Feedback */}
            <section id="feedback" className="scroll-mt-24 pt-4 border-t border-slate-100 space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">Feedback</h2>
              <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/70 text-center space-y-3">
                <p className="text-sm font-semibold text-slate-800">
                  Did you find this scheme information helpful?
                </p>
                {feedbackVote ? (
                  <p className="text-xs font-medium text-emerald-700">
                    Thank you for your feedback! It helps keep our government welfare data verified and up to date.
                  </p>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setFeedbackVote('yes')}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-300 hover:border-emerald-500 text-slate-700 text-xs font-medium transition-all shadow-2xs cursor-pointer"
                    >
                      <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Yes, helpful</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeedbackVote('no')}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-300 hover:border-rose-400 text-slate-700 text-xs font-medium transition-all shadow-2xs cursor-pointer"
                    >
                      <ThumbsDown className="w-3.5 h-3.5 text-rose-500" />
                      <span>Needs improvement</span>
                    </button>
                  </div>
                )}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
