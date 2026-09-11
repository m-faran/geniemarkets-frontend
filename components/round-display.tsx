"use client";

import { useCurrentRound, formatCountdown } from "@/hooks/use-current-round";
import { useRoundActions } from "@/hooks/use-round-actions";
import { RoundPhase, PHASE_LABELS, PHASE_COLORS } from "@/lib/utils";
import { usePrivy } from "@privy-io/react-auth";
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
      className={`flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl text-2xl sm:text-3xl font-bold transition-all duration-700 ${
        revealed
          ? "scale-100 bg-gradient-to-br from-violet-500 to-purple-700 text-white shadow-lg shadow-violet-500/30 ring-1 ring-violet-400/40"
          : "scale-90 bg-white/5 text-zinc-600 border border-white/5"
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
                    ? "bg-green-600/10 text-green-500"
                    : "bg-white/5 text-zinc-600"
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
                className={`h-px w-4 sm:w-6 ${isPast ? "bg-green-500/30" : "bg-white/10"}`}
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
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
      </div>
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
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-6 shadow-xl backdrop-blur-sm">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-zinc-400">Current Round</span>
              {isCloseCutoffPassed && round.phase === RoundPhase.OpenBetting && (
                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 ring-1 ring-amber-500/20">
                  Draw Overdue
                </span>
              )}
            </div>
            <p className="text-3xl font-extrabold text-white tracking-tight">#{roundId.toString()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-zinc-500">Lifecycle Status</p>
            <p className={`text-sm font-bold ${PHASE_COLORS[round.phase]}`}>
              {PHASE_LABELS[round.phase]}
            </p>
          </div>
        </div>

        {/* Phase Progress */}
        <PhaseIndicator phase={round.phase} />

        {/* Dual Timers Grid */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Open Market Timer Card */}
          <div className={`rounded-xl border p-4 transition-all ${
            isOpenBettingActive
              ? "border-violet-500/30 bg-violet-500/5"
              : isOpenDrawReady
                ? "border-amber-500/30 bg-amber-500/5"
                : "border-white/5 bg-white/[0.02]"
          }`}>
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1 text-zinc-300">
                <Clock className="h-3.5 w-3.5 text-violet-400" />
                Open Market Cutoff
              </span>
              <span className={
                isOpenBettingActive
                  ? "text-green-400"
                  : isOpenDrawReady
                    ? "text-amber-400"
                    : "text-zinc-500"
              }>
                {isOpenBettingActive ? "Betting Open" : isOpenDrawReady ? "Draw Due" : "Cutoff Passed"}
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold text-white">
                {isOpenBettingActive ? formatCountdown(openTimeRemaining) : "00:00"}
              </span>
              <span className="text-xs text-zinc-500">
                {isOpenBettingActive ? "remaining to bet" : "cutoff elapsed"}
              </span>
            </div>
          </div>

          {/* Close Market Timer Card */}
          <div className={`rounded-xl border p-4 transition-all ${
            isCloseBettingActive
              ? "border-blue-500/30 bg-blue-500/5"
              : isCloseDrawReady
                ? "border-amber-500/30 bg-amber-500/5"
                : "border-white/5 bg-white/[0.02]"
          }`}>
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1 text-zinc-300">
                <Clock className="h-3.5 w-3.5 text-blue-400" />
                Close Market Cutoff
              </span>
              <span className={
                isCloseBettingActive
                  ? "text-blue-400"
                  : isCloseDrawReady
                    ? "text-amber-400"
                    : "text-zinc-500"
              }>
                {isCloseBettingActive ? "Betting Open" : isCloseDrawReady ? "Settlement Due" : "Cutoff Passed"}
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold text-white">
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
          <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
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
                  <button
                    onClick={() => requestOpenDraw(roundId)}
                    disabled={actionStep === "submitting" || !authenticated}
                    className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-black transition-all hover:bg-amber-400 disabled:opacity-50"
                  >
                    {actionStep === "submitting" ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Requesting VRF…
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" />
                        {authenticated ? "Trigger Open Draw" : "Sign In to Trigger"}
                      </>
                    )}
                  </button>
                )}

                {isCloseDrawReady && (
                  <button
                    onClick={() => requestCloseDraw(roundId)}
                    disabled={actionStep === "submitting" || !authenticated}
                    className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-black transition-all hover:bg-amber-400 disabled:opacity-50"
                  >
                    {actionStep === "submitting" ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Settling Round…
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" />
                        {authenticated ? "Settle Round" : "Sign In to Settle"}
                      </>
                    )}
                  </button>
                )}

                {isEmergencyStale && !isOpenDrawReady && !isCloseDrawReady && (
                  <button
                    onClick={() => cancelStaleRound(roundId)}
                    disabled={actionStep === "submitting" || !authenticated}
                    className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-red-500 disabled:opacity-50"
                  >
                    {actionStep === "submitting" ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Cancelling…
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Recover Stale Round
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {actionError && (
              <div className="mt-3 flex items-center justify-between text-xs text-red-400 bg-red-500/10 p-2.5 rounded-lg">
                <span>{actionError}</span>
                <button onClick={resetAction} className="underline hover:text-white">
                  Dismiss
                </button>
              </div>
            )}
          </div>
        )}

        {/* VRF Pending Notice */}
        {(round.phase === RoundPhase.OpenPending || round.phase === RoundPhase.ClosePending) && (
          <div className="mt-5 flex items-center justify-center gap-3 rounded-xl bg-yellow-400/10 border border-yellow-400/20 py-4">
            <Loader2 className="h-5 w-5 animate-spin text-yellow-400" />
            <span className="text-sm font-semibold text-yellow-300">
              {round.phase === RoundPhase.OpenPending
                ? "Chainlink VRF is drawing Open digits..."
                : "Chainlink VRF is drawing Close digits and settling round..."}
            </span>
          </div>
        )}

        {/* Cancelled Notice */}
        {isCancelled && (
          <div className="mt-5 flex items-center justify-center gap-3 rounded-xl bg-red-400/10 border border-red-400/20 py-4">
            <XCircle className="h-5 w-5 text-red-400" />
            <span className="text-sm font-semibold text-red-300">
              Round cancelled due to stale VRF — claim full refunds below.
            </span>
          </div>
        )}

        {/* Partially Settled Notice */}
        {isPartiallySettled && (
          <div className="mt-5 flex items-center justify-center gap-3 rounded-xl bg-orange-400/10 border border-orange-400/20 py-4">
            <AlertTriangle className="h-5 w-5 text-orange-400" />
            <span className="text-sm font-semibold text-orange-300">
              Partially settled — Open winners can claim; Close & Pair wagers refunded.
            </span>
          </div>
        )}

        {/* Digit Displays */}
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Open Draw */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
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
                <span className="font-mono text-sm font-bold text-violet-400">
                  {round.openSingle}
                </span>
              </p>
            ) : (
              <p className="mt-3 text-xs text-zinc-500">Awaiting Open VRF fulfillment</p>
            )}
          </div>

          {/* Close Draw */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
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
                <span className="font-mono text-sm font-bold text-blue-400">
                  {round.closeSingle}
                </span>
              </p>
            ) : (
              <p className="mt-3 text-xs text-zinc-500">Awaiting Close VRF fulfillment</p>
            )}
          </div>
        </div>

        {/* Pair Result (only when settled) */}
        {round.phase === RoundPhase.Settled && (
          <div className="mt-6 flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-blue-500/10 border border-violet-500/20 py-4">
            <span className="text-sm font-medium text-zinc-300">Winning Pair Result:</span>
            <span className="font-mono text-3xl font-extrabold text-amber-400 tracking-wider">
              {round.pairResult.toString().padStart(2, "0")}
            </span>
          </div>
        )}
      </div>

      {/* Previous Round Summary Card (Transparency on what just finished) */}
      {prevRoundId && previousRound && previousRound.phase === RoundPhase.Settled && (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] px-5 py-3 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 font-medium">Last Settled:</span>
              <span className="font-mono font-bold text-white">Round #{prevRoundId.toString()}</span>
              <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-semibold text-green-400">
                Settled
              </span>
            </div>
            <div className="flex items-center gap-4 text-zinc-300">
              <span>
                Open: <span className="font-mono font-semibold text-violet-400">{previousRound.openD1}-{previousRound.openD2}-{previousRound.openD3}</span> (Single: {previousRound.openSingle})
              </span>
              <span>
                Close: <span className="font-mono font-semibold text-blue-400">{previousRound.closeD1}-{previousRound.closeD2}-{previousRound.closeD3}</span> (Single: {previousRound.closeSingle})
              </span>
              <span>
                Pair: <span className="font-mono font-bold text-amber-400">{previousRound.pairResult.toString().padStart(2, "0")}</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

