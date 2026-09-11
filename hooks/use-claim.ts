"use client";

import { useSendTransaction } from "@privy-io/react-auth";
import { encodeFunctionData } from "viem";
import { genieMarketsAbi, GENIE_MARKETS_ADDRESS } from "@/lib/contracts";
import { useState, useCallback } from "react";
import { sepolia } from "viem/chains";

type ClaimStep = "idle" | "claiming" | "success" | "error";

export function useClaim() {
  const { sendTransaction } = useSendTransaction();
  const [step, setStep] = useState<ClaimStep>("idle");
  const [error, setError] = useState<string | null>(null);

  const claimWinnings = useCallback(
    async (roundId: bigint, betIndex: bigint) => {
      setStep("claiming");
      setError(null);
      try {
        const data = encodeFunctionData({
          abi: genieMarketsAbi,
          functionName: "claimWinnings",
          args: [roundId, betIndex],
        });
        await sendTransaction(
          { to: GENIE_MARKETS_ADDRESS, data, chainId: sepolia.id },
          { sponsor: true, uiOptions: { showWalletUIs: true } }
        );
        setStep("success");
      } catch (e) {
        setStep("error");
        setError(e instanceof Error ? e.message : "Claim failed");
      }
    },
    [sendTransaction]
  );

  const claimRefund = useCallback(
    async (roundId: bigint, betIndex: bigint) => {
      setStep("claiming");
      setError(null);
      try {
        const data = encodeFunctionData({
          abi: genieMarketsAbi,
          functionName: "claimRefund",
          args: [roundId, betIndex],
        });
        await sendTransaction(
          { to: GENIE_MARKETS_ADDRESS, data, chainId: sepolia.id },
          { sponsor: true, uiOptions: { showWalletUIs: true } }
        );
        setStep("success");
      } catch (e) {
        setStep("error");
        setError(e instanceof Error ? e.message : "Refund claim failed");
      }
    },
    [sendTransaction]
  );

  const reset = () => {
    setStep("idle");
    setError(null);
  };

  return { claimWinnings, claimRefund, step, error, reset };
}
