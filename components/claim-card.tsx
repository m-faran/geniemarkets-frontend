"use client";

import { useState } from "react";
import { useUnclaimedWinnings } from "@/hooks/use-user-bets";
import { useClaim } from "@/hooks/use-claim";
import {
  BET_TYPE_LABELS,
  formatUsdcDollar,
} from "@/lib/utils";
import { usePrivy } from "@privy-io/react-auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Trophy,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Coins,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Search,
} from "lucide-react";

export function ClaimCard() {
  const { authenticated, login } = usePrivy();
  const { winningBets, refetch } = useUnclaimedWinnings();
  const { claimWinnings, step, error, reset } = useClaim();

  // Manual claim state
  const [showManual, setShowManual] = useState(false);
  const [manualRoundId, setManualRoundId] = useState("");
  const [manualBetIndex, setManualBetIndex] = useState("");

  const totalWinnings = winningBets.reduce((acc, b) => acc + b.payout, 0n);

  const handleClaimWin = async (roundId: bigint, betIndex: bigint) => {
    await claimWinnings(roundId, betIndex);
    refetch();
  };

  const handleManualClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualRoundId || !manualBetIndex) return;
    try {
      await claimWinnings(BigInt(manualRoundId), BigInt(manualBetIndex));
      refetch();
    } catch {
      // Error handled by useClaim hook
    }
  };

  if (!authenticated) {
    return (
      <Card className="rounded-2xl bg-[#0B0F1A]/85 backdrop-blur-xl border border-amber-500/25 p-8 text-center space-y-4 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 mx-auto shadow-lg shadow-amber-500/20">
          <Trophy className="h-7 w-7 text-amber-400" />
        </div>
        <CardTitle className="text-xl font-extrabold text-white font-heading flex items-center justify-center gap-2.5 tracking-tight">
          Winning Claims Terminal
          <Badge variant="gold" className="text-[10px] uppercase font-hud">
            claimWinnings
          </Badge>
        </CardTitle>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          Winnings are held in the onchain escrow vault. Connect your Web3 or embedded wallet to audit and claim your settlements.
        </p>
        <Button
          onClick={login}
          variant="gold"
          className="h-11 px-6 font-hud tracking-wider uppercase text-xs"
        >
          Authenticate to Audit Claims
        </Button>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-amber-500/30 bg-[#0B0F1A]/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-500/10 blur-3xl pointer-events-none" />
      {/* Top highlight gradient */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

      {/* Header */}
      <CardHeader className="p-0 flex flex-wrap items-center justify-between gap-5 border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-xl shadow-amber-500/15">
            <Trophy className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <CardTitle className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight">
                Winning Claims Portal
              </CardTitle>
              <Badge variant="gold" className="text-[11px] font-hud uppercase">
                claimWinnings()
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Pull-based USDC payouts held in trustless smart contract escrow. Claim within 30 days of round finalization.
            </p>
          </div>
        </div>

        {totalWinnings > 0n && (
          <div className="flex items-center gap-3 rounded-xl bg-amber-500/15 border border-amber-500/30 px-5 py-2.5 shadow-lg shadow-amber-500/10">
            <Coins className="h-5 w-5 text-amber-400" />
            <span className="text-xs font-hud uppercase tracking-wider text-amber-300">Total Unclaimed:</span>
            <span className="font-hud text-xl font-black text-amber-300 tabular-nums">
              {formatUsdcDollar(totalWinnings)}
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0 space-y-5">
        {/* Success Notification */}
        {step === "success" && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center space-y-2.5">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400" />
            <p className="text-base font-bold text-white font-heading">Settlement Claim Executed</p>
            <p className="text-xs text-slate-400 leading-relaxed">USDC payout successfully transferred to your wallet balance.</p>
            <Button
              size="sm"
              variant="cyber"
              onClick={() => {
                reset();
                refetch();
              }}
              className="text-xs font-hud font-bold rounded-xl uppercase tracking-wider"
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* Detected Winning Bets */}
        {winningBets.length > 0 ? (
          <div className="space-y-3">
            <p className="text-xs font-black text-amber-400 uppercase tracking-widest font-hud">
              Unclaimed Position Settlements ({winningBets.length})
            </p>
            {winningBets.map((bet) => (
              <div
                key={`win-${bet.roundId.toString()}-${bet.betIndex.toString()}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-amber-500/30 bg-[#07090E]/90 p-5 sm:p-6 hover:border-amber-500/50 transition-all shadow-md group"
              >
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant="outline" className="font-mono text-xs tabular-nums rounded-lg px-2.5 py-1 border-white/10 bg-[#05070B] text-slate-300">
                      Round #{bet.roundId.toString()}
                    </Badge>
                    <p className="text-base font-bold text-white font-heading">
                      {BET_TYPE_LABELS[bet.betType]} · <span className="text-amber-400 font-hud">Pick {bet.pick}</span>
                    </p>
                    <span className="text-xs text-slate-500 font-mono tabular-nums">
                      (Bet #{bet.betIndex.toString()})
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-400 font-mono tabular-nums">
                    Wagered {formatUsdcDollar(bet.amount)}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5">
                  <span className="font-hud text-2xl sm:text-3xl font-black text-amber-400 tabular-nums">
                    {formatUsdcDollar(bet.payout)}
                  </span>
                  <Button
                    onClick={() => handleClaimWin(bet.roundId, bet.betIndex)}
                    disabled={step === "claiming"}
                    variant="gold"
                    className="h-11 px-5 font-hud uppercase tracking-wider text-xs gap-2"
                  >
                    {step === "claiming" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    Claim Winnings
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="rounded-2xl border border-white/5 bg-[#07090E]/80 p-8 sm:p-10 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-lg shadow-amber-500/10">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <p className="text-base sm:text-lg font-bold text-white font-heading tracking-tight">
                No Unclaimed Payouts Found
              </p>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                All winning positions are up to date. Place predictions in active rounds to earn up to 600x payouts verified onchain.
              </p>
            </div>
          </div>
        )}

        {/* Manual Claim Accordion */}
        <div className="border-t border-white/5 pt-5">
          <button
            type="button"
            onClick={() => setShowManual(!showManual)}
            className="group flex items-center justify-between w-full rounded-xl bg-[#07090E]/80 hover:bg-[#07090E] border border-white/5 px-4 py-3.5 text-xs font-hud uppercase tracking-wider text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <span className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-400">
                <Search className="h-3.5 w-3.5" />
              </div>
              Manual Settlement Claim by Round & Bet Index
            </span>
            {showManual ? (
              <ChevronUp className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
            )}
          </button>

          {showManual && (
            <form onSubmit={handleManualClaim} className="mt-3 space-y-4 rounded-xl border border-white/10 bg-[#07090E] p-5">
              <p className="text-xs text-slate-400">
                Directly execute contract function <code className="font-mono text-amber-400 font-bold bg-[#05070B] px-1.5 py-0.5 rounded border border-amber-500/20">claimWinnings(roundId, betIndex)</code> for any settled round.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-hud uppercase tracking-wider text-slate-400 mb-1.5">
                    Round ID (uint256)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    required
                    placeholder="e.g. 1"
                    value={manualRoundId}
                    onChange={(e) => setManualRoundId(e.target.value)}
                    className="h-10 rounded-xl font-mono text-xs tabular-nums bg-[#05070B] border-white/10 px-3.5 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-hud uppercase tracking-wider text-slate-400 mb-1.5">
                    Bet Index (uint256)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    required
                    placeholder="e.g. 0"
                    value={manualBetIndex}
                    onChange={(e) => setManualBetIndex(e.target.value)}
                    className="h-10 rounded-xl font-mono text-xs tabular-nums bg-[#05070B] border-white/10 px-3.5 focus:border-amber-500"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={step === "claiming" || !manualRoundId || !manualBetIndex}
                variant="gold"
                className="h-10 px-5 font-hud uppercase tracking-wider text-xs gap-1.5"
              >
                {step === "claiming" ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Executing Claim…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    Execute Claim for Bet #{manualBetIndex || "—"}
                  </>
                )}
              </Button>
            </form>
          )}
        </div>

        {/* Error display */}
        {error && (
          <div className="flex items-center justify-between gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-xs text-red-400">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
            <Button
              variant="ghost"
              size="xs"
              onClick={reset}
              className="text-slate-400 hover:text-white"
            >
              Dismiss
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

