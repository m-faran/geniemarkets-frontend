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
      <Card className="rounded-2xl bg-zinc-900/60 border-zinc-800/90 p-8 text-center space-y-4 shadow-xl shadow-black/20">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 mx-auto shadow-md shadow-amber-500/10">
          <Trophy className="h-6 w-6" />
        </div>
        <CardTitle className="text-lg font-extrabold text-white font-heading flex items-center justify-center gap-2.5 tracking-tight">
          Winning Claims Portal
          <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-300 font-mono text-[10px] px-2.5 py-0.5 rounded-lg">
            claimWinnings
          </Badge>
        </CardTitle>
        <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
          Winnings are pull-based and held in the contract. Connect your wallet to check and claim any pending rewards.
        </p>
        <Button
          onClick={login}
          className="h-10 px-5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-heading font-bold text-xs shadow-lg shadow-violet-600/25"
        >
          Sign In to Check Claims
        </Button>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-amber-500/30 bg-gradient-to-b from-amber-500/10 via-zinc-950/70 to-zinc-950 p-7 sm:p-8 shadow-xl shadow-black/20 space-y-7">
      {/* Header */}
      <CardHeader className="p-0 flex flex-wrap items-center justify-between gap-5 border-b border-amber-500/20 pb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-xl shadow-amber-500/20">
            <Trophy className="h-7 w-7" />
          </div>
          <div>
            <CardTitle className="text-2xl sm:text-3xl font-extrabold text-white font-heading flex items-center gap-3 tracking-tight">
              Winning Claims Portal
              <Badge variant="outline" className="border-amber-500/30 bg-amber-500/15 font-mono text-xs font-bold text-amber-300 px-3 py-1 rounded-xl">
                claimWinnings
              </Badge>
            </CardTitle>
            <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">
              Claim winnings directly to your wallet within 30 days of round settlement.
            </p>
          </div>
        </div>

        {totalWinnings > 0n && (
          <div className="flex items-center gap-3 rounded-xl bg-amber-500/15 border border-amber-500/30 px-5 py-2.5 shadow-sm">
            <Coins className="h-5 w-5 text-amber-400" />
            <span className="text-xs font-heading font-medium text-zinc-300">Total Winnings:</span>
            <span className="font-mono text-lg font-black text-amber-300 tabular-nums">
              {formatUsdcDollar(totalWinnings)}
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0 space-y-5">
        {/* Success Notification (Zero Emojis) */}
        {step === "success" && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center space-y-2.5">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400" />
            <p className="text-base font-bold text-white font-heading">Winnings Claimed Successfully</p>
            <p className="text-sm text-zinc-400 leading-relaxed">USDC payout has been transferred directly to your wallet balance.</p>
            <Button
              size="sm"
              onClick={() => {
                reset();
                refetch();
              }}
              className="bg-violet-600 hover:bg-violet-500 text-white text-xs font-heading font-bold rounded-xl"
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* Detected Winning Bets */}
        {winningBets.length > 0 ? (
          <div className="space-y-3">
            <p className="text-xs font-extrabold text-amber-300/90 uppercase tracking-wider font-mono">
              Unclaimed Winning Bets ({winningBets.length})
            </p>
            {winningBets.map((bet) => (
              <div
                key={`win-${bet.roundId.toString()}-${bet.betIndex.toString()}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/[0.07] p-5 sm:p-6 hover:border-amber-500/50 transition-all shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant="secondary" className="font-mono text-xs tabular-nums rounded-lg px-2.5 py-1">
                      Round #{bet.roundId.toString()}
                    </Badge>
                    <p className="text-base font-bold text-white font-heading">
                      {BET_TYPE_LABELS[bet.betType]} · Pick {bet.pick}
                    </p>
                    <span className="text-xs text-zinc-400 font-mono tabular-nums">
                      (Bet #{bet.betIndex.toString()})
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-zinc-400 font-mono tabular-nums">
                    Wagered {formatUsdcDollar(bet.amount)}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5">
                  <span className="font-mono text-2xl font-black text-amber-400 tabular-nums">
                    {formatUsdcDollar(bet.payout)}
                  </span>
                  <Button
                    onClick={() => handleClaimWin(bet.roundId, bet.betIndex)}
                    disabled={step === "claiming"}
                    className="h-11 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-heading font-bold text-xs gap-2 shadow-lg shadow-amber-500/20"
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
          <div className="rounded-2xl border border-zinc-800/90 bg-zinc-950/70 p-8 sm:p-12 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-xl shadow-amber-500/15">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div className="space-y-1.5">
              <p className="text-lg sm:text-xl font-extrabold text-white font-heading tracking-tight">
                No Unclaimed Winnings
              </p>
              <p className="text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
                You currently have no pending winnings in recent rounds. Place bets in the active round, and winners can claim their USDC rewards right here upon settlement.
              </p>
            </div>
          </div>
        )}

        {/* Manual Claim Accordion */}
        <div className="border-t border-amber-500/20 pt-5">
          <button
            type="button"
            onClick={() => setShowManual(!showManual)}
            className="group flex items-center justify-between w-full rounded-2xl bg-zinc-950/60 hover:bg-zinc-900/80 border border-zinc-800/90 px-5 py-4 text-sm font-heading font-bold text-zinc-200 hover:text-white transition-all cursor-pointer shadow-sm"
          >
            <span className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400">
                <Search className="h-4 w-4" />
              </div>
              Manual Claim by Round & Bet Index
            </span>
            {showManual ? (
              <ChevronUp className="h-5 w-5 text-zinc-400 group-hover:text-white transition-colors" />
            ) : (
              <ChevronDown className="h-5 w-5 text-zinc-400 group-hover:text-white transition-colors" />
            )}
          </button>

          {showManual && (
            <form onSubmit={handleManualClaim} className="mt-3 space-y-4 rounded-2xl border border-zinc-800/90 bg-zinc-950/80 p-5">
              <p className="text-xs text-zinc-400">
                Directly invoke <code className="font-mono text-amber-300 font-bold">claimWinnings(roundId, betIndex)</code> on the contract for any settled round.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-heading font-medium text-zinc-300 mb-1.5">
                    Round ID
                  </label>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    required
                    placeholder="e.g. 1"
                    value={manualRoundId}
                    onChange={(e) => setManualRoundId(e.target.value)}
                    className="h-11 rounded-xl font-mono text-xs tabular-nums bg-zinc-950/90 border-zinc-800/90 px-3.5 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-heading font-medium text-zinc-300 mb-1.5">
                    Bet Index
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    required
                    placeholder="e.g. 0"
                    value={manualBetIndex}
                    onChange={(e) => setManualBetIndex(e.target.value)}
                    className="h-11 rounded-xl font-mono text-xs tabular-nums bg-zinc-950/90 border-zinc-800/90 px-3.5 focus:border-amber-500"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={step === "claiming" || !manualRoundId || !manualBetIndex}
                className="h-11 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-heading font-bold text-xs gap-1.5 shadow-lg shadow-amber-500/20"
              >
                {step === "claiming" ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Claiming…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    Claim Winnings for Bet #{manualBetIndex || "—"}
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
              className="text-zinc-400 hover:text-white"
            >
              Dismiss
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
