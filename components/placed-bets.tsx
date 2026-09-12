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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
    <Card className="rounded-2xl bg-zinc-900/60 border-zinc-800/90 p-7 sm:p-8 space-y-7 shadow-xl shadow-black/20">
      {/* Header */}
      <CardHeader className="p-0 flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-zinc-800/80 pb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-600/15 border border-violet-500/30 text-violet-400 shadow-xl shadow-violet-600/20">
            <Ticket className="h-7 w-7" />
          </div>
          <div>
            <CardTitle className="text-2xl sm:text-3xl font-extrabold text-white font-heading flex items-center gap-3 tracking-tight">
              Your Placed Bets
              {userBets.length > 0 && (
                <Badge
                  variant="outline"
                  className="font-mono text-xs font-bold border-violet-500/30 bg-violet-500/15 text-violet-300 tabular-nums px-3 py-1 rounded-xl"
                >
                  {userBets.length} {userBets.length === 1 ? "bet" : "bets"}
                </Badge>
              )}
            </CardTitle>
            <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">
              Track your predictions, potential payouts, and round outcomes.
            </p>
          </div>
        </div>

        {/* Round Switcher & Refresh */}
        <div className="flex items-center gap-3 flex-wrap">
          {roundPhase !== undefined && (
            <Badge
              variant="outline"
              className={`font-mono text-xs font-bold border-zinc-800 bg-zinc-950/90 px-3 py-1.5 rounded-xl ${PHASE_COLORS[roundPhase]}`}
            >
              {PHASE_LABELS[roundPhase]}
            </Badge>
          )}

          {roundOptions.length > 1 ? (
            <select
              value={activeRoundId ? Number(activeRoundId) : ""}
              onChange={(e) => setSelectedRoundId(BigInt(e.target.value))}
              className="h-10 rounded-xl border border-zinc-800/90 bg-zinc-950/90 px-3.5 font-mono text-xs font-semibold text-zinc-200 focus:border-violet-500 focus:outline-none shadow-sm cursor-pointer"
            >
              {roundOptions.map((r) => (
                <option key={r} value={r}>
                  Round #{r} {currentRoundId && BigInt(r) === currentRoundId ? "(Current)" : ""}
                </option>
              ))}
            </select>
          ) : (
            <Badge variant="outline" className="h-10 px-3.5 rounded-xl font-mono text-xs font-semibold border-zinc-800 bg-zinc-950/80 text-zinc-300 tabular-nums flex items-center">
              Round #{activeRoundId ? activeRoundId.toString() : "—"}
            </Badge>
          )}

          {totalRoundBets > 0 && (
            <span className="hidden sm:inline text-xs text-zinc-400 font-mono tabular-nums px-1">
              ({totalRoundBets} pool {totalRoundBets === 1 ? "bet" : "bets"})
            </span>
          )}

          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            className="h-10 w-10 rounded-xl border-zinc-800 bg-zinc-950/80 text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 transition-colors"
            title="Refresh your bets"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin text-violet-400" : ""}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0 space-y-4">
        {/* Unauthenticated State */}
        {!authenticated ? (
          <div className="rounded-2xl border border-zinc-800/90 bg-zinc-950/60 p-8 text-center space-y-3">
            <Ticket className="mx-auto h-8 w-8 text-zinc-600" />
            <p className="text-base font-bold text-white font-heading">Sign In to View Your Bets</p>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
              Connect your wallet to see all active predictions and track your potential winnings for this round.
            </p>
            <Button
              onClick={login}
              className="mt-2 h-10 px-5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-heading font-bold text-xs shadow-lg shadow-violet-600/25"
            >
              Sign In with Wallet
            </Button>
          </div>
        ) : isLoading && userBets.length === 0 ? (
          /* Content-Shaped Loading Skeleton */
          <div className="space-y-3">
            <Skeleton className="h-12 w-full bg-zinc-800/50 rounded-xl" />
            <Skeleton className="h-20 w-full bg-zinc-800/50 rounded-xl" />
            <Skeleton className="h-20 w-full bg-zinc-800/50 rounded-xl" />
          </div>
        ) : userBets.length === 0 ? (
          /* Empty State */
          <div className="rounded-2xl border border-zinc-800/90 bg-zinc-950/60 p-8 text-center space-y-2.5">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-zinc-400 border border-zinc-800 shadow-inner">
              <Dice5 className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-white font-heading">
              No Bets in Round #{activeRoundId ? activeRoundId.toString() : "—"}
            </p>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
              You haven&apos;t placed any predictions for this round yet. Use the Bet Panel above to submit your picks.
            </p>
          </div>
        ) : (
          /* User Bets List */
          <div className="space-y-4">
            {/* Summary Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-zinc-950/80 border border-zinc-800/90 px-5 py-3 text-xs shadow-sm">
              <div className="flex items-center gap-2.5 text-zinc-400">
                <span className="font-heading font-medium text-zinc-300">Total Staked in Round:</span>
                <span className="font-mono font-extrabold text-white text-sm tabular-nums">
                  {formatUsdcDollar(totalUserStaked)}
                </span>
              </div>

              {totalUserWinnings > 0n && (
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold font-mono text-sm tabular-nums">
                  <Trophy className="h-4 w-4" />
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
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                  : isPair
                    ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
                    : isCloseMarket
                      ? "border-blue-500/30 bg-blue-500/10 text-blue-300"
                      : "border-violet-500/30 bg-violet-500/10 text-violet-300";

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
                const isPartiallySettled = currentPhase === RoundPhase.PartiallySettled;
                const isDrawing =
                  currentPhase === RoundPhase.OpenPending ||
                  currentPhase === RoundPhase.ClosePending;
                const isWon = bet.payout > 0n;
                const isRefundable =
                  isCancelled ||
                  (isPartiallySettled &&
                    (bet.betType === BetType.CloseSingle ||
                      bet.betType === BetType.CloseTrio ||
                      bet.betType === BetType.Pair));
                const isClaimingThis =
                  claimingBetIndex === bet.betIndex && claimStep === "claiming";

                return (
                  <div
                    key={`${bet.roundId.toString()}-${bet.betIndex.toString()}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-zinc-800/90 bg-zinc-950/70 p-4 sm:p-5 hover:border-violet-500/30 hover:bg-zinc-950/90 transition-all shadow-sm"
                  >
                    {/* Left: Bet Info & Pick */}
                    <div className="flex items-center gap-4">
                      <div className="flex h-13 w-13 sm:h-14 sm:w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-zinc-900/90 border border-zinc-700/60 text-center font-mono shadow-inner">
                        <span className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider">Pick</span>
                        <span className="text-lg sm:text-xl font-black text-white tabular-nums tracking-tight">
                          {formatPick(bet.betType, bet.pick)}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className={`font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-lg ${badgeColor}`}
                          >
                            {BET_TYPE_LABELS[bet.betType]}
                          </Badge>
                          {trioSubLabel && (
                            <Badge variant="outline" className="border-zinc-800 bg-zinc-900/60 font-mono text-[10px] text-zinc-300 px-2 py-0.5 rounded-lg">
                              {trioSubLabel} ({multiplier}x)
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-zinc-400">
                          <span>
                            Wager:{" "}
                            <strong className="text-zinc-100 font-mono font-bold tabular-nums">
                              {formatUsdcDollar(bet.amount)}
                            </strong>
                          </span>
                          <span className="text-zinc-600">•</span>
                          <span className="font-mono text-zinc-400 tabular-nums">
                            Bet #{bet.betIndex.toString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Potential Return / Result & Action */}
                    <div className="flex items-center justify-between sm:justify-end gap-5 border-t sm:border-t-0 border-zinc-800/80 pt-3 sm:pt-0">
                      <div className="text-left sm:text-right">
                        {isSettled ? (
                          isWon ? (
                            <div>
                              <span className="text-xs text-emerald-400 font-bold flex items-center sm:justify-end gap-1">
                                <Trophy className="h-3.5 w-3.5" />
                                Won Payout
                              </span>
                              <p className="font-mono text-lg font-black text-emerald-400 tabular-nums">
                                {formatUsdcDollar(bet.payout)}
                              </p>
                            </div>
                          ) : isRefundable ? (
                            <div>
                              <span className="text-xs text-cyan-400 font-bold">Refund Due</span>
                              <p className="font-mono text-base font-extrabold text-cyan-300 tabular-nums">
                                {formatUsdcDollar(bet.amount)}
                              </p>
                            </div>
                          ) : (
                            <div>
                              <span className="text-xs text-zinc-500 font-medium">Result</span>
                              <p className="font-mono text-xs text-zinc-400 mt-0.5">
                                Did not match
                              </p>
                            </div>
                          )
                        ) : isCancelled ? (
                          <div>
                            <span className="text-xs text-cyan-400 font-bold">Round Cancelled</span>
                            <p className="font-mono text-base font-extrabold text-cyan-300 tabular-nums">
                              {formatUsdcDollar(bet.amount)} Refund
                            </p>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center sm:justify-end gap-1.5 text-xs text-zinc-400">
                              <TrendingUp className="h-3.5 w-3.5 text-violet-400" />
                              <span className="font-medium">Potential Win</span>
                            </div>
                            <p className="font-mono text-base sm:text-lg font-black text-amber-300 tabular-nums">
                              {formatUsdcDollar(potentialPayout)}
                              <span className="ml-1.5 text-xs font-semibold text-zinc-500 tabular-nums">
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
                            className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold ${
                              isDrawing
                                ? "bg-yellow-500/15 text-yellow-300 border border-yellow-500/30"
                                : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
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
                            <Badge variant="outline" className="border-zinc-800 bg-zinc-900 text-zinc-400 gap-1.5 text-xs py-1.5 px-3 rounded-xl">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                              Claimed
                            </Badge>
                          ) : (
                            <Button
                              onClick={() => handleClaim(bet)}
                              disabled={isClaimingThis}
                              className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-heading font-bold text-xs gap-1.5 shadow-lg shadow-emerald-600/25"
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
                            </Button>
                          )
                        ) : isRefundable ? (
                          bet.claimed ? (
                            <Badge variant="outline" className="border-zinc-800 bg-zinc-900 text-zinc-400 gap-1.5 text-xs py-1.5 px-3 rounded-xl">
                              <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
                              Refund Claimed
                            </Badge>
                          ) : (
                            <Button
                              onClick={() => handleClaim(bet)}
                              disabled={isClaimingThis}
                              className="h-10 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-heading font-bold text-xs gap-1.5 shadow-lg shadow-cyan-600/25"
                            >
                              {isClaimingThis ? (
                                <>
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  Claiming…
                                </>
                              ) : (
                                <>
                                  <Coins className="h-3.5 w-3.5" />
                                  Claim Refund
                                </>
                              )}
                            </Button>
                          )
                        ) : (
                          <Badge variant="outline" className="border-zinc-800 bg-zinc-900/60 text-zinc-500 text-xs py-1.5 px-3 rounded-xl">
                            Closed
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
