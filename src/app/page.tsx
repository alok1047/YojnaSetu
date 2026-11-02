import type { Metadata } from "next";
import { HomePageClient } from "./HomePageClient";

export const metadata: Metadata = {
  title: "YojnaSetu — Public Information Portal for Welfare Schemes",
  description:
    "Civic benefits made clear, accessible, and transparent for every citizen. Grounded in official source documents with verifiable citations and rule-based eligibility checks.",
};

export default function HomePage() {
  return <HomePageClient />;
}
