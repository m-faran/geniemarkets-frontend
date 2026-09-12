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
  RotateCcw,
  ArrowDownCircle,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Search,
  ShieldCheck,
} from "lucide-react";

export function RefundCard() {
  const { authenticated } = usePrivy();
  const { refundableBets, refetch } = useUnclaimedWinnings();
  const { claimRefund, step, error, reset } = useClaim();

  // Collapsible state — collapsed by default per user requirement
  const [isOpen, setIsOpen] = useState(false);

  // Manual refund state
  const [manualRoundId, setManualRoundId] = useState("");
  const [manualBetIndex, setManualBetIndex] = useState("");

  const totalRefundable = refundableBets.reduce((acc, b) => acc + b.amount, 0n);

  const handleClaimRefund = async (roundId: bigint, betIndex: bigint) => {
    await claimRefund(roundId, betIndex);
    refetch();
  };

  const handleManualRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualRoundId || !manualBetIndex) return;
    try {
      await claimRefund(BigInt(manualRoundId), BigInt(manualBetIndex));
      refetch();
    } catch {
      // Handled by useClaim hook
    }
  };

  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-cyan-500/5 via-black/40 to-transparent p-5 shadow-lg transition-all">
      {/* Collapsible Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-cyan-500/15 p-2.5 ring-1 ring-cyan-500/30 text-cyan-400">
            <RotateCcw className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">
                Claim Refunds
              </h3>
              <span className="rounded-md bg-cyan-500/20 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-mono text-cyan-300">
                claimRefund
              </span>
              {refundableBets.length > 0 && (
                <span className="rounded-full bg-cyan-500 px-2 py-0.5 text-[10px] font-extrabold text-black animate-pulse">
                  {refundableBets.length} Ready
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Pull-based wager refunds for Cancelled or Partially Settled rounds.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {totalRefundable > 0n && (
            <span className="font-mono text-xs font-bold text-cyan-300 hidden sm:inline">
              {formatUsdcDollar(totalRefundable)} Available
            </span>
          )}
          <div className="rounded-lg bg-white/5 p-1.5 text-zinc-400 hover:text-white transition-colors">
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>
      </button>

      {/* Collapsible Body — only visible when opened */}
      {isOpen && (
        <div className="mt-5 pt-5 border-t border-cyan-500/15 space-y-5">
          {/* Explanatory Banner */}
          <div className="rounded-xl border border-cyan-500/10 bg-cyan-500/[0.03] p-4 text-xs text-zinc-400 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-cyan-300">
              <ShieldCheck className="h-4 w-4" />
              How Contract Refunds Work (`claimRefund`)
            </div>
            <ul className="list-disc list-inside space-y-1 text-zinc-400 text-[11px] leading-relaxed">
              <li>
                <strong className="text-zinc-200">Cancelled Round:</strong> If Open VRF fails or stalls past the 24h emergency timeout, all bets are 100% refundable.
              </li>
              <li>
                <strong className="text-zinc-200">Partially Settled Round:</strong> If Close VRF stalls, Open-side bets win normally, while Close-side and Pair bets can claim 100% refunds.
              </li>
              <li>
                Refunds are held pull-based in the contract and must be claimed within <strong className="text-zinc-200">30 days</strong> of round settlement.
              </li>
            </ul>
          </div>

          {/* Success Notification */}
          {step === "success" && (
            <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-center">
              <CheckCircle2 className="mx-auto mb-2 h-7 w-7 text-green-400" />
              <p className="text-sm font-semibold text-white">Refund Claimed Successfully! 🎉</p>
              <p className="text-xs text-zinc-400 mt-0.5">Your original wager has been refunded to your wallet in USDC.</p>
              <button
                onClick={() => {
                  reset();
                  refetch();
                }}
                className="mt-3 rounded-lg bg-cyan-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500 transition-all"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Detected Refundable Bets */}
          {refundableBets.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                Refundable Bets Ready to Claim ({refundableBets.length})
              </p>
              {refundableBets.map((bet) => (
                <div
                  key={`refund-${bet.roundId.toString()}-${bet.betIndex.toString()}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3"
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
                      Wagered {formatUsdcDollar(bet.amount)} · Eligible for 100% Refund
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <span className="font-mono text-base font-bold text-cyan-300">
                      {formatUsdcDollar(bet.amount)}
                    </span>
                    <button
                      onClick={() => handleClaimRefund(bet.roundId, bet.betIndex)}
                      disabled={step === "claiming" || !authenticated}
                      className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-cyan-600/20 transition-all hover:bg-cyan-500 disabled:opacity-50"
                    >
                      {step === "claiming" ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <ArrowDownCircle className="h-3.5 w-3.5" />
                      )}
                      Claim Refund
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="rounded-xl border border-white/5 bg-black/20 p-4 text-center space-y-1">
              <CheckCircle2 className="mx-auto h-6 w-6 text-zinc-500" />
              <p className="text-xs font-semibold text-zinc-300">No Pending Refunds</p>
              <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">
                No bets in cancelled or partially settled rounds were detected in recent history.
              </p>
            </div>
          )}

          {/* Manual Refund Form */}
          <div className="rounded-xl border border-white/5 bg-black/30 p-4 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
              <Search className="h-3.5 w-3.5 text-cyan-400" />
              Manual Refund Claim
            </div>
            <p className="text-[11px] text-zinc-400">
              If you have a bet in an older cancelled round, enter the Round ID and Bet Index to call <code className="font-mono text-cyan-300">claimRefund(roundId, betIndex)</code> directly.
            </p>

            <form onSubmit={handleManualRefund} className="space-y-3">
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
                    className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 font-mono text-xs text-white placeholder:text-zinc-600 focus:border-cyan-500 focus:outline-none"
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
                    className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 font-mono text-xs text-white placeholder:text-zinc-600 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={step === "claiming" || !manualRoundId || !manualBetIndex || !authenticated}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-2 text-xs font-bold text-white shadow-md transition-all hover:bg-cyan-500 disabled:opacity-50"
              >
                {step === "claiming" ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Claiming Refund…
                  </>
                ) : (
                  <>
                    <ArrowDownCircle className="h-3.5 w-3.5" />
                    {authenticated ? `Claim Refund for Bet #${manualBetIndex || "—"}` : "Sign In to Claim Refund"}
                  </>
                )}
              </button>
            </form>
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
      )}
    </div>
  );
}
