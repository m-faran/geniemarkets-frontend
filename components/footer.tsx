import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-10 md:grid-cols-12 lg:gap-16">
          {/* Brand & Mission Column */}
          <div className="space-y-4 md:col-span-5 lg:col-span-6">
            <Link href="/" className="group inline-flex items-center gap-3">
              <div className="relative flex items-center justify-center">
                <Image
                  src="/genie-lamp-artwork-LOGO.png"
                  alt="Genie Markets"
                  width={40}
                  height={34}
                  className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
                />
              </div>
              <span className="font-heading text-xl font-extrabold tracking-tight text-white group-hover:text-violet-300 transition-colors">
                Genie Markets
              </span>
            </Link>
            <p className="max-w-md text-sm leading-relaxed text-zinc-400">
              The next-generation onchain number prediction protocol. Powered by Chainlink VRF
              tamper-proof randomness, gas-sponsored transactions, and instant pull-based USDC payouts.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Badge
                variant="outline"
                className="gap-1.5 border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-xs text-emerald-300"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Ethereum Sepolia Live
              </Badge>
              <Badge
                variant="outline"
                className="gap-1.5 border-violet-500/30 bg-violet-500/10 px-3 py-1 font-mono text-xs text-violet-300"
              >
                <Sparkles className="h-3 w-3 text-violet-400" />
                Up to 600x Multipliers
              </Badge>
            </div>
          </div>

          {/* Navigation Links Column */}
          <div className="space-y-3 md:col-span-4 lg:col-span-3">
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-zinc-200">
              Protocol Navigation
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/how-it-works"
                  className="inline-flex items-center gap-2 text-zinc-400 transition-colors hover:text-white"
                >
                  <span className="h-1 w-1 rounded-full bg-violet-400" />
                  How It Works & Player Guide
                </Link>
              </li>
              <li>
                <Link
                  href="/play"
                  className="inline-flex items-center gap-2 text-zinc-400 transition-colors hover:text-white"
                >
                  <span className="h-1 w-1 rounded-full bg-violet-400" />
                  Live Prediction Arena
                </Link>
              </li>
              <li>
                <Link
                  href="/history"
                  className="inline-flex items-center gap-2 text-zinc-400 transition-colors hover:text-white"
                >
                  <span className="h-1 w-1 rounded-full bg-violet-400" />
                  Round History & Settlement
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 text-zinc-500 transition-colors hover:text-zinc-300"
                >
                  <span className="h-1 w-1 rounded-full bg-zinc-600" />
                  Operator Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Web3 Architecture Column */}
          <div className="space-y-3 md:col-span-3 lg:col-span-3">
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-zinc-200">
              Trust & Architecture
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="https://docs.chain.link/vrf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-zinc-400 transition-colors hover:text-white"
                >
                  <span>Chainlink VRF v2.5</span>
                  <ExternalLink className="h-3 w-3 text-zinc-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://privy.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-zinc-400 transition-colors hover:text-white"
                >
                  <span>Privy Embedded Wallets</span>
                  <ExternalLink className="h-3 w-3 text-zinc-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://sepolia.etherscan.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-zinc-400 transition-colors hover:text-white"
                >
                  <span>Sepolia Block Explorer</span>
                  <ExternalLink className="h-3 w-3 text-zinc-500" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Sub-footer */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-zinc-900 pt-8 text-xs text-zinc-500 sm:flex-row">
          <p className="font-sans">
            © {new Date().getFullYear()} Genie Markets Protocol. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-2 text-zinc-400">
            <span className="font-mono text-[11px] text-zinc-500">Infrastructure:</span>
            <Badge variant="outline" className="border-zinc-800 bg-zinc-900/60 font-mono text-[10px] text-zinc-300">
              Chainlink VRF
            </Badge>
            <Badge variant="outline" className="border-zinc-800 bg-zinc-900/60 font-mono text-[10px] text-zinc-300">
              Privy Auth
            </Badge>
            <Badge variant="outline" className="border-zinc-800 bg-zinc-900/60 font-mono text-[10px] text-zinc-300">
              ERC-20 USDC
            </Badge>
          </div>
        </div>
      </div>
    </footer>
  );
}
