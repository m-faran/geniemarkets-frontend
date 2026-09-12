"use client";

import { useState } from "react";
import { useCurrentRound } from "@/hooks/use-current-round";
import { useRoundActions } from "@/hooks/use-round-actions";
import { RoundPhase, PHASE_LABELS, PHASE_COLORS } from "@/lib/utils";
import { usePrivy } from "@privy-io/react-auth";
import {
  AlertTriangle,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
} from "lucide-react";

export function EmergencyRecovery() {
  const { authenticated, login } = usePrivy();
  const {
    roundId,
    round,
    isEmergencyStale,
    refetch: refetchRound,
  } = useCurrentRound();

  const {
    cancelStaleRound,
    step: actionStep,
    error: actionError,
    reset: resetAction,
  } = useRoundActions(refetchRound);

  // Collapsible state — collapsed by default per user requirement
  const [isOpen, setIsOpen] = useState(false);

  // Manual recovery input
  const [targetRoundId, setTargetRoundId] = useState("");

  const isPendingVRF =
    round?.phase === RoundPhase.OpenPending ||
    round?.phase === RoundPhase.ClosePending;

  const handleCancelCurrentStale = async () => {
    if (!roundId) return;
    await cancelStaleRound(roundId);
  };

  const handleCancelTargetStale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRoundId) return;
    await cancelStaleRound(BigInt(targetRoundId));
  };

  return (
    <div className="rounded-2xl border border-red-500/20 bg-gradient-to-b from-red-500/5 via-black/40 to-transparent p-5 shadow-lg transition-all">
      {/* Collapsible Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-red-500/15 p-2.5 ring-1 ring-red-500/30 text-red-400">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">
                Emergency VRF Recovery
              </h3>
              <span className="rounded-md bg-red-500/20 border border-red-500/30 px-2 py-0.5 text-[10px] font-mono text-red-300">
                cancelStaleRound
              </span>
              {isEmergencyStale && (
                <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-extrabold text-white animate-pulse">
                  Stale VRF Triggerable
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Permissionless recovery if Chainlink VRF stalls for over 24 hours.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-lg border hidden sm:inline ${
              isEmergencyStale
                ? "bg-red-500/20 border-red-500/30 text-red-300"
                : "bg-white/5 border-white/10 text-zinc-400"
            }`}
          >
            {isEmergencyStale ? "Stale Action Available" : "Protocol Healthy"}
          </span>
          <div className="rounded-lg bg-white/5 p-1.5 text-zinc-400 hover:text-white transition-colors">
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>
      </button>

      {/* Collapsible Body */}
      {isOpen && (
        <div className="mt-5 pt-5 border-t border-red-500/15 space-y-5">
          {/* Explanation */}
          <div className="rounded-xl border border-red-500/10 bg-red-500/[0.03] p-4 text-xs text-zinc-400 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-red-300">
              <AlertTriangle className="h-4 w-4" />
              Decentralized Failsafe Specification (`cancelStaleRound`)
            </div>
            <ul className="list-disc list-inside space-y-1 text-zinc-400 text-[11px] leading-relaxed">
              <li>
                <strong className="text-zinc-200">24-Hour Timeout:</strong> Anyone can call this function if a round has been waiting for Chainlink VRF for more than 24 hours (`EMERGENCY_TIMEOUT`).
              </li>
              <li>
                <strong className="text-zinc-200">Open VRF Stale:</strong> Sets round to <span className="text-red-400 font-semibold">Cancelled</span>, unlocks 100% refunds for all bets, and initializes the next round.
              </li>
              <li>
                <strong className="text-zinc-200">Close VRF Stale:</strong> Sets round to <span className="text-amber-400 font-semibold">Partially Settled</span>, pays out Open winners, unlocks refunds for Close/Pair bets, and starts the next round.
              </li>
            </ul>
          </div>

          {/* Action Success Notification */}
          {actionStep === "success" && (
            <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-center">
              <CheckCircle2 className="mx-auto mb-2 h-7 w-7 text-green-400" />
              <p className="text-sm font-semibold text-white">Stale Round Cancelled Successfully!</p>
              <p className="text-xs text-zinc-400 mt-0.5">
                The round has been cancelled / partially settled and the protocol has advanced to the next round.
              </p>
              <button
                onClick={resetAction}
                className="mt-3 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-500 transition-all"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Current Round Health Monitor */}
          <div className="rounded-xl border border-white/10 bg-black/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 font-medium">Active Round:</span>
                <span className="font-mono text-sm font-bold text-white">
                  #{roundId ? roundId.toString() : "—"}
                </span>
                {round && (
                  <span
                    className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${PHASE_COLORS[round.phase]} bg-white/5 border-white/10`}
                  >
                    {PHASE_LABELS[round.phase]}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <Clock className="h-3.5 w-3.5 text-zinc-500" />
                <span className="text-zinc-400">
                  VRF Status:{" "}
                  <strong className={isPendingVRF ? "text-amber-400" : "text-emerald-400"}>
                    {isPendingVRF ? "Awaiting VRF" : "Idle / Normal"}
                  </strong>
                </span>
              </div>
            </div>

            {/* If Current Round is Emergency Stale */}
            {isEmergencyStale ? (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 space-y-3">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-red-300">
                      Active Round #{roundId?.toString()} is Stale!
                    </p>
                    <p className="text-xs text-zinc-300 mt-0.5">
                      Chainlink VRF has exceeded the 24-hour emergency timeout. You can trigger emergency recovery now to unstick the contract.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={authenticated ? handleCancelCurrentStale : login}
                  disabled={actionStep === "submitting"}
                  className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-500 transition-all disabled:opacity-50 w-full sm:w-auto"
                >
                  {actionStep === "submitting" ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Executing cancelStaleRound…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      {authenticated ? `Cancel Stale Round #${roundId?.toString()}` : "Sign In to Cancel"}
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="rounded-lg bg-white/[0.02] border border-white/5 p-3 text-xs text-zinc-500">
                Current round #{roundId ? roundId.toString() : "—"} is not stale. The 24-hour emergency timeout only triggers if a VRF request hangs past its cutoff.
              </div>
            )}
          </div>

          {/* Manual Round Recovery Form */}
          <div className="rounded-xl border border-white/5 bg-black/30 p-4 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
              <ShieldAlert className="h-3.5 w-3.5 text-red-400" />
              Manual Stale Round Recovery
            </div>
            <p className="text-[11px] text-zinc-400">
              Enter any past or target Round ID to invoke <code className="font-mono text-red-300">cancelStaleRound(roundId)</code>. Note: The contract will revert with <code className="text-zinc-300 font-mono">NotStaleYet</code> or <code className="text-zinc-300 font-mono">RoundNotPending</code> if the round does not qualify.
            </p>

            <form onSubmit={handleCancelTargetStale} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Target Round ID
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  placeholder={roundId ? `e.g. ${roundId.toString()}` : "e.g. 1"}
                  value={targetRoundId}
                  onChange={(e) => setTargetRoundId(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-1.5 font-mono text-xs text-white placeholder:text-zinc-600 focus:border-red-500 focus:outline-none"
                />
              </div>

              <button
                type={authenticated ? "submit" : "button"}
                onClick={authenticated ? undefined : login}
                disabled={actionStep === "submitting" || (authenticated && !targetRoundId)}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-md transition-all hover:bg-red-500 disabled:opacity-50"
              >
                {actionStep === "submitting" ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Executing cancelStaleRound…
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {authenticated
                      ? `Execute cancelStaleRound(${targetRoundId || "…"})`
                      : "Sign In to Execute"}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Action Error Display */}
          {actionError && (
            <div className="flex items-center justify-between gap-2 rounded-xl bg-red-500/10 px-4 py-3 text-xs text-red-400">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{actionError}</span>
              </div>
              <button onClick={resetAction} className="underline text-zinc-400 hover:text-white">
                Dismiss
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
