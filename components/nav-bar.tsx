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
    { href: "/play", label: "Prediction Arena", icon: Dice5 },
    { href: "/how-it-works", label: "Protocol Specs", icon: HelpCircle },
    { href: "/history", label: "Settlement Log", icon: History },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#070A12]/85 backdrop-blur-2xl">
      {/* Top Onchain Telemetry Ticker Strip */}
      <div className="hidden md:flex h-7 items-center justify-between border-b border-white/5 bg-[#04060A]/90 px-4 sm:px-8 font-mono text-[11px] text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="font-semibold text-slate-300">Sepolia EVM</span>
            <span className="text-slate-500">(11155111)</span>
          </span>
          <span className="h-2.5 w-px bg-white/10" />
          <span className="flex items-center gap-1.5 text-cyan-400">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            <span>Chainlink VRF v2.5 Verified</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-violet-400">
            <span>⚡ Zero-Gas Account Abstraction</span>
          </span>
          <span className="h-2.5 w-px bg-white/10" />
          <span className="text-amber-400 font-bold">Max Payout: 600x</span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-8">
        {/* Left: Brand Logo + Nav Terminal */}
        <div className="flex items-center gap-8">
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <div className="absolute -inset-1 rounded-xl bg-violet-600/20 blur-md transition-all group-hover:bg-violet-600/40" />
              <Image
                src="/genie-lamp-artwork-LOGO.png"
                alt="Genie Markets"
                width={40}
                height={34}
                priority
                style={{ width: "auto" }}
                className="relative h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-xl font-bold tracking-tight text-white group-hover:text-violet-300 transition-colors">
                GENIE MARKETS
              </span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-violet-400/80 -mt-1 font-semibold">
                Onchain Prediction Protocol
              </span>
            </div>
          </Link>

          {/* Segmented Cyber Navigation Bar */}
          <nav className="hidden md:flex items-center gap-1 rounded-xl bg-[#0B0F1A] p-1 border border-white/10 shadow-inner">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-hud font-bold uppercase tracking-wider transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Web3 Financial HUD & Wallet Connect */}
        <div className="flex items-center gap-3">
          {ready && !authenticated && (
            <Button
              onClick={login}
              size="default"
              variant="default"
              className="font-hud font-bold tracking-wider uppercase h-10 px-5 gap-2 rounded-xl shadow-lg shadow-violet-600/30"
            >
              <Wallet className="h-4 w-4" />
              <span>Connect Wallet</span>
            </Button>
          )}

          {authenticated && walletAddress && (
            <>
              {/* Live USDC Balance Badge */}
              <div className="hidden xs:flex items-center gap-2 rounded-xl border border-white/10 bg-[#0B0F1A] px-3.5 py-1.5 shadow-inner">
                <span className="font-mono text-xs text-slate-500 font-semibold">USDC</span>
                <span className="font-mono text-sm font-extrabold text-emerald-400 tabular-nums">
                  {usdcBalance !== undefined ? formatUsdcDollar(usdcBalance) : "…"}
                </span>
              </div>

              {/* Action Button: Add Funds */}
              <Button
                variant={!hasBalance ? "cyber" : "outline"}
                size="sm"
                onClick={handleAddFunds}
                className={`font-hud font-bold tracking-wide uppercase h-10 px-3.5 gap-1.5 rounded-xl ${
                  !hasBalance ? "animate-pulse" : ""
                }`}
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>Deposit</span>
              </Button>

              {/* Account Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="h-10 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#0B0F1A] px-3.5 py-2 font-mono text-xs font-bold text-slate-200 transition-all hover:border-violet-500/50 hover:bg-violet-500/10 shadow-sm cursor-pointer outline-none">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span>{truncateAddress(walletAddress)}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-2">
                  <DropdownMenuLabel>Onchain Account</DropdownMenuLabel>
                  <div className="px-3 py-2 font-mono text-[11px] text-slate-300 bg-[#07090E] rounded-xl mx-1 break-all select-all border border-white/10 shadow-inner">
                    {walletAddress}
                  </div>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem onClick={handleCopy} className="justify-between py-2 cursor-pointer">
                    <span className="font-medium">{copied ? "Address Copied!" : "Copy Full Address"}</span>
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4 text-slate-400" />
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
                    <ExternalLink className="h-4 w-4 text-slate-400" />
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 focus:bg-rose-500/10 focus:text-rose-300 justify-between py-2 cursor-pointer"
                  >
                    <span className="font-medium">Disconnect Wallet</span>
                    <LogOut className="h-4 w-4" />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

      {/* Mobile nav bar row */}
      <div className="md:hidden flex items-center justify-around border-t border-white/10 bg-[#070A12]/95 py-2 px-3">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-hud text-xs font-bold uppercase tracking-wider transition-all ${
                isActive
                  ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {link.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
