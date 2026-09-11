"use client";

import { useCurrentRound, formatCountdown } from "@/hooks/use-current-round";
import { RoundPhase, PHASE_LABELS, PHASE_COLORS } from "@/lib/utils";
import { Clock, Loader2, CheckCircle2, XCircle, Zap } from "lucide-react";

function DigitOrb({ digit, revealed }: { digit: number; revealed: boolean }) {
  return (
    <div
      className={`flex h-16 w-16 items-center justify-center rounded-2xl text-3xl font-bold transition-all duration-700 ${
        revealed
          ? "scale-100 bg-gradient-to-br from-violet-500 to-purple-700 text-white shadow-lg shadow-violet-500/30"
          : "scale-90 bg-white/5 text-zinc-600"
      }`}
    >
      {revealed ? digit : "?"}
    </div>
  );
}

function PhaseIndicator({ phase }: { phase: RoundPhase }) {
  const steps = [
    { label: "Open", phases: [RoundPhase.OpenBetting, RoundPhase.OpenPending] },
    {
      label: "Close",
      phases: [RoundPhase.CloseBetting, RoundPhase.ClosePending],
    },
    { label: "Settled", phases: [RoundPhase.Settled] },
  ];

  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => {
        const isActive = s.phases.includes(phase);
        const isPast =
          s.phases[0] < phase &&
          phase !== RoundPhase.Cancelled &&
          phase !== RoundPhase.PartiallySettled;

        return (
          <div key={s.label} className="flex items-center gap-2">
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
                className={`h-px w-6 ${isPast ? "bg-green-500/30" : "bg-white/10"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function RoundDisplay() {
  const { roundId, round, timeRemaining } = useCurrentRound();

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
  const isBetting =
    round.phase === RoundPhase.OpenBetting ||
    round.phase === RoundPhase.CloseBetting;
  const isPending =
    round.phase === RoundPhase.OpenPending ||
    round.phase === RoundPhase.ClosePending;
  const isCancelled = round.phase === RoundPhase.Cancelled;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-zinc-500">Round</p>
          <p className="text-2xl font-bold text-white">#{roundId.toString()}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-zinc-500">Status</p>
          <p className={`text-sm font-semibold ${PHASE_COLORS[round.phase]}`}>
            {PHASE_LABELS[round.phase]}
          </p>
        </div>
      </div>

      {/* Phase Progress */}
      <PhaseIndicator phase={round.phase} />

      {/* Countdown Timer */}
      {isBetting && timeRemaining > 0 && (
        <div className="mt-6 flex items-center justify-center gap-3 rounded-xl bg-white/5 py-4">
          <Clock className="h-5 w-5 text-violet-400" />
          <span className="font-mono text-3xl font-bold tracking-wider text-white">
            {formatCountdown(timeRemaining)}
          </span>
          <span className="text-sm text-zinc-500">remaining</span>
        </div>
      )}

      {/* Pending spinner */}
      {isPending && (
        <div className="mt-6 flex items-center justify-center gap-3 rounded-xl bg-yellow-400/5 py-4">
          <Loader2 className="h-5 w-5 animate-spin text-yellow-400" />
          <span className="text-sm font-medium text-yellow-400">
            Waiting for Chainlink VRF...
          </span>
        </div>
      )}

      {/* Cancelled */}
      {isCancelled && (
        <div className="mt-6 flex items-center justify-center gap-3 rounded-xl bg-red-400/5 py-4">
          <XCircle className="h-5 w-5 text-red-400" />
          <span className="text-sm font-medium text-red-400">
            Round cancelled — claim refunds below
          </span>
        </div>
      )}

      {/* Digit Displays */}
      <div className="mt-6 grid grid-cols-2 gap-6">
        {/* Open Draw */}
        <div>
          <p className="mb-3 flex items-center gap-1.5 text-sm font-medium text-zinc-400">
            <Zap className="h-3.5 w-3.5 text-violet-400" />
            Open Draw
          </p>
          <div className="flex gap-2">
            <DigitOrb digit={round.openD1} revealed={showOpenDigits} />
            <DigitOrb digit={round.openD2} revealed={showOpenDigits} />
            <DigitOrb digit={round.openD3} revealed={showOpenDigits} />
          </div>
          {showOpenDigits && (
            <p className="mt-2 text-xs text-zinc-500">
              Single:{" "}
              <span className="font-bold text-violet-400">
                {round.openSingle}
              </span>
            </p>
          )}
        </div>

        {/* Close Draw */}
        <div>
          <p className="mb-3 flex items-center gap-1.5 text-sm font-medium text-zinc-400">
            <Zap className="h-3.5 w-3.5 text-blue-400" />
            Close Draw
          </p>
          <div className="flex gap-2">
            <DigitOrb digit={round.closeD1} revealed={showCloseDigits} />
            <DigitOrb digit={round.closeD2} revealed={showCloseDigits} />
            <DigitOrb digit={round.closeD3} revealed={showCloseDigits} />
          </div>
          {showCloseDigits && (
            <p className="mt-2 text-xs text-zinc-500">
              Single:{" "}
              <span className="font-bold text-blue-400">
                {round.closeSingle}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Pair Result (only when settled) */}
      {round.phase === RoundPhase.Settled && (
        <div className="mt-6 flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-violet-500/10 to-blue-500/10 py-4">
          <span className="text-sm text-zinc-400">Pair Result:</span>
          <span className="font-mono text-2xl font-bold text-amber-400">
            {round.pairResult.toString().padStart(2, "0")}
          </span>
        </div>
      )}
    </div>
  );
}
