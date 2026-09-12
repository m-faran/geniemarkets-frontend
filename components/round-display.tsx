"use client";

import { useCurrentRound, formatCountdown } from "@/hooks/use-current-round";
import { useRoundActions } from "@/hooks/use-round-actions";
import { RoundPhase, PHASE_LABELS, PHASE_COLORS } from "@/lib/utils";
import { usePrivy } from "@privy-io/react-auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
  Zap,
  Sparkles,
  AlertTriangle,
  Flame,
} from "lucide-react";

function DigitOrb({ digit, revealed }: { digit: number; revealed: boolean }) {
  return (
    <div
      className={`flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl font-mono text-2xl sm:text-3xl font-extrabold tabular-nums transition-all duration-700 ${
        revealed
          ? "scale-100 bg-gradient-to-br from-violet-500 to-purple-700 text-white shadow-lg shadow-violet-500/30 ring-1 ring-violet-400/40"
          : "scale-90 bg-zinc-900/60 text-zinc-600 border border-zinc-800"
      }`}
    >
      {revealed ? digit : "?"}
    </div>
  );
}

function PhaseIndicator({ phase }: { phase: RoundPhase }) {
  const steps = [
    { label: "Open Market", phases: [RoundPhase.OpenBetting, RoundPhase.OpenPending] },
    {
      label: "Close Market",
      phases: [RoundPhase.CloseBetting, RoundPhase.ClosePending],
    },
    { label: "Settled", phases: [RoundPhase.Settled] },
  ];

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
      {steps.map((s, i) => {
        const isActive = s.phases.includes(phase);
        const isPast =
          s.phases[0] < phase &&
          phase !== RoundPhase.Cancelled &&
          phase !== RoundPhase.PartiallySettled;

        return (
          <div key={s.label} className="flex items-center gap-1.5 sm:gap-2">
            <div
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                isActive
                  ? "bg-violet-600/20 text-violet-400 ring-1 ring-violet-500/30"
                  : isPast
                    ? "bg-emerald-600/10 text-emerald-400"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-500"
              }`}
            >
              {isPast && <CheckCircle2 className="h-3 w-3" />}
              {isActive && (
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
                </span>
              )}
              {s.label}
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-px w-4 sm:w-6 ${isPast ? "bg-emerald-500/30" : "bg-zinc-800"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function RoundDisplay() {
  const {
    roundId,
    round,
    prevRoundId,
    previousRound,
    openTimeRemaining,
    closeTimeRemaining,
    isCloseCutoffPassed,
    isOpenBettingActive,
    isCloseBettingActive,
    isOpenDrawReady,
    isCloseDrawReady,
    isEmergencyStale,
    refetch,
  } = useCurrentRound();

  const { authenticated } = usePrivy();
  const {
    requestOpenDraw,
    requestCloseDraw,
    cancelStaleRound,
    step: actionStep,
    error: actionError,
    reset: resetAction,
  } = useRoundActions(refetch);

  if (!round || roundId === undefined) {
    return (
      <Card className="bg-zinc-900/60 border-zinc-800 p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28 bg-zinc-800/50" />
            <Skeleton className="h-8 w-24 bg-zinc-800/50" />
          </div>
          <Skeleton className="h-6 w-28 rounded-full bg-zinc-800/50" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Skeleton className="h-24 rounded-xl bg-zinc-800/50" />
          <Skeleton className="h-24 rounded-xl bg-zinc-800/50" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-28 rounded-xl bg-zinc-800/50" />
          <Skeleton className="h-28 rounded-xl bg-zinc-800/50" />
        </div>
      </Card>
    );
  }

  const showOpenDigits =
    round.phase >= RoundPhase.CloseBetting &&
    round.phase !== RoundPhase.Cancelled;
  const showCloseDigits =
    round.phase >= RoundPhase.Settled &&
    round.phase !== RoundPhase.PartiallySettled;
  const isCancelled = round.phase === RoundPhase.Cancelled;
  const isPartiallySettled = round.phase === RoundPhase.PartiallySettled;

  return (
    <div className="space-y-4">
      <Card className="bg-zinc-900/60 border-zinc-800 p-6 shadow-xl backdrop-blur-sm space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-zinc-400">Current Round</span>
              {isCloseCutoffPassed && round.phase === RoundPhase.OpenBetting && (
                <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-[10px] text-amber-400 font-semibold">
                  Draw Overdue
                </Badge>
              )}
            </div>
            <p className="font-mono text-3xl font-extrabold text-white tracking-tight tabular-nums">
              #{roundId.toString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Lifecycle Status</p>
            <Badge
              variant="outline"
              className={`mt-1 font-mono text-xs font-bold border-zinc-800 ${PHASE_COLORS[round.phase]}`}
            >
              {PHASE_LABELS[round.phase]}
            </Badge>
          </div>
        </div>

        {/* Phase Progress Indicator */}
        <PhaseIndicator phase={round.phase} />

        {/* Dual Timers Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Open Market Timer Card */}
          <div
            className={`rounded-xl border p-4 transition-all ${
              isOpenBettingActive
                ? "border-violet-500/30 bg-violet-500/5"
                : isOpenDrawReady
                  ? "border-amber-500/30 bg-amber-500/5"
                  : "border-zinc-800 bg-zinc-950/40"
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <Clock className="h-3.5 w-3.5 text-violet-400" />
                Open Market Cutoff
              </span>
              <span
                className={
                  isOpenBettingActive
                    ? "text-emerald-400"
                    : isOpenDrawReady
                      ? "text-amber-400"
                      : "text-zinc-500"
                }
              >
                {isOpenBettingActive ? "Betting Open" : isOpenDrawReady ? "Draw Due" : "Cutoff Passed"}
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold text-white tabular-nums">
                {isOpenBettingActive ? formatCountdown(openTimeRemaining) : "00:00"}
              </span>
              <span className="text-xs text-zinc-500">
                {isOpenBettingActive ? "remaining to bet" : "cutoff elapsed"}
              </span>
            </div>
          </div>

          {/* Close Market Timer Card */}
          <div
            className={`rounded-xl border p-4 transition-all ${
              isCloseBettingActive
                ? "border-blue-500/30 bg-blue-500/5"
                : isCloseDrawReady
                  ? "border-amber-500/30 bg-amber-500/5"
                  : "border-zinc-800 bg-zinc-950/40"
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <Clock className="h-3.5 w-3.5 text-blue-400" />
                Close Market Cutoff
              </span>
              <span
                className={
                  isCloseBettingActive
                    ? "text-blue-400"
                    : isCloseDrawReady
                      ? "text-amber-400"
                      : "text-zinc-500"
                }
              >
                {isCloseBettingActive ? "Betting Open" : isCloseDrawReady ? "Settlement Due" : "Cutoff Passed"}
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold text-white tabular-nums">
                {isCloseBettingActive ? formatCountdown(closeTimeRemaining) : "00:00"}
              </span>
              <span className="text-xs text-zinc-500">
                {isCloseBettingActive ? "remaining to bet" : "cutoff elapsed"}
              </span>
            </div>
          </div>
        </div>

        {/* Draw / Settlement Action Trigger Bar */}
        {(isOpenDrawReady || isCloseDrawReady || isEmergencyStale) && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-amber-300">
                  <Flame className="h-4 w-4 text-amber-400" />
                  {isOpenDrawReady
                    ? "Open Draw Ready to Trigger"
                    : isCloseDrawReady
                      ? "Close Draw & Settlement Ready"
                      : "Emergency VRF Recovery Available"}
                </div>
                <p className="mt-0.5 text-xs text-zinc-300">
                  {isOpenDrawReady
                    ? "The betting cutoff has passed. Anyone can trigger Chainlink VRF to reveal Open digits."
                    : isCloseDrawReady
                      ? "Close cutoff elapsed. Trigger the final VRF draw to settle bets and advance to the next round."
                      : "VRF request exceeded 24h timeout. Trigger emergency cancel/settlement."}
                </p>
              </div>

              <div>
                {isOpenDrawReady && (
                  <Button
                    onClick={() => requestOpenDraw(roundId)}
                    disabled={actionStep === "submitting" || !authenticated}
                    size="sm"
                    className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-black font-bold"
                  >
                    {actionStep === "submitting" ? (
                      <>
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        Requesting VRF…
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                        {authenticated ? "Trigger Open Draw" : "Sign In to Trigger"}
                      </>
                    )}
                  </Button>
                )}

                {isCloseDrawReady && (
                  <Button
                    onClick={() => requestCloseDraw(roundId)}
                    disabled={actionStep === "submitting" || !authenticated}
                    size="sm"
                    className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-black font-bold"
                  >
                    {actionStep === "submitting" ? (
                      <>
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        Settling Round…
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                        {authenticated ? "Settle Round" : "Sign In to Settle"}
                      </>
                    )}
                  </Button>
                )}

                {isEmergencyStale && !isOpenDrawReady && !isCloseDrawReady && (
                  <Button
                    onClick={() => cancelStaleRound(roundId)}
                    disabled={actionStep === "submitting" || !authenticated}
                    size="sm"
                    variant="destructive"
                    className="w-full sm:w-auto font-bold"
                  >
                    {actionStep === "submitting" ? (
                      <>
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        Cancelling…
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />
                        Recover Stale Round
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {actionError && (
              <div className="flex items-center justify-between text-xs text-red-400 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                <span>{actionError}</span>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={resetAction}
                  className="text-red-300 hover:text-white"
                >
                  Dismiss
                </Button>
              </div>
            )}
          </div>
        )}

        {/* VRF Pending Notice */}
        {(round.phase === RoundPhase.OpenPending || round.phase === RoundPhase.ClosePending) && (
          <div className="flex items-center justify-center gap-3 rounded-xl bg-yellow-400/10 border border-yellow-400/20 py-4">
            <Loader2 className="h-5 w-5 animate-spin text-yellow-400" />
            <span className="text-sm font-semibold text-yellow-300">
              {round.phase === RoundPhase.OpenPending
                ? "Chainlink VRF is drawing Open digits…"
                : "Chainlink VRF is drawing Close digits and settling round…"}
            </span>
          </div>
        )}

        {/* Cancelled Notice */}
        {isCancelled && (
          <div className="flex items-center justify-center gap-3 rounded-xl bg-red-400/10 border border-red-400/20 py-4">
            <XCircle className="h-5 w-5 text-red-400" />
            <span className="text-sm font-semibold text-red-300">
              Round cancelled due to stale VRF — claim full refunds below.
            </span>
          </div>
        )}

        {/* Partially Settled Notice */}
        {isPartiallySettled && (
          <div className="flex items-center justify-center gap-3 rounded-xl bg-orange-400/10 border border-orange-400/20 py-4">
            <AlertTriangle className="h-5 w-5 text-orange-400" />
            <span className="text-sm font-semibold text-orange-300">
              Partially settled — Open winners can claim; Close & Pair wagers refunded.
            </span>
          </div>
        )}

        {/* Digit Displays */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Open Draw */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
            <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-zinc-300">
              <Zap className="h-3.5 w-3.5 text-violet-400" />
              Open Draw Digits
            </p>
            <div className="flex gap-2">
              <DigitOrb digit={round.openD1} revealed={showOpenDigits} />
              <DigitOrb digit={round.openD2} revealed={showOpenDigits} />
              <DigitOrb digit={round.openD3} revealed={showOpenDigits} />
            </div>
            {showOpenDigits ? (
              <p className="mt-3 text-xs text-zinc-400">
                Derived Open Single:{" "}
                <span className="font-mono text-sm font-bold text-violet-400 tabular-nums">
                  {round.openSingle}
                </span>
              </p>
            ) : (
              <p className="mt-3 text-xs text-zinc-500 font-mono">Awaiting Open VRF fulfillment</p>
            )}
          </div>

          {/* Close Draw */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
            <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-zinc-300">
              <Zap className="h-3.5 w-3.5 text-blue-400" />
              Close Draw Digits
            </p>
            <div className="flex gap-2">
              <DigitOrb digit={round.closeD1} revealed={showCloseDigits} />
              <DigitOrb digit={round.closeD2} revealed={showCloseDigits} />
              <DigitOrb digit={round.closeD3} revealed={showCloseDigits} />
            </div>
            {showCloseDigits ? (
              <p className="mt-3 text-xs text-zinc-400">
                Derived Close Single:{" "}
                <span className="font-mono text-sm font-bold text-blue-400 tabular-nums">
                  {round.closeSingle}
                </span>
              </p>
            ) : (
              <p className="mt-3 text-xs text-zinc-500 font-mono">Awaiting Close VRF fulfillment</p>
            )}
          </div>
        </div>

        {/* Pair Result (only when settled) */}
        {round.phase === RoundPhase.Settled && (
          <div className="flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-blue-500/10 border border-violet-500/20 py-4">
            <span className="text-sm font-medium text-zinc-300">Winning Pair Result:</span>
            <span className="font-mono text-3xl font-extrabold text-amber-400 tracking-wider tabular-nums">
              {round.pairResult.toString().padStart(2, "0")}
            </span>
          </div>
        )}
      </Card>

      {/* Previous Round Summary Card */}
      {prevRoundId && previousRound && previousRound.phase === RoundPhase.Settled && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 px-5 py-3 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 font-medium">Last Settled:</span>
              <span className="font-mono font-bold text-white tabular-nums">Round #{prevRoundId.toString()}</span>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                Settled
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-zinc-300 font-mono tabular-nums">
              <span>
                Open: <span className="font-semibold text-violet-400">{previousRound.openD1}-{previousRound.openD2}-{previousRound.openD3}</span> (Single: {previousRound.openSingle})
              </span>
              <span>
                Close: <span className="font-semibold text-blue-400">{previousRound.closeD1}-{previousRound.closeD2}-{previousRound.closeD3}</span> (Single: {previousRound.closeSingle})
              </span>
              <span>
                Pair: <span className="font-bold text-amber-400">{previousRound.pairResult.toString().padStart(2, "0")}</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
