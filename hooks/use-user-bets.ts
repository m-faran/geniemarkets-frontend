"use client";

import { useReadContract, useReadContracts } from "wagmi";
import { genieMarketsAbi, GENIE_MARKETS_ADDRESS } from "@/lib/contracts";
import { usePrivy } from "@privy-io/react-auth";
import { BetType } from "@/lib/utils";
import { useMemo } from "react";

export interface UserBet {
  roundId: bigint;
  betIndex: bigint;
  betType: BetType;
  pick: number;
  amount: bigint;
  claimed: boolean;
  payout: bigint;
}

export function useUserBets(roundId: bigint | undefined) {
  const { user } = usePrivy();
  const walletAddress = user?.wallet?.address?.toLowerCase();

  // Get total bet count for the round
  const { data: betCount } = useReadContract({
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

  const { data: betsData } = useReadContracts({
    contracts: betCalls,
    query: { enabled: betCalls.length > 0, refetchInterval: 10000 },
  });

  const { data: payoutsData } = useReadContracts({
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

  return { userBets, totalBets: count };
}
