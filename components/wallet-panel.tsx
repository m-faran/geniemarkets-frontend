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
    <Card className="rounded-2xl border border-white/10 bg-[#0B0F1A]/90 p-6 space-y-5 shadow-2xl shadow-black/80">
      <CardHeader className="p-0 flex flex-row items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/15 border border-violet-500/30 text-violet-400 shadow-sm">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-hud font-bold text-white uppercase tracking-wide">
              Onchain Vault
            </CardTitle>
            <p className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">
              Smart Account Interface
            </p>
          </div>
        </div>
        {isEmbedded ? (
          <Badge variant="emerald" className="gap-1.5 text-xs px-3 py-1 font-semibold rounded-lg">
            <Zap className="h-3.5 w-3.5 text-emerald-400" />
            Gas Sponsored
          </Badge>
        ) : (
          <Badge variant="gold" className="text-xs px-3 py-1 font-semibold rounded-lg">
            {walletClientType === "privy" ? "External EOA" : walletClientType}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="p-0 space-y-4">
        {/* External Wallet Gas Warning */}
        {!isEmbedded && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300 font-mono">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <p>
              External wallet connected. You will need Sepolia testnet ETH for gas. Embedded wallets receive 100% gas sponsorship.
            </p>
          </div>
        )}

        {/* Address Pill */}
        <div className="flex items-center justify-between rounded-xl bg-[#07090E] border border-white/10 px-4 py-2.5 shadow-inner">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-xs text-slate-200 tabular-nums font-bold">
              {truncateAddress(walletAddress)}
            </span>
          </div>
          <Button
            variant="ghost"
            size="xs"
            onClick={handleCopy}
            className="text-slate-400 hover:text-white cursor-pointer px-2"
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
        <div className="rounded-2xl bg-[#07090E] border border-white/10 p-5 text-center shadow-inner space-y-1.5">
          <p className="font-hud text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Available USDC Liquidity
          </p>
          <p className="font-hud font-extrabold text-3xl sm:text-4xl text-emerald-400 tabular-nums tracking-tight text-glow-cyan">
            {usdcBalance !== undefined
              ? formatUsdcDollar(usdcBalance)
              : "…"}
          </p>
          {usdcBalance !== undefined && (
            <p className="font-mono text-xs text-slate-400 font-semibold tabular-nums">
              {formatUsdc(usdcBalance)} Sepolia USDC
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2.5">
          <Button
            variant="default"
            onClick={handleAddFunds}
            className="flex-1 h-11 rounded-xl gap-2 font-hud font-bold text-xs uppercase tracking-wider shadow-lg"
          >
            <PlusCircle className="h-4 w-4" />
            Deposit Funds
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowTransfer(!showTransfer)}
            className="flex-1 h-11 rounded-xl gap-2 border-white/10 bg-[#07090E] text-slate-200 hover:border-violet-500/50 hover:bg-violet-500/10 font-hud font-bold text-xs uppercase tracking-wider"
          >
            <ArrowUpRight className="h-4 w-4" />
            Withdraw
          </Button>
        </div>

        {/* Transfer Out Form */}
        {showTransfer && (
          <div className="space-y-3 rounded-2xl border border-white/10 bg-[#07090E] p-4 shadow-inner">
            {transferSuccess ? (
              <div className="flex items-center justify-center gap-2 py-4">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span className="font-hud text-sm font-bold text-emerald-400 uppercase tracking-wide">
                  Transfer sent onchain
                </span>
              </div>
            ) : (
              <>
                <Input
                  type="text"
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  placeholder="Recipient address (0x…)"
                  className="font-mono text-xs bg-[#05070B] border-white/10"
                />
                <Input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="Amount (USDC)"
                  min={0}
                  step="0.01"
                  className="font-mono text-xs bg-[#05070B] border-white/10"
                />
                <Button
                  onClick={handleTransfer}
                  size="default"
                  variant="cyber"
                  disabled={!transferTo || !transferAmount || transferring}
                  className="w-full gap-2 font-hud font-bold text-xs uppercase tracking-wider h-10"
                >
                  {transferring ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Sending onchain…
                    </>
                  ) : (
                    <>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                      Execute Transfer
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
