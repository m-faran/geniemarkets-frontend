"use client";

import { RoundDisplay } from "@/components/round-display";
import { BetPanel } from "@/components/bet-panel";
import { WalletPanel } from "@/components/wallet-panel";
import { ClaimCard } from "@/components/claim-card";

import Link from "next/link";
import { HelpCircle } from "lucide-react";

export default function PlayPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Main Column */}
        <div className="space-y-6">
          <RoundDisplay />
          <BetPanel />
          <ClaimCard />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <WalletPanel />

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <HelpCircle className="h-4 w-4 text-violet-400" />
              New to Genie Markets?
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Understand the 9x to 600x payout multipliers, the unique Genie-sort digit ordering, and how daily rounds settle.
            </p>
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-1 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors"
            >
              Read the Game Tutorial &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
