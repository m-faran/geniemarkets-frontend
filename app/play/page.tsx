"use client";

import { RoundDisplay } from "@/components/round-display";
import { BetPanel } from "@/components/bet-panel";
import { WalletPanel } from "@/components/wallet-panel";
import { ClaimCard } from "@/components/claim-card";

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
        </div>
      </div>
    </div>
  );
}
