"use client";

import { useReadContract } from "wagmi";
import { genieMarketsAbi, GENIE_MARKETS_ADDRESS } from "@/lib/contracts";
import { RoundPhase } from "@/lib/utils";
import { useEffect, useState } from "react";

export interface RoundData {
  phase: RoundPhase;
  openCutoff: number;
  closeCutoff: number;
  settledAt: number;
  openD1: number;
  openD2: number;
  openD3: number;
  closeD1: number;
  closeD2: number;
  closeD3: number;
  openSingle: number;
  closeSingle: number;
  pairResult: number;
}

export function useCurrentRound() {
  const { data: currentRoundId, refetch: refetchId } = useReadContract({
    address: GENIE_MARKETS_ADDRESS,
    abi: genieMarketsAbi,
    functionName: "s_currentRoundId",
    query: { refetchInterval: 5000 },
  });

  const roundId = currentRoundId ? BigInt(currentRoundId as bigint) : undefined;

  const { data: rawRound, refetch: refetchRound } = useReadContract({
    address: GENIE_MARKETS_ADDRESS,
    abi: genieMarketsAbi,
    functionName: "s_rounds",
    args: roundId !== undefined ? [roundId] : undefined,
    query: {
      enabled: roundId !== undefined,
      refetchInterval: 5000,
    },
  });

  const r = rawRound as readonly unknown[] | undefined;
  const round: RoundData | undefined = r
    ? {
        phase: Number(r[0]) as RoundPhase,
        openCutoff: Number(r[1]),
        closeCutoff: Number(r[2]),
        settledAt: Number(r[3]),
        openD1: Number(r[6]),
        openD2: Number(r[7]),
        openD3: Number(r[8]),
        closeD1: Number(r[9]),
        closeD2: Number(r[10]),
        closeD3: Number(r[11]),
        openSingle: Number(r[12]),
        closeSingle: Number(r[13]),
        pairResult: Number(r[14]),
      }
    : undefined;

  // Dual countdown timers & current timestamp
  const [currentTime, setCurrentTime] = useState<number>(() =>
    Math.floor(Date.now() / 1000)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const openTimeRemaining = round
    ? Math.max(0, round.openCutoff - currentTime)
    : 0;
  const closeTimeRemaining = round
    ? Math.max(0, round.closeCutoff - currentTime)
    : 0;

  const isOpenCutoffPassed = round ? currentTime >= round.openCutoff : false;
  const isCloseCutoffPassed = round ? currentTime >= round.closeCutoff : false;

  const isOpenBettingActive = Boolean(
    round && round.phase === RoundPhase.OpenBetting && !isOpenCutoffPassed
  );
  const isCloseBettingActive = Boolean(
    round &&
      (round.phase === RoundPhase.OpenBetting ||
        round.phase === RoundPhase.OpenPending ||
        round.phase === RoundPhase.CloseBetting) &&
      !isCloseCutoffPassed
  );

  const isOpenDrawReady = Boolean(
    round && round.phase === RoundPhase.OpenBetting && isOpenCutoffPassed
  );
  const isCloseDrawReady = Boolean(
    round && round.phase === RoundPhase.CloseBetting && isCloseCutoffPassed
  );

  const EMERGENCY_TIMEOUT = 86400; // 24 hours
  const isEmergencyStale = Boolean(
    round &&
      ((round.phase === RoundPhase.OpenPending &&
        currentTime > round.openCutoff + EMERGENCY_TIMEOUT) ||
        (round.phase === RoundPhase.ClosePending &&
          currentTime > round.closeCutoff + EMERGENCY_TIMEOUT))
  );

  // Backward compatibility: default timer for current active phase
  const timeRemaining =
    round?.phase === RoundPhase.OpenBetting
      ? openTimeRemaining
      : closeTimeRemaining;

  // Previous round lookup (if roundId > 1)
  const prevRoundId =
    roundId && roundId > 1n ? roundId - 1n : undefined;
  const { data: rawPrevRound } = useReadContract({
    address: GENIE_MARKETS_ADDRESS,
    abi: genieMarketsAbi,
    functionName: "s_rounds",
    args: prevRoundId !== undefined ? [prevRoundId] : undefined,
    query: {
      enabled: prevRoundId !== undefined,
      refetchInterval: 10000,
    },
  });

  const pr = rawPrevRound as readonly unknown[] | undefined;
  const previousRound: RoundData | undefined = pr
    ? {
        phase: Number(pr[0]) as RoundPhase,
        openCutoff: Number(pr[1]),
        closeCutoff: Number(pr[2]),
        settledAt: Number(pr[3]),
        openD1: Number(pr[6]),
        openD2: Number(pr[7]),
        openD3: Number(pr[8]),
        closeD1: Number(pr[9]),
        closeD2: Number(pr[10]),
        closeD3: Number(pr[11]),
        openSingle: Number(pr[12]),
        closeSingle: Number(pr[13]),
        pairResult: Number(pr[14]),
      }
    : undefined;

  return {
    roundId,
    round,
    prevRoundId,
    previousRound,
    timeRemaining,
    openTimeRemaining,
    closeTimeRemaining,
    isOpenCutoffPassed,
    isCloseCutoffPassed,
    isOpenBettingActive,
    isCloseBettingActive,
    isOpenDrawReady,
    isCloseDrawReady,
    isEmergencyStale,
    refetch: () => {
      refetchId();
      refetchRound();
    },
  };
}

/** Format seconds into MM:SS or HH:MM:SS */
export function formatCountdown(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
}

