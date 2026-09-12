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

function DigitOrb({
  digit,
  revealed,
  theme = "violet",
}: {
  digit: number;
  revealed: boolean;
  theme?: "violet" | "cyan" | "gold";
}) {
  const glowStyles = {
    violet:
      "border-violet-500/50 bg-gradient-to-b from-violet-600/30 to-[#0B0F1A] text-white shadow-lg shadow-violet-600/30 ring-1 ring-violet-400/40 text-glow-violet",
    cyan:
      "border-cyan-500/50 bg-gradient-to-b from-cyan-600/30 to-[#0B0F1A] text-white shadow-lg shadow-cyan-600/30 ring-1 ring-cyan-400/40 text-glow-cyan",
    gold:
      "border-amber-500/50 bg-gradient-to-b from-amber-600/30 to-[#0B0F1A] text-amber-300 shadow-lg shadow-amber-600/30 ring-1 ring-amber-400/40 text-glow-gold",
  };

  return (
    <div
      className={`relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl font-mono text-3xl sm:text-4xl font-extrabold tabular-nums transition-all duration-700 overflow-hidden border ${
        revealed
          ? `${glowStyles[theme]} scale-100`
          : "border-white/10 bg-[#07090E] text-slate-500 shadow-inner"
      }`}
    >
      {/* Background scanline & LED filament effect */}
      <div className="absolute inset-0 pointer-events-none scanlines opacity-30" />
      
      {!revealed && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="h-8 w-8 rounded-full bg-cyan-500/10 animate-ping" />
        </div>
      )}

      <span className="relative z-10 font-hud">
        {revealed ? digit : "?"}
      </span>

      {/* Top bevel highlight */}
      <div className="absolute inset-x-2 top-0 h-px bg-white/20" />
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
    <div className="flex items-center gap-2 sm:gap-3 flex-wrap bg-[#07090E]/80 p-2 rounded-xl border border-white/10 shadow-inner">
      {steps.map((s, i) => {
        const isActive = s.phases.includes(phase);
        const isPast =
          s.phases[0] < phase &&
          phase !== RoundPhase.Cancelled &&
          phase !== RoundPhase.PartiallySettled;

        return (
          <div key={s.label} className="flex items-center gap-2 sm:gap-3">
            <div
              className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 font-hud text-xs font-bold uppercase tracking-wider transition-all ${
                isActive
                  ? "bg-violet-600/25 text-violet-300 border border-violet-500/50 shadow-md shadow-violet-500/20"
                  : isPast
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : "bg-white/5 border border-white/5 text-slate-500"
              }`}
            >
              {isPast && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
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
                className={`h-0.5 w-4 sm:w-6 rounded-full ${isPast ? "bg-emerald-500/50" : "bg-white/10"}`}
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
  } = useCurrentRound();

  const {
    requestOpenDraw,
    requestCloseDraw,
    cancelStaleRound,
    step: actionStep,
    error: actionError,
    reset: resetAction,
  } = useRoundActions();

  const { authenticated } = usePrivy();

  if (!roundId || !round) {
    return (
      <Card className="rounded-2xl border-white/10 bg-[#0B0F1A]/85 p-7 space-y-6 shadow-2xl">
        <Skeleton className="h-7 w-48 bg-white/5 rounded-xl" />
        <Skeleton className="h-14 w-full bg-white/5 rounded-xl" />
        <Skeleton className="h-28 w-full bg-white/5 rounded-xl" />
      </Card>
    );
  }

  const isCancelled = round.phase === RoundPhase.Cancelled;
  const isPartiallySettled = round.phase === RoundPhase.PartiallySettled;
  const showOpenDigits =
    round.phase !== RoundPhase.OpenBetting &&
    round.phase !== RoundPhase.OpenPending &&
    !isCancelled;
  const showCloseDigits =
    round.phase === RoundPhase.Settled ||
    round.phase === RoundPhase.PartiallySettled;

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl border border-white/10 bg-[#0B0F1A]/90 p-6 sm:p-7 space-y-6 shadow-2xl shadow-black/80">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-hud text-xs font-bold uppercase tracking-wider text-slate-400">
                Active Protocol Cycle
              </span>
              {isCloseCutoffPassed && round.phase === RoundPhase.OpenBetting && (
                <Badge variant="gold">
                  Draw Overdue
                </Badge>
              )}
            </div>
            <p className="font-hud font-extrabold text-3xl sm:text-5xl text-white tracking-tight tabular-nums mt-0.5 text-glow-violet">
              #{roundId.toString()}
            </p>
          </div>
          <div className="text-right">
            <p className="font-hud text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Contract Phase
            </p>
            <Badge
              variant="outline"
              className={`mt-1 font-mono text-xs font-semibold px-3 py-1 rounded-lg border shadow-sm flex items-center gap-1.5 ${PHASE_COLORS[round.phase]}`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
              {PHASE_LABELS[round.phase]}
            </Badge>
          </div>
        </div>

        {/* Phase Progress Indicator */}
        <PhaseIndicator phase={round.phase} />

        {/* Dual Timers Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Open Market Timer Card */}
          <div
            className={`rounded-2xl border p-5 transition-all shadow-inner relative overflow-hidden ${
              isOpenBettingActive
                ? "border-violet-500/40 bg-gradient-to-b from-violet-600/10 to-[#07090E]"
                : isOpenDrawReady
                  ? "border-amber-500/40 bg-gradient-to-b from-amber-600/10 to-[#07090E]"
                  : "border-white/10 bg-[#07090E]"
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5 font-hud uppercase tracking-wider text-slate-300">
                <Clock className="h-4 w-4 text-violet-400" />
                Open Market Lock
              </span>
              <span
                className={`font-mono font-semibold flex items-center gap-1.5 text-xs ${
                  isOpenBettingActive
                    ? "text-emerald-400"
                    : isOpenDrawReady
                      ? "text-amber-400"
                      : "text-slate-500"
                }`}
              >
                {isOpenBettingActive && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                {isOpenBettingActive ? "Betting Open" : isOpenDrawReady ? "Draw Due" : "Cutoff Passed"}
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-hud text-3xl sm:text-4xl font-extrabold text-white tabular-nums tracking-tight">
                {isOpenBettingActive ? formatCountdown(openTimeRemaining) : "00:00"}
              </span>
              <span className="font-mono text-xs text-slate-400">
                {isOpenBettingActive ? "remaining" : "cutoff elapsed"}
              </span>
            </div>
          </div>

          {/* Close Market Timer Card */}
          <div
            className={`rounded-2xl border p-5 transition-all shadow-inner relative overflow-hidden ${
              isCloseBettingActive
                ? "border-cyan-500/40 bg-gradient-to-b from-cyan-600/10 to-[#07090E]"
                : isCloseDrawReady
                  ? "border-amber-500/40 bg-gradient-to-b from-amber-600/10 to-[#07090E]"
                  : "border-white/10 bg-[#07090E]"
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5 font-hud uppercase tracking-wider text-slate-300">
                <Clock className="h-4 w-4 text-cyan-400" />
                Close Market Lock
              </span>
              <span
                className={`font-mono font-semibold flex items-center gap-1.5 text-xs ${
                  isCloseBettingActive
                    ? "text-cyan-400"
                    : isCloseDrawReady
                      ? "text-amber-400"
                      : "text-slate-500"
                }`}
              >
                {isCloseBettingActive && <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />}
                {isCloseBettingActive ? "Betting Open" : isCloseDrawReady ? "Settlement Due" : "Cutoff Passed"}
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-hud text-3xl sm:text-4xl font-extrabold text-white tabular-nums tracking-tight">
                {isCloseBettingActive ? formatCountdown(closeTimeRemaining) : "00:00"}
              </span>
              <span className="font-mono text-xs text-slate-400">
                {isCloseBettingActive ? "remaining" : "cutoff elapsed"}
              </span>
            </div>
          </div>
        </div>

        {/* Draw / Settlement Action Trigger Bar */}
        {(isOpenDrawReady || isCloseDrawReady || isEmergencyStale) && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 space-y-3 shadow-lg shadow-amber-500/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 font-hud text-sm font-bold text-amber-300 uppercase tracking-wider">
                  <Flame className="h-4 w-4 text-amber-400" />
                  {isOpenDrawReady
                    ? "Open Draw Ready on Chainlink VRF"
                    : isCloseDrawReady
                      ? "Close Draw & Settlement Ready"
                      : "Emergency VRF Recovery Available"}
                </div>
                <p className="mt-1 text-xs text-slate-300 max-w-xl">
                  {isOpenDrawReady
                    ? "Betting lock elapsed. Anyone can permissionlessly trigger Chainlink VRF v2.5 to request verifiable random digits onchain."
                    : isCloseDrawReady
                      ? "Close lock elapsed. Trigger the final VRF draw to settle winning bets and roll forward to next round."
                      : "VRF request timed out (>24h). Trigger emergency cancellation to enable full refund claims."}
                </p>
              </div>

              <div className="shrink-0">
                {isOpenDrawReady && (
                  <Button
                    onClick={() => requestOpenDraw(roundId)}
                    disabled={actionStep === "submitting" || !authenticated}
                    size="default"
                    variant="gold"
                    className="w-full sm:w-auto font-hud font-bold tracking-wider uppercase shadow-xl"
                  >
                    {actionStep === "submitting" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Requesting VRF…
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        {authenticated ? "Trigger Open Draw" : "Connect to Trigger"}
                      </>
                    )}
                  </Button>
                )}

                {isCloseDrawReady && (
                  <Button
                    onClick={() => requestCloseDraw(roundId)}
                    disabled={actionStep === "submitting" || !authenticated}
                    size="default"
                    variant="gold"
                    className="w-full sm:w-auto font-hud font-bold tracking-wider uppercase shadow-xl"
                  >
                    {actionStep === "submitting" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Settling Round…
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        {authenticated ? "Execute Settlement" : "Connect to Settle"}
                      </>
                    )}
                  </Button>
                )}

                {isEmergencyStale && !isOpenDrawReady && !isCloseDrawReady && (
                  <Button
                    onClick={() => cancelStaleRound(roundId)}
                    disabled={actionStep === "submitting" || !authenticated}
                    size="default"
                    variant="destructive"
                    className="w-full sm:w-auto font-hud font-bold tracking-wider uppercase"
                  >
                    {actionStep === "submitting" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Cancelling…
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Recover Stale Round
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {actionError && (
              <div className="flex items-center justify-between text-xs text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/30 font-mono">
                <span>{actionError}</span>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={resetAction}
                  className="text-rose-300 hover:text-white"
                >
                  Dismiss
                </Button>
              </div>
            )}
          </div>
        )}

        {/* VRF Pending Notice */}
        {(round.phase === RoundPhase.OpenPending || round.phase === RoundPhase.ClosePending) && (
          <div className="flex items-center justify-center gap-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 py-4 px-4 text-center">
            <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
            <span className="font-hud text-sm font-bold text-cyan-300 uppercase tracking-wide">
              {round.phase === RoundPhase.OpenPending
                ? "Chainlink VRF v2.5 is generating Open digits onchain…"
                : "Chainlink VRF v2.5 is generating Close digits & settling pool…"}
            </span>
          </div>
        )}

        {/* Cancelled Notice */}
        {isCancelled && (
          <div className="flex items-center justify-center gap-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 py-4 px-4 text-center">
            <XCircle className="h-5 w-5 text-rose-400" />
            <span className="font-hud text-sm font-bold text-rose-300 uppercase tracking-wide">
              Round cancelled due to stale VRF — 100% full refunds claimable below.
            </span>
          </div>
        )}

        {/* Partially Settled Notice */}
        {isPartiallySettled && (
          <div className="flex items-center justify-center gap-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 py-4 px-4 text-center">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <span className="font-hud text-sm font-bold text-amber-300 uppercase tracking-wide">
              Partially settled — Open winners can claim; Close & Pair wagers refunded.
            </span>
          </div>
        )}

        {/* Digit Displays */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Open Draw */}
          <div className="rounded-2xl border border-white/10 bg-[#07090E]/90 p-5 shadow-inner">
            <p className="mb-4 flex items-center gap-2 font-hud text-xs font-bold uppercase tracking-wider text-slate-300">
              <Zap className="h-4 w-4 text-violet-400" />
              Open Draw Cryptographic Digits
            </p>
            <div className="flex gap-3">
              <DigitOrb digit={round.openD1} revealed={showOpenDigits} theme="violet" />
              <DigitOrb digit={round.openD2} revealed={showOpenDigits} theme="violet" />
              <DigitOrb digit={round.openD3} revealed={showOpenDigits} theme="violet" />
            </div>
            {showOpenDigits ? (
              <p className="mt-4 font-mono text-xs text-slate-400 flex items-center gap-2">
                <span>Derived Single (Last Digit):</span>
                <span className="font-hud text-base font-extrabold text-violet-400 tabular-nums text-glow-violet">
                  [{round.openSingle}]
                </span>
              </p>
            ) : (
              <p className="mt-4 text-xs text-slate-500 font-mono">
                Awaiting VRF verification
              </p>
            )}
          </div>

          {/* Close Draw */}
          <div className="rounded-2xl border border-white/10 bg-[#07090E]/90 p-5 shadow-inner">
            <p className="mb-4 flex items-center gap-2 font-hud text-xs font-bold uppercase tracking-wider text-slate-300">
              <Zap className="h-4 w-4 text-cyan-400" />
              Close Draw Cryptographic Digits
            </p>
            <div className="flex gap-3">
              <DigitOrb digit={round.closeD1} revealed={showCloseDigits} theme="cyan" />
              <DigitOrb digit={round.closeD2} revealed={showCloseDigits} theme="cyan" />
              <DigitOrb digit={round.closeD3} revealed={showCloseDigits} theme="cyan" />
            </div>
            {showCloseDigits ? (
              <p className="mt-4 font-mono text-xs text-slate-400 flex items-center gap-2">
                <span>Derived Single (Last Digit):</span>
                <span className="font-hud text-base font-extrabold text-cyan-400 tabular-nums text-glow-cyan">
                  [{round.closeSingle}]
                </span>
              </p>
            ) : (
              <p className="mt-4 text-xs text-slate-500 font-mono">
                Awaiting VRF verification
              </p>
            )}
          </div>
        </div>

        {/* Pair Result (only when settled) */}
        {round.phase === RoundPhase.Settled && (
          <div className="flex items-center justify-center gap-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 border border-amber-500/30 py-4 px-6 shadow-xl">
            <span className="font-hud text-sm font-bold text-amber-300 uppercase tracking-wider">
              Winning 90x Pair Outcome:
            </span>
            <span className="font-hud text-4xl font-extrabold text-amber-300 tracking-wider tabular-nums text-glow-gold">
              {round.pairResult.toString().padStart(2, "0")}
            </span>
          </div>
        )}
      </Card>

      {/* Previous Round Summary Strip */}
      {prevRoundId && previousRound && previousRound.phase === RoundPhase.Settled && (
        <div className="rounded-2xl border border-white/10 bg-[#07090E]/90 px-5 py-3.5 text-xs shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-slate-400 font-hud text-xs font-bold uppercase tracking-wide">
                Previous Settlement:
              </span>
              <span className="font-hud font-bold text-white tabular-nums">
                Round #{prevRoundId.toString()}
              </span>
              <Badge variant="emerald">
                Settled
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-slate-300 font-mono tabular-nums flex-wrap">
              <span>
                Open: <span className="font-bold text-violet-400">{previousRound.openD1}-{previousRound.openD2}-{previousRound.openD3}</span> <span className="text-slate-500">(Single: {previousRound.openSingle})</span>
              </span>
              <span>
                Close: <span className="font-bold text-cyan-400">{previousRound.closeD1}-{previousRound.closeD2}-{previousRound.closeD3}</span> <span className="text-slate-500">(Single: {previousRound.closeSingle})</span>
              </span>
              <span>
                Pair: <span className="font-black text-amber-400 text-glow-gold">{previousRound.pairResult.toString().padStart(2, "0")}</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
