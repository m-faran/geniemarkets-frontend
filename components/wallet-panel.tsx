"use client";

import { usePrivy, useFundWallet } from "@privy-io/react-auth";
import { useSmartTransaction } from "@/hooks/use-smart-transaction";
import { useReadContract, useAccount } from "wagmi";
import { erc20Abi, USDC_ADDRESS } from "@/lib/contracts";
import { formatUsdc, formatUsdcDollar, truncateAddress } from "@/lib/utils";
import { encodeFunctionData } from "viem";
import { sepolia } from "viem/chains";
import {
  Wallet,
  PlusCircle,
  ArrowUpRight,
  Copy,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Zap,
} from "lucide-react";
import { useState, useCallback } from "react";

export function WalletPanel() {
  const { authenticated } = usePrivy();
  const { address: walletAddress } = useAccount();
  const { fundWallet } = useFundWallet();
  const { sendTransaction, isEmbedded, walletClientType } = useSmartTransaction();

  const { data: balance } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: walletAddress ? [walletAddress] : undefined,
    query: { enabled: !!walletAddress, refetchInterval: 10000 },
  });

  const usdcBalance = balance as bigint | undefined;

  // Copy address state
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [walletAddress]);

  // Transfer out state
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferring, setTransferring] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState(false);

  const handleAddFunds = async () => {
    if (!walletAddress) return;
    try {
      await fundWallet({ address: walletAddress });
    } catch (err) {
      console.warn("Funding flow closed or error:", err);
    }
  };

  const handleTransfer = async () => {
    if (!transferTo || !transferAmount || !walletAddress) return;
    setTransferring(true);
    try {
      const amount = BigInt(
        Math.floor(parseFloat(transferAmount) * 1_000_000)
      );
      const transferData = encodeFunctionData({
        abi: [
          {
            type: "function",
            name: "transfer",
            inputs: [
              { name: "to", type: "address" },
              { name: "amount", type: "uint256" },
            ],
            outputs: [{ type: "bool" }],
            stateMutability: "nonpayable",
          },
        ] as const,
        functionName: "transfer",
        args: [transferTo as `0x${string}`, amount],
      });

      await sendTransaction({
        to: USDC_ADDRESS,
        data: transferData,
        chainId: sepolia.id,
      });
      setTransferSuccess(true);
      setTransferTo("");
      setTransferAmount("");
      setTimeout(() => {
        setTransferSuccess(false);
        setShowTransfer(false);
      }, 3000);
    } catch {
      // User likely rejected
    } finally {
      setTransferring(false);
    }
  };

  if (!authenticated || !walletAddress) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
          <Wallet className="h-5 w-5 text-violet-400" />
          Your Wallet
        </h3>
        {isEmbedded ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
            <Zap className="h-3 w-3" />
            Gasless
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400">
            {walletClientType === "privy" ? "Wallet" : walletClientType}
          </span>
        )}
      </div>

      {/* External Wallet Gas Warning */}
      {!isEmbedded && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <p>
            External wallet connected. You will need Sepolia ETH for transaction gas. Embedded wallets (Email/Google) receive 100% gas sponsorship.
          </p>
        </div>
      )}

      {/* Address */}
      <div className="mb-4 flex items-center gap-2 rounded-xl bg-white/5 px-4 py-3">
        <span className="flex-1 font-mono text-sm text-zinc-400">
          {truncateAddress(walletAddress)}
        </span>
        <button
          onClick={handleCopy}
          className="text-zinc-500 transition-colors hover:text-white"
          title="Copy address"
        >
          {copied ? (
            <CheckCircle2 className="h-4 w-4 text-green-400" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Balance */}
      <div className="mb-5 rounded-xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 px-4 py-4 text-center">
        <p className="text-sm text-zinc-400">USDC Balance</p>
        <p className="mt-1 text-3xl font-bold text-white">
          {usdcBalance !== undefined
            ? formatUsdcDollar(usdcBalance)
            : "…"}
        </p>
        {usdcBalance !== undefined && (
          <p className="mt-0.5 text-xs text-zinc-500">
            {formatUsdc(usdcBalance)} USDC
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleAddFunds}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-violet-500"
        >
          <PlusCircle className="h-4 w-4" />
          Add Funds
        </button>
        <button
          onClick={() => setShowTransfer(!showTransfer)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-semibold text-zinc-300 transition-all hover:bg-white/10"
        >
          <ArrowUpRight className="h-4 w-4" />
          Transfer Out
        </button>
      </div>

      {/* Transfer Out Form */}
      {showTransfer && (
        <div className="mt-4 space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
          {transferSuccess ? (
            <div className="flex items-center justify-center gap-2 py-4">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              <span className="text-sm font-medium text-green-400">
                Transfer sent!
              </span>
            </div>
          ) : (
            <>
              <input
                type="text"
                value={transferTo}
                onChange={(e) => setTransferTo(e.target.value)}
                placeholder="Recipient address (0x…)"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-white placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none"
              />
              <input
                type="number"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="Amount (USDC)"
                min={0}
                step="0.01"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-white placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none"
              />
              <button
                onClick={handleTransfer}
                disabled={!transferTo || !transferAmount || transferring}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 py-2 text-sm font-semibold text-white transition-all hover:bg-violet-500 disabled:bg-white/5 disabled:text-zinc-600"
              >
                {transferring ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="h-4 w-4" />
                    Send USDC
                  </>
                )}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
