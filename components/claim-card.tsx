"use client";

import { useState } from "react";
import { useUnclaimedWinnings } from "@/hooks/use-user-bets";
import { useClaim } from "@/hooks/use-claim";
import {
  BET_TYPE_LABELS,
  formatUsdcDollar,
} from "@/lib/utils";
import { usePrivy } from "@privy-io/react-auth";
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

  // If not authenticated, show a neat sign-in card
  if (!authenticated) {
    return (
      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent p-6 text-center space-y-3">
        <Trophy className="mx-auto h-7 w-7 text-amber-400/80" />
        <h3 className="text-base font-bold text-white flex items-center justify-center gap-2">
          Winning Claims Portal
          <span className="rounded-md bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 text-[10px] font-mono text-amber-300">
            claimWinnings
          </span>
        </h3>
        <p className="text-xs text-zinc-400 max-w-md mx-auto">
          Winnings are pull-based and held in the contract. Connect your wallet to check and claim any pending rewards.
        </p>
        <button
          onClick={login}
          className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-500 transition-all"
        >
          Sign In to Check Claims
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent p-6 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/15 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl bg-amber-500/20 p-2 ring-1 ring-amber-500/30">
            <Trophy className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Winning Claims Portal
              <span className="rounded-md bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 text-[10px] font-mono text-amber-300">
                claimWinnings
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              Claim winnings directly to your wallet within 30 days of round settlement.
            </p>
          </div>
        </div>

        {totalWinnings > 0n && (
          <div className="flex items-center gap-2 rounded-xl bg-amber-500/15 px-3.5 py-1.5 ring-1 ring-amber-500/30">
            <Coins className="h-4 w-4 text-amber-400" />
            <span className="text-xs text-zinc-400">Total Winnings:</span>
            <span className="font-mono text-sm font-extrabold text-amber-300">
              {formatUsdcDollar(totalWinnings)}
            </span>
          </div>
        )}
      </div>

      {/* Success Notification */}
      {step === "success" && (
        <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-center">
          <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-green-400" />
          <p className="text-sm font-semibold text-white">Winnings Claimed Successfully! 🎉</p>
          <p className="text-xs text-zinc-400 mt-0.5">USDC payout has been transferred to your wallet.</p>
          <button
            onClick={() => {
              reset();
              refetch();
            }}
            className="mt-3 rounded-lg bg-violet-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-violet-500 transition-all"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Detected Winning Bets */}
      {winningBets.length > 0 ? (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-amber-300/90 uppercase tracking-wider">
            Unclaimed Winning Bets ({winningBets.length})
          </p>
          {winningBets.map((bet) => (
            <div
              key={`win-${bet.roundId.toString()}-${bet.betIndex.toString()}`}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[11px] font-bold text-white">
                    Round #{bet.roundId.toString()}
                  </span>
                  <p className="text-sm font-semibold text-white">
                    {BET_TYPE_LABELS[bet.betType]} · Pick {bet.pick}
                  </p>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    (Bet #{bet.betIndex.toString()})
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-zinc-400">
                  Wagered {formatUsdcDollar(bet.amount)}
                </p>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3">
                <span className="font-mono text-lg font-bold text-amber-400">
                  {formatUsdcDollar(bet.payout)}
                </span>
                <button
                  onClick={() => handleClaimWin(bet.roundId, bet.betIndex)}
                  disabled={step === "claiming"}
                  className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-2 text-xs font-bold text-black shadow-md shadow-amber-500/20 transition-all hover:bg-amber-400 disabled:opacity-50"
                >
                  {step === "claiming" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  Claim Winnings
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-xl border border-white/5 bg-black/20 p-5 text-center space-y-2">
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
          className="flex items-center justify-between w-full text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
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
          <form onSubmit={handleManualClaim} className="mt-3 space-y-3 rounded-xl border border-white/5 bg-black/30 p-4">
            <p className="text-[11px] text-zinc-400">
              Directly invoke <code className="font-mono text-amber-300">claimWinnings(roundId, betIndex)</code> on the contract for any settled round.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Round ID
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  placeholder="e.g. 1"
                  value={manualRoundId}
                  onChange={(e) => setManualRoundId(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 font-mono text-xs text-white placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Bet Index
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  placeholder="e.g. 0"
                  value={manualBetIndex}
                  onChange={(e) => setManualBetIndex(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 font-mono text-xs text-white placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={step === "claiming" || !manualRoundId || !manualBetIndex}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-black shadow-md transition-all hover:bg-amber-400 disabled:opacity-50"
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
            </button>
          </form>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="flex items-center justify-between gap-2 rounded-xl bg-red-500/10 px-4 py-3 text-xs text-red-400">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={reset} className="underline text-zinc-400 hover:text-white">
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}

