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
    <nav className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Left: Brand Logo + Nav */}
        <div className="flex items-center gap-6">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="relative flex items-center justify-center">
              <Image
                src="/genie-lamp-artwork-LOGO.png"
                alt="Genie Markets"
                width={36}
                height={30}
                priority
                className="object-contain transition-transform group-hover:scale-105"
              />
            </div>
            <span className="text-base font-bold tracking-tight text-zinc-100 group-hover:text-white transition-colors">
              Genie Markets
            </span>
          </Link>

          {/* Navigation Pill Bar */}
          <div className="hidden sm:flex items-center gap-1 rounded-lg bg-zinc-900/60 p-1 border border-zinc-800/80">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                    isActive
                      ? "bg-violet-600 text-white font-semibold shadow-xs"
                      : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right: Web3 HUD Financial Bar */}
        <div className="flex items-center gap-2.5">
          {ready && !authenticated && (
            <Button
              onClick={login}
              size="sm"
              className="gap-2 bg-violet-600 font-semibold text-white shadow-lg shadow-violet-600/25 hover:bg-violet-500"
            >
              <Wallet className="h-3.5 w-3.5" />
              Sign In
            </Button>
          )}

          {authenticated && walletAddress && (
            <>
              {/* Balance Badge */}
              <Badge
                variant="secondary"
                className="font-mono tabular-nums px-3 py-1 bg-zinc-900 border-zinc-800 text-zinc-100 text-xs hidden xs:inline-flex"
              >
                {usdcBalance !== undefined
                  ? formatUsdcDollar(usdcBalance)
                  : "…"} USDC
              </Badge>

              {/* Action Button: Add Funds */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddFunds}
                className={`gap-1.5 border-zinc-800 text-xs font-medium hover:border-violet-500/50 ${
                  !hasBalance
                    ? "animate-pulse bg-violet-600 text-white border-transparent hover:bg-violet-500 shadow-sm shadow-violet-600/25"
                    : "bg-zinc-900/60 text-zinc-300 hover:text-white hover:bg-zinc-800/80"
                }`}
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>Add Funds</span>
              </Button>

              {/* Account Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900/60 px-2.5 py-1.5 text-xs font-mono tabular-nums text-zinc-300 transition-colors hover:border-violet-500/50 hover:bg-zinc-800/80 outline-none cursor-pointer">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>{truncateAddress(walletAddress)}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Connected Account</DropdownMenuLabel>
                  <div className="px-2.5 py-1 font-mono text-[11px] text-zinc-400 break-all select-all">
                    {walletAddress}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleCopy} className="justify-between">
                    <span>{copied ? "Address Copied!" : "Copy Address"}</span>
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-zinc-400" />
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
                    className="justify-between"
                  >
                    <span>View on Etherscan</span>
                    <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-red-400 hover:bg-red-500/10 hover:text-red-300 focus:bg-red-500/10 focus:text-red-300 justify-between"
                  >
                    <span>Disconnect</span>
                    <LogOut className="h-3.5 w-3.5" />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

      {/* Mobile nav bar row */}
      <div className="sm:hidden flex items-center justify-around border-t border-zinc-900 bg-zinc-950/90 py-2 px-3">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                isActive
                  ? "bg-violet-600 text-white font-semibold"
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
