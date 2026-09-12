"use client";

import { usePrivy, useWallets, useSendTransaction as usePrivySendTransaction } from "@privy-io/react-auth";
import { useSendTransaction as useWagmiSendTransaction, useAccount } from "wagmi";
import { useCallback } from "react";

export type SmartTransactionRequest = {
  to: `0x${string}` | string;
  data?: `0x${string}` | string;
  value?: bigint | number | string;
  chainId?: number;
};

export type SmartTransactionResult = {
  hash: `0x${string}`;
  transactionHash: `0x${string}`;
};

export function useSmartTransaction() {
  const { user } = usePrivy();
  const { wallets } = useWallets();
  const { address: wagmiAddress } = useAccount();

  const { sendTransaction: privySendTx } = usePrivySendTransaction();
  const { sendTransactionAsync: wagmiSendTxAsync } = useWagmiSendTransaction();

  // Identify active wallet
  const currentAddress = wagmiAddress || user?.wallet?.address;
  const activeWallet = wallets.find(
    (w) => w.address.toLowerCase() === currentAddress?.toLowerCase()
  ) || user?.wallet;

  const isEmbedded = activeWallet?.walletClientType === "privy";
  const walletClientType = activeWallet?.walletClientType || (isEmbedded ? "privy" : "external");

  const sendTransaction = useCallback(
    async (
      tx: SmartTransactionRequest,
      options?: { sponsor?: boolean }
    ): Promise<SmartTransactionResult> => {
      // Channel 1: Embedded Wallet (Google / Email sign-in) -> Privy with sponsorship
      if (isEmbedded) {
        const res = await privySendTx(
          {
            to: tx.to as `0x${string}`,
            data: (tx.data ?? "0x") as `0x${string}`,
            value: tx.value !== undefined ? BigInt(tx.value) : undefined,
            chainId: tx.chainId,
          },
          {
            sponsor: options?.sponsor ?? true,
            uiOptions: { showWalletUIs: true },
          }
        );

        return {
          hash: res.hash as `0x${string}`,
          transactionHash: res.hash as `0x${string}`,
        };
      }

      // Channel 2: External Wallet (MetaMask, Coinbase, Rainbow, etc.) -> Wagmi
      const hash = await wagmiSendTxAsync({
        to: tx.to as `0x${string}`,
        data: (tx.data ?? "0x") as `0x${string}`,
        value: tx.value !== undefined ? BigInt(tx.value) : undefined,
        chainId: tx.chainId,
      });

      return {
        hash,
        transactionHash: hash,
      };
    },
    [isEmbedded, privySendTx, wagmiSendTxAsync]
  );

  return {
    sendTransaction,
    isEmbedded,
    walletClientType,
  };
}
