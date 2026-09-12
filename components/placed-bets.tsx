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
    <Card className="rounded-2xl border border-white/10 bg-[#0B0F1A]/90 p-6 sm:p-8 space-y-6 shadow-2xl shadow-black/80">
      {/* Header */}
      <CardHeader className="p-0 flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-600/15 border border-violet-500/30 text-violet-400 shadow-xl shadow-violet-600/20">
            <Ticket className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-xl sm:text-2xl font-hud font-bold text-white uppercase flex items-center gap-3 tracking-wide">
              Position Ledger
              {userBets.length > 0 && (
                <Badge
                  variant="default"
                  className="font-mono text-xs font-bold tabular-nums px-3 py-0.5 rounded-lg"
                >
                  {userBets.length} {userBets.length === 1 ? "position" : "positions"}
                </Badge>
              )}
            </CardTitle>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed font-sans">
              Onchain prediction orders, potential payouts, and smart settlement claims.
            </p>
          </div>
        </div>

        {/* Round Switcher & Refresh */}
        <div className="flex items-center gap-3 flex-wrap">
          {roundPhase !== undefined && (
            <Badge
              variant="outline"
              className={`font-mono text-xs font-bold border-white/10 bg-[#07090E] px-3 py-1.5 rounded-xl ${PHASE_COLORS[roundPhase]}`}
            >
              {PHASE_LABELS[roundPhase]}
            </Badge>
          )}

          {roundOptions.length > 1 ? (
            <select
              value={activeRoundId ? Number(activeRoundId) : ""}
              onChange={(e) => setSelectedRoundId(BigInt(e.target.value))}
              className="h-10 rounded-xl border border-white/10 bg-[#07090E] px-3.5 font-mono text-xs font-semibold text-slate-200 focus:border-violet-500 focus:outline-none shadow-sm cursor-pointer"
            >
              {roundOptions.map((r) => (
                <option key={r} value={r} className="bg-[#07090E] text-slate-200">
                  Round #{r} {currentRoundId && BigInt(r) === currentRoundId ? "(Current)" : ""}
                </option>
              ))}
            </select>
          ) : (
            <Badge variant="outline" className="h-10 px-3.5 rounded-xl font-mono text-xs font-semibold border-white/10 bg-[#07090E] text-slate-300 tabular-nums flex items-center">
              Round #{activeRoundId ? activeRoundId.toString() : "—"}
            </Badge>
          )}

          {totalRoundBets > 0 && (
            <span className="hidden sm:inline text-xs text-slate-500 font-mono tabular-nums px-1">
              ({totalRoundBets} pool {totalRoundBets === 1 ? "ticket" : "tickets"})
            </span>
          )}

          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            className="h-10 w-10 rounded-xl border-white/10 bg-[#07090E] text-slate-400 hover:text-white hover:border-violet-500/50"
            title="Refresh positions"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin text-violet-400" : ""}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0 space-y-4">
        {/* Unauthenticated State */}
        {!authenticated ? (
          <div className="rounded-2xl border border-white/10 bg-[#07090E] p-8 text-center space-y-3">
            <Ticket className="mx-auto h-8 w-8 text-slate-600" />
            <p className="text-base font-hud font-bold text-white uppercase tracking-wide">
              Wallet Required for Position Ledger
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed font-sans">
              Connect your Web3 wallet to inspect your active predictions and settle realized winnings.
            </p>
            <Button
              onClick={login}
              variant="default"
              className="mt-2 h-10 px-6 font-hud font-bold text-xs uppercase tracking-wider"
            >
              Connect Wallet
            </Button>
          </div>
        ) : isLoading && userBets.length === 0 ? (
          /* Loading Skeleton */
          <div className="space-y-3">
            <Skeleton className="h-12 w-full bg-white/5 rounded-xl" />
            <Skeleton className="h-20 w-full bg-white/5 rounded-xl" />
            <Skeleton className="h-20 w-full bg-white/5 rounded-xl" />
          </div>
        ) : userBets.length === 0 ? (
          /* Empty State */
          <div className="rounded-2xl border border-white/10 bg-[#07090E] p-8 text-center space-y-2.5 shadow-inner">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-slate-400 border border-white/10">
              <Dice5 className="h-6 w-6" />
            </div>
            <p className="text-sm font-hud font-bold text-white uppercase tracking-wide">
              No Positions in Round #{activeRoundId ? activeRoundId.toString() : "—"}
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed font-sans">
              No active predictions committed for this round cycle. Submit your numbers in the terminal above.
            </p>
          </div>
        ) : (
          /* User Bets List */
          <div className="space-y-4">
            {/* Summary Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#07090E] border border-white/10 px-5 py-3.5 text-xs shadow-inner">
              <div className="flex items-center gap-2.5 text-slate-400 font-mono">
                <span className="font-hud uppercase tracking-wider text-slate-300">Total Staked:</span>
                <span className="font-mono font-extrabold text-white text-sm tabular-nums">
                  {formatUsdcDollar(totalUserStaked)}
                </span>
              </div>

              {totalUserWinnings > 0n && (
                <div className="flex items-center gap-2 text-emerald-400 font-hud font-bold text-sm tabular-nums">
                  <Trophy className="h-4 w-4" />
                  <span>Realized Winnings: {formatUsdcDollar(totalUserWinnings)}</span>
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

                const badgeVariant: "gold" | "cyber" | "default" = isTrio
                  ? "gold"
                  : isPair
                    ? "cyber"
                    : isCloseMarket
                      ? "cyber"
                      : "default";

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
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#07090E] p-4 sm:p-5 hover:border-violet-500/30 transition-all shadow-inner"
                  >
                    {/* Left: Bet Info & Pick */}
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-[#0B0F1A] border border-white/10 text-center font-hud shadow-inner">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Pick</span>
                        <span className="text-xl sm:text-2xl font-extrabold text-white tabular-nums tracking-tight">
                          {formatPick(bet.betType, bet.pick)}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant={badgeVariant}
                            className="font-hud uppercase tracking-wider text-[11px] px-2.5 py-0.5"
                          >
                            {BET_TYPE_LABELS[bet.betType]}
                          </Badge>
                          {trioSubLabel && (
                            <Badge variant="outline" className="font-mono text-[10px] text-amber-300 border-amber-500/30 bg-amber-500/10 px-2 py-0.5 rounded-lg">
                              {trioSubLabel} ({multiplier}x)
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                          <span>
                            Stake:{" "}
                            <strong className="text-white font-mono font-bold tabular-nums">
                              {formatUsdcDollar(bet.amount)}
                            </strong>
                          </span>
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-500 tabular-nums">
                            Index #{bet.betIndex.toString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Potential Return / Result & Action */}
                    <div className="flex items-center justify-between sm:justify-end gap-5 border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0">
                      <div className="text-left sm:text-right font-mono">
                        {isSettled ? (
                          isWon ? (
                            <div>
                              <span className="text-xs text-emerald-400 font-hud font-bold uppercase flex items-center sm:justify-end gap-1">
                                <Trophy className="h-3.5 w-3.5" />
                                Won Payout
                              </span>
                              <p className="font-hud text-lg sm:text-xl font-extrabold text-emerald-400 tabular-nums text-glow-cyan">
                                {formatUsdcDollar(bet.payout)}
                              </p>
                            </div>
                          ) : isRefundable ? (
                            <div>
                              <span className="text-xs text-cyan-400 font-hud font-bold uppercase">Refund Due</span>
                              <p className="font-hud text-base font-extrabold text-cyan-300 tabular-nums">
                                {formatUsdcDollar(bet.amount)}
                              </p>
                            </div>
                          ) : (
                            <div>
                              <span className="text-xs text-slate-500 font-hud uppercase">Result</span>
                              <p className="text-xs text-slate-400 mt-0.5">
                                Did not hit
                              </p>
                            </div>
                          )
                        ) : isCancelled ? (
                          <div>
                            <span className="text-xs text-cyan-400 font-hud font-bold uppercase">Cancelled</span>
                            <p className="font-hud text-base font-extrabold text-cyan-300 tabular-nums">
                              {formatUsdcDollar(bet.amount)} Refund
                            </p>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center sm:justify-end gap-1.5 text-xs text-slate-400">
                              <TrendingUp className="h-3.5 w-3.5 text-violet-400" />
                              <span className="font-hud uppercase text-[10px] font-bold text-slate-400">Projected Return</span>
                            </div>
                            <p className="font-hud text-base sm:text-lg font-extrabold text-amber-300 tabular-nums text-glow-gold">
                              {formatUsdcDollar(potentialPayout)}
                              <span className="ml-1.5 text-xs font-semibold text-slate-500 font-mono">
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
                            className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-hud font-bold uppercase tracking-wider ${
                              isDrawing
                                ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                                : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            }`}
                          >
                            <span className="relative flex h-2 w-2">
                              <span
                                className={`absolute inline-flex h-full w-full animate-ping rounded-full ${
                                  isDrawing ? "bg-amber-400" : "bg-emerald-400"
                                } opacity-75`}
                              />
                              <span
                                className={`relative inline-flex h-2 w-2 rounded-full ${
                                  isDrawing ? "bg-amber-500" : "bg-emerald-500"
                                }`}
                              />
                            </span>
                            {isDrawing ? "Drawing…" : "In Escrow"}
                          </div>
                        ) : isWon ? (
                          bet.claimed ? (
                            <Badge variant="outline" className="border-white/10 bg-white/5 text-slate-400 gap-1.5 text-xs py-1.5 px-3 rounded-xl font-hud uppercase">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                              Claimed
                            </Badge>
                          ) : (
                            <Button
                              variant="gold"
                              onClick={() => handleClaim(bet)}
                              disabled={isClaimingThis}
                              className="h-10 px-4 rounded-xl font-hud font-bold text-xs uppercase tracking-wider gap-1.5 shadow-xl"
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
                            <Badge variant="outline" className="border-white/10 bg-white/5 text-slate-400 gap-1.5 text-xs py-1.5 px-3 rounded-xl font-hud uppercase">
                              <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
                              Refund Claimed
                            </Badge>
                          ) : (
                            <Button
                              variant="cyber"
                              onClick={() => handleClaim(bet)}
                              disabled={isClaimingThis}
                              className="h-10 px-4 rounded-xl font-hud font-bold text-xs uppercase tracking-wider gap-1.5 shadow-xl"
                            >
                              {isClaimingThis ? (
                                <>
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  Refunding…
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
                          <Badge variant="outline" className="border-white/10 bg-[#07090E] text-slate-500 text-xs py-1.5 px-3 rounded-xl font-hud uppercase">
                            Settled
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
