"use client";

import { useState } from "react";
import { useCurrentRound } from "@/hooks/use-current-round";
import { useRoundActions } from "@/hooks/use-round-actions";
import { RoundPhase, PHASE_LABELS, PHASE_COLORS } from "@/lib/utils";
import { usePrivy } from "@privy-io/react-auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <Card className="rounded-2xl border-red-500/25 bg-gradient-to-b from-red-500/10 via-zinc-950/70 to-zinc-950 p-7 sm:p-8 shadow-xl shadow-black/20 transition-all">
      {/* Collapsible Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-5 text-left cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-500/20 border border-red-500/40 text-red-400 shadow-xl shadow-red-500/20">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-white tracking-tight">
                Emergency VRF Recovery
              </h3>
              <Badge variant="outline" className="border-red-500/30 bg-red-500/15 text-red-300 font-mono text-xs font-bold px-3 py-1 rounded-xl">
                cancelStaleRound
              </Badge>
              {isEmergencyStale && (
                <Badge className="bg-red-600 text-white font-mono font-extrabold text-xs animate-pulse px-3 py-1 rounded-xl">
                  Stale VRF Triggerable
                </Badge>
              )}
            </div>
            <p className="text-sm text-zinc-400 mt-1.5 leading-relaxed">
              Permissionless recovery if Chainlink VRF stalls for over 24 hours.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3.5">
          <Badge
            variant="outline"
            className={`text-xs font-mono font-semibold h-10 px-4 rounded-xl border hidden sm:inline-flex items-center ${
              isEmergencyStale
                ? "bg-red-500/20 border-red-500/30 text-red-300"
                : "bg-zinc-900/90 border-zinc-800 text-zinc-300"
            }`}
          >
            {isEmergencyStale ? "Stale Action Available" : "Protocol Healthy"}
          </Badge>
          <div className="h-11 w-11 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
            {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
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
              Decentralized Failsafe Specification (cancelStaleRound)
            </div>
            <ul className="list-disc list-inside space-y-1 text-zinc-400 text-[11px] leading-relaxed">
              <li>
                <strong className="text-zinc-200">24-Hour Timeout:</strong> Anyone can call this function if a round has been waiting for Chainlink VRF for more than 24 hours (EMERGENCY_TIMEOUT).
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
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center space-y-2">
              <CheckCircle2 className="mx-auto mb-2 h-7 w-7 text-emerald-400" />
              <p className="text-sm font-semibold text-white">Stale Round Cancelled Successfully</p>
              <p className="text-xs text-zinc-400">
                The round has been cancelled / partially settled and the protocol has advanced to the next round.
              </p>
              <Button
                size="sm"
                onClick={resetAction}
                className="bg-red-600 hover:bg-red-500 text-white text-xs"
              >
                Dismiss
              </Button>
            </div>
          )}

          {/* Current Round Health Monitor */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 font-medium">Active Round:</span>
                <span className="font-mono text-sm font-bold text-white tabular-nums">
                  #{roundId ? roundId.toString() : "—"}
                </span>
                {round && (
                  <Badge
                    variant="outline"
                    className={`font-mono text-[10px] font-semibold ${PHASE_COLORS[round.phase]} border-zinc-800`}
                  >
                    {PHASE_LABELS[round.phase]}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <Clock className="h-3.5 w-3.5 text-zinc-500" />
                <span className="text-zinc-400">
                  VRF Status:{" "}
                  <strong className={isPendingVRF ? "text-amber-400 font-mono" : "text-emerald-400 font-mono"}>
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
                      Active Round #{roundId?.toString()} is Stale
                    </p>
                    <p className="text-xs text-zinc-300 mt-0.5">
                      Chainlink VRF has exceeded the 24-hour emergency timeout. You can trigger emergency recovery now to unstick the contract.
                    </p>
                  </div>
                </div>

                <Button
                  onClick={authenticated ? handleCancelCurrentStale : login}
                  disabled={actionStep === "submitting"}
                  className="bg-red-600 hover:bg-red-500 text-white font-bold gap-2 w-full sm:w-auto"
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
                </Button>
              </div>
            ) : (
              <div className="rounded-lg bg-zinc-900/60 border border-zinc-800/80 p-3 text-xs text-zinc-500">
                Current round #{roundId ? roundId.toString() : "—"} is not stale. The 24-hour emergency timeout only triggers if a VRF request hangs past its cutoff.
              </div>
            )}
          </div>

          {/* Manual Round Recovery Form */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
              <ShieldAlert className="h-3.5 w-3.5 text-red-400" />
              Manual Stale Round Recovery
            </div>
            <p className="text-[11px] text-zinc-400">
              Enter any past or target Round ID to invoke <code className="font-mono text-red-300">cancelStaleRound(roundId)</code>.
            </p>

            <form onSubmit={handleCancelTargetStale} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Target Round ID
                </label>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  required
                  placeholder={roundId ? `e.g. ${roundId.toString()}` : "e.g. 1"}
                  value={targetRoundId}
                  onChange={(e) => setTargetRoundId(e.target.value)}
                  className="font-mono text-xs tabular-nums bg-zinc-950 border-zinc-800"
                />
              </div>

              <Button
                type={authenticated ? "submit" : "button"}
                onClick={authenticated ? undefined : login}
                disabled={actionStep === "submitting" || (authenticated && !targetRoundId)}
                className="bg-red-600 hover:bg-red-500 text-white font-bold gap-1.5"
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
              </Button>
            </form>
          </div>

          {/* Action Error Display */}
          {actionError && (
            <div className="flex items-center justify-between gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-xs text-red-400">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{actionError}</span>
              </div>
              <Button
                variant="ghost"
                size="xs"
                onClick={resetAction}
                className="text-zinc-400 hover:text-white"
              >
                Dismiss
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
