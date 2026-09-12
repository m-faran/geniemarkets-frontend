import type { Metadata } from "next";
import { HowItWorksContent } from "@/components/how-it-works/how-it-works-content";

export const metadata: Metadata = {
  title: "How It Works — Genie Markets",
  description:
    "Learn how to play Genie Markets: understand game types, payout multipliers up to 600x, the Genie-sort ordering rule, and provably fair draws powered by Chainlink VRF.",
};

export default function HowItWorksPage() {
  return <HowItWorksContent />;
}
