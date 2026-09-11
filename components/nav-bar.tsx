"use client";

import Image from "next/image";
import Link from "next/link";
import { usePrivy, useFundWallet } from "@privy-io/react-auth";
import { useReadContract, useAccount } from "wagmi";
import { erc20Abi, USDC_ADDRESS } from "@/lib/contracts";
import { formatUsdcDollar, truncateAddress } from "@/lib/utils";
import {
  Wallet,
  LogOut,
  PlusCircle,
  Dice5,
  History,
} from "lucide-react";

export function NavBar() {
  const { login, logout, authenticated, ready } = usePrivy();
  const { address: walletAddress } = useAccount();
  const { fundWallet } = useFundWallet();

  const { data: balance } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: walletAddress ? [walletAddress] : undefined,
    query: { enabled: !!walletAddress, refetchInterval: 10000 },
  });

  const usdcBalance = balance as bigint | undefined;
  const hasBalance = usdcBalance && usdcBalance > 0n;

  const handleAddFunds = async () => {
    if (!walletAddress) return;
    try {
      await fundWallet({
        address: walletAddress,
      });
    } catch (err) {
      console.warn("Funding flow closed or error:", err);
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Genie Markets"
              width={36}
              height={36}
              className="rounded-lg"
            />
            <span className="hidden text-lg font-bold text-white sm:inline">
              Genie Markets
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <Link
              href="/play"
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              <Dice5 className="h-4 w-4" />
              Play
            </Link>
            <Link
              href="/history"
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              <History className="h-4 w-4" />
              History
            </Link>
          </div>
        </div>

        {/* Right: Wallet */}
        <div className="flex items-center gap-3">
          {ready && !authenticated && (
            <button
              onClick={login}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition-all hover:bg-violet-500 hover:shadow-violet-500/30"
            >
              <Wallet className="h-4 w-4" />
              Sign In
            </button>
          )}

          {authenticated && walletAddress && (
            <>
              {/* Balance Chip */}
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <span className="text-sm font-medium text-zinc-400">
                  {usdcBalance !== undefined
                    ? formatUsdcDollar(usdcBalance)
                    : "…"}
                </span>
                <span className="text-xs text-zinc-500">USDC</span>
              </div>

              {/* Add Funds */}
              <button
                onClick={handleAddFunds}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                  !hasBalance
                    ? "animate-pulse bg-violet-600 text-white shadow-lg shadow-violet-600/25"
                    : "border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
                }`}
              >
                <PlusCircle className="h-4 w-4" />
                Add Funds
              </button>

              {/* Address + Logout */}
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <span className="text-sm font-mono text-zinc-400">
                  {truncateAddress(walletAddress)}
                </span>
                <button
                  onClick={logout}
                  className="text-zinc-500 transition-colors hover:text-red-400"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
