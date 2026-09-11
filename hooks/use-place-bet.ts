"use client";

import { useReadContract, usePublicClient, useAccount } from "wagmi";
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
import { sepolia } from "viem/chains";

type PlaceBetStep = "idle" | "approving" | "betting" | "success" | "error";

export function usePlaceBet() {
  const { address: walletAddress } = useAccount();
  const { sendTransaction } = useSendTransaction();
  const publicClient = usePublicClient();
  const [step, setStep] = useState<PlaceBetStep>("idle");
  const [error, setError] = useState<string | null>(null);

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
          const tx = await sendTransaction(
            {
              to: USDC_ADDRESS,
              data: approveData,
              chainId: sepolia.id,
            },
            { sponsor: true, uiOptions: { showWalletUIs: true } }
          );
          
          let hashToWait: `0x${string}` | undefined = undefined;
          if (typeof tx === "string") {
            hashToWait = tx as `0x${string}`;
          } else if (tx && typeof tx === "object") {
            const txObj = tx as { transactionHash?: `0x${string}`; hash?: `0x${string}` };
            hashToWait = txObj.transactionHash || txObj.hash;
          }

          if (hashToWait && publicClient) {
             await publicClient.waitForTransactionReceipt({ hash: hashToWait });
          } else {
             // Fallback just in case
             await new Promise((r) => setTimeout(r, 4000));
          }
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
        const tx = await sendTransaction(
          {
            to: GENIE_MARKETS_ADDRESS,
            data: betData,
            chainId: sepolia.id,
          },
          { sponsor: true, uiOptions: { showWalletUIs: true } }
        );
        
        let hashToWait: `0x${string}` | undefined = undefined;
        if (typeof tx === "string") {
          hashToWait = tx as `0x${string}`;
        } else if (tx && typeof tx === "object") {
          const txObj = tx as { transactionHash?: `0x${string}`; hash?: `0x${string}` };
          hashToWait = txObj.transactionHash || txObj.hash;
        }

        if (hashToWait && publicClient) {
           await publicClient.waitForTransactionReceipt({ hash: hashToWait });
        }

        setStep("success");
        refetchBalance();
        refetchAllowance();
      } catch (e) {
        setStep("error");
        setError(e instanceof Error ? e.message : "Bet placement failed");
      }
    },
    [allowance, sendTransaction, refetchAllowance, refetchBalance, publicClient]
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

