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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-10">
      {/* Top Section: Interactive Betting Arena & Sticky Wallet HUD */}
      <div className="grid gap-8 lg:grid-cols-[1fr_390px] items-start">
        {/* Main Betting Column */}
        <div className="space-y-8">
          <RoundDisplay />
          <BetPanel onBetPlaced={handleRefresh} />
        </div>

        {/* Sticky Sidebar: Wallet HUD & Quick Rules Reference */}
        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <WalletPanel />

          {/* Quick Rules & Multiplier Reference Widget */}
          <Card className="rounded-2xl border border-white/10 bg-[#0B0F1A]/90 p-6 space-y-5 shadow-2xl shadow-black/80">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/15 border border-violet-500/30 text-violet-400">
                  <Dice5 className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-hud text-base font-bold text-white tracking-wide uppercase">
                    Protocol Odds
                  </span>
                  <p className="font-mono text-[10px] text-slate-400">Fixed Math Multipliers</p>
                </div>
              </div>
              <Badge variant="cyber">
                VRF v2.5
              </Badge>
            </div>

            {/* Compact Multiplier Quick Reference */}
            <div className="space-y-2 rounded-xl bg-[#07090E] border border-white/10 p-3.5 text-xs font-mono shadow-inner">
              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-300 font-sans">Single (0–9)</span>
                <span className="font-bold text-violet-300 tabular-nums">9x Payout</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-slate-300 font-sans">Pair (00–99)</span>
                <span className="font-bold text-cyan-300 tabular-nums">90x Payout</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-300 font-sans">Trio (Sorted)</span>
                <span className="font-bold text-amber-300 tabular-nums text-glow-gold">140x – 600x</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Non-custodial number prediction markets powered by Chainlink VRF v2.5 tamper-proof randomness on Ethereum Sepolia.
            </p>

            <Link
              href="/how-it-works"
              className="group flex items-center justify-between rounded-xl bg-[#07090E] border border-white/10 px-4 py-3 text-xs font-hud font-bold uppercase tracking-wider text-violet-300 hover:text-white hover:border-violet-500/40 hover:bg-violet-600/15 transition-all shadow-sm"
            >
              <span>View Technical Whitepaper</span>
              <ArrowRight className="h-3.5 w-3.5 text-violet-400 transition-transform group-hover:translate-x-1" />
            </Link>
          </Card>
        </div>
      </div>

      {/* Activity Section: Your Placed Bets & Claims Portal */}
      <div className="space-y-6 pt-4">
        <PlacedBets key={refreshKey} onRefetchNeeded={handleRefresh} />
        <ClaimCard />
      </div>

      {/* Bottom Section: Safeguards & Recovery */}
      <div className="space-y-6 pt-10 border-t border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            <span className="font-hud text-xs font-bold uppercase tracking-wider text-cyan-400">
              Decentralized Recovery Escrow
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-heading tracking-tight mt-1">
            Contract Safeguards & Stale VRF Exit
          </h3>
          <p className="text-sm sm:text-base text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Autonomous onchain recovery mechanisms allowing any participant to claim refunds from cancelled rounds or force resolution on stalled oracles.
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
