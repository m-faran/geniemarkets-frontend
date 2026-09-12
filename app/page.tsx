"use client";

import Link from "next/link";
import Image from "next/image";
import { usePrivy } from "@privy-io/react-auth";
import {
  Dice5,
  Sparkles,
  Shield,
  Zap,
  ArrowRight,
  Trophy,
} from "lucide-react";

const BET_TYPES = [
  {
    name: "Single",
    desc: "Predict one digit (0-9)",
    payout: "9x",
    icon: Dice5,
    color: "from-violet-500 to-purple-600",
  },
  {
    name: "Pair",
    desc: "Predict two digits (00-99)",
    payout: "90x",
    icon: Sparkles,
    color: "from-blue-500 to-cyan-600",
  },
  {
    name: "Trio",
    desc: "Predict three digits (000-999)",
    payout: "140-600x",
    icon: Trophy,
    color: "from-amber-500 to-orange-600",
  },
];

const FEATURES = [
  {
    icon: Shield,
    title: "No Seed Phrases",
    desc: "Sign in with Google or email. Privy creates a secure wallet for you instantly.",
  },
  {
    icon: Zap,
    title: "Zero Gas Fees",
    desc: "We sponsor all transaction fees. You only deal in USDC — no ETH needed.",
  },
  {
    icon: Dice5,
    title: "Provably Fair",
    desc: "Chainlink VRF provides tamper-proof randomness. Every draw is verifiable on-chain.",
  },
];

export default function LandingPage() {
  const { authenticated } = usePrivy();

  return (
    <div className="relative overflow-hidden">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="animate-glow-pulse absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="animate-glow-pulse absolute -bottom-40 left-1/4 h-80 w-80 rounded-full bg-blue-600/10 blur-3xl [animation-delay:1s]" />
        <div className="animate-glow-pulse absolute right-1/4 top-1/2 h-72 w-72 rounded-full bg-purple-600/10 blur-3xl [animation-delay:2s]" />
      </div>

      {/* Hero */}
      <section className="relative mx-auto max-w-5xl px-4 pb-20 pt-24 text-center sm:px-6 sm:pt-32">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          <span className="text-sm font-medium text-violet-300">
            Live on Ethereum Sepolia
          </span>
        </div>

        <h1 className="bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-7xl">
          Predict. Play.
          <br />
          <span className="bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text">
            Win up to 600x.
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">
          Genie Markets is an on-chain number prediction protocol powered by
          Chainlink VRF. Sign in with your email, fund with a credit card, and
          start playing — no crypto experience required.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/play"
            className="group flex items-center gap-2 rounded-2xl bg-violet-600 px-8 py-4 text-lg font-bold text-white shadow-2xl shadow-violet-600/30 transition-all hover:bg-violet-500 hover:shadow-violet-500/40"
          >
            {authenticated ? "Go to Game" : "Start Playing"}
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/how-it-works"
            className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-lg font-bold text-zinc-200 transition-all hover:bg-white/10 hover:text-white"
          >
            How It Works
          </Link>
        </div>

        {/* Logo */}
        <div className="mt-16 flex justify-center">
          <div className="relative">
            <div className="animate-glow-pulse absolute inset-0 rounded-3xl bg-violet-500/30 blur-2xl" />
            <Image
              src="/logo.png"
              alt="Genie Markets"
              width={120}
              height={120}
              priority
              style={{ width: "auto", height: "auto" }}
              className="relative rounded-3xl shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Bet Types */}
      <section className="relative mx-auto max-w-5xl px-4 pb-20 sm:px-6">
        <h2 className="mb-10 text-center text-3xl font-bold text-white">
          Three Ways to Win
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {BET_TYPES.map((bt) => (
            <div
              key={bt.name}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-all hover:border-white/20 hover:bg-white/[0.05]"
            >
              <div
                className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${bt.color} p-3`}
              >
                <bt.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">{bt.name}</h3>
              <p className="mt-2 text-sm text-zinc-400">{bt.desc}</p>
              <p className="mt-4 text-3xl font-extrabold text-white">
                {bt.payout}
              </p>
              <p className="text-xs text-zinc-500">payout multiplier</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative mx-auto max-w-5xl px-4 pb-24 sm:px-6">
        <h2 className="mb-10 text-center text-3xl font-bold text-white">
          Built for Everyone
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
            >
              <f.icon className="mb-4 h-8 w-8 text-violet-400" />
              <h3 className="text-lg font-bold text-white">{f.title}</h3>
              <p className="mt-2 text-sm text-zinc-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-sm text-zinc-600 space-y-2">
        <div className="flex items-center justify-center gap-6 text-zinc-400 text-xs">
          <Link href="/how-it-works" className="hover:text-white transition-colors">
            How It Works
          </Link>
          <Link href="/play" className="hover:text-white transition-colors">
            Play Game
          </Link>
          <Link href="/history" className="hover:text-white transition-colors">
            Round History
          </Link>
        </div>
        <p>Genie Markets · ETHGlobal Online 2026 · Powered by Privy & Chainlink VRF</p>
      </footer>
    </div>
  );
}
