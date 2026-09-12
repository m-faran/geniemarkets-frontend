import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Shield, Cpu, Terminal, ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/5 bg-[#05070B]/90 backdrop-blur-xl relative overflow-hidden">
      {/* Top highlight bar */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-10 md:grid-cols-12 lg:gap-16">
          {/* Brand & Mission Column */}
          <div className="space-y-4 md:col-span-5 lg:col-span-5">
            <Link href="/" className="group inline-flex items-center gap-3">
              <div className="relative flex items-center justify-center">
                <Image
                  src="/genie-lamp-artwork-LOGO.png"
                  alt="Genie Markets"
                  width={36}
                  height={32}
                  className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
                />
              </div>
              <span className="font-heading text-xl font-black tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                GENIE MARKETS
              </span>
            </Link>
            <p className="max-w-md text-xs leading-relaxed text-slate-400 font-sans">
              Decentralized onchain number prediction protocol. Powered by Chainlink VRF v2.5 tamper-proof verifiable randomness, ERC-4337 zero-gas accounts, and instant pull-based USDC settlements.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Badge
                variant="emerald"
                className="text-[10px] font-hud uppercase tracking-wider gap-1.5"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                Sepolia 11155111
              </Badge>
              <Badge
                variant="cyber"
                className="text-[10px] font-hud uppercase tracking-wider gap-1"
              >
                <Cpu className="h-3 w-3" />
                VRF v2.5 Verified
              </Badge>
              <Badge
                variant="gold"
                className="text-[10px] font-hud uppercase tracking-wider gap-1"
              >
                <Sparkles className="h-3 w-3" />
                600x Multiplier
              </Badge>
            </div>
          </div>

          {/* Protocol Navigation Column */}
          <div className="space-y-3 md:col-span-4 lg:col-span-3">
            <h3 className="font-hud text-xs font-bold uppercase tracking-widest text-slate-300">
              Protocol Console
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  href="/play"
                  className="inline-flex items-center gap-2 text-slate-400 transition-colors hover:text-cyan-300"
                >
                  <span className="h-1 w-1 rounded-full bg-cyan-400" />
                  Live Prediction Arena
                </Link>
              </li>
              <li>
                <Link
                  href="/history"
                  className="inline-flex items-center gap-2 text-slate-400 transition-colors hover:text-cyan-300"
                >
                  <span className="h-1 w-1 rounded-full bg-cyan-400" />
                  Round Explorer & Settlements
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  className="inline-flex items-center gap-2 text-slate-400 transition-colors hover:text-cyan-300"
                >
                  <span className="h-1 w-1 rounded-full bg-cyan-400" />
                  Technical Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 text-slate-500 transition-colors hover:text-slate-300"
                >
                  <span className="h-1 w-1 rounded-full bg-slate-600" />
                  Operator Console
                </Link>
              </li>
            </ul>
          </div>

          {/* Web3 Infrastructure Column */}
          <div className="space-y-3 md:col-span-3 lg:col-span-4">
            <h3 className="font-hud text-xs font-bold uppercase tracking-widest text-slate-300">
              Onchain Architecture
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a
                  href="https://docs.chain.link/vrf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-between w-full text-slate-400 transition-colors hover:text-white"
                >
                  <span className="flex items-center gap-2">
                    <Cpu className="h-3.5 w-3.5 text-cyan-400" />
                    Chainlink VRF Coordinator
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://privy.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-between w-full text-slate-400 transition-colors hover:text-white"
                >
                  <span className="flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5 text-violet-400" />
                    Privy ERC-4337 Paymaster
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://sepolia.etherscan.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-between w-full text-slate-400 transition-colors hover:text-white"
                >
                  <span className="flex items-center gap-2">
                    <Terminal className="h-3.5 w-3.5 text-emerald-400" />
                    Sepolia Contract Explorer
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Sub-footer */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 text-xs text-slate-500 sm:flex-row">
          <p className="font-mono text-[11px]">
            © {new Date().getFullYear()} Genie Markets Protocol. Built on Ethereum Sepolia.
          </p>
          <div className="flex flex-wrap items-center gap-2 text-slate-400">
            <span className="font-hud uppercase tracking-wider text-[10px] text-slate-500">Security Stack:</span>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#07090E] border border-white/5 text-slate-300">
              Chainlink VRF v2.5
            </span>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#07090E] border border-white/5 text-slate-300">
              ERC-4337 AA
            </span>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#07090E] border border-white/5 text-slate-300">
              ERC-20 USDC
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
