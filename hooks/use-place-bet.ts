"use client";

import { useReadContract } from "wagmi";
import { useSendTransaction } from "@privy-io/react-auth";
import { encodeFunctionData } from "viem";
import {
  genieMarketsAbi,
  erc20Abi,
  GENIE_MARKETS_ADDRESS,
  USDC_ADDRESS,
} from "@/lib/contracts";
import { parseUsdc, BetType } from "@/lib/utils";
import { useState, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { sepolia } from "viem/chains";

type PlaceBetStep = "idle" | "approving" | "betting" | "success" | "error";

export function usePlaceBet() {
  const { user } = usePrivy();
  const { sendTransaction } = useSendTransaction();
  const [step, setStep] = useState<PlaceBetStep>("idle");
  const [error, setError] = useState<string | null>(null);

  const walletAddress = user?.wallet?.address as `0x${string}` | undefined;

  // Check current USDC allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: "allowance",
    args: walletAddress
      ? [walletAddress, GENIE_MARKETS_ADDRESS]
      : undefined,
    query: { enabled: !!walletAddress },
  });

  // Check USDC balance
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: walletAddress ? [walletAddress] : undefined,
    query: { enabled: !!walletAddress },
  });

  const placeBet = useCallback(
    async (
      roundId: bigint,
      betType: BetType,
      pick: number,
      wagerAmount: string
    ) => {
      setError(null);
      const amount = parseUsdc(wagerAmount);

      // Step 1: Approve if needed
      const currentAllowance = (allowance as bigint) ?? BigInt(0);
      if (currentAllowance < amount) {
        setStep("approving");
        try {
          const approveData = encodeFunctionData({
            abi: erc20Abi,
            functionName: "approve",
            args: [GENIE_MARKETS_ADDRESS, amount],
          });
          await sendTransaction(
            {
              to: USDC_ADDRESS,
              data: approveData,
              chainId: sepolia.id,
            },
            { uiOptions: { showWalletUIs: true } }
          );
          // Wait a moment for state to propagate
          await new Promise((r) => setTimeout(r, 2000));
          refetchAllowance();
        } catch (e) {
          setStep("error");
          setError(e instanceof Error ? e.message : "Approval failed");
          return;
        }
      }

      // Step 2: Place the bet
      setStep("betting");
      try {
        const betData = encodeFunctionData({
          abi: genieMarketsAbi,
          functionName: "placeBet",
          args: [roundId, betType, pick, BigInt(amount)],
        });
        await sendTransaction(
          {
            to: GENIE_MARKETS_ADDRESS,
            data: betData,
            chainId: sepolia.id,
          },
          { uiOptions: { showWalletUIs: true } }
        );
        setStep("success");
        refetchBalance();
        refetchAllowance();
      } catch (e) {
        setStep("error");
        setError(e instanceof Error ? e.message : "Bet placement failed");
      }
    },
    [allowance, sendTransaction, refetchAllowance, refetchBalance]
  );

  const reset = () => {
    setStep("idle");
    setError(null);
  };

  return {
    placeBet,
    step,
    error,
    reset,
    balance: balance as bigint | undefined,
    allowance: allowance as bigint | undefined,
    refetchBalance,
  };
}
