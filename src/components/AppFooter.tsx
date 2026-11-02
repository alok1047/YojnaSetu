"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/context/LanguageContext";

export function AppFooter() {
  const { language } = useLanguage();
  const pathname = usePathname();

  // Hide footer on Ask Assistant and Admin pages for a dedicated full-height experience
  if (pathname?.startsWith("/ask") || pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="bg-[var(--color-surface)] border-t border-[var(--color-border)] mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* About section */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text)] uppercase tracking-wider">
              {language === "HI" ? "हमारे बारे में" : "About"}
            </h3>
            <p className="mt-3 text-sm text-[var(--color-muted)] leading-relaxed">
              {language === "HI"
                ? "यह सहायक आधिकारिक दस्तावेज़ों के आधार पर नागरिकों को सरकारी कल्याणकारी योजनाओं को खोजने में मदद करता है। यह कोई आधिकारिक सरकारी पोर्टल नहीं है।"
                : "This assistant helps you discover government welfare schemes based on official source documents. It is not an official government portal."}
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text)] uppercase tracking-wider">
              {language === "HI" ? "त्वरित लिंक" : "Quick Links"}
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/schemes"
                  className="text-sm text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors"
                >
                  {language === "HI" ? "योजनाएं देखें" : "Explore Schemes"}
                </Link>
              </li>
              <li>
                <Link
                  href="/ask"
                  className="text-sm text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors"
                >
                  {language === "HI" ? "प्रश्न पूछें" : "Ask a Question"}
                </Link>
              </li>
              <li>
                <Link
                  href="/eligibility"
                  className="text-sm text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors"
                >
                  {language === "HI" ? "पात्रता जांचें" : "Check Eligibility"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text)] uppercase tracking-wider">
              {language === "HI" ? "जानकारी" : "Information"}
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors"
                >
                  {language === "HI" ? "यह कैसे काम करता है" : "How It Works"}
                </Link>
              </li>
              <li>
                <Link
                  href="/about#privacy"
                  className="text-sm text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors"
                >
                  {language === "HI" ? "गोपनीयता" : "Privacy"}
                </Link>
              </li>
              <li>
                <Link
                  href="/about#accessibility"
                  className="text-sm text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors"
                >
                  {language === "HI" ? "सुलभता" : "Accessibility"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text)] uppercase tracking-wider">
              {language === "HI" ? "अस्वीकरण" : "Disclaimer"}
            </h3>
            <p className="mt-3 text-sm text-[var(--color-muted)] leading-relaxed">
              {language === "HI"
                ? "जानकारी प्रमाणित आधिकारिक दस्तावेज़ों पर आधारित है। नियम व पात्रता समय-समय पर बदल सकते हैं। हमेशा संबंधित विभाग अथवा आधिकारिक पोर्टल से पुष्टि करें।"
                : "Information is based on cited official documents. Rules and eligibility can change. Always confirm with the responsible department or official portal."}
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-muted)] text-center">
            {language === "HI"
              ? "यह केवल एक सूचनात्मक सेवा है, कोई आधिकारिक सरकारी पोर्टल नहीं। पात्रता आकलन प्रारंभिक हैं और आधिकारिक स्वीकृति नहीं दर्शाते हैं।"
              : "This is an informational service, not an official government portal. Eligibility assessments are preliminary and do not constitute official approval."}
          </p>
        </div>
      </div>
    </footer>
  );
}
