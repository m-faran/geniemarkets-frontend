"use client";

import { useSmartTransaction } from "@/hooks/use-smart-transaction";
import { encodeFunctionData } from "viem";
import { genieMarketsAbi, GENIE_MARKETS_ADDRESS } from "@/lib/contracts";
import { useState, useCallback } from "react";
import { sepolia } from "viem/chains";

export type RoundActionStep = "idle" | "submitting" | "success" | "error";

export function useRoundActions(onSuccess?: () => void) {
  const { sendTransaction } = useSmartTransaction();
  const [step, setStep] = useState<RoundActionStep>("idle");
  const [error, setError] = useState<string | null>(null);

  const requestOpenDraw = useCallback(
    async (roundId: bigint) => {
      setStep("submitting");
      setError(null);
      try {
        const data = encodeFunctionData({
          abi: genieMarketsAbi,
          functionName: "requestOpenDraw",
          args: [roundId],
        });
        await sendTransaction({
          to: GENIE_MARKETS_ADDRESS,
          data,
          chainId: sepolia.id,
        });
        setStep("success");
        onSuccess?.();
      } catch (e) {
        setStep("error");
        setError(e instanceof Error ? e.message : "Failed to request Open draw");
      }
    },
    [sendTransaction, onSuccess]
  );

  const requestCloseDraw = useCallback(
    async (roundId: bigint) => {
      setStep("submitting");
      setError(null);
      try {
        const data = encodeFunctionData({
          abi: genieMarketsAbi,
          functionName: "requestCloseDraw",
          args: [roundId],
        });
        await sendTransaction({
          to: GENIE_MARKETS_ADDRESS,
          data,
          chainId: sepolia.id,
        });
        setStep("success");
        onSuccess?.();
      } catch (e) {
        setStep("error");
        setError(e instanceof Error ? e.message : "Failed to request Close draw");
      }
    },
    [sendTransaction, onSuccess]
  );

  const cancelStaleRound = useCallback(
    async (roundId: bigint) => {
      setStep("submitting");
      setError(null);
      try {
        const data = encodeFunctionData({
          abi: genieMarketsAbi,
          functionName: "cancelStaleRound",
          args: [roundId],
        });
        await sendTransaction({
          to: GENIE_MARKETS_ADDRESS,
          data,
          chainId: sepolia.id,
        });
        setStep("success");
        onSuccess?.();
      } catch (e) {
        setStep("error");
        setError(e instanceof Error ? e.message : "Failed to cancel stale round");
      }
    },
    [sendTransaction, onSuccess]
  );

  const reset = () => {
    setStep("idle");
    setError(null);
  };

  return {
    requestOpenDraw,
    requestCloseDraw,
    cancelStaleRound,
    step,
    error,
    reset,
  };
}
