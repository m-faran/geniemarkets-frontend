"use client";

import { useReadContract, useReadContracts, useAccount } from "wagmi";
import { genieMarketsAbi, GENIE_MARKETS_ADDRESS } from "@/lib/contracts";
import { usePrivy } from "@privy-io/react-auth";
import { BetType, RoundPhase } from "@/lib/utils";
import { useMemo } from "react";

export interface UserBet {
  roundId: bigint;
  betIndex: bigint;
  betType: BetType;
  pick: number;
  amount: bigint;
  claimed: boolean;
  payout: bigint;
  roundPhase?: RoundPhase;
}

export function useUserBets(roundId: bigint | undefined) {
  const { address: wagmiAddress } = useAccount();
  const { user } = usePrivy();
  const walletAddress = (wagmiAddress || user?.wallet?.address)?.toLowerCase();

  // Get total bet count for the round
  const { data: betCount, refetch: refetchCount } = useReadContract({
    address: GENIE_MARKETS_ADDRESS,
    abi: genieMarketsAbi,
    functionName: "getRoundBetCount",
    args: roundId !== undefined ? [roundId] : undefined,
    query: {
      enabled: roundId !== undefined,
      refetchInterval: 10000,
    },
  });

  const count = betCount ? Number(betCount as bigint) : 0;

  // Build multicall to read all bets + payouts for this round
  const betCalls = useMemo(() => {
    if (!roundId || count === 0) return [];
    return Array.from({ length: count }, (_, i) => ({
      address: GENIE_MARKETS_ADDRESS as `0x${string}`,
      abi: genieMarketsAbi,
      functionName: "getBet" as const,
      args: [roundId, BigInt(i)] as const,
    }));
  }, [roundId, count]);

  const payoutCalls = useMemo(() => {
    if (!roundId || count === 0) return [];
    return Array.from({ length: count }, (_, i) => ({
      address: GENIE_MARKETS_ADDRESS as `0x${string}`,
      abi: genieMarketsAbi,
      functionName: "checkPayout" as const,
      args: [roundId, BigInt(i)] as const,
    }));
  }, [roundId, count]);

  const { data: betsData, refetch: refetchBets } = useReadContracts({
    contracts: betCalls,
    query: { enabled: betCalls.length > 0, refetchInterval: 10000 },
  });

  const { data: payoutsData, refetch: refetchPayouts } = useReadContracts({
    contracts: payoutCalls,
    query: { enabled: payoutCalls.length > 0, refetchInterval: 10000 },
  });

  // Filter to user's bets
  const userBets: UserBet[] = useMemo(() => {
    if (!betsData || !walletAddress || !roundId) return [];

    return betsData
      .map((result, i) => {
        if (result.status !== "success" || !result.result) return null;
        const [player, betType, pick, amount, claimed] = result.result as [
          string,
          number,
          number,
          bigint,
          boolean
        ];
        if (player.toLowerCase() !== walletAddress) return null;

        const payout =
          payoutsData?.[i]?.status === "success"
            ? (payoutsData[i].result as bigint)
            : BigInt(0);

        return {
          roundId,
          betIndex: BigInt(i),
          betType: betType as BetType,
          pick,
          amount,
          claimed,
          payout,
        };
      })
      .filter(Boolean) as UserBet[];
  }, [betsData, payoutsData, walletAddress, roundId]);

  return {
    userBets,
    totalBets: count,
    refetch: () => {
      refetchCount();
      refetchBets();
      refetchPayouts();
    },
  };
}

/** Hook to scan recent settled/cancelled rounds for unclaimed winnings and refunds */
export function useUnclaimedWinnings(maxPastRounds = 10) {
  const { address: wagmiAddress } = useAccount();
  const { user } = usePrivy();
  const walletAddress = (wagmiAddress || user?.wallet?.address)?.toLowerCase();

  const { data: currentRoundId, refetch: refetchId } = useReadContract({
    address: GENIE_MARKETS_ADDRESS,
    abi: genieMarketsAbi,
    functionName: "s_currentRoundId",
    query: { refetchInterval: 10000 },
  });

  const curId = currentRoundId ? Number(currentRoundId as bigint) : 0;

  // Generate list of round IDs to scan (newest first, down to Math.max(1, curId - maxPastRounds))
  const roundIds = useMemo(() => {
    if (curId === 0) return [];
    const min = Math.max(1, curId - maxPastRounds + 1);
    const ids: bigint[] = [];
    for (let i = curId; i >= min; i--) {
      ids.push(BigInt(i));
    }
    return ids;
  }, [curId, maxPastRounds]);

  // Read rounds info and bet counts for all scanned rounds
  const roundCalls = useMemo(
    () =>
      roundIds.map((id) => ({
        address: GENIE_MARKETS_ADDRESS as `0x${string}`,
        abi: genieMarketsAbi,
        functionName: "s_rounds" as const,
        args: [id] as const,
      })),
    [roundIds]
  );

  const countCalls = useMemo(
    () =>
      roundIds.map((id) => ({
        address: GENIE_MARKETS_ADDRESS as `0x${string}`,
        abi: genieMarketsAbi,
        functionName: "getRoundBetCount" as const,
        args: [id] as const,
      })),
    [roundIds]
  );

  const { data: roundsData, refetch: refetchRounds } = useReadContracts({
    contracts: roundCalls,
    query: { enabled: roundCalls.length > 0, refetchInterval: 10000 },
  });

  const { data: countsData, refetch: refetchCounts } = useReadContracts({
    contracts: countCalls,
    query: { enabled: countCalls.length > 0, refetchInterval: 10000 },
  });

  // Identify all (roundId, betIndex) pairs across rounds where count > 0
  const allBetCalls = useMemo(() => {
    if (!countsData) return [];
    const calls: {
      roundId: bigint;
      betIndex: bigint;
      phase: RoundPhase;
    }[] = [];

    roundIds.forEach((rId, idx) => {
      const countRes = countsData[idx];
      const roundRes = roundsData?.[idx];
      const count =
        countRes?.status === "success" && countRes.result
          ? Number(countRes.result as bigint)
          : 0;
      const phase =
        roundRes?.status === "success" && roundRes.result
          ? (Number((roundRes.result as readonly unknown[])[0]) as RoundPhase)
          : RoundPhase.OpenBetting;

      for (let b = 0; b < count; b++) {
        calls.push({ roundId: rId, betIndex: BigInt(b), phase });
      }
    });

    return calls;
  }, [roundIds, countsData, roundsData]);

  // Multicall to read getBet and checkPayout for every existing bet
  const betsQueryCalls = useMemo(
    () =>
      allBetCalls.map((c) => ({
        address: GENIE_MARKETS_ADDRESS as `0x${string}`,
        abi: genieMarketsAbi,
        functionName: "getBet" as const,
        args: [c.roundId, c.betIndex] as const,
      })),
    [allBetCalls]
  );

  const payoutsQueryCalls = useMemo(
    () =>
      allBetCalls.map((c) => ({
        address: GENIE_MARKETS_ADDRESS as `0x${string}`,
        abi: genieMarketsAbi,
        functionName: "checkPayout" as const,
        args: [c.roundId, c.betIndex] as const,
      })),
    [allBetCalls]
  );

  const { data: allBetsResult, refetch: refetchAllBets } = useReadContracts({
    contracts: betsQueryCalls,
    query: { enabled: betsQueryCalls.length > 0, refetchInterval: 10000 },
  });

  const { data: allPayoutsResult, refetch: refetchAllPayouts } = useReadContracts({
    contracts: payoutsQueryCalls,
    query: { enabled: payoutsQueryCalls.length > 0, refetchInterval: 10000 },
  });

  // Filter for user's claimable winning bets and refunds
  const { winningBets, refundableBets, totalUnclaimedAmount } = useMemo(() => {
    if (!allBetsResult || !walletAddress) {
      return {
        winningBets: [] as UserBet[],
        refundableBets: [] as UserBet[],
        totalUnclaimedAmount: 0n,
      };
    }

    const wins: UserBet[] = [];
    const refunds: UserBet[] = [];
    let total = 0n;

    allBetCalls.forEach((meta, idx) => {
      const bRes = allBetsResult[idx];
      if (bRes?.status !== "success" || !bRes.result) return;
      const [player, betType, pick, amount, claimed] = bRes.result as [
        string,
        number,
        number,
        bigint,
        boolean
      ];

      if (player.toLowerCase() !== walletAddress || claimed) return;

      const payout =
        allPayoutsResult?.[idx]?.status === "success"
          ? (allPayoutsResult[idx].result as bigint)
          : 0n;

      const betObj: UserBet = {
        roundId: meta.roundId,
        betIndex: meta.betIndex,
        betType: betType as BetType,
        pick,
        amount,
        claimed,
        payout,
        roundPhase: meta.phase,
      };

      // Winning bet check (Settled or PartiallySettled with positive payout)
      if (
        (meta.phase === RoundPhase.Settled ||
          meta.phase === RoundPhase.PartiallySettled) &&
        payout > 0n
      ) {
        wins.push(betObj);
        total += payout;
      }
      // Refund check (Cancelled or PartiallySettled close/pair bets)
      else if (meta.phase === RoundPhase.Cancelled) {
        refunds.push(betObj);
        total += amount;
      } else if (
        meta.phase === RoundPhase.PartiallySettled &&
        (betType === BetType.CloseSingle ||
          betType === BetType.CloseTrio ||
          betType === BetType.Pair)
      ) {
        refunds.push(betObj);
        total += amount;
      }
    });

    return {
      winningBets: wins,
      refundableBets: refunds,
      totalUnclaimedAmount: total,
    };
  }, [allBetsResult, allPayoutsResult, allBetCalls, walletAddress]);

  return {
    winningBets,
    refundableBets,
    totalUnclaimedAmount,
    refetch: () => {
      refetchId();
      refetchRounds();
      refetchCounts();
      refetchAllBets();
      refetchAllPayouts();
    },
  };
}

