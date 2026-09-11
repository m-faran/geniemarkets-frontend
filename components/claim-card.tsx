"use client";

import { useUserBets } from "@/hooks/use-user-bets";
import { useClaim } from "@/hooks/use-claim";
import { useCurrentRound } from "@/hooks/use-current-round";
import {
  RoundPhase,
  BetType,
  BET_TYPE_LABELS,
  formatUsdcDollar,
} from "@/lib/utils";
import { usePrivy } from "@privy-io/react-auth";
import {
  Trophy,
  ArrowDownCircle,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export function ClaimCard() {
  const { authenticated } = usePrivy();
  const { roundId, round } = useCurrentRound();
  const { userBets } = useUserBets(roundId);
  const { claimWinnings, claimRefund, step, error, reset } = useClaim();

  if (!authenticated || !round || !roundId) return null;

  // Only show claim card when round is settled, partially settled, or cancelled
  const canClaim =
    round.phase === RoundPhase.Settled ||
    round.phase === RoundPhase.PartiallySettled ||
    round.phase === RoundPhase.Cancelled;

  if (!canClaim || userBets.length === 0) return null;

  const winningBets = userBets.filter((b) => b.payout > 0n && !b.claimed);
  const refundableBets = userBets.filter((b) => {
    if (b.claimed) return false;
    if (round.phase === RoundPhase.Cancelled) return true;
    if (round.phase === RoundPhase.PartiallySettled) {
      return (
        b.betType === BetType.CloseSingle ||
        b.betType === BetType.CloseTrio ||
        b.betType === BetType.Pair
      );
    }
    return false;
  });

  if (winningBets.length === 0 && refundableBets.length === 0) {
    // Check if user had bets but lost
    const lostBets = userBets.filter((b) => b.payout === 0n && !b.claimed);
    if (lostBets.length === 0) return null;

    return (
      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-6 text-center">
        <p className="text-sm text-zinc-400">
          No wins this round. Better luck next time! 🎲
        </p>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-6 text-center">
        <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-green-400" />
        <p className="text-lg font-semibold text-white">Claimed! 🎉</p>
        <button
          onClick={reset}
          className="mt-3 text-sm text-violet-400 hover:underline"
        >
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-b from-amber-500/5 to-transparent p-6">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
        <Trophy className="h-5 w-5 text-amber-400" />
        {winningBets.length > 0 ? "You Won!" : "Claim Refunds"}
      </h3>

      <div className="space-y-3">
        {/* Winning bets */}
        {winningBets.map((bet) => (
          <div
            key={`win-${bet.betIndex}`}
            className="flex items-center justify-between rounded-xl border border-amber-500/10 bg-amber-500/5 px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-white">
                {BET_TYPE_LABELS[bet.betType]} — Pick {bet.pick}
              </p>
              <p className="text-xs text-zinc-500">
                Wagered {formatUsdcDollar(bet.amount)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-amber-400">
                {formatUsdcDollar(bet.payout)}
              </span>
              <button
                onClick={() => claimWinnings(roundId, bet.betIndex)}
                disabled={step === "claiming"}
                className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-black transition-all hover:bg-amber-400 disabled:bg-amber-500/30 disabled:text-amber-800"
              >
                {step === "claiming" ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Trophy className="h-3 w-3" />
                )}
                Claim
              </button>
            </div>
          </div>
        ))}

        {/* Refundable bets */}
        {refundableBets.map((bet) => (
          <div
            key={`refund-${bet.betIndex}`}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-white">
                {BET_TYPE_LABELS[bet.betType]} — Pick {bet.pick}
              </p>
              <p className="text-xs text-zinc-500">
                Wagered {formatUsdcDollar(bet.amount)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-zinc-300">
                {formatUsdcDollar(bet.amount)} refund
              </span>
              <button
                onClick={() => claimRefund(roundId, bet.betIndex)}
                disabled={step === "claiming"}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition-all hover:bg-white/10 disabled:opacity-40"
              >
                {step === "claiming" ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <ArrowDownCircle className="h-3 w-3" />
                )}
                Refund
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
