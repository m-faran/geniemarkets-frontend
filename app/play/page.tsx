"use client";

import { useState } from "react";
import { RoundDisplay } from "@/components/round-display";
import { BetPanel } from "@/components/bet-panel";
import { PlacedBets } from "@/components/placed-bets";
import { WalletPanel } from "@/components/wallet-panel";
import { ClaimCard } from "@/components/claim-card";
import { RefundCard } from "@/components/refund-card";
import { EmergencyRecovery } from "@/components/emergency-recovery";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight, Dice5 } from "lucide-react";

export default function PlayPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const handleRefresh = () => setRefreshKey((k) => k + 1);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      {/* Top Section: Interactive Betting Arena & Sticky Wallet HUD */}
      <div className="grid gap-6 lg:grid-cols-[1fr_380px] items-start">
        {/* Main Betting Column */}
        <div className="space-y-6">
          <RoundDisplay />
          <BetPanel onBetPlaced={handleRefresh} />
        </div>

        {/* Sticky Sidebar: Wallet HUD & Quick Rules Reference */}
        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <WalletPanel />

          {/* Quick Rules & Multiplier Reference Widget */}
          <Card className="rounded-2xl bg-zinc-900/60 border-zinc-800/90 p-6 space-y-4 shadow-xl shadow-black/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600/15 border border-violet-500/30 text-violet-400">
                  <Dice5 className="h-4 w-4" />
                </div>
                <span className="font-heading text-base font-bold text-white tracking-tight">
                  Game Multipliers
                </span>
              </div>
              <Badge
                variant="outline"
                className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-mono text-[10px]"
              >
                VRF Verified
              </Badge>
            </div>

            {/* Compact Multiplier Quick Reference */}
            <div className="space-y-2 rounded-xl bg-zinc-950/70 border border-zinc-800/80 p-3 text-xs font-mono">
              <div className="flex items-center justify-between py-1 border-b border-zinc-800/60">
                <span className="font-sans text-zinc-300">Single (0–9)</span>
                <span className="font-bold text-violet-300 tabular-nums">9x return</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-zinc-800/60">
                <span className="font-sans text-zinc-300">Pair (00–99)</span>
                <span className="font-bold text-blue-300 tabular-nums">90x return</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="font-sans text-zinc-300">Trio (Sorted)</span>
                <span className="font-bold text-amber-300 tabular-nums">140x – 600x</span>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Predictions run on predictable daily cycles with Chainlink VRF random draws.
            </p>

            <Link
              href="/how-it-works"
              className="group flex items-center justify-between rounded-xl bg-zinc-950/50 border border-zinc-800/80 px-3.5 py-2.5 text-xs font-semibold text-violet-300 hover:text-white hover:border-violet-500/40 hover:bg-violet-600/10 transition-all"
            >
              <span>Read Official Guide & Rules</span>
              <ArrowRight className="h-3.5 w-3.5 text-violet-400 transition-transform group-hover:translate-x-1" />
            </Link>
          </Card>
        </div>
      </div>

      {/* Activity Section: Your Placed Bets & Claims Portal */}
      <div className="space-y-6">
        <PlacedBets key={refreshKey} onRefetchNeeded={handleRefresh} />
        <ClaimCard />
      </div>

      {/* Bottom Section: Safeguards & Recovery */}
      <div className="space-y-6 pt-10 border-t border-zinc-800/80">
        <div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-heading tracking-tight">
            Contract Safeguards & Recovery
          </h3>
          <p className="text-sm sm:text-base text-zinc-400 mt-1.5 leading-relaxed">
            Decentralized onchain tools to claim wager refunds from cancelled rounds and recover rounds with stalled Chainlink VRF.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RefundCard />
          <EmergencyRecovery />
        </div>
      </div>
    </div>
  );
}
