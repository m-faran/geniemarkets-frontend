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
      <Card className="bg-zinc-900/60 border-zinc-800 p-6 text-center space-y-3">
        <Trophy className="mx-auto h-7 w-7 text-amber-400/80" />
        <CardTitle className="text-base font-bold text-white flex items-center justify-center gap-2 tracking-tight">
          Winning Claims Portal
          <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-300 font-mono text-[10px]">
            claimWinnings
          </Badge>
        </CardTitle>
        <p className="text-xs text-zinc-400 max-w-md mx-auto">
          Winnings are pull-based and held in the contract. Connect your wallet to check and claim any pending rewards.
        </p>
        <Button
          onClick={login}
          size="sm"
          className="bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-md shadow-violet-600/25"
        >
          Sign In to Check Claims
        </Button>
      </Card>
    );
  }

  return (
    <Card className="border-amber-500/30 bg-gradient-to-b from-amber-500/10 via-zinc-950/60 to-zinc-950 p-6 shadow-xl space-y-5">
      {/* Header */}
      <CardHeader className="p-0 flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/15 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl bg-amber-500/20 p-2 ring-1 ring-amber-500/30">
            <Trophy className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2 tracking-tight">
              Winning Claims Portal
              <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 font-mono text-[10px] text-amber-300">
                claimWinnings
              </Badge>
            </CardTitle>
            <p className="text-xs text-zinc-400">
              Claim winnings directly to your wallet within 30 days of round settlement.
            </p>
          </div>
        </div>

        {totalWinnings > 0n && (
          <div className="flex items-center gap-2 rounded-xl bg-amber-500/15 px-3.5 py-1.5 ring-1 ring-amber-500/30">
            <Coins className="h-4 w-4 text-amber-400" />
            <span className="text-xs text-zinc-400">Total Winnings:</span>
            <span className="font-mono text-sm font-extrabold text-amber-300 tabular-nums">
              {formatUsdcDollar(totalWinnings)}
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0 space-y-4">
        {/* Success Notification (Zero Emojis) */}
        {step === "success" && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center space-y-2">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400" />
            <p className="text-sm font-semibold text-white">Winnings Claimed Successfully</p>
            <p className="text-xs text-zinc-400">USDC payout has been transferred directly to your wallet balance.</p>
            <Button
              size="sm"
              onClick={() => {
                reset();
                refetch();
              }}
              className="bg-violet-600 hover:bg-violet-500 text-white text-xs"
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* Detected Winning Bets */}
        {winningBets.length > 0 ? (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-amber-300/90 uppercase tracking-wider font-mono">
              Unclaimed Winning Bets ({winningBets.length})
            </p>
            {winningBets.map((bet) => (
              <div
                key={`win-${bet.roundId.toString()}-${bet.betIndex.toString()}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono text-[10px] tabular-nums">
                      Round #{bet.roundId.toString()}
                    </Badge>
                    <p className="text-sm font-semibold text-white">
                      {BET_TYPE_LABELS[bet.betType]} · Pick {bet.pick}
                    </p>
                    <span className="text-[11px] text-zinc-400 font-mono tabular-nums">
                      (Bet #{bet.betIndex.toString()})
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-400 font-mono tabular-nums">
                    Wagered {formatUsdcDollar(bet.amount)}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <span className="font-mono text-lg font-bold text-amber-400 tabular-nums">
                    {formatUsdcDollar(bet.payout)}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => handleClaimWin(bet.roundId, bet.betIndex)}
                    disabled={step === "claiming"}
                    className="bg-amber-500 hover:bg-amber-400 text-black font-bold gap-1.5 shadow-md shadow-amber-500/20"
                  >
                    {step === "claiming" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5" />
                    )}
                    Claim Winnings
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-5 text-center space-y-2">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-white">No Unclaimed Winnings</p>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              You currently have no pending winnings in recent rounds. Place bets in the active round, and winners can claim their USDC rewards right here upon settlement.
            </p>
          </div>
        )}

        {/* Manual Claim Accordion */}
        <div className="border-t border-amber-500/15 pt-4">
          <button
            type="button"
            onClick={() => setShowManual(!showManual)}
            className="flex items-center justify-between w-full text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Search className="h-3.5 w-3.5 text-amber-400" />
              Manual Claim by Round & Bet Index
            </span>
            {showManual ? (
              <ChevronUp className="h-4 w-4 text-zinc-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-zinc-400" />
            )}
          </button>

          {showManual && (
            <form onSubmit={handleManualClaim} className="mt-3 space-y-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
              <p className="text-[11px] text-zinc-400">
                Directly invoke <code className="font-mono text-amber-300">claimWinnings(roundId, betIndex)</code> on the contract for any settled round.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
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
                    className="font-mono text-xs tabular-nums bg-zinc-950 border-zinc-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
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
                    className="font-mono text-xs tabular-nums bg-zinc-950 border-zinc-800"
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="sm"
                disabled={step === "claiming" || !manualRoundId || !manualBetIndex}
                className="bg-amber-500 hover:bg-amber-400 text-black font-bold gap-1.5"
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
