"use client";

import { useState, useCallback } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { useSendTransaction } from "@privy-io/react-auth";
import { encodeFunctionData, type Address, isAddress } from "viem";
import {
  genieMarketsAbi,
  erc20Abi,
  GENIE_MARKETS_ADDRESS,
  USDC_ADDRESS,
} from "@/lib/contracts";
import { parseUsdc } from "@/lib/utils";
import { sepolia } from "viem/chains";

export type AdminActionStep =
  | "idle"
  | "approving"
  | "submitting"
  | "success"
  | "error";

export function useAdminActions(onSuccess?: () => void) {
  const { address: walletAddress } = useAccount();
  const { sendTransaction } = useSendTransaction();
  const publicClient = usePublicClient();

  const [step, setStep] = useState<AdminActionStep>("idle");
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStep("idle");
    setActiveAction(null);
    setError(null);
  }, []);

  // 1. Deposit Bankroll (with automated USDC allowance approval)
  const depositBankroll = useCallback(
    async (amountStr: string) => {
      if (!walletAddress) {
        setError("Wallet not connected");
        return;
      }
      reset();
      setActiveAction("deposit");
      setError(null);

      try {
        const amount = parseUsdc(amountStr);
        if (amount <= 0n) throw new Error("Deposit amount must be greater than 0");

        // Check allowance
        if (publicClient) {
          const currentAllowance = (await publicClient.readContract({
            address: USDC_ADDRESS,
            abi: erc20Abi,
            functionName: "allowance",
            args: [walletAddress, GENIE_MARKETS_ADDRESS],
          })) as bigint;

          if (currentAllowance < amount) {
            setStep("approving");
            const approveData = encodeFunctionData({
              abi: erc20Abi,
              functionName: "approve",
              args: [GENIE_MARKETS_ADDRESS, amount],
            });

            const approveTx = await sendTransaction(
              {
                to: USDC_ADDRESS,
                data: approveData,
                chainId: sepolia.id,
              },
              { sponsor: true, uiOptions: { showWalletUIs: true } }
            );

            // Wait for approval confirmation
            await publicClient.waitForTransactionReceipt({
              hash: approveTx.hash as `0x${string}`,
            });
          }
        }

        // Deposit bankroll
        setStep("submitting");
        const depositData = encodeFunctionData({
          abi: genieMarketsAbi,
          functionName: "depositBankroll",
          args: [amount],
        });

        await sendTransaction(
          {
            to: GENIE_MARKETS_ADDRESS,
            data: depositData,
            chainId: sepolia.id,
          },
          { sponsor: true, uiOptions: { showWalletUIs: true } }
        );

        setStep("success");
        onSuccess?.();
      } catch (err) {
        setStep("error");
        setError(err instanceof Error ? err.message : "Failed to deposit bankroll");
      }
    },
    [walletAddress, publicClient, sendTransaction, reset, onSuccess]
  );

  // 2. Withdraw Bankroll
  const withdrawBankroll = useCallback(
    async (amountStr: string) => {
      reset();
      setActiveAction("withdraw");
      setError(null);
      setStep("submitting");

      try {
        const amount = parseUsdc(amountStr);
        if (amount <= 0n) throw new Error("Withdraw amount must be greater than 0");

        const data = encodeFunctionData({
          abi: genieMarketsAbi,
          functionName: "withdrawBankroll",
          args: [amount],
        });

        await sendTransaction(
          {
            to: GENIE_MARKETS_ADDRESS,
            data,
            chainId: sepolia.id,
          },
          { sponsor: true, uiOptions: { showWalletUIs: true } }
        );

        setStep("success");
        onSuccess?.();
      } catch (err) {
        setStep("error");
        setError(err instanceof Error ? err.message : "Failed to withdraw bankroll");
      }
    },
    [sendTransaction, reset, onSuccess]
  );

  // 3. Update Round Durations
  const setDurations = useCallback(
    async (openSeconds: number, closeSeconds: number) => {
      reset();
      setActiveAction("durations");
      setError(null);
      setStep("submitting");

      try {
        if (openSeconds <= 0 || closeSeconds <= 0) {
          throw new Error("Durations must be greater than 0 seconds");
        }

        const data = encodeFunctionData({
          abi: genieMarketsAbi,
          functionName: "setDurations",
          args: [openSeconds, closeSeconds],
        });

        await sendTransaction(
          {
            to: GENIE_MARKETS_ADDRESS,
            data,
            chainId: sepolia.id,
          },
          { sponsor: true, uiOptions: { showWalletUIs: true } }
        );

        setStep("success");
        onSuccess?.();
      } catch (err) {
        setStep("error");
        setError(err instanceof Error ? err.message : "Failed to update durations");
      }
    },
    [sendTransaction, reset, onSuccess]
  );

  // 4. Update VRF Coordinator
  const setCoordinator = useCallback(
    async (coordinatorAddress: string) => {
      reset();
      setActiveAction("coordinator");
      setError(null);
      setStep("submitting");

      try {
        if (!isAddress(coordinatorAddress)) {
          throw new Error("Invalid coordinator address format");
        }

        const data = encodeFunctionData({
          abi: genieMarketsAbi,
          functionName: "setCoordinator",
          args: [coordinatorAddress as Address],
        });

        await sendTransaction(
          {
            to: GENIE_MARKETS_ADDRESS,
            data,
            chainId: sepolia.id,
          },
          { sponsor: true, uiOptions: { showWalletUIs: true } }
        );

        setStep("success");
        onSuccess?.();
      } catch (err) {
        setStep("error");
        setError(err instanceof Error ? err.message : "Failed to update coordinator");
      }
    },
    [sendTransaction, reset, onSuccess]
  );

  // 5. Transfer Ownership
  const transferOwnership = useCallback(
    async (newOwner: string) => {
      reset();
      setActiveAction("transferOwnership");
      setError(null);
      setStep("submitting");

      try {
        if (!isAddress(newOwner)) {
          throw new Error("Invalid new owner address format");
        }

        const data = encodeFunctionData({
          abi: genieMarketsAbi,
          functionName: "transferOwnership",
          args: [newOwner as Address],
        });

        await sendTransaction(
          {
            to: GENIE_MARKETS_ADDRESS,
            data,
            chainId: sepolia.id,
          },
          { sponsor: true, uiOptions: { showWalletUIs: true } }
        );

        setStep("success");
        onSuccess?.();
      } catch (err) {
        setStep("error");
        setError(err instanceof Error ? err.message : "Failed to transfer ownership");
      }
    },
    [sendTransaction, reset, onSuccess]
  );

  // 6. Accept Ownership
  const acceptOwnership = useCallback(async () => {
    reset();
    setActiveAction("acceptOwnership");
    setError(null);
    setStep("submitting");

    try {
      const data = encodeFunctionData({
        abi: genieMarketsAbi,
        functionName: "acceptOwnership",
        args: [],
      });

      await sendTransaction(
        {
          to: GENIE_MARKETS_ADDRESS,
          data,
          chainId: sepolia.id,
        },
        { sponsor: true, uiOptions: { showWalletUIs: true } }
      );

      setStep("success");
      onSuccess?.();
    } catch (err) {
      setStep("error");
      setError(err instanceof Error ? err.message : "Failed to accept ownership");
    }
  }, [sendTransaction, reset, onSuccess]);

  // 7. Request Open Draw
  const requestOpenDraw = useCallback(
    async (roundId: bigint) => {
      reset();
      setActiveAction("openDraw");
      setError(null);
      setStep("submitting");

      try {
        const data = encodeFunctionData({
          abi: genieMarketsAbi,
          functionName: "requestOpenDraw",
          args: [roundId],
        });

        await sendTransaction(
          {
            to: GENIE_MARKETS_ADDRESS,
            data,
            chainId: sepolia.id,
          },
          { sponsor: true, uiOptions: { showWalletUIs: true } }
        );

        setStep("success");
        onSuccess?.();
      } catch (err) {
        setStep("error");
        setError(err instanceof Error ? err.message : "Failed to request Open draw");
      }
    },
    [sendTransaction, reset, onSuccess]
  );

  // 8. Request Close Draw
  const requestCloseDraw = useCallback(
    async (roundId: bigint) => {
      reset();
      setActiveAction("closeDraw");
      setError(null);
      setStep("submitting");

      try {
        const data = encodeFunctionData({
          abi: genieMarketsAbi,
          functionName: "requestCloseDraw",
          args: [roundId],
        });

        await sendTransaction(
          {
            to: GENIE_MARKETS_ADDRESS,
            data,
            chainId: sepolia.id,
          },
          { sponsor: true, uiOptions: { showWalletUIs: true } }
        );

        setStep("success");
        onSuccess?.();
      } catch (err) {
        setStep("error");
        setError(err instanceof Error ? err.message : "Failed to request Close draw");
      }
    },
    [sendTransaction, reset, onSuccess]
  );

  // 9. Cancel Stale Round
  const cancelStaleRound = useCallback(
    async (roundId: bigint) => {
      reset();
      setActiveAction("cancelStale");
      setError(null);
      setStep("submitting");

      try {
        const data = encodeFunctionData({
          abi: genieMarketsAbi,
          functionName: "cancelStaleRound",
          args: [roundId],
        });

        await sendTransaction(
          {
            to: GENIE_MARKETS_ADDRESS,
            data,
            chainId: sepolia.id,
          },
          { sponsor: true, uiOptions: { showWalletUIs: true } }
        );

        setStep("success");
        onSuccess?.();
      } catch (err) {
        setStep("error");
        setError(err instanceof Error ? err.message : "Failed to cancel stale round");
      }
    },
    [sendTransaction, reset, onSuccess]
  );

  return {
    step,
    activeAction,
    error,
    reset,
    depositBankroll,
    withdrawBankroll,
    setDurations,
    setCoordinator,
    transferOwnership,
    acceptOwnership,
    requestOpenDraw,
    requestCloseDraw,
    cancelStaleRound,
  };
}
