"use client";

import { usePrivy, useFundWallet } from "@privy-io/react-auth";
import { useSmartTransaction } from "@/hooks/use-smart-transaction";
import { useReadContract, useAccount } from "wagmi";
import { erc20Abi, USDC_ADDRESS } from "@/lib/contracts";
import { formatUsdc, formatUsdcDollar, truncateAddress } from "@/lib/utils";
import { encodeFunctionData } from "viem";
import { sepolia } from "viem/chains";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
      // User rejected
    } finally {
      setTransferring(false);
    }
  };

  if (!authenticated || !walletAddress) return null;

  return (
    <Card className="rounded-2xl bg-zinc-900/60 border-zinc-800/90 p-6 space-y-5 shadow-xl shadow-black/30">
      <CardHeader className="p-0 flex flex-row items-center justify-between border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/15 border border-violet-500/30 text-violet-400 shadow-sm">
            <Wallet className="h-5 w-5" />
          </div>
          <CardTitle className="text-xl font-extrabold text-white font-heading tracking-tight">
            Your Wallet
          </CardTitle>
        </div>
        {isEmbedded ? (
          <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300 gap-1.5 text-xs px-3 py-1 font-semibold rounded-full">
            <Zap className="h-3.5 w-3.5 text-emerald-400" />
            Gasless
          </Badge>
        ) : (
          <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs px-3 py-1 font-semibold rounded-full">
            {walletClientType === "privy" ? "Wallet" : walletClientType}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="p-0 space-y-4">
        {/* External Wallet Gas Warning */}
        {!isEmbedded && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <p>
              External wallet connected. You will need Sepolia ETH for transaction gas. Embedded wallets receive 100% gas sponsorship.
            </p>
          </div>
        )}

        {/* Address */}
        <div className="flex items-center justify-between rounded-xl bg-zinc-950/90 border border-zinc-800/90 px-4 py-2.5 shadow-inner">
          <span className="font-mono text-xs text-zinc-200 tabular-nums font-medium">
            {truncateAddress(walletAddress)}
          </span>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleCopy}
            className="text-zinc-400 hover:text-white cursor-pointer"
            title="Copy address"
          >
            {copied ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Balance Display */}
        <div className="rounded-2xl bg-zinc-950/85 border border-zinc-800/90 p-5 text-center shadow-inner space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">USDC Balance</p>
          <p className="font-heading font-extrabold text-3xl sm:text-4xl text-white tabular-nums tracking-tight">
            {usdcBalance !== undefined
              ? formatUsdcDollar(usdcBalance)
              : "…"}
          </p>
          {usdcBalance !== undefined && (
            <p className="font-mono text-xs text-emerald-400/90 font-semibold tabular-nums">
              {formatUsdc(usdcBalance)} USDC
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2.5">
          <Button
            onClick={handleAddFunds}
            className="flex-1 h-11 rounded-xl gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold font-heading text-sm shadow-md shadow-violet-600/25 cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            Add Funds
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowTransfer(!showTransfer)}
            className="flex-1 h-11 rounded-xl gap-2 border-zinc-800/90 bg-zinc-950/70 text-zinc-200 hover:bg-zinc-800 hover:text-white font-bold font-heading text-sm cursor-pointer"
          >
            <ArrowUpRight className="h-4 w-4" />
            Transfer Out
          </Button>
        </div>

        {/* Transfer Out Form */}
        {showTransfer && (
          <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
            {transferSuccess ? (
              <div className="flex items-center justify-center gap-2 py-4">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-400">
                  Transfer sent successfully
                </span>
              </div>
            ) : (
              <>
                <Input
                  type="text"
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  placeholder="Recipient address (0x…)"
                  className="font-mono text-xs bg-zinc-950 border-zinc-800"
                />
                <Input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="Amount (USDC)"
                  min={0}
                  step="0.01"
                  className="font-mono text-xs bg-zinc-950 border-zinc-800"
                />
                <Button
                  onClick={handleTransfer}
                  size="sm"
                  disabled={!transferTo || !transferAmount || transferring}
                  className="w-full gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold"
                >
                  {transferring ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                      Send USDC
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
