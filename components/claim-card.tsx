"use client";

import { useUnclaimedWinnings } from "@/hooks/use-user-bets";
import { useClaim } from "@/hooks/use-claim";
import {
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
  Coins,
} from "lucide-react";

export function ClaimCard() {
  const { authenticated } = usePrivy();
  const { winningBets, refundableBets, totalUnclaimedAmount, refetch } =
    useUnclaimedWinnings();
  const { claimWinnings, claimRefund, step, error, reset } = useClaim();

  if (!authenticated) return null;

  const hasClaims = winningBets.length > 0 || refundableBets.length > 0;

  if (!hasClaims && step !== "success") return null;

  const handleClaimWin = async (roundId: bigint, betIndex: bigint) => {
    await claimWinnings(roundId, betIndex);
    refetch();
  };

  const handleClaimRefund = async (roundId: bigint, betIndex: bigint) => {
    await claimRefund(roundId, betIndex);
    refetch();
  };

  if (step === "success") {
    return (
      <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-6 text-center">
        <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-green-400" />
        <p className="text-lg font-semibold text-white">Claimed Successfully! 🎉</p>
        <p className="text-xs text-zinc-400 mt-1">USDC has been transferred to your wallet.</p>
        <button
          onClick={() => {
            reset();
            refetch();
          }}
          className="mt-3 rounded-xl bg-violet-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-violet-500"
        >
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent p-6 shadow-xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/15 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl bg-amber-500/20 p-2 ring-1 ring-amber-500/30">
            <Trophy className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {winningBets.length > 0 ? "Unclaimed Winnings Available!" : "Refunds Ready to Claim"}
            </h3>
            <p className="text-xs text-zinc-400">
              Claim directly to your wallet within 30 days of round settlement.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-amber-500/15 px-3 py-1.5 ring-1 ring-amber-500/30">
          <Coins className="h-4 w-4 text-amber-400" />
          <span className="text-xs text-zinc-400">Total Claimable:</span>
          <span className="font-mono text-sm font-extrabold text-amber-300">
            {formatUsdcDollar(totalUnclaimedAmount)}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {/* Winning bets across rounds */}
        {winningBets.map((bet) => (
          <div
            key={`win-${bet.roundId.toString()}-${bet.betIndex.toString()}`}
            className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[11px] font-bold text-white">
                  Round #{bet.roundId.toString()}
                </span>
                <p className="text-sm font-semibold text-white">
                  {BET_TYPE_LABELS[bet.betType]} · Pick {bet.pick}
                </p>
              </div>
              <p className="mt-0.5 text-xs text-zinc-400">
                Wagered {formatUsdcDollar(bet.amount)}
              </p>
            </div>
            <div className="flex items-center gap-3">
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
                  <Trophy className="h-3.5 w-3.5" />
                )}
                Claim
              </button>
            </div>
          </div>
        ))}

        {/* Refundable bets */}
        {refundableBets.map((bet) => (
          <div
            key={`refund-${bet.roundId.toString()}-${bet.betIndex.toString()}`}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[11px] font-bold text-white">
                  Round #{bet.roundId.toString()}
                </span>
                <p className="text-sm font-semibold text-white">
                  {BET_TYPE_LABELS[bet.betType]} · Pick {bet.pick}
                </p>
              </div>
              <p className="mt-0.5 text-xs text-zinc-400">
                Wagered {formatUsdcDollar(bet.amount)} · Refund
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-semibold text-zinc-300">
                {formatUsdcDollar(bet.amount)}
              </span>
              <button
                onClick={() => handleClaimRefund(bet.roundId, bet.betIndex)}
                disabled={step === "claiming"}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition-all hover:bg-white/10 disabled:opacity-40"
              >
                {step === "claiming" ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <ArrowDownCircle className="h-3 w-3" />
                )}
                Claim Refund
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

