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

  // Countdown timer
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    if (!round) return;

    const getTarget = () => {
      if (round.phase === RoundPhase.OpenBetting) return round.openCutoff;
      if (round.phase === RoundPhase.CloseBetting) return round.closeCutoff;
      return 0;
    };

    const target = getTarget();
    if (!target) {
      setTimeRemaining(0);
      return;
    }

    const tick = () => {
      const now = Math.floor(Date.now() / 1000);
      setTimeRemaining(Math.max(0, target - now));
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [round]);

  return {
    roundId,
    round,
    timeRemaining,
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
