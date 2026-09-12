"use client";

import { useState, useMemo } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useCurrentRound } from "@/hooks/use-current-round";
import { useUserBets, type UserBet } from "@/hooks/use-user-bets";
import { useClaim } from "@/hooks/use-claim";
import {
  BetType,
  BET_TYPE_LABELS,
  formatUsdcDollar,
  formatPick,
  getBetPotentialMultiplier,
  getTrioPayoutMultiplier,
  RoundPhase,
  PHASE_LABELS,
  PHASE_COLORS,
} from "@/lib/utils";
import {
  Ticket,
  Dice5,
  Coins,
  Trophy,
  CheckCircle2,
  Loader2,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

export function PlacedBets({ onRefetchNeeded }: { onRefetchNeeded?: () => void }) {
  const { authenticated, login } = usePrivy();
  const { roundId: currentRoundId, round: currentRound } = useCurrentRound();

  // State to allow user to switch between viewing current round or past rounds
  const [selectedRoundId, setSelectedRoundId] = useState<bigint | undefined>(undefined);

  // Active round ID to display (fallback to currentRoundId)
  const activeRoundId = selectedRoundId ?? currentRoundId;

  const {
    userBets,
    totalBets: totalRoundBets,
    roundPhase,
    isLoading,
    refetch,
  } = useUserBets(activeRoundId);

  const { claimWinnings, claimRefund, step: claimStep } = useClaim();
  const [claimingBetIndex, setClaimingBetIndex] = useState<bigint | null>(null);

  // Calculate totals for user's bets in this round
  const totalUserStaked = useMemo(() => {
    return userBets.reduce((acc, bet) => acc + bet.amount, 0n);
  }, [userBets]);

  const totalUserWinnings = useMemo(() => {
    return userBets.reduce((acc, bet) => acc + bet.payout, 0n);
  }, [userBets]);

  // Handle claiming directly from placed bets list
  const handleClaim = async (bet: UserBet) => {
    setClaimingBetIndex(bet.betIndex);
    if (bet.payout > 0n) {
      await claimWinnings(bet.roundId, bet.betIndex);
    } else {
      await claimRefund(bet.roundId, bet.betIndex);
    }
    setClaimingBetIndex(null);
    refetch();
    onRefetchNeeded?.();
  };

  // Generate available round options for dropdown if currentRoundId > 1
  const roundOptions = useMemo(() => {
    if (!currentRoundId) return [];
    const cur = Number(currentRoundId);
    const options: number[] = [];
    const min = Math.max(1, cur - 9);
    for (let i = cur; i >= min; i--) {
      options.push(i);
    }
    return options;
  }, [currentRoundId]);

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-violet-600/20 p-2 text-violet-400 border border-violet-500/20">
            <Ticket className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Your Placed Bets
              {userBets.length > 0 && (
                <span className="rounded-full bg-violet-500/20 border border-violet-500/30 px-2.5 py-0.5 text-xs font-bold text-violet-300">
                  {userBets.length} {userBets.length === 1 ? "bet" : "bets"}
                </span>
              )}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Track your predictions, potential payouts, and round outcomes.
            </p>
          </div>
        </div>

        {/* Round Switcher & Refresh */}
        <div className="flex items-center gap-2">
          {roundPhase !== undefined && (
            <span
              className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${PHASE_COLORS[roundPhase]} bg-white/5 border-white/10`}
            >
              {PHASE_LABELS[roundPhase]}
            </span>
          )}

          {roundOptions.length > 1 ? (
            <select
              value={activeRoundId ? Number(activeRoundId) : ""}
              onChange={(e) => setSelectedRoundId(BigInt(e.target.value))}
              className="rounded-xl border border-white/10 bg-black/60 px-3 py-1.5 text-xs font-medium text-zinc-300 focus:border-violet-500 focus:outline-none"
            >
              {roundOptions.map((r) => (
                <option key={r} value={r}>
                  Round #{r} {currentRoundId && BigInt(r) === currentRoundId ? "(Current)" : ""}
                </option>
              ))}
            </select>
          ) : (
            <span className="rounded-lg bg-black/40 border border-white/10 px-2.5 py-1 text-xs font-mono text-zinc-400">
              Round #{activeRoundId ? activeRoundId.toString() : "—"}
            </span>
          )}

          {totalRoundBets > 0 && (
            <span className="hidden sm:inline text-[11px] text-zinc-500 font-mono">
              ({totalRoundBets} pool {totalRoundBets === 1 ? "bet" : "bets"})
            </span>
          )}

          <button
            onClick={() => refetch()}
            className="flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition-all"
            title="Refresh your bets"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-violet-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Unauthenticated State */}
      {!authenticated ? (
        <div className="rounded-xl border border-white/5 bg-black/20 p-8 text-center space-y-3">
          <Ticket className="mx-auto h-8 w-8 text-zinc-600" />
          <p className="text-sm font-semibold text-white">Sign In to View Your Bets</p>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Connect your wallet to see all active predictions and track your potential winnings for this round.
          </p>
          <button
            onClick={login}
            className="mt-2 rounded-xl bg-violet-600 px-5 py-2 text-xs font-semibold text-white hover:bg-violet-500 transition-all"
          >
            Sign In with Wallet
          </button>
        </div>
      ) : isLoading && userBets.length === 0 ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
          <span className="ml-2 text-xs text-zinc-400">Loading your bets…</span>
        </div>
      ) : userBets.length === 0 ? (
        /* Empty State */
        <div className="rounded-xl border border-white/5 bg-black/20 p-8 text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-zinc-500 border border-white/5">
            <Dice5 className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold text-white">
            No Bets in Round #{activeRoundId ? activeRoundId.toString() : "—"}
          </p>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            You haven&apos;t placed any predictions for this round yet. Use the Bet Panel above to submit your picks!
          </p>
        </div>
      ) : (
        /* User Bets List */
        <div className="space-y-4">
          {/* Summary Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white/[0.02] border border-white/5 px-4 py-2.5 text-xs">
            <div className="flex items-center gap-2 text-zinc-400">
              <span>Total Staked in Round:</span>
              <span className="font-mono font-bold text-white">
                {formatUsdcDollar(totalUserStaked)}
              </span>
            </div>

            {totalUserWinnings > 0n && (
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Trophy className="h-3.5 w-3.5" />
                <span>Total Winnings: {formatUsdcDollar(totalUserWinnings)}</span>
              </div>
            )}
          </div>

          {/* List of Bet Cards */}
          <div className="space-y-3">
            {userBets.map((bet) => {
              const multiplier = getBetPotentialMultiplier(bet.betType, bet.pick);
              const potentialPayout = bet.amount * BigInt(multiplier);

              // Market Side & Color
              const isCloseMarket =
                bet.betType === BetType.CloseSingle || bet.betType === BetType.CloseTrio;
              const isTrio =
                bet.betType === BetType.OpenTrio || bet.betType === BetType.CloseTrio;
              const isPair = bet.betType === BetType.Pair;

              const badgeColor = isTrio
                ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                : isPair
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                  : isCloseMarket
                    ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                    : "bg-violet-500/20 text-violet-300 border-violet-500/30";

              // Trio sub-badge
              let trioSubLabel = "";
              if (isTrio) {
                const mult = getTrioPayoutMultiplier(bet.pick);
                if (mult === 600) trioSubLabel = "Jackpot";
                else if (mult === 280) trioSubLabel = "Twin";
                else trioSubLabel = "Unique";
              }

              // Status determination
              const currentPhase = bet.roundPhase ?? currentRound?.phase;
              const isSettled =
                currentPhase === RoundPhase.Settled ||
                currentPhase === RoundPhase.PartiallySettled;
              const isCancelled = currentPhase === RoundPhase.Cancelled;
              const isDrawing =
                currentPhase === RoundPhase.OpenPending ||
                currentPhase === RoundPhase.ClosePending;
              const isWon = bet.payout > 0n;
              const isClaimingThis =
                claimingBetIndex === bet.betIndex && claimStep === "claiming";

              return (
                <div
                  key={`${bet.roundId.toString()}-${bet.betIndex.toString()}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/40 p-4 hover:border-white/20 transition-all"
                >
                  {/* Left: Bet Info & Pick */}
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-white/5 border border-white/10 text-center font-mono">
                      <span className="text-[10px] text-zinc-500 uppercase">Pick</span>
                      <span className="text-base font-extrabold text-white">
                        {formatPick(bet.betType, bet.pick)}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${badgeColor}`}
                        >
                          {BET_TYPE_LABELS[bet.betType]}
                        </span>
                        {trioSubLabel && (
                          <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-300">
                            {trioSubLabel} ({multiplier}x)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-zinc-400">
                        <span>
                          Wager:{" "}
                          <strong className="text-zinc-200 font-mono font-semibold">
                            {formatUsdcDollar(bet.amount)}
                          </strong>
                        </span>
                        <span className="text-zinc-600">•</span>
                        <span>
                          Bet #{bet.betIndex.toString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Potential Return / Result & Action */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
                    <div className="text-left sm:text-right">
                      {isSettled ? (
                        isWon ? (
                          <div>
                            <span className="text-xs text-emerald-400 font-semibold flex items-center sm:justify-end gap-1">
                              <Trophy className="h-3 w-3" />
                              Won Payout
                            </span>
                            <p className="font-mono text-base font-extrabold text-emerald-400">
                              {formatUsdcDollar(bet.payout)}
                            </p>
                          </div>
                        ) : (
                          <div>
                            <span className="text-xs text-zinc-500">Result</span>
                            <p className="font-mono text-xs text-zinc-400">
                              Did not match
                            </p>
                          </div>
                        )
                      ) : (
                        <div>
                          <div className="flex items-center sm:justify-end gap-1.5 text-xs text-zinc-400">
                            <TrendingUp className="h-3 w-3 text-violet-400" />
                            <span>Potential Win</span>
                          </div>
                          <p className="font-mono text-base font-bold text-amber-300">
                            {formatUsdcDollar(potentialPayout)}
                            <span className="ml-1 text-xs font-normal text-zinc-500">
                              ({multiplier}x)
                            </span>
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Status Badge or Claim Action */}
                    <div>
                      {!isSettled && !isCancelled ? (
                        <div
                          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                            isDrawing
                              ? "bg-yellow-500/15 text-yellow-300 border border-yellow-500/20"
                              : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                          }`}
                        >
                          <span className="relative flex h-2 w-2">
                            <span
                              className={`absolute inline-flex h-full w-full animate-ping rounded-full ${
                                isDrawing ? "bg-yellow-400" : "bg-emerald-400"
                              } opacity-75`}
                            />
                            <span
                              className={`relative inline-flex h-2 w-2 rounded-full ${
                                isDrawing ? "bg-yellow-500" : "bg-emerald-500"
                              }`}
                            />
                          </span>
                          {isDrawing ? "Drawing…" : "In Play"}
                        </div>
                      ) : isWon ? (
                        bet.claimed ? (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-semibold text-zinc-400">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                            Claimed
                          </span>
                        ) : (
                          <button
                            onClick={() => handleClaim(bet)}
                            disabled={isClaimingThis}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-500 disabled:opacity-50 transition-all"
                          >
                            {isClaimingThis ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Claiming…
                              </>
                            ) : (
                              <>
                                <Coins className="h-3.5 w-3.5" />
                                Claim Winnings
                              </>
                            )}
                          </button>
                        )
                      ) : (
                        <span className="rounded-lg bg-white/5 px-2.5 py-1 text-xs font-medium text-zinc-500">
                          Closed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
