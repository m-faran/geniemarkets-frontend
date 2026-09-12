"use client";

import Link from "next/link";
import Image from "next/image";
import { usePrivy } from "@privy-io/react-auth";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    badgeColor: "border-violet-500/30 bg-violet-500/10 text-violet-300",
  },
  {
    name: "Pair",
    desc: "Predict two digits (00-99)",
    payout: "90x",
    icon: Sparkles,
    badgeColor: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  },
  {
    name: "Trio",
    desc: "Predict three digits (000-999)",
    payout: "140-600x",
    icon: Trophy,
    badgeColor: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  },
];

const FEATURES = [
  {
    icon: Shield,
    title: "No Seed Phrases",
    desc: "Sign in with Google or email. Privy creates a secure embedded wallet for you instantly.",
    badge: "Privy Auth",
  },
  {
    icon: Zap,
    title: "Zero Gas Fees",
    desc: "All transaction fees are sponsored. You only wager USDC — no ETH needed for gas.",
    badge: "Gas Sponsored",
  },
  {
    icon: Dice5,
    title: "Provably Fair",
    desc: "Chainlink VRF v2.5 provides tamper-proof randomness. Every draw is verifiable onchain.",
    badge: "Chainlink VRF",
  },
];

export default function LandingPage() {
  const { authenticated } = usePrivy();

  return (
    <div className="relative overflow-hidden">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="animate-glow-pulse absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="animate-glow-pulse absolute -bottom-40 left-1/4 h-80 w-80 rounded-full bg-blue-600/10 blur-3xl [animation-delay:1s]" />
        <div className="animate-glow-pulse absolute right-1/4 top-1/2 h-72 w-72 rounded-full bg-purple-600/10 blur-3xl [animation-delay:2s]" />
      </div>

      {/* Hero */}
      <section className="relative mx-auto max-w-5xl px-4 pb-20 pt-20 text-center sm:px-6 sm:pt-28">
        <div className="mb-6 inline-flex">
          <Badge
            variant="outline"
            className="gap-2 border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold text-violet-300"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Live on Ethereum Sepolia
          </Badge>
        </div>

        <h1 className="bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-7xl">
          Predict. Play.
          <br />
          <span className="bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text font-mono tabular-nums">
            Win up to 600x.
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-zinc-400">
          Genie Markets is an onchain number prediction protocol powered by
          Chainlink VRF. Sign in with your email, fund with USDC, and start playing —
          no crypto jargon, no gas fees, 100% provably fair.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/play">
            <Button
              size="lg"
              className="gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold px-8 h-12 shadow-xl shadow-violet-600/30"
            >
              {authenticated ? "Go to Game" : "Start Playing"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/how-it-works">
            <Button
              variant="outline"
              size="lg"
              className="border-zinc-800 bg-zinc-900/60 text-zinc-200 hover:bg-zinc-800 hover:text-white px-8 h-12"
            >
              How It Works
            </Button>
          </Link>
        </div>

        {/* Brand Artwork Logo */}
        <div className="mt-14 flex justify-center">
          <div className="relative group">
            <div className="animate-glow-pulse absolute -inset-2 rounded-3xl bg-violet-500/20 blur-2xl" />
            <Image
              src="/genie-lamp-artwork-LOGO.png"
              alt="Genie Markets Artwork"
              width={200}
              height={170}
              priority
              className="relative object-contain drop-shadow-2xl transition-transform group-hover:scale-105"
            />
          </div>
        </div>
      </section>

      {/* Bet Types */}
      <section className="relative mx-auto max-w-5xl px-4 pb-20 sm:px-6 space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            Three Ways to Win
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Choose your odds profile from rapid single-digit predictions to 600x Jackpot Trios.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {BET_TYPES.map((bt) => {
            const Icon = bt.icon;
            return (
              <Card
                key={bt.name}
                className="bg-zinc-900/60 border-zinc-800 hover:border-violet-500/40 transition-all p-6 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-violet-600/20 p-3 text-violet-400 border border-violet-500/20">
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className={`font-mono font-bold tabular-nums text-xs ${bt.badgeColor}`}>
                    {bt.payout}
                  </Badge>
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-white">{bt.name}</CardTitle>
                  <p className="mt-1.5 text-xs sm:text-sm text-zinc-400">{bt.desc}</p>
                </div>
                <div className="pt-2 border-t border-zinc-800/80 flex items-baseline justify-between">
                  <span className="text-xs text-zinc-500 font-mono">Max Payout</span>
                  <span className="font-mono text-2xl font-extrabold text-white tabular-nums">
                    {bt.payout}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="relative mx-auto max-w-5xl px-4 pb-24 sm:px-6 space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            Built for Everyone
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Engineered on Ethereum with frictionless Web2-style onboarding.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <Card
                key={f.title}
                className="bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 transition-all p-6 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-violet-600/15 p-2.5 text-violet-400 border border-violet-500/20">
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="font-mono text-[10px] border-zinc-800 text-zinc-400">
                    {f.badge}
                  </Badge>
                </div>
                <CardTitle className="text-lg font-bold text-white pt-1">{f.title}</CardTitle>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-8 text-center text-xs text-zinc-500 space-y-2">
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
        <p>Genie Markets · Ethereum Sepolia · Powered by Privy & Chainlink VRF</p>
      </footer>
    </div>
  );
}
