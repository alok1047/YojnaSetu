"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { Headphones } from "lucide-react";
import { useLanguage } from "@/lib/context/LanguageContext";

const NAV_LINKS = [
  { href: "/schemes", label: "Explore Schemes", labelHi: "योजनाएं देखें" },
  { href: "/ask", label: "Ask Assistant", labelHi: "सहायक से पूछें" },
  { href: "/eligibility", label: "Eligibility Checker", labelHi: "पात्रता जांचें" },
  { href: "/about", label: "How It Works", labelHi: "यह कैसे काम करता है" },
] as const;

export function AppHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, toggleLanguage } = useLanguage();
  const [isLogoBhagwa, setIsLogoBhagwa] = useState(false);
  const wheelRef = useRef<SVGSVGElement | null>(null);

  // Scroll-driven wheel rotation:
  // Scrolling down (increasing scrollY) rotates clockwise
  // Scrolling up (decreasing scrollY) rotates anticlockwise
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (wheelRef.current) {
            const scrollY = window.scrollY || window.pageYOffset || 0;
            // 0.45 degrees per pixel scrolled
            wheelRef.current.style.transform = `rotate(${scrollY * 0.45}deg)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[var(--color-surface)] border-b border-dashed border-sky-300/80 shadow-xs">
      <nav
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <div className="flex h-18 items-center justify-between">
          {/* Logo / Wordmark */}
          <Link
            href="/"
            onClick={() => setIsLogoBhagwa((prev) => !prev)}
            className="flex items-center gap-3 group transition-transform hover:scale-[1.01]"
            aria-label="YojnaSetu Public Information Portal - Home"
          >
            {/* Dharma Chakra / Wheel Icon — Default Black, Bhagwa Orange when clicked */}
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-300 ${
                isLogoBhagwa
                  ? "text-[#EA580C] drop-shadow-[0_0_8px_rgba(234,88,12,0.45)]"
                  : "text-black group-hover:text-slate-800"
              }`}
            >
              <svg
                ref={wheelRef}
                width="34"
                height="34"
                viewBox="0 0 100 100"
                fill="none"
                stroke="currentColor"
                strokeWidth="5"
                className="transition-colors duration-300 origin-center will-change-transform"
                style={{ transformOrigin: "50% 50%" }}
                aria-hidden="true"
              >
                <circle cx="50" cy="50" r="44" strokeWidth="5" />
                <circle
                  cx="50"
                  cy="50"
                  r="14"
                  strokeWidth="5"
                  fill="currentColor"
                  fillOpacity={isLogoBhagwa ? "0.2" : "0.08"}
                />
                <circle cx="50" cy="50" r="4" fill="currentColor" />
                {/* 12 spokes rendering */}
                {Array.from({ length: 12 }).map((_, i) => (
                  <line
                    key={i}
                    x1="50"
                    y1="50"
                    x2={50 + 44 * Math.cos((i * 30 * Math.PI) / 180)}
                    y2={50 + 44 * Math.sin((i * 30 * Math.PI) / 180)}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                ))}
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-black">
                YojnaSetu
              </span>
              <span className="text-[9px] font-semibold tracking-wider text-slate-500 uppercase -mt-0.5">
                {language === "HI" ? "सार्वजनिक सूचना पोर्टल" : "Public Information Portal"}
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex lg:items-center lg:gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-700 hover:text-[#115E59] transition-colors"
              >
                {language === "HI" ? link.labelHi : link.label}
              </Link>
            ))}
          </div>

          {/* Right controls: Language & Helpdesk */}
          <div className="hidden sm:flex items-center gap-5">
            {/* Language toggle pill */}
            <button
              type="button"
              onClick={toggleLanguage}
              className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full border transition-colors cursor-pointer ${
                language === "HI"
                  ? "border-[#115E59] bg-teal-50/60 text-[#115E59]"
                  : "border-slate-300 text-slate-700 hover:border-[#115E59] hover:text-[#115E59]"
              }`}
              aria-label="Toggle language between English and Hindi"
            >
              <span className={language === "EN" ? "font-bold text-[#115E59]" : "text-slate-400"}>EN</span>
              <span className="text-slate-300">/</span>
              <span className={language === "HI" ? "font-bold text-[#115E59]" : "text-slate-500"}>हिन्दी</span>
            </button>

            {/* Helpdesk link */}
            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-[#115E59] transition-colors"
            >
              <Headphones className="w-3.5 h-3.5 text-slate-500" />
              <span>{language === "HI" ? "हेल्पडेस्क" : "Helpdesk"}</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            onClick={toggleMenu}
          >
            {mobileMenuOpen ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div id="mobile-menu" className="lg:hidden border-t border-slate-200 py-3 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2.5 text-base font-medium text-slate-700 rounded-lg hover:text-[#115E59] hover:bg-slate-50 transition-colors"
                onClick={closeMenu}
              >
                {language === "HI" ? link.labelHi : link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between px-3">
              <button
                type="button"
                onClick={toggleLanguage}
                className="px-3 py-1 text-xs font-semibold rounded-full border border-slate-300 text-slate-700 cursor-pointer"
              >
                {language === "EN" ? "EN / हिन्दी" : "हिन्दी / EN"}
              </button>
              <Link
                href="/about"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600"
                onClick={closeMenu}
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>{language === "HI" ? "हेल्पडेस्क" : "Helpdesk"}</span>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
