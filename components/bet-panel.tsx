"use client";

import { useState } from "react";
import { usePrivy, useFundWallet } from "@privy-io/react-auth";
import { useAccount } from "wagmi";
import { useCurrentRound, formatCountdown } from "@/hooks/use-current-round";
import { usePlaceBet } from "@/hooks/use-place-bet";
import {
  BetType,
  BET_TYPE_LABELS,
  PAYOUTS,
  getTrioPayoutMultiplier,
  isValidTrio,
  formatUsdcDollar,
  parseUsdc,
} from "@/lib/utils";
import {
  Wallet,
  PlusCircle,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

const QUICK_AMOUNTS = ["1", "5", "10", "25"];

export function BetPanel() {
  const { login, authenticated, ready } = usePrivy();
  const { address: walletAddress } = useAccount();
  const { fundWallet } = useFundWallet();
  const {
    roundId,
    round,
    openTimeRemaining,
    closeTimeRemaining,
    isOpenBettingActive,
    isCloseBettingActive,
  } = useCurrentRound();
  const { placeBet, step, error, reset, balance } = usePlaceBet();

  const [marketSide, setMarketSide] = useState<"open" | "close">("open");
  const [selectedBetType, setSelectedBetType] = useState<BetType>(
    BetType.OpenSingle
  );
  const [pick, setPick] = useState<string>("");
  const [wager, setWager] = useState<string>("");

  const hasBalance = balance && balance > 0n;

  // Active bet type depending on marketSide
  const activeBetType = selectedBetType;
  const isOpenBet =
    activeBetType === BetType.OpenSingle ||
    activeBetType === BetType.OpenTrio ||
    activeBetType === BetType.Pair;

  const isMarketOpenForBet = isOpenBet
    ? isOpenBettingActive
    : isCloseBettingActive;

  // Pick validation
  const getPickMax = () => {
    if (
      activeBetType === BetType.OpenSingle ||
      activeBetType === BetType.CloseSingle
    )
      return 9;
    if (activeBetType === BetType.Pair) return 99;
    return 999;
  };

  const pickNum = parseInt(pick) || 0;
  const isTrioBet =
    activeBetType === BetType.OpenTrio || activeBetType === BetType.CloseTrio;
  const isPickValid =
    pick !== "" &&
    pickNum >= 0 &&
    pickNum <= getPickMax() &&
    (!isTrioBet || isValidTrio(pickNum));
  const isWagerValid = wager !== "" && parseFloat(wager) > 0;

  // Calculate potential payout
  const getMultiplier = () => {
    if (
      activeBetType === BetType.OpenSingle ||
      activeBetType === BetType.CloseSingle
    )
      return PAYOUTS[BetType.OpenSingle];
    if (activeBetType === BetType.Pair) return PAYOUTS[BetType.Pair];
    if (isTrioBet && isPickValid) return getTrioPayoutMultiplier(pickNum);
    return PAYOUTS.uniqueTrio; // default trio
  };

  const multiplier = getMultiplier();
  const potentialPayout =
    isWagerValid && isPickValid
      ? formatUsdcDollar(parseUsdc((parseFloat(wager) * multiplier).toString()))
      : "$0.00";

  const handlePlaceBet = async () => {
    if (!roundId || !isPickValid || !isWagerValid || !isMarketOpenForBet) return;
    await placeBet(roundId, activeBetType, pickNum, wager);
  };

  const handleAddFunds = async () => {
    if (!walletAddress) return;
    try {
      await fundWallet({ address: walletAddress });
    } catch (err) {
      console.warn("Funding flow closed or error:", err);
    }
  };

  if (!round) {
    return (
      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-6 text-center">
        <p className="text-sm text-zinc-500">Loading round data…</p>
      </div>
    );
  }


  // Success state
  if (step === "success") {
    return (
      <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-6 text-center">
        <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-green-400" />
        <p className="text-lg font-semibold text-white">Bet Placed!</p>
        <p className="mt-1 text-sm text-zinc-400">
          Your bet has been recorded on-chain.
        </p>
        <button
          onClick={() => {
            reset();
            setPick("");
            setWager("");
          }}
          className="mt-4 rounded-xl bg-violet-600 px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-violet-500"
        >
          Place Another Bet
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-6">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
        <Sparkles className="h-5 w-5 text-violet-400" />
        Place Your Bet
      </h3>

      {/* Market Selector Tabs */}
      <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-white/5 p-1">
        <button
          onClick={() => {
            setMarketSide("open");
            if (
              selectedBetType !== BetType.OpenSingle &&
              selectedBetType !== BetType.OpenTrio &&
              selectedBetType !== BetType.Pair
            ) {
              setSelectedBetType(BetType.OpenSingle);
              setPick("");
            }
          }}
          className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-all ${
            marketSide === "open"
              ? "bg-violet-600 text-white shadow-lg shadow-violet-600/25"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <span>Open Market</span>
          <span
            className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
              isOpenBettingActive
                ? marketSide === "open"
                  ? "bg-white/20 text-white"
                  : "bg-green-500/10 text-green-400"
                : "bg-white/5 text-zinc-500"
            }`}
          >
            {isOpenBettingActive
              ? formatCountdown(openTimeRemaining)
              : "Closed"}
          </span>
        </button>

        <button
          onClick={() => {
            setMarketSide("close");
            if (
              selectedBetType !== BetType.CloseSingle &&
              selectedBetType !== BetType.CloseTrio
            ) {
              setSelectedBetType(BetType.CloseSingle);
              setPick("");
            }
          }}
          className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-all ${
            marketSide === "close"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <span>Close Market</span>
          <span
            className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
              isCloseBettingActive
                ? marketSide === "close"
                  ? "bg-white/20 text-white"
                  : "bg-blue-500/10 text-blue-400"
                : "bg-white/5 text-zinc-500"
            }`}
          >
            {isCloseBettingActive
              ? formatCountdown(closeTimeRemaining)
              : "Closed"}
          </span>
        </button>
      </div>

      {/* Bet Types for Selected Market */}
      <div className="mb-5 flex gap-1.5 rounded-xl bg-white/5 p-1">
        {(marketSide === "open"
          ? [BetType.OpenSingle, BetType.Pair, BetType.OpenTrio]
          : [BetType.CloseSingle, BetType.CloseTrio]
        ).map((bt) => (
          <button
            key={bt}
            onClick={() => {
              setSelectedBetType(bt);
              setPick("");
            }}
            className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
              activeBetType === bt
                ? marketSide === "open"
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                  : "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "text-zinc-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            {bt === BetType.OpenSingle || bt === BetType.CloseSingle
              ? "Single (9x)"
              : bt === BetType.Pair
                ? "Pair (90x)"
                : "Trio (140-600x)"}
          </button>
        ))}
      </div>

      {/* Pick Input */}
      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-zinc-400">
          Your Pick
          <span className="ml-1 text-xs text-zinc-600">
            (
            {activeBetType === BetType.OpenSingle ||
            activeBetType === BetType.CloseSingle
              ? "0-9"
              : activeBetType === BetType.Pair
                ? "00-99"
                : "000-999, Genie-sorted"}
            )
          </span>
        </label>

        {/* Single: digit buttons */}
        {(activeBetType === BetType.OpenSingle ||
          activeBetType === BetType.CloseSingle) && (
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 10 }, (_, i) => (
              <button
                key={i}
                onClick={() => setPick(i.toString())}
                className={`rounded-xl py-3 text-lg font-bold transition-all ${
                  pick === i.toString()
                    ? marketSide === "open"
                      ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                      : "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        )}

        {/* Pair / Trio: text input */}
        {(activeBetType === BetType.Pair || isTrioBet) && (
          <div>
            <input
              type="number"
              value={pick}
              onChange={(e) => setPick(e.target.value)}
              placeholder={
                activeBetType === BetType.Pair ? "e.g. 42" : "e.g. 123"
              }
              min={0}
              max={getPickMax()}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-lg text-white placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
            {isTrioBet && pick !== "" && !isPickValid && (
              <p className="mt-1 text-xs text-red-400">
                Trio must be in Genie-sorted order (1 &lt; 2 &lt; ... &lt; 9 &lt; 0)
              </p>
            )}
          </div>
        )}
      </div>

      {/* Wager Input */}
      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-zinc-400">
          Wager (USDC)
        </label>
        <input
          type="number"
          value={wager}
          onChange={(e) => setWager(e.target.value)}
          placeholder="0.00"
          min={0}
          step="0.01"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-lg text-white placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
        />
        <div className="mt-2 flex gap-2">
          {QUICK_AMOUNTS.map((amt) => (
            <button
              key={amt}
              onClick={() => setWager(amt)}
              className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                wager === amt
                  ? "bg-violet-600/20 text-violet-400 ring-1 ring-violet-500/30"
                  : "bg-white/5 text-zinc-500 hover:bg-white/10 hover:text-zinc-300"
              }`}
            >
              ${amt}
            </button>
          ))}
        </div>
      </div>

      {/* Potential Payout Preview */}
      {isPickValid && isWagerValid && (
        <div className="mb-5 flex items-center justify-between rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-600/5 px-4 py-3">
          <span className="text-sm text-zinc-400">Potential Payout</span>
          <div className="text-right">
            <p className="text-lg font-bold text-amber-400">{potentialPayout}</p>
            <p className="text-xs text-zinc-500">{multiplier}x multiplier</p>
          </div>
        </div>
      )}

      {/* Action Button */}
      {!ready ? (
        <button
          disabled
          className="w-full rounded-xl bg-white/5 py-3 text-sm font-semibold text-zinc-600"
        >
          Loading…
        </button>
      ) : !authenticated ? (
        <button
          onClick={login}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition-all hover:bg-violet-500"
        >
          <Wallet className="h-4 w-4" />
          Sign In to Play
        </button>
      ) : !hasBalance ? (
        <button
          onClick={handleAddFunds}
          className="flex w-full animate-pulse items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition-all hover:bg-violet-500"
        >
          <PlusCircle className="h-4 w-4" />
          Fund Wallet to Play
        </button>
      ) : step === "approving" ? (
        <button
          disabled
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600/50 py-3 text-sm font-semibold text-white/60"
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          Approving USDC…
        </button>
      ) : step === "betting" ? (
        <button
          disabled
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600/50 py-3 text-sm font-semibold text-white/60"
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          Placing Bet…
        </button>
      ) : !isMarketOpenForBet ? (
        <button
          disabled
          className="w-full rounded-xl bg-white/5 py-3 text-sm font-semibold text-zinc-500"
        >
          {isOpenBet ? "Open Market Cutoff Passed" : "Close Market Cutoff Passed"}
        </button>
      ) : (
        <button
          onClick={handlePlaceBet}
          disabled={!isPickValid || !isWagerValid}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition-all hover:bg-violet-500 disabled:bg-white/5 disabled:text-zinc-600 disabled:shadow-none"
        >
          <ShieldCheck className="h-4 w-4" />
          Place Bet ({BET_TYPE_LABELS[activeBetType]})
        </button>
      )}

      {/* Error */}
      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}

