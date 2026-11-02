"use client";

import { Fragment, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  Search,
  ArrowUpRight,
  GraduationCap,
  HeartPulse,
  Home,
  Sprout,
  Briefcase,
  ShieldCheck,
} from "lucide-react";
import { SAMPLE_SCHEMES } from "@/lib/data/sample-schemes";
import { SchemeCard } from "@/components/schemes/SchemeCard";
import { BrowseByStateSection } from "@/components/home/BrowseByStateSection";
import { FaqSection } from "@/components/home/FaqSection";
import { useLanguage } from "@/lib/context/LanguageContext";

interface HeadlineWord {
  id: string;
  en: string;
  hi: string;
}

const HEADLINE_LINES: HeadlineWord[][] = [
  [
    { id: "civic", en: "Civic", hi: "नागरिक" },
    { id: "benefits", en: "benefits", hi: "कल्याण" },
    { id: "made", en: "made", hi: "बने," },
  ],
  [
    { id: "clear", en: "clear,", hi: "स्पष्ट," },
    { id: "accessible", en: "accessible,", hi: "सुलभ" },
    { id: "and", en: "and", hi: "और" },
  ],
  [
    { id: "transparent", en: "transparent", hi: "पारदर्शी —" },
    { id: "for", en: "for", hi: "हर" },
    { id: "every", en: "every", hi: "एक" },
    { id: "citizen", en: "citizen.", hi: "नागरिक के लिए।" },
  ],
];

function BilingualWord({
  word,
  isHovered,
  hasActiveHover,
  onHover,
  onLeave,
}: {
  word: HeadlineWord;
  isHovered: boolean;
  hasActiveHover: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  return (
    <span
      className={`relative inline-block cursor-pointer select-none transition-colors duration-200 ${
        isHovered
          ? "text-[#C2410C] font-extrabold"
          : hasActiveHover
          ? "opacity-25 blur-[0.3px] transition-all duration-300"
          : "opacity-100 text-[#111827] transition-all duration-300"
      }`}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {/* English Word — stable, zero layout shift, completely jitter-free */}
      <span className="inline-block transition-transform duration-200 ease-out">
        {word.en}
      </span>

      {/* Floating Hindi Translation Pill — Absolute with pointer-events-none, never affects inline layout */}
      {isHovered && (
        <span
          className="absolute -top-7 sm:-top-8 left-1/2 -translate-x-1/2 pointer-events-none z-30 flex flex-col items-center animate-in fade-in zoom-in-95 duration-150"
          aria-hidden="true"
        >
          <span className="px-2 py-0.5 rounded-md bg-[#C2410C] text-white font-bold text-[11px] sm:text-xs shadow-md whitespace-nowrap tracking-normal leading-tight">
            {word.hi}
          </span>
          <span className="w-1.5 h-1.5 rotate-45 bg-[#C2410C] -mt-0.5" />
        </span>
      )}
    </span>
  );
}

export function HomePageClient() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredWordId, setHoveredWordId] = useState<string | null>(null);
  const { language } = useLanguage();

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/schemes?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/schemes");
    }
  };

  return (
    <main id="main-content" className="flex-1 flex flex-col overflow-hidden">
      {/* ================= HERO SECTION ================= */}
      <section className="relative bg-white pt-6 pb-12 sm:pb-16 lg:pb-20 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* 1. Saffron Hindi Badge — CENTERED */}
          <div className="w-full text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold tracking-wide text-[#C2410C]">
              <span className="w-5 h-[1.5px] bg-[#C2410C]" aria-hidden="true" />
              <span>नागरिक कल्याण सेवा</span>
              <span className="w-5 h-[1.5px] bg-[#C2410C]" aria-hidden="true" />
            </div>
          </div>

          {/* 2. Main Two-Column Row: Lady Justice (Left) & Centered Hero Content (Right) */}
          <div className="relative flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-8 min-h-[540px]">
            {/* LADY JUSTICE ARTWORK - Left Hand Side */}
            <div className="shrink-0 flex justify-center lg:justify-start">
              <div className="relative w-[280px] sm:w-[340px] lg:w-[390px] xl:w-[430px] h-[480px] sm:h-[560px] lg:h-[640px] xl:h-[680px]">
                <Image
                  src="/lady-justice.png"
                  alt="Lady Justice with Scales and Sword"
                  fill
                  priority
                  className="object-contain object-left-top select-none"
                  sizes="(max-width: 1024px) 340px, 430px"
                />
              </div>
            </div>

            {/* HERO CONTENT COLUMN - Centered like reference mock */}
            <div className="w-full lg:flex-1 max-w-2xl flex flex-col items-center text-center pt-2 pb-6">
              {/* State Emblem of India - 3D Slow Rotating Insignia — CENTERED ABOVE HEADLINE */}
              <div
                className="w-full flex justify-center mb-4 group select-none"
                title="State Emblem of India — 360° 3D Rotating Insignia"
              >
                <div className="w-20 sm:w-24 h-auto transition-transform group-hover:scale-105 duration-300">
                  <Image
                    src="/state-emblem-3d.webp"
                    alt="State Emblem of India 3D slow rotation"
                    width={180}
                    height={237}
                    priority
                    unoptimized
                    className="w-full h-auto object-contain drop-shadow-sm select-none"
                  />
                </div>
                <span className="sr-only">
                  State Emblem of India rotating slowly in 3D
                </span>
              </div>

              {/* Main Headline - 3 Lines, CENTER ALIGNED with Nearby Fade */}
              <h1
                onMouseLeave={() => setHoveredWordId(null)}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-[48px] xl:text-[52px] font-extrabold text-[#111827] tracking-tight leading-[1.2] sm:leading-[1.24] text-center max-w-2xl py-1"
              >
                {language === "HI" ? (
                  <>
                    <span className="block text-[#C2410C]">नागरिक कल्याण बने,</span>
                    <span className="block">स्पष्ट, सुलभ और</span>
                    <span className="block whitespace-nowrap">पारदर्शी — हर नागरिक के लिए।</span>
                  </>
                ) : (
                  HEADLINE_LINES.map((line, lineIdx) => (
                    <span
                      key={lineIdx}
                      className={`block${lineIdx === HEADLINE_LINES.length - 1 ? " whitespace-nowrap" : ""}`}
                    >
                      {line.map((word, wordIdx) => (
                        <Fragment key={word.id}>
                          <BilingualWord
                            word={word}
                            isHovered={hoveredWordId === word.id}
                            hasActiveHover={hoveredWordId !== null && hoveredWordId !== word.id}
                            onHover={() => setHoveredWordId(word.id)}
                            onLeave={() => setHoveredWordId(null)}
                          />
                          {wordIdx < line.length - 1 ? " " : ""}
                        </Fragment>
                      ))}
                    </span>
                  ))
                )}
              </h1>

              {/* Action Buttons: [Check Your Eligibility] on left, [Ask Assistant] on right */}
              <div className="mt-7 sm:mt-8 flex flex-row flex-wrap items-center justify-center gap-3.5 sm:gap-4 w-full">
                {/* Check Your Eligibility Button */}
                <Link
                  href="/eligibility"
                  className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 bg-white text-[#115E59] border border-slate-200/90 rounded-xl font-semibold shadow-xs hover:bg-slate-50 hover:border-slate-300 transition-all text-sm sm:text-base group"
                >
                  <Check className="w-4 h-4 text-emerald-600 stroke-[2.5] group-hover:scale-110 transition-transform" />
                  <span>{language === "HI" ? "अपनी पात्रता जांचें" : "Check Your Eligibility"}</span>
                </Link>

                {/* Ask Assistant Button (on right side of Check Your Eligibility) */}
                <Link
                  href="/ask"
                  className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 bg-[#115E59] text-white rounded-xl font-semibold shadow-xs hover:bg-[#0d4a46] hover:shadow-md transition-all text-sm sm:text-base group"
                >
                  <span>{language === "HI" ? "सहायक से पूछें" : "Ask Assistant"}</span>
                </Link>
              </div>

              {/* Subtitle Paragraph - CENTER ALIGNED */}
              <p className="mt-6 text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl text-center">
                {language === "HI"
                  ? "केन्द्र और राज्य की कल्याणकारी योजनाओं की खोज करें, पारदर्शी नियमों से अपनी पात्रता जांचें और आधिकारिक सरकारी गजट व परिपत्रों के प्रमाण देखें।"
                  : "Discover central and state welfare initiatives, verify your eligibility with deterministic rules, and inspect citations from official gazettes and department circulars."}
              </p>

              {/* Search Bar — below description */}
              <div className="w-full max-w-xl mt-6 sm:mt-8">
                <form onSubmit={handleSearch}>
                  <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-2 sm:p-2.5 shadow-xl shadow-slate-200/60 hover:border-[#115E59]/50 transition-all">
                    <div className="pl-2 sm:pl-3 text-[#115E59] shrink-0">
                      <Search className="w-5 h-5" />
                    </div>
                    <div className="flex-1 px-3 text-left">
                      <label htmlFor="hero-search" className="block text-xs font-semibold text-slate-800">
                        {language === "HI"
                          ? "आप किस सहायता या योजना की तलाश में हैं?"
                          : "What support are you looking for?"}
                      </label>
                      <input
                        id="hero-search"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={
                          language === "HI"
                            ? "उच्च शिक्षा छात्रवृत्ति, सोलर पंप सब्सिडी, वृद्धावस्था पेंशन खोजें..."
                            : "Try higher education scholarships, solar pump subsidies, or senior pensions..."
                        }
                        className="w-full text-xs sm:text-sm text-slate-700 placeholder:text-slate-400 bg-transparent outline-none truncate mt-0.5"
                      />
                    </div>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1 px-4 sm:px-5 py-2.5 bg-[#115E59] text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-[#0d4a46] transition-colors shrink-0 shadow-xs cursor-pointer"
                    >
                      <span>{language === "HI" ? "खोजें" : "Explore"}</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= BROWSE SCHEMES BY STATE (INTERACTIVE INDIA MAP) ================= */}
      <BrowseByStateSection />

      {/* ================= POPULAR CATEGORIES ================= */}
      <section className="bg-white py-14 sm:py-16 border-b border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#C2410C]">
                {language === "HI" ? "नागरिक क्षेत्र" : "Citizen Sectors"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                {language === "HI" ? "क्षेत्र के अनुसार योजनाएं देखें" : "Browse Schemes by Sector"}
              </h2>
            </div>
            <Link
              href="/schemes"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#115E59] hover:underline"
            >
              <span>{language === "HI" ? "सभी योजनाएं देखें" : "View all schemes"}</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {[
              {
                category: "education",
                label: language === "HI" ? "शिक्षा" : "Education",
                icon: GraduationCap,
                desc: language === "HI" ? "छात्रवृत्ति और शुल्क छूट" : "Scholarships & fee waivers",
              },
              {
                category: "health",
                label: language === "HI" ? "स्वास्थ्य" : "Health",
                icon: HeartPulse,
                desc: language === "HI" ? "अस्पताल उपचार और दवाएं" : "Hospitalization & medicines",
              },
              {
                category: "housing",
                label: language === "HI" ? "आवास" : "Housing",
                icon: Home,
                desc: language === "HI" ? "पक्का मकान और स्वच्छता अनुदान" : "Pucca house & sanitation grants",
              },
              {
                category: "agriculture",
                label: language === "HI" ? "कृषि" : "Agriculture",
                icon: Sprout,
                desc: language === "HI" ? "फसल इनपुट और बीज सब्सिडी" : "Crop inputs & seed subsidies",
              },
              {
                category: "employment",
                label: language === "HI" ? "रोजगार" : "Employment",
                icon: Briefcase,
                desc: language === "HI" ? "प्रशिक्षुता और युवा कौशल" : "Apprenticeship & youth skills",
              },
              {
                category: "social_security",
                label: language === "HI" ? "सामाजिक सुरक्षा" : "Social Security",
                icon: ShieldCheck,
                desc: language === "HI" ? "वृद्धावस्था और विधवा पेंशन" : "Old age & widow pensions",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.category}
                  href={`/schemes?category=${item.category}`}
                  className="flex flex-col items-center text-center p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl hover:border-[#115E59] hover:bg-teal-50/40 hover:shadow-xs transition-all group"
                >
                  <div className="w-11 h-11 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-[#115E59] group-hover:scale-110 transition-transform shadow-2xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="mt-3 text-sm font-bold text-slate-900 group-hover:text-[#115E59] transition-colors">
                    {item.label}
                  </span>
                  <span className="mt-1 text-[11px] text-slate-500 leading-tight">
                    {item.desc}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= FEATURED DEMO SCHEMES ================= */}
      <section className="bg-slate-50 py-14 sm:py-16 border-b border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#C2410C]">
                {language === "HI" ? "आधिकारिक निर्देशिका" : "Official Directory"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                {language === "HI" ? "प्रमुख कल्याणकारी योजनाएं" : "Featured Welfare Schemes"}
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                {language === "HI"
                  ? "नीचे दी गई सभी योजनाओं में दस्तावेज़ संदर्भ, पात्रता नियम और आवेदन निर्देश शामिल हैं।"
                  : "All schemes below include document citations, eligibility rules, and application instructions."}
              </p>
            </div>
            <Link
              href="/schemes"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#115E59] hover:underline"
            >
              <span>
                {language === "HI"
                  ? `सभी ${SAMPLE_SCHEMES.length} योजनाएं देखें`
                  : `Explore all ${SAMPLE_SCHEMES.length} schemes`}
              </span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SAMPLE_SCHEMES.slice(0, 3).map((scheme) => (
              <SchemeCard key={scheme.id} scheme={scheme} />
            ))}
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="bg-white py-16 sm:py-20 border-b border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#C2410C]">
            {language === "HI" ? "सरल नागरिक प्रक्रिया" : "Simple Citizen Journey"}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            {language === "HI" ? "योजनासेतु कैसे काम करता है" : "How YojnaSetu Works"}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto mt-2">
            {language === "HI"
              ? "एक त्रि-स्तरीय दृष्टिकोण ताकि प्रत्येक नागरिक बिना किसी जटिल कागजी कार्रवाई के आधिकारिक योजनाओं तक पहुंच सके।"
              : "A three-step approach designed to ensure every citizen can access official welfare rules without confusing red tape."}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-12 text-left">
            <div className="p-6 bg-slate-50/80 border border-slate-200/80 rounded-2xl relative">
              <span className="w-8 h-8 rounded-full bg-[#115E59] text-white font-bold flex items-center justify-center text-sm mb-4">
                1
              </span>
              <h3 className="font-bold text-slate-900 text-base">
                {language === "HI" ? "आधिकारिक स्रोत खोजें" : "Search Official Sources"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                {language === "HI"
                  ? "अपनी पारिवारिक आवश्यकता बताएं या श्रेणी अनुसार खोजें। हम प्रमाणित सरकारी परिपत्रों और योजना दिशानिर्देशों में खोजते हैं।"
                  : "Describe your household need or browse by category. We search indexed official government circulars and scheme guidelines."}
              </p>
            </div>

            <div className="p-6 bg-slate-50/80 border border-slate-200/80 rounded-2xl relative">
              <span className="w-8 h-8 rounded-full bg-[#115E59] text-white font-bold flex items-center justify-center text-sm mb-4">
                2
              </span>
              <h3 className="font-bold text-slate-900 text-base">
                {language === "HI" ? "पारदर्शी पात्रता जांच" : "Deterministic Evaluation"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                {language === "HI"
                  ? "केवल योजना के लिए आवश्यक न्यूनतम प्रश्नों के उत्तर दें। पारदर्शी नियमों से आपकी संभावित पात्रता जांची जाती है।"
                  : "Answer only the minimum questions required by the scheme. Transparent rules evaluate your preliminary eligibility."}
              </p>
            </div>

            <div className="p-6 bg-slate-50/80 border border-slate-200/80 rounded-2xl relative">
              <span className="w-8 h-8 rounded-full bg-[#115E59] text-white font-bold flex items-center justify-center text-sm mb-4">
                3
              </span>
              <h3 className="font-bold text-slate-900 text-base">
                {language === "HI" ? "प्रमाण देखें और सीधे आवेदन करें" : "Verify & Apply Directly"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                {language === "HI"
                  ? "प्रत्येक उत्तर में आधिकारिक दस्तावेज़ के पृष्ठ संख्या का संदर्भ होता है और सुरक्षित आवेदन के लिए विभागीय पोर्टल का लिंक मिलता है।"
                  : "Every answer references exact document page numbers and links directly to official department portals for secure filing."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FREQUENTLY ASKED QUESTIONS (KNOWLEDGE BASE) ================= */}
      <FaqSection />
    </main>
  );
}
