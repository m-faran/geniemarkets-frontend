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
    <Card className="bg-zinc-900/60 border-zinc-800 p-6 space-y-5">
      <CardHeader className="p-0 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-white tracking-tight">
          <Wallet className="h-5 w-5 text-violet-400" />
          Your Wallet
        </CardTitle>
        {isEmbedded ? (
          <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 gap-1 text-xs">
            <Zap className="h-3 w-3" />
            Gasless
          </Badge>
        ) : (
          <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs">
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
        <div className="flex items-center justify-between rounded-xl bg-zinc-950/80 border border-zinc-800 px-3.5 py-2.5">
          <span className="font-mono text-xs text-zinc-300 tabular-nums">
            {truncateAddress(walletAddress)}
          </span>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleCopy}
            className="text-zinc-400 hover:text-white"
            title="Copy address"
          >
            {copied ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>

        {/* Balance Display */}
        <div className="rounded-xl bg-zinc-950/80 border border-zinc-800 p-4 text-center">
          <p className="text-xs text-zinc-400 font-medium">USDC Balance</p>
          <p className="mt-1 font-mono text-3xl font-extrabold text-white tabular-nums">
            {usdcBalance !== undefined
              ? formatUsdcDollar(usdcBalance)
              : "…"}
          </p>
          {usdcBalance !== undefined && (
            <p className="mt-0.5 font-mono text-xs text-zinc-500 tabular-nums">
              {formatUsdc(usdcBalance)} USDC
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={handleAddFunds}
            size="sm"
            className="flex-1 gap-1.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-md shadow-violet-600/25"
          >
            <PlusCircle className="h-4 w-4" />
            Add Funds
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTransfer(!showTransfer)}
            className="flex-1 gap-1.5 border-zinc-800 bg-zinc-950/40 text-zinc-300 hover:bg-zinc-800 hover:text-white"
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
