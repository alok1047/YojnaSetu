import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";
import { LanguageProvider } from "@/lib/context/LanguageContext";
import { AgentationWrapper } from "@/components/AgentationWrapper";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Welfare Scheme Assistant",
    template: "%s | Welfare Scheme Assistant",
  },
  description:
    "Find government welfare schemes based on official documents. Understand eligibility, required documents, and application steps with source citations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--color-bg)] text-[var(--color-text)]">
        <LanguageProvider>
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          <AppHeader />
          <div className="flex-1 flex flex-col">{children}</div>
          <AppFooter />
          <AgentationWrapper />
        </LanguageProvider>
      </body>
    </html>
  );
}
