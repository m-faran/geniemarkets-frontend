"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePrivy, useFundWallet } from "@privy-io/react-auth";
import { useReadContract, useAccount } from "wagmi";
import { erc20Abi, USDC_ADDRESS } from "@/lib/contracts";
import { formatUsdcDollar, truncateAddress } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Wallet,
  LogOut,
  PlusCircle,
  Dice5,
  History,
  HelpCircle,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
} from "lucide-react";

export function NavBar() {
  const pathname = usePathname();
  const { login, logout, authenticated, ready } = usePrivy();
  const { address: walletAddress } = useAccount();
  const { fundWallet } = useFundWallet();
  const [copied, setCopied] = useState(false);

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

  const handleCopy = () => {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const navLinks = [
    { href: "/how-it-works", label: "How It Works", icon: HelpCircle },
    { href: "/play", label: "Play", icon: Dice5 },
    { href: "/history", label: "History", icon: History },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-2xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-8">
        {/* Left: Brand Logo + Nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <Image
                src="/genie-lamp-artwork-LOGO.png"
                alt="Genie Markets"
                width={42}
                height={36}
                priority
                className="h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <span className="font-heading text-xl font-extrabold tracking-tight text-white group-hover:text-violet-300 transition-colors">
              Genie Markets
            </span>
          </Link>

          {/* Navigation Pill Bar */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-xl bg-zinc-900/70 p-1.5 border border-zinc-800/90 shadow-inner">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-violet-600 text-white font-semibold shadow-md shadow-violet-600/30 scale-[1.02]"
                      : "text-zinc-400 hover:bg-zinc-800/70 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right: Web3 HUD Financial Bar */}
        <div className="flex items-center gap-3 sm:gap-3.5">
          {ready && !authenticated && (
            <Button
              onClick={login}
              size="default"
              className="h-10 px-5 gap-2 bg-violet-600 font-bold text-white shadow-lg shadow-violet-600/30 hover:bg-violet-500 rounded-xl"
            >
              <Wallet className="h-4 w-4" />
              <span>Connect Wallet</span>
            </Button>
          )}

          {authenticated && walletAddress && (
            <>
              {/* Balance Badge */}
              <Badge
                variant="secondary"
                className="h-10 font-mono tabular-nums px-3.5 py-2 bg-zinc-900/90 border border-zinc-800/90 text-zinc-100 text-xs sm:text-sm font-semibold shadow-sm hidden xs:inline-flex items-center gap-1.5 rounded-xl"
              >
                <span className="text-emerald-400 font-extrabold">
                  {usdcBalance !== undefined ? formatUsdcDollar(usdcBalance) : "…"}
                </span>
                <span className="text-zinc-500 font-mono text-xs">USDC</span>
              </Badge>

              {/* Action Button: Add Funds */}
              <Button
                variant="outline"
                size="default"
                onClick={handleAddFunds}
                className={`h-10 px-4 gap-2 text-xs sm:text-sm font-semibold rounded-xl border transition-all ${
                  !hasBalance
                    ? "animate-pulse bg-violet-600 text-white border-transparent hover:bg-violet-500 shadow-md shadow-violet-600/30"
                    : "border-zinc-800/90 bg-zinc-900/80 text-zinc-200 hover:text-white hover:border-violet-500/50 hover:bg-zinc-800/90 shadow-sm"
                }`}
              >
                <PlusCircle className="h-4 w-4 text-violet-400" />
                <span>Add Funds</span>
              </Button>

              {/* Account Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="h-10 inline-flex items-center gap-2.5 rounded-xl border border-zinc-800/90 bg-zinc-900/80 px-3.5 py-2 text-xs sm:text-sm font-mono tabular-nums text-zinc-200 font-semibold transition-all hover:border-violet-500/50 hover:bg-zinc-800/90 shadow-sm cursor-pointer outline-none">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span>{truncateAddress(walletAddress)}</span>
                  <ChevronDown className="h-4 w-4 text-zinc-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60 p-1.5">
                  <DropdownMenuLabel>Connected Account</DropdownMenuLabel>
                  <div className="px-2.5 py-1.5 font-mono text-xs text-zinc-400 bg-zinc-900/60 rounded-lg mx-1 break-all select-all border border-zinc-800/60">
                    {walletAddress}
                  </div>
                  <DropdownMenuSeparator className="my-1.5" />
                  <DropdownMenuItem onClick={handleCopy} className="justify-between py-2 cursor-pointer">
                    <span className="font-medium">{copied ? "Address Copied!" : "Copy Address"}</span>
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4 text-zinc-400" />
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      window.open(
                        `https://sepolia.etherscan.io/address/${walletAddress}`,
                        "_blank",
                        "noopener,noreferrer"
                      )
                    }
                    className="justify-between py-2 cursor-pointer"
                  >
                    <span className="font-medium">View on Etherscan</span>
                    <ExternalLink className="h-4 w-4 text-zinc-400" />
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1.5" />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-red-400 hover:bg-red-500/10 hover:text-red-300 focus:bg-red-500/10 focus:text-red-300 justify-between py-2 cursor-pointer"
                  >
                    <span className="font-medium">Disconnect</span>
                    <LogOut className="h-4 w-4" />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

      {/* Mobile nav bar row */}
      <div className="sm:hidden flex items-center justify-around border-t border-zinc-900 bg-zinc-950/95 py-2.5 px-3">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                isActive
                  ? "bg-violet-600 text-white shadow-xs"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
