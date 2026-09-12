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
    <Card className="bg-zinc-900/60 border-zinc-800 p-6 space-y-5">
      {/* Header */}
      <CardHeader className="p-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-violet-600/20 p-2 text-violet-400 border border-violet-500/20">
            <Ticket className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2 tracking-tight">
              Your Placed Bets
              {userBets.length > 0 && (
                <Badge
                  variant="outline"
                  className="font-mono text-xs font-bold border-violet-500/30 bg-violet-500/10 text-violet-300 tabular-nums"
                >
                  {userBets.length} {userBets.length === 1 ? "bet" : "bets"}
                </Badge>
              )}
            </CardTitle>
            <p className="text-xs text-zinc-400 mt-0.5">
              Track your predictions, potential payouts, and round outcomes.
            </p>
          </div>
        </div>

        {/* Round Switcher & Refresh */}
        <div className="flex items-center gap-2">
          {roundPhase !== undefined && (
            <Badge
              variant="outline"
              className={`font-mono text-[10px] font-bold border-zinc-800 bg-zinc-950/60 ${PHASE_COLORS[roundPhase]}`}
            >
              {PHASE_LABELS[roundPhase]}
            </Badge>
          )}

          {roundOptions.length > 1 ? (
            <select
              value={activeRoundId ? Number(activeRoundId) : ""}
              onChange={(e) => setSelectedRoundId(BigInt(e.target.value))}
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 font-mono text-xs font-medium text-zinc-300 focus:border-violet-500 focus:outline-none"
            >
              {roundOptions.map((r) => (
                <option key={r} value={r}>
                  Round #{r} {currentRoundId && BigInt(r) === currentRoundId ? "(Current)" : ""}
                </option>
              ))}
            </select>
          ) : (
            <Badge variant="outline" className="font-mono text-xs border-zinc-800 bg-zinc-950/60 text-zinc-400 tabular-nums">
              Round #{activeRoundId ? activeRoundId.toString() : "—"}
            </Badge>
          )}

          {totalRoundBets > 0 && (
            <span className="hidden sm:inline text-[11px] text-zinc-500 font-mono tabular-nums">
              ({totalRoundBets} pool {totalRoundBets === 1 ? "bet" : "bets"})
            </span>
          )}

          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => refetch()}
            className="border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:text-white hover:bg-zinc-800"
            title="Refresh your bets"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-violet-400" : ""}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0 space-y-4">
        {/* Unauthenticated State */}
        {!authenticated ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-8 text-center space-y-3">
            <Ticket className="mx-auto h-8 w-8 text-zinc-600" />
            <p className="text-sm font-semibold text-white">Sign In to View Your Bets</p>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Connect your wallet to see all active predictions and track your potential winnings for this round.
            </p>
            <Button
              onClick={login}
              size="sm"
              className="mt-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-md shadow-violet-600/25"
            >
              Sign In with Wallet
            </Button>
          </div>
        ) : isLoading && userBets.length === 0 ? (
          /* Content-Shaped Loading Skeleton */
          <div className="space-y-3">
            <Skeleton className="h-10 w-full bg-zinc-800/50 rounded-xl" />
            <Skeleton className="h-20 w-full bg-zinc-800/50 rounded-xl" />
            <Skeleton className="h-20 w-full bg-zinc-800/50 rounded-xl" />
          </div>
        ) : userBets.length === 0 ? (
          /* Empty State */
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-8 text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-zinc-500 border border-zinc-800">
              <Dice5 className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-white font-mono">
              No Bets in Round #{activeRoundId ? activeRoundId.toString() : "—"}
            </p>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              You haven&apos;t placed any predictions for this round yet. Use the Bet Panel above to submit your picks.
            </p>
          </div>
        ) : (
          /* User Bets List */
          <div className="space-y-4">
            {/* Summary Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-zinc-950/60 border border-zinc-800 px-4 py-2.5 text-xs">
              <div className="flex items-center gap-2 text-zinc-400">
                <span>Total Staked in Round:</span>
                <span className="font-mono font-bold text-white tabular-nums">
                  {formatUsdcDollar(totalUserStaked)}
                </span>
              </div>

              {totalUserWinnings > 0n && (
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold font-mono tabular-nums">
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
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 hover:border-zinc-700 transition-all"
                  >
                    {/* Left: Bet Info & Pick */}
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-center font-mono">
                        <span className="text-[9px] font-bold text-zinc-500 uppercase">Pick</span>
                        <span className="text-base font-extrabold text-white tabular-nums">
                          {formatPick(bet.betType, bet.pick)}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`font-mono text-[10px] font-bold ${badgeColor}`}
                          >
                            {BET_TYPE_LABELS[bet.betType]}
                          </Badge>
                          {trioSubLabel && (
                            <Badge variant="outline" className="border-zinc-800 font-mono text-[10px] text-zinc-300">
                              {trioSubLabel} ({multiplier}x)
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-zinc-400">
                          <span>
                            Wager:{" "}
                            <strong className="text-zinc-200 font-mono font-semibold tabular-nums">
                              {formatUsdcDollar(bet.amount)}
                            </strong>
                          </span>
                          <span className="text-zinc-600">•</span>
                          <span className="font-mono tabular-nums">
                            Bet #{bet.betIndex.toString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Potential Return / Result & Action */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-zinc-800 pt-3 sm:pt-0">
                      <div className="text-left sm:text-right">
                        {isSettled ? (
                          isWon ? (
                            <div>
                              <span className="text-xs text-emerald-400 font-semibold flex items-center sm:justify-end gap-1">
                                <Trophy className="h-3 w-3" />
                                Won Payout
                              </span>
                              <p className="font-mono text-base font-extrabold text-emerald-400 tabular-nums">
                                {formatUsdcDollar(bet.payout)}
                              </p>
                            </div>
                          ) : isRefundable ? (
                            <div>
                              <span className="text-xs text-cyan-400 font-semibold">Refund Due</span>
                              <p className="font-mono text-sm font-bold text-cyan-300 tabular-nums">
                                {formatUsdcDollar(bet.amount)}
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
                        ) : isCancelled ? (
                          <div>
                            <span className="text-xs text-cyan-400 font-semibold">Round Cancelled</span>
                            <p className="font-mono text-sm font-bold text-cyan-300 tabular-nums">
                              {formatUsdcDollar(bet.amount)} Refund
                            </p>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center sm:justify-end gap-1.5 text-xs text-zinc-400">
                              <TrendingUp className="h-3 w-3 text-violet-400" />
                              <span>Potential Win</span>
                            </div>
                            <p className="font-mono text-base font-bold text-amber-300 tabular-nums">
                              {formatUsdcDollar(potentialPayout)}
                              <span className="ml-1 text-xs font-normal text-zinc-500 tabular-nums">
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
                            <Badge variant="outline" className="border-zinc-800 bg-zinc-900 text-zinc-400 gap-1 text-xs py-1">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                              Claimed
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleClaim(bet)}
                              disabled={isClaimingThis}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-1.5 shadow-md shadow-emerald-600/25"
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
                            <Badge variant="outline" className="border-zinc-800 bg-zinc-900 text-zinc-400 gap-1 text-xs py-1">
                              <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
                              Refund Claimed
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleClaim(bet)}
                              disabled={isClaimingThis}
                              className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold gap-1.5 shadow-md shadow-cyan-600/25"
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
                          <Badge variant="outline" className="border-zinc-800 text-zinc-500 text-xs py-1">
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
