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
import Link from "next/link";
import { HelpCircle, ArrowRight } from "lucide-react";

export default function PlayPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const handleRefresh = () => setRefreshKey((k) => k + 1);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Main Column */}
        <div className="space-y-6">
          <RoundDisplay />
          <BetPanel onBetPlaced={handleRefresh} />
          <PlacedBets key={refreshKey} onRefetchNeeded={handleRefresh} />
          <ClaimCard />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <WalletPanel />

          <Card className="bg-zinc-900/60 border-zinc-800 p-5 space-y-3">
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
              Read the Game Tutorial
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Card>
        </div>
      </div>

      {/* Bottom Section: Collapsible Operational & Emergency Recovery Cards */}
      <div className="space-y-4 pt-6 border-t border-zinc-800/80">
        <div>
          <h4 className="text-sm font-semibold text-zinc-300">Contract Safeguards & Recovery</h4>
          <p className="text-xs text-zinc-500 mt-0.5">
            Decentralized tools to claim wager refunds from cancelled rounds and recover rounds with stalled Chainlink VRF.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RefundCard />
          <EmergencyRecovery />
        </div>
      </div>
    </div>
  );
}
