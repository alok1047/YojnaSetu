"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import indiaMapData from "@svg-maps/india";
import {
  CheckCircle2,
  ArrowUpRight,
  RotateCcw,
  Building2,
  ShieldCheck,
  ChevronRight,
  GraduationCap,
  HeartPulse,
  Home,
  Sprout,
  Briefcase,
  Users,
} from "lucide-react";
import { getStateDetails, type StateInfo } from "@/lib/data/india-states-meta";
import { SAMPLE_SCHEMES, SCHEME_CATEGORIES } from "@/lib/data/sample-schemes";
import { useLanguage } from "@/lib/context/LanguageContext";

// Ensure map object is resolved correctly whether default or direct
interface SVGMapLocation {
  id: string;
  name: string;
  path: string;
}

interface SVGMap {
  viewBox: string;
  locations: SVGMapLocation[];
}

const resolvedMap = ((indiaMapData as unknown as { default?: SVGMap }).default || indiaMapData) as SVGMap;

export function BrowseByStateSection() {
  const { language } = useLanguage();

  // State variables - initialized to null for neutral, total reset view
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
  const [hoveredStateId, setHoveredStateId] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Active state data (null when no state is selected)
  const activeStateInfo: StateInfo | null = useMemo(() => {
    if (!selectedStateId) return null;
    return getStateDetails(selectedStateId);
  }, [selectedStateId]);

  // Combined schemes applicable to this state (State Flagships + Central Schemes, or Central when null)
  const combinedSchemes = useMemo(() => {
    if (activeStateInfo) {
      const stateSchemes = activeStateInfo.sampleSchemes.map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.id,
        category: s.category,
        summary: s.summary,
        benefits: s.benefits,
        isStateSpecific: true,
        department: `${activeStateInfo.name} State Welfare Board`,
        jurisdiction: activeStateInfo.name,
      }));

      const centralSchemes = SAMPLE_SCHEMES.map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        category: s.category,
        summary: s.summary,
        benefits: s.benefits.slice(0, 2),
        isStateSpecific: false,
        department: s.department,
        jurisdiction: "Central / Nationwide",
      }));

      return [...stateSchemes, ...centralSchemes];
    } else {
      return SAMPLE_SCHEMES.map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        category: s.category,
        summary: s.summary,
        benefits: s.benefits.slice(0, 2),
        isStateSpecific: false,
        department: s.department,
        jurisdiction: "Central / Nationwide",
      }));
    }
  }, [activeStateInfo]);

  // Filtered by selected category tab
  const filteredSchemes = useMemo(() => {
    if (selectedCategory === "all") return combinedSchemes;
    return combinedSchemes.filter((s) => s.category === selectedCategory);
  }, [combinedSchemes, selectedCategory]);

  // State selection handler:
  // On 2nd click on the same state: zoom out AND deselect completely (total reset)
  const handleSelectState = (stateId: string) => {
    if (selectedStateId === stateId) {
      setSelectedStateId(null);
      setIsZoomed(false);
    } else {
      setSelectedStateId(stateId);
      setIsZoomed(true);
    }
  };

  // Full reset handler
  const handleTotalReset = () => {
    setSelectedStateId(null);
    setIsZoomed(false);
  };

  // Categories present in this state's schemes
  const categoriesList = [
    { id: "all", label: language === "HI" ? "सभी योजनाएं" : "All Schemes" },
    { id: "education", label: language === "HI" ? "शिक्षा" : "Education", icon: GraduationCap },
    { id: "health", label: language === "HI" ? "स्वास्थ्य" : "Health", icon: HeartPulse },
    { id: "housing", label: language === "HI" ? "आवास" : "Housing", icon: Home },
    { id: "agriculture", label: language === "HI" ? "कृषि" : "Agriculture", icon: Sprout },
    { id: "social_security", label: language === "HI" ? "सामाजिक सुरक्षा" : "Social Security", icon: ShieldCheck },
    { id: "women_children", label: language === "HI" ? "महिला एवं बाल" : "Women & Girls", icon: Users },
    { id: "employment", label: language === "HI" ? "रोजगार" : "Employment", icon: Briefcase },
  ];

  // Active state scheme count and badge text dimensions
  const activeSchemeCount = activeStateInfo?.totalSchemesCount || 32;
  const schemeNumText = `${activeSchemeCount} schemes `;
  const stateNameText = activeStateInfo ? `(${activeStateInfo.name})` : "";
  const schemeNumWidth = schemeNumText.length * 7.2;
  const stateNameWidth = stateNameText.length * 6.5;
  const pillWidth = 26 + schemeNumWidth + stateNameWidth + 16;

  return (
    <section id="browse-by-state" className="relative bg-gradient-to-b from-white via-slate-50/50 to-white py-16 sm:py-20 border-b border-slate-200/90 overflow-hidden">
      {/* Decorative background grid (warm yellow glow removed per request) */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold tracking-wide text-[#C2410C] mb-2">
            <span className="w-5 h-[1.5px] bg-[#C2410C]" aria-hidden="true" />
            <span>राज्य अनुसार कल्याणकारी योजनाएं</span>
            <span className="w-5 h-[1.5px] bg-[#C2410C]" aria-hidden="true" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight">
            {language === "HI" ? "राज्य अनुसार कल्याणकारी योजनाएं देखें" : "Browse Welfare Schemes by State"}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            {language === "HI"
              ? "भारत के इंटरैक्टिव मानचित्र पर किसी भी राज्य पर क्लिक करें और वहां के नागरिकों के लिए उपलब्ध विशेष सब्सिडी, छात्रवृत्ति और केंद्रीय योजनाओं का विवरण देखें।"
              : "Click on any state on the interactive map of India to explore state-specific subsidies, scholarships, and central initiatives available for its residents."}
          </p>
        </div>

        {/* Two-Column Responsive Layout: Left Schemes Panel & Right Interactive Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* ================= LEFT COLUMN: SCHEMES EXPLORER PANEL (5 cols) ================= */}
          <div className="lg:col-span-5 flex flex-col gap-5 order-2 lg:order-1">
            
            {/* Header: State info when selected, or National info when reset */}
            {activeStateInfo ? (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-50 border border-teal-200/80 text-[#115E59] shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                          {activeStateInfo.name}
                        </h3>
                        <p className="text-xs sm:text-sm font-semibold text-[#115E59]">
                          {activeStateInfo.hindiName} • {language === "HI" ? "राजधानी" : "Capital"}: {activeStateInfo.capital}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200/60">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>
                        {activeStateInfo.totalSchemesCount || 32}{" "}
                        {language === "HI" ? "योजनाएं सक्रिय" : "Schemes Active"}
                      </span>
                    </span>
                    <Link
                      href={`/schemes?state=${encodeURIComponent(activeStateInfo.name)}`}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-[#115E59] text-white text-xs font-semibold rounded-full hover:bg-[#0d4a46] transition-colors"
                    >
                      <span>{language === "HI" ? "निर्देशिका देखें" : "View Directory"}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* State Focus Area Pills */}
                <div className="pt-3 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-medium text-slate-400 mr-1">
                    {language === "HI" ? "प्रमुख प्राथमिकताएं:" : "Priority Focus:"}
                  </span>
                  {activeStateInfo.focusAreas.map((area, idx) => (
                    <span
                      key={idx}
                      className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs rounded-md font-medium"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-50 border border-teal-200/80 text-[#115E59] shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                          {language === "HI" ? "अखिल भारतीय व केंद्रीय योजनाएं" : "National Welfare Schemes"}
                        </h3>
                        <p className="text-xs sm:text-sm font-semibold text-[#115E59]">
                          {language === "HI"
                            ? "28 राज्य और 8 केंद्र शासित प्रदेश"
                            : "Pan-India • Central Flagships Available Across All States"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200/60">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{language === "HI" ? "राष्ट्रव्यापी पहुंच" : "Nationwide Access"}</span>
                    </span>
                    <Link
                      href="/schemes"
                      className="inline-flex items-center gap-1 px-3 py-1 bg-[#115E59] text-white text-xs font-semibold rounded-full hover:bg-[#0d4a46] transition-colors"
                    >
                      <span>{language === "HI" ? "पूरी निर्देशिका देखें" : "View Directory"}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* State Guidance Pill */}
                <div className="pt-3 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-medium text-slate-400 mr-1">
                    {language === "HI" ? "मानचित्र निर्देश:" : "Map Tip:"}
                  </span>
                  <span className="inline-block px-2.5 py-0.5 bg-teal-50 text-[#115E59] text-xs rounded-md font-semibold border border-teal-200/70">
                    {language === "HI"
                      ? "राज्य-विशिष्ट योजनाओं को देखने के लिए मानचित्र पर किसी भी राज्य पर क्लिक करें"
                      : "Click any state on the map to zoom in & view state schemes"}
                  </span>
                </div>
              </div>
            )}
            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categoriesList.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#115E59] text-white shadow-xs"
                        : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {cat.icon && <cat.icon className="w-3.5 h-3.5" />}
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Schemes List with Smooth Transition — Strictly 2 schemes shown */}
            <div className="space-y-4">
              {filteredSchemes.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                  <p className="text-sm text-slate-500">
                    {language === "HI"
                      ? "इस क्षेत्र के अंतर्गत कोई योजना उपलब्ध नहीं है।"
                      : `No schemes found under this sector for ${activeStateInfo?.name || "All India"}.`}
                  </p>
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className="mt-3 text-xs font-semibold text-[#115E59] hover:underline cursor-pointer"
                  >
                    {language === "HI" ? "फ़िल्टर रीसेट करें" : "Reset sector filter"}
                  </button>
                </div>
              ) : (
                filteredSchemes.slice(0, 2).map((scheme) => (
                  <div
                    key={scheme.id}
                    className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Category Badge */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-medium capitalize">
                          {SCHEME_CATEGORIES[scheme.category as keyof typeof SCHEME_CATEGORIES] || scheme.category}
                        </span>
                      </div>

                      {/* Scheme Name */}
                      <h4 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#115E59] transition-colors leading-snug">
                        <Link href={`/schemes/${scheme.slug}`}>
                          {scheme.name}
                        </Link>
                      </h4>

                      {/* Summary */}
                      <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2">
                        {scheme.summary}
                      </p>

                      {/* Benefits Bullets */}
                      {scheme.benefits && scheme.benefits.length > 0 && (
                        <div className="mt-3 space-y-1">
                          {scheme.benefits.slice(0, 2).map((benefit, bIdx) => (
                            <div key={bIdx} className="flex items-start gap-1.5 text-xs text-slate-700">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span className="line-clamp-1">{benefit}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Card Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <Link
                        href={`/eligibility?scheme=${scheme.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#115E59] hover:text-[#0d4a46] hover:underline"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{language === "HI" ? "पात्रता जांचें" : "Check Eligibility"}</span>
                      </Link>

                      <Link
                        href={`/schemes/${scheme.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
                      >
                        <span>{language === "HI" ? "विवरण और प्रमाण" : "Details & Citations"}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom link to view all schemes */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between">
              <span className="text-xs text-slate-600">
                {language === "HI"
                  ? "क्या आप सभी राज्य गजटों की पूरी निर्देशिका देखना चाहते हैं?"
                  : "Want to browse the full directory of all state gazettes?"}
              </span>
              <Link
                href="/schemes"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#115E59] hover:underline"
              >
                <span>{language === "HI" ? "सभी योजनाएं देखें" : "Explore all schemes"}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>


          {/* ================= RIGHT COLUMN: INTERACTIVE INDIA SVG MAP (7 cols) ================= */}
          <div className="lg:col-span-7 order-1 lg:order-2 flex flex-col gap-3">

            {/* SVG Map Canvas directly on UI page surface */}
            <div
              className="relative w-full h-[620px] sm:h-[680px] lg:h-[750px] xl:h-[800px] flex items-center justify-center select-none overflow-hidden"
            >
              {/* CSS Keyframes for scheme badge bounce animation */}
              <style>{`
                @keyframes badgePopInner {
                  0% {
                    opacity: 0;
                    transform: scale(0.3) translateY(12px);
                  }
                  60% {
                    transform: scale(1.14) translateY(-3px);
                  }
                  80% {
                    transform: scale(0.96) translateY(1px);
                  }
                  100% {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                  }
                }
                .animate-state-badge {
                  animation: badgePopInner 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                  transform-origin: 0 0;
                }
              `}</style>

              {/* SVG India Map */}
              <svg
                viewBox={resolvedMap.viewBox}
                className="w-full h-full drop-shadow-sm cursor-pointer"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* SVG Filter for Badge Shadow */}
                <defs>
                  <filter id="badge-glow-shadow" x="-30%" y="-30%" width="160%" height="160%">
                    <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#042F2E" floodOpacity="0.4" />
                  </filter>
                </defs>

                {/* Clickable background: clicking empty space outside states completely resets map */}
                <rect
                  width="100%"
                  height="100%"
                  fill="transparent"
                  onClick={handleTotalReset}
                />

                {/* Zoom Group: scales around selected state when active, otherwise centers at scale 1 */}
                <g
                  style={{
                    transformOrigin:
                      isZoomed && activeStateInfo
                        ? `${activeStateInfo.cx}px ${activeStateInfo.cy}px`
                        : "center",
                    transform: isZoomed ? "scale(1.6)" : "scale(1)",
                    transition: "transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  {resolvedMap.locations.map((loc) => {
                    const isSelected = selectedStateId !== null && loc.id === selectedStateId;
                    const isHovered = loc.id === hoveredStateId;

                    // Fill color logic: Theme Green / Teal when selected, Soft mint on hover, Slate-50 default
                    let fillColor = "#F8FAFC";
                    let strokeColor = "#CBD5E1";
                    let strokeWidth = "0.75";

                    if (isSelected) {
                      fillColor = "#115E59";
                      strokeColor = "#042F2E";
                      strokeWidth = "1.5";
                    } else if (isHovered) {
                      fillColor = "#CCFBF1";
                      strokeColor = "#0D9488";
                      strokeWidth = "1.25";
                    }

                    return (
                      <path
                        key={loc.id}
                        id={loc.id}
                        d={loc.path}
                        name={loc.name}
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        strokeLinejoin="round"
                        className="transition-colors duration-200 outline-none cursor-pointer"
                        onClick={() => handleSelectState(loc.id)}
                        onMouseEnter={() => setHoveredStateId(loc.id)}
                        onMouseLeave={() => setHoveredStateId(null)}
                      >
                        <title>
                          {loc.name}
                          {isSelected
                            ? (language === "HI" ? " — चयन हटाने व रीसेट के लिए पुनः क्लिक करें" : " — Click again to deselect & reset")
                            : (language === "HI" ? " — चयन और ज़ूम के लिए क्लिक करें" : " — Click to select & zoom")}
                        </title>
                      </path>
                    );
                  })}

                  {/* Pulsing Pin Marker and Animated Floating Badge ONLY when a state is selected */}
                  {selectedStateId && activeStateInfo && (
                    <>
                      {/* Pulsing Pin Marker on the Selected State — Theme Green */}
                      <g
                        transform={`translate(${activeStateInfo.cx}, ${activeStateInfo.cy})`}
                        className="pointer-events-none"
                      >
                        {/* Outer pulsing ring */}
                        <circle
                          r="10"
                          fill="none"
                          stroke="#FFFFFF"
                          strokeWidth="2.5"
                          className="animate-ping opacity-75"
                        />
                        {/* Center core dot */}
                        <circle r="4.5" fill="#FFFFFF" stroke="#115E59" strokeWidth="2" />
                      </g>

                      {/* Animated Floating Scheme Count Badge for Selected State */}
                      <g
                        key={`badge-${selectedStateId}`}
                        transform={`translate(${activeStateInfo.cx}, ${activeStateInfo.cy}) scale(${isZoomed ? 0.65 : 1})`}
                        className="pointer-events-none"
                      >
                        <g className="animate-state-badge">
                          {/* Triangle pointer */}
                          <polygon points="-6,-10 6,-10 0,-3" fill="#042F2E" />

                          {/* Pill background */}
                          <rect
                            x={-pillWidth / 2}
                            y="-42"
                            width={pillWidth}
                            height="32"
                            rx="16"
                            fill="#042F2E"
                            stroke="#2DD4BF"
                            strokeWidth="1.5"
                            filter="url(#badge-glow-shadow)"
                          />

                          {/* Pulsing emerald indicator dot */}
                          <circle cx={-pillWidth / 2 + 15} cy="-26" r="3.5" fill="#34D399" />

                          {/* Scheme Count Number */}
                          <text
                            x={-pillWidth / 2 + 25}
                            y="-26"
                            dominantBaseline="central"
                            className="fill-emerald-300 font-extrabold text-[12px] tracking-tight"
                          >
                            {activeSchemeCount} {language === "HI" ? "योजनाएं" : "schemes"}
                          </text>

                          {/* State Name */}
                          <text
                            x={-pillWidth / 2 + 25 + schemeNumWidth}
                            y="-26"
                            dominantBaseline="central"
                            className="fill-slate-100 font-medium text-[11px]"
                          >
                            ({activeStateInfo.name})
                          </text>
                        </g>
                      </g>
                    </>
                  )}
                </g>
              </svg>
            </div>

            {/* Status bar under map */}
            <div className="px-1 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${selectedStateId ? "bg-[#115E59]" : "bg-slate-400"}`} />
                {selectedStateId && activeStateInfo ? (
                  <>
                    <span className="font-medium text-slate-700">
                      {language === "HI" ? "प्रदर्शित: " : "Showing: "}
                      <strong className="text-slate-900">{activeStateInfo.name}</strong> ({activeStateInfo.hindiName})
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-[#115E59] border border-teal-200">
                      {activeSchemeCount} {language === "HI" ? "योजनाएं" : "schemes"}
                    </span>
                  </>
                ) : (
                  <span className="font-medium text-slate-600">
                    {language === "HI"
                      ? "प्रदर्शित: अखिल भारतीय — विवरण के लिए किसी भी राज्य पर क्लिक करें"
                      : "Showing: All India (National Overview) — Click any state to select"}
                  </span>
                )}
              </span>
              {selectedStateId ? (
                <button
                  onClick={handleTotalReset}
                  className="font-semibold text-[#115E59] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>{language === "HI" ? "मानचित्र रीसेट करें" : "Reset Map"}</span>
                  <RotateCcw className="w-3 h-3" />
                </button>
              ) : (
                <span className="text-slate-400 text-[11px]">
                  {language === "HI" ? "मानचित्र पर 28 राज्य व 8 केंद्र शासित प्रदेश" : "28 States & 8 UTs on Map"}
                </span>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
