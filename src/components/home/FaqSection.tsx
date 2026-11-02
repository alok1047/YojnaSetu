"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronUp, ChevronDown, ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/context/LanguageContext";

interface FaqItem {
  id: string;
  question: string;
  answer: string | string[];
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: "what-is-yojnasetu",
    question: "What is YojnaSetu, and how is it different from other government portals?",
    answer:
      "YojnaSetu is a national platform for accessing a wide range of government schemes from both the Central & State/UT Governments. It is a one-stop platform for search & discovery of government schemes based on demographic details. Unlike traditional government portals, YojnaSetu brings together schemes from the Central Government, State Governments, and Union Territories on a single platform and helps users find relevant schemes based on their eligibility with grounded document citations.",
  },
  {
    id: "how-will-it-help",
    question: "How will YojnaSetu help common citizens?",
    answer:
      "YojnaSetu removes bureaucratic ambiguity by translating complex gazette rules into plain, accessible language in English and Hindi. Common citizens, students, and village helpdesks can quickly find which benefits they qualify for, verify mandatory document requirements beforehand, understand step-by-step application procedures, and connect directly to official department portals without middleman commissions.",
  },
  {
    id: "how-does-it-work",
    question: "How does YojnaSetu work?",
    answer:
      "YojnaSetu indexes official government scheme guidelines and notifications. When you explore schemes or check your potential eligibility, our transparent rule engine evaluates criteria such as state jurisdiction, age, occupation, and family income against the indexed rules. Every answer includes verifiable source citations referencing official government publications and exact page numbers.",
  },
  {
    id: "procedure-for-knowing-schemes",
    question: "What is the procedure for knowing the right scheme on the YojnaSetu platform?",
    answer: [
      "Enter keywords or household needs in the central search bar",
      "Click your home state on our interactive India map to inspect state-specific flagships",
      "Filter by sector categories such as Education, Healthcare, Agriculture, or Housing",
      "Use our deterministic Eligibility Checker to receive personalized scheme assessments based on your profile",
    ],
  },
  {
    id: "what-information-can-i-find",
    question: "What information about a particular scheme can I find on YojnaSetu?",
    answer:
      "For each scheme, you can find concise summaries, comprehensive benefit amounts, strict eligibility criteria with document excerpts, required documentation checklists (e.g. Aadhaar, income certificate), step-by-step application instructions, responsible department contact details, and official department website links.",
  },
];

const FAQ_ITEMS_HI: FaqItem[] = [
  {
    id: "what-is-yojnasetu",
    question: "योजनासेतु (YojnaSetu) क्या है, और यह अन्य सरकारी पोर्टलों से किस प्रकार भिन्न है?",
    answer:
      "योजनासेतु केंद्र और राज्य/केंद्र शासित प्रदेश दोनों सरकारों की विस्तृत सरकारी योजनाओं तक पहुंचने का एक राष्ट्रीय मंच है। यह जनसांख्यिकीय विवरणों के आधार पर सरकारी योजनाओं की खोज का एकल मंच है। पारंपरिक पोर्टलों के विपरीत, योजनासेतु केंद्र व राज्यों की योजनाओं को एक साथ लाता है और प्रामाणिक सरकारी दस्तावेज़ संदर्भों के साथ नागरिकों को उनकी पात्रता के अनुसार सही योजना खोजने में मदद करता है।",
  },
  {
    id: "how-will-it-help",
    question: "योजनासेतु आम नागरिकों की किस प्रकार सहायता करेगा?",
    answer:
      "योजनासेतु जटिल सरकारी गजट नियमों को सरल, सुगम हिंदी भाषा में प्रस्तुत कर प्रशासनिक जटिलताओं को दूर करता है। आम नागरिक, विद्यार्थी और ग्रामीण सेवा केंद्रों के संचालक यह आसानी से जान सकते हैं कि वे किन लाभों के पात्र हैं, आवश्यक दस्तावेजों की सूची पहले से सत्यापित कर सकते हैं, चरण-दर-चरण आवेदन प्रक्रिया समझ सकते हैं और बिना किसी बिचौलिए के सीधे आधिकारिक विभागीय पोर्टल से जुड़ सकते हैं।",
  },
  {
    id: "how-does-it-work",
    question: "योजनासेतु कैसे काम करता है?",
    answer:
      "योजनासेतु आधिकारिक सरकारी योजना दिशानिर्देशों और अधिसूचनाओं को अनुक्रमित (इंडेक्स) करता है। जब आप योजनाएं खोजते हैं या अपनी पात्रता जांचते हैं, तो हमारा पारदर्शी नियम इंजन राज्य, आयु, व्यवसाय और पारिवारिक आय जैसे मानदंडों का मूल्यांकन करता है। प्रत्येक परिणाम में आधिकारिक सरकारी प्रकाशनों और सटीक पृष्ठ संख्याओं के सत्यापन योग्य संदर्भ शामिल होते हैं।",
  },
  {
    id: "procedure-for-knowing-schemes",
    question: "योजनासेतु पर सही योजना जानने की क्या प्रक्रिया है?",
    answer: [
      "मुख्य खोज बॉक्स में अपनी पारिवारिक आवश्यकता या कीवर्ड दर्ज करें",
      "राज्य-विशिष्ट योजनाओं को देखने के लिए इंटरैक्टिव भारत मानचित्र पर अपने राज्य पर क्लिक करें",
      "शिक्षा, स्वास्थ्य, कृषि या आवास जैसी श्रेणियों के आधार पर फ़िल्टर करें",
      "अपनी प्रोफ़ाइल के अनुसार सटीक योजना मूल्यांकन प्राप्त करने के लिए हमारे पात्रता परीक्षक का उपयोग करें",
    ],
  },
  {
    id: "what-information-can-i-find",
    question: "योजनासेतु पर किसी विशेष योजना के बारे में क्या जानकारी मिल सकती है?",
    answer:
      "प्रत्येक योजना के लिए आपको संक्षिप्त विवरण, वित्तीय लाभ राशि, दस्तावेज़ी संदर्भों के साथ पात्रता मानदंड, आवश्यक दस्तावेजों की चेकलिस्ट (जैसे आधार, आय प्रमाण पत्र), आवेदन की चरण-दर-चरण प्रक्रिया, संबंधित विभाग का संपर्क विवरण और आधिकारिक पोर्टल के सीधे लिंक प्राप्त होते हैं।",
  },
];

function FaqIllustration() {
  return (
    <svg
      viewBox="0 0 540 440"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-[460px] mx-auto drop-shadow-sm select-none"
      aria-hidden="true"
    >
      {/* Decorative background connected circles and curves */}
      <g opacity="0.65">
        <circle cx="170" cy="140" r="7" fill="#CCFBF1" stroke="#99F6E4" strokeWidth="1.5" />
        <circle cx="210" cy="175" r="5" fill="#E2E8F0" />
        <circle cx="345" cy="125" r="8" fill="#A7F3D0" stroke="#6EE7B7" strokeWidth="1.5" />
        <circle cx="375" cy="165" r="5" fill="#E2E8F0" />
        <circle cx="235" cy="105" r="9" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1.5" />
        <circle cx="310" cy="75" r="6" fill="#CCFBF1" />
        <path
          d="M170 140 C 195 115, 215 95, 245 105 C 275 115, 305 85, 345 125"
          stroke="#CBD5E1"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <path
          d="M210 175 C 235 155, 275 165, 315 135 C 345 115, 365 145, 375 165"
          stroke="#E2E8F0"
          strokeWidth="1.5"
        />
      </g>

      {/* Ground baseline */}
      <line x1="70" y1="390" x2="470" y2="390" stroke="#94A3B8" strokeWidth="1.75" strokeLinecap="round" />
      <ellipse cx="270" cy="392" rx="170" ry="7" fill="#E2E8F0" opacity="0.6" />

      {/* Giant Green Question Mark */}
      <g>
        {/* Hook */}
        <path
          d="M 235 185 C 235 138, 266 104, 312 104 C 354 104, 384 136, 384 176 C 384 212, 357 238, 332 258 C 306 279, 296 298, 296 328 L 296 338 L 259 338 L 259 323 C 259 287, 280 261, 306 240 C 328 222, 347 205, 347 176 C 347 151, 331 135, 312 135 C 285 135, 271 152, 271 185 Z"
          fill="#059669"
        />
        {/* Dot */}
        <circle cx="277.5" cy="367" r="17.5" fill="#059669" />
      </g>

      {/* Left Citizen (holding document/folder looking at Question Mark) */}
      <g>
        {/* Shadow */}
        <ellipse cx="145" cy="390" rx="36" ry="4" fill="#94A3B8" opacity="0.45" />
        {/* Shoes */}
        <path d="M 120 385 L 133 385 C 136 385, 138 388, 138 390 L 115 390 C 115 387, 117 385, 120 385 Z" fill="#0F172A" />
        <path d="M 148 385 L 161 385 C 164 385, 166 388, 166 390 L 143 390 C 143 387, 145 385, 148 385 Z" fill="#0F172A" />
        {/* Trousers (Dark charcoal) */}
        <path d="M 124 318 L 123 385 L 134 385 L 138 322 L 146 322 L 152 385 L 163 385 L 157 318 Z" fill="#1E293B" />
        {/* Shirt (Light slate blue-grey) */}
        <path d="M 123 248 L 159 248 L 157 320 L 123 320 Z" fill="#CBD5E1" />
        {/* Left Arm */}
        <path d="M 123 250 L 114 285 L 122 289 L 129 265 Z" fill="#CBD5E1" />
        {/* Folder/Document */}
        <rect x="136" y="268" width="23" height="30" rx="2" fill="#334155" transform="rotate(-10 136 268)" />
        {/* Right Arm */}
        <path d="M 153 252 L 161 280 L 146 286 L 143 276 Z" fill="#CBD5E1" />
        <circle cx="147" cy="285" r="4.5" fill="#FDBA74" />
        {/* Neck & Head */}
        <rect x="137" y="236" width="8" height="14" fill="#FDBA74" />
        <circle cx="141" cy="224" r="14" fill="#FDBA74" />
        {/* Hair */}
        <path d="M 127 224 C 127 212, 135 210, 146 210 C 155 210, 157 216, 157 222 C 153 221, 147 220, 143 223 C 139 226, 135 225, 127 224 Z" fill="#1E293B" />
      </g>

      {/* Right Citizen (Female figure pointing towards Question Mark) */}
      <g>
        {/* Shadow */}
        <ellipse cx="395" cy="390" rx="36" ry="4" fill="#94A3B8" opacity="0.45" />
        {/* Shoes */}
        <path d="M 378 386 L 390 386 C 393 386, 395 388, 395 390 L 373 390 C 373 388, 375 386, 378 386 Z" fill="#0F172A" />
        <path d="M 402 386 L 414 386 C 417 386, 419 388, 419 390 L 397 390 C 397 388, 399 386, 402 386 Z" fill="#0F172A" />
        {/* Trousers */}
        <path d="M 380 315 L 380 386 L 391 386 L 395 315 L 401 315 L 407 386 L 417 386 L 414 315 Z" fill="#1E293B" />
        {/* Dark Navy Top */}
        <path d="M 380 252 L 415 252 L 411 316 L 382 316 Z" fill="#1E293B" />
        {/* Raised Pointing Arm */}
        <path d="M 384 255 L 348 218 L 342 224 L 378 266 Z" fill="#1E293B" />
        {/* Hand and pointing finger */}
        <circle cx="343" cy="220" r="4.5" fill="#FDBA74" />
        <path d="M 341 219 L 332 212" stroke="#FDBA74" strokeWidth="2.5" strokeLinecap="round" />
        {/* Right Arm resting down */}
        <path d="M 412 255 L 421 288 L 413 291 L 407 265 Z" fill="#1E293B" />
        <circle cx="415" cy="293" r="4" fill="#FDBA74" />
        {/* Neck & Head */}
        <rect x="393" y="240" width="7" height="14" fill="#FDBA74" />
        <circle cx="397" cy="226" r="13.5" fill="#FDBA74" />
        {/* Hair and Ponytail */}
        <path d="M 385 226 C 385 214, 394 212, 405 212 C 413 212, 415 219, 414 226 C 411 225, 406 224, 402 226 C 396 229, 391 228, 385 226 Z" fill="#1E293B" />
        <path d="M 410 217 C 421 215, 429 223, 431 236 C 427 238, 421 234, 418 227 C 416 223, 413 221, 410 217 Z" fill="#1E293B" />
      </g>
    </svg>
  );
}

export function FaqSection() {
  const { language } = useLanguage();
  // First item open by default just like in the myscheme.gov.in screenshot
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const items = language === "HI" ? FAQ_ITEMS_HI : FAQ_ITEMS;

  const toggleAccordion = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section id="faq" className="relative bg-[#F4FAF8] py-16 sm:py-20 border-b border-slate-200/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* LEFT COLUMN: Clean Illustration */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <FaqIllustration />
          </div>

          {/* RIGHT COLUMN: FAQ Accordion */}
          <div className="lg:col-span-7">
            {/* Eyebrow */}
            <span className="text-sm font-medium text-slate-500 tracking-wide">
              {language === "HI" ? "अक्सर पूछे जाने वाले प्रश्न (FAQ)" : "Frequently Asked Questions"}
            </span>

            {/* Main Heading */}
            <h2 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#111827] tracking-tight leading-tight">
              {language === "HI"
                ? "अपने प्रश्नों के समाधान के लिए हमारा ज्ञानकोश देखें!"
                : "Checkout our knowledge base for some of your answers!"}
            </h2>

            {/* Accordion List */}
            <div className="mt-8 space-y-4">
              {items.map((item, index) => {
                const isOpen = openIndex === index;
                return (
                  <div
                    key={item.id}
                    className="border-b border-slate-200/80 pb-4 transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => toggleAccordion(index)}
                      className="w-full flex items-start justify-between gap-4 text-left py-2 group cursor-pointer focus:outline-none"
                      aria-expanded={isOpen}
                    >
                      <span className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#059669] transition-colors leading-snug">
                        {item.question}
                      </span>
                      <span className="text-slate-600 group-hover:text-[#059669] transition-colors mt-0.5 shrink-0">
                        {isOpen ? (
                          <ChevronUp className="w-5 h-5 stroke-[2.5]" />
                        ) : (
                          <ChevronDown className="w-5 h-5 stroke-[2.5]" />
                        )}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="pt-2.5 pb-1 text-xs sm:text-sm text-slate-600 leading-relaxed animate-in fade-in duration-200">
                        {Array.isArray(item.answer) ? (
                          <ul className="space-y-1.5 list-disc list-inside">
                            {item.answer.map((pt, pIdx) => (
                              <li key={pIdx}>{pt}</li>
                            ))}
                          </ul>
                        ) : (
                          <p>{item.answer}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* View More Button */}
            <div className="mt-8">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#059669] text-[#059669] bg-white font-semibold text-sm hover:bg-emerald-50/60 shadow-2xs transition-all"
              >
                <span>{language === "HI" ? "और अधिक जानें" : "View More"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
