"use client";

import { useState, useCallback } from "react";
import { useAccount, useReadContract } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import {
  genieMarketsAbi,
  erc20Abi,
  GENIE_MARKETS_ADDRESS,
  USDC_ADDRESS,
} from "@/lib/contracts";
import {
  formatUsdcDollar,
  formatUsdc,
  truncateAddress,
  RoundPhase,
  PHASE_LABELS,
  PHASE_COLORS,
} from "@/lib/utils";
import { useCurrentRound, formatCountdown } from "@/hooks/use-current-round";
import { useAdminActions } from "@/hooks/use-admin-actions";
import {
  ShieldAlert,
  ShieldCheck,
  Coins,
  Clock,
  Zap,
  KeyRound,
  Lock,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Copy,
} from "lucide-react";

export function AdminContent() {
  const { authenticated, ready, login, logout } = usePrivy();
  const { address: walletAddress } = useAccount();

  // --- Read Contract Owner & Verification ---
  const {
    data: contractOwner,
    isLoading: isOwnerLoading,
    refetch: refetchOwner,
  } = useReadContract({
    address: GENIE_MARKETS_ADDRESS,
    abi: genieMarketsAbi,
    functionName: "owner",
  });

  const ownerAddress = contractOwner ? (contractOwner as string) : "";
  const isOwner =
    authenticated &&
    !!walletAddress &&
    !!ownerAddress &&
    walletAddress.toLowerCase() === ownerAddress.toLowerCase();

  // --- Read Contract Balances ---
  const {
    data: contractBalanceRaw,
    isLoading: isContractBalanceLoading,
    refetch: refetchContractBalance,
  } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [GENIE_MARKETS_ADDRESS],
    query: { refetchInterval: 8000 },
  });

  const {
    data: adminBalanceRaw,
    refetch: refetchAdminBalance,
  } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: walletAddress ? [walletAddress] : undefined,
    query: { enabled: !!walletAddress, refetchInterval: 8000 },
  });

  const contractBalance = (contractBalanceRaw as bigint) ?? 0n;
  const adminBalance = (adminBalanceRaw as bigint) ?? 0n;

  // --- Read Durations ---
  const {
    data: openDurationRaw,
    refetch: refetchDurations,
  } = useReadContract({
    address: GENIE_MARKETS_ADDRESS,
    abi: genieMarketsAbi,
    functionName: "s_openDuration",
  });

  const { data: closeDurationRaw } = useReadContract({
    address: GENIE_MARKETS_ADDRESS,
    abi: genieMarketsAbi,
    functionName: "s_closeDuration",
  });

  const currentOpenDuration = openDurationRaw ? Number(openDurationRaw) : 75600;
  const currentCloseDuration = closeDurationRaw ? Number(closeDurationRaw) : 10800;

  // --- Read VRF Config & Immutables ---
  const { data: vrfCoordinatorRaw, refetch: refetchCoordinator } =
    useReadContract({
      address: GENIE_MARKETS_ADDRESS,
      abi: genieMarketsAbi,
      functionName: "s_vrfCoordinator",
    });

  const { data: subIdRaw } = useReadContract({
    address: GENIE_MARKETS_ADDRESS,
    abi: genieMarketsAbi,
    functionName: "i_subscriptionId",
  });

  const { data: callbackGasRaw } = useReadContract({
    address: GENIE_MARKETS_ADDRESS,
    abi: genieMarketsAbi,
    functionName: "i_callbackGasLimit",
  });

  const { data: keyHashRaw } = useReadContract({
    address: GENIE_MARKETS_ADDRESS,
    abi: genieMarketsAbi,
    functionName: "i_keyHash",
  });

  const vrfCoordinator = vrfCoordinatorRaw ? (vrfCoordinatorRaw as string) : "";
  const subId = subIdRaw ? subIdRaw.toString() : "—";
  const callbackGas = callbackGasRaw ? callbackGasRaw.toString() : "—";
  const keyHash = keyHashRaw ? (keyHashRaw as string) : "—";

  // --- Active Round State ---
  const {
    roundId,
    round,
    openTimeRemaining,
    closeTimeRemaining,
    isOpenCutoffPassed,
    isCloseCutoffPassed,
    isOpenDrawReady,
    isCloseDrawReady,
    isEmergencyStale,
    refetch: refetchCurrentRound,
  } = useCurrentRound();

  const { data: roundBetCountRaw, refetch: refetchBetCount } = useReadContract({
    address: GENIE_MARKETS_ADDRESS,
    abi: genieMarketsAbi,
    functionName: "getRoundBetCount",
    args: roundId ? [roundId] : undefined,
    query: { enabled: !!roundId, refetchInterval: 10000 },
  });

  const roundBetCount = roundBetCountRaw ? Number(roundBetCountRaw) : 0;

  // --- Refetch All Handler ---
  const refetchAll = useCallback(() => {
    refetchOwner();
    refetchContractBalance();
    refetchAdminBalance();
    refetchDurations();
    refetchCoordinator();
    refetchCurrentRound();
    refetchBetCount();
  }, [
    refetchOwner,
    refetchContractBalance,
    refetchAdminBalance,
    refetchDurations,
    refetchCoordinator,
    refetchCurrentRound,
    refetchBetCount,
  ]);

  // --- Admin Action Hook ---
  const {
    step,
    activeAction,
    error,
    reset,
    depositBankroll,
    withdrawBankroll,
    setDurations,
    setCoordinator,
    transferOwnership,
    acceptOwnership,
    requestOpenDraw,
    requestCloseDraw,
    cancelStaleRound,
  } = useAdminActions(refetchAll);

  // --- Local Form States ---
  const [depositAmount, setDepositAmount] = useState<string>("500");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [openHoursInput, setOpenHoursInput] = useState<string>(
    (currentOpenDuration / 3600).toString()
  );
  const [closeHoursInput, setCloseHoursInput] = useState<string>(
    (currentCloseDuration / 3600).toString()
  );
  const [newCoordinatorInput, setNewCoordinatorInput] = useState<string>("");
  const [newOwnerInput, setNewOwnerInput] = useState<string>("");
  const [copiedAddr, setCopiedAddr] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddr(id);
    setTimeout(() => setCopiedAddr(null), 2000);
  };

  // Helper for duration formatting
  const formatDurationText = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m (${seconds}s)`;
    if (hrs > 0) return `${hrs} hours (${seconds}s)`;
    return `${mins} minutes (${seconds}s)`;
  };

  // ─────────────────────────────────────────────────────────────
  // 1. Unauthenticated State
  // ─────────────────────────────────────────────────────────────
  if (!ready || !authenticated || !walletAddress) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-600/10 text-violet-400">
          <Lock className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Genie Markets Admin Console</h1>
          <p className="text-sm text-zinc-400">
            This area is restricted to the contract owner. Please connect your administrative wallet to continue.
          </p>
        </div>
        <button
          onClick={login}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-violet-600/25 hover:bg-violet-500 transition-all"
        >
          <KeyRound className="h-4 w-4" />
          Sign In as Admin
        </button>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. Unauthorized (Non-Owner) State
  // ─────────────────────────────────────────────────────────────
  if (!isOwnerLoading && !isOwner) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 space-y-6">
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-white">Access Restricted</h1>
            <p className="text-xs sm:text-sm text-zinc-300">
              The connected wallet is not the verified owner of the GenieMarkets protocol.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-2 text-left font-mono text-xs">
            <div className="flex items-center justify-between text-zinc-400">
              <span>Your Wallet:</span>
              <span className="text-white font-semibold">{truncateAddress(walletAddress)}</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span>Contract Owner:</span>
              <span className="text-amber-300 font-semibold">
                {ownerAddress ? truncateAddress(ownerAddress) : "Loading…"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={logout}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-all"
            >
              Sign Out
            </button>
            <button
              onClick={login}
              className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-violet-500 transition-all"
            >
              Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 3. Authorized Admin Dashboard
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 space-y-10">
      {/* Top Header & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Owner Verified
            </span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Protocol Admin Portal
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">
            Direct administrative controls for bankroll liquidity, round scheduling, VRF configuration, and protocol governance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refetchAll}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition-all"
            title="Refresh onchain state"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
          <a
            href={`https://sepolia.etherscan.io/address/${GENIE_MARKETS_ADDRESS}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition-all"
          >
            <ExternalLink className="h-3.5 w-3.5 text-zinc-500" />
            Etherscan
          </a>
        </div>
      </div>

      {/* Action Notification Banner */}
      {step !== "idle" && (
        <div
          className={`rounded-2xl border p-4 transition-all ${
            step === "submitting" || step === "approving"
              ? "border-blue-500/30 bg-blue-500/10 text-blue-300"
              : step === "success"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-red-500/30 bg-red-500/10 text-red-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {(step === "submitting" || step === "approving") && (
                <Loader2 className="h-5 w-5 animate-spin" />
              )}
              {step === "success" && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
              {step === "error" && <AlertTriangle className="h-5 w-5 text-red-400" />}
              <div>
                <p className="text-sm font-semibold">
                  {step === "approving" && "Approving USDC allowance for GenieMarkets…"}
                  {step === "submitting" && `Broadcasting ${activeAction} transaction to network…`}
                  {step === "success" && "Transaction confirmed successfully!"}
                  {step === "error" && (error || "Transaction failed")}
                </p>
              </div>
            </div>
            {step !== "submitting" && step !== "approving" && (
              <button
                onClick={reset}
                className="text-xs font-semibold underline hover:opacity-80"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      )}

      {/* Protocol Quick Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Stat 1: Bankroll Balance */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Contract Bankroll</span>
            <Coins className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="font-mono text-2xl font-bold text-white">
            {isContractBalanceLoading ? "…" : formatUsdcDollar(contractBalance)}
          </p>
          <p className="text-[11px] text-zinc-500 font-mono">
            {formatUsdc(contractBalance)} USDC
          </p>
        </div>

        {/* Stat 2: Active Round */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Current Round</span>
            <span
              className={`text-xs font-semibold ${round ? PHASE_COLORS[round.phase as RoundPhase] : "text-zinc-500"}`}
            >
              {round ? PHASE_LABELS[round.phase as RoundPhase] : "Loading…"}
            </span>
          </div>
          <p className="font-mono text-2xl font-bold text-white">
            #{roundId ? roundId.toString() : "—"}
          </p>
          <p className="text-[11px] text-zinc-500">
            {roundBetCount} {roundBetCount === 1 ? "bet" : "bets"} placed
          </p>
        </div>

        {/* Stat 3: Open Duration */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Open Duration</span>
            <Clock className="h-4 w-4 text-violet-400" />
          </div>
          <p className="font-mono text-2xl font-bold text-white">
            {(currentOpenDuration / 3600).toFixed(1)}h
          </p>
          <p className="text-[11px] text-zinc-500">
            Cutoff window: {currentOpenDuration.toLocaleString()}s
          </p>
        </div>

        {/* Stat 4: Close Duration */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Close Duration</span>
            <Clock className="h-4 w-4 text-blue-400" />
          </div>
          <p className="font-mono text-2xl font-bold text-white">
            {(currentCloseDuration / 3600).toFixed(1)}h
          </p>
          <p className="text-[11px] text-zinc-500">
            Close window: {currentCloseDuration.toLocaleString()}s
          </p>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: BANKROLL LIQUIDITY (DEPOSIT & WITHDRAW)
      ───────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-white">
          <Coins className="h-5 w-5 text-emerald-400" />
          Bankroll Management
        </h2>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Deposit Bankroll Card */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ArrowDownLeft className="h-4 w-4 text-emerald-400" />
                  Deposit Bankroll
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Fund contract bankroll with USDC to back player winnings.
                </p>
              </div>
              <div className="text-right text-xs">
                <span className="text-zinc-500">Your Balance: </span>
                <span className="font-mono font-semibold text-zinc-200">
                  {formatUsdcDollar(adminBalance)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Deposit Amount (USDC)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-zinc-500">
                  $
                </span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="500"
                  className="w-full rounded-xl border border-white/10 bg-black/60 pl-8 pr-4 py-3 font-mono text-white focus:border-violet-500 focus:outline-none"
                />
              </div>

              {/* Quick Chips */}
              <div className="flex gap-2">
                {["100", "500", "1000", "5000"].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setDepositAmount(amt)}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                      depositAmount === amt
                        ? "bg-violet-600/20 text-violet-300 ring-1 ring-violet-500/40"
                        : "border border-white/5 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>

              <button
                onClick={() => depositBankroll(depositAmount)}
                disabled={step === "approving" || step === "submitting" || !depositAmount}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 disabled:opacity-40 transition-all"
              >
                {step === "approving" && activeAction === "deposit" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Approving USDC…
                  </>
                ) : step === "submitting" && activeAction === "deposit" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Depositing to Bankroll…
                  </>
                ) : (
                  <>
                    <ArrowDownLeft className="h-4 w-4" />
                    Deposit USDC to Contract
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Withdraw Bankroll Card */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ArrowUpRight className="h-4 w-4 text-amber-400" />
                  Withdraw Bankroll
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Withdraw protocol profits or liquidity to owner wallet.
                </p>
              </div>
              <div className="text-right text-xs">
                <span className="text-zinc-500">Contract Total: </span>
                <span className="font-mono font-semibold text-emerald-400">
                  {formatUsdcDollar(contractBalance)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Withdraw Amount (USDC)
                </label>
                <button
                  onClick={() => setWithdrawAmount(formatUsdc(contractBalance))}
                  className="text-xs font-semibold text-violet-400 hover:text-violet-300 underline"
                >
                  Max Available
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-zinc-500">
                  $
                </span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-white/10 bg-black/60 pl-8 pr-4 py-3 font-mono text-white focus:border-violet-500 focus:outline-none"
                />
              </div>

              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-[11px] text-amber-300/90 leading-relaxed">
                Ensure sufficient bankroll remains in the contract to settle pending rounds and honor winner claims.
              </div>

              <button
                onClick={() => withdrawBankroll(withdrawAmount)}
                disabled={
                  step === "submitting" ||
                  !withdrawAmount ||
                  contractBalance === 0n
                }
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-600 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-600/20 hover:bg-amber-500 disabled:opacity-40 transition-all"
              >
                {step === "submitting" && activeAction === "withdraw" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Withdrawing from Bankroll…
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="h-4 w-4" />
                    Withdraw to Owner Wallet
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: ROUND DURATIONS CONFIGURATION
      ───────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-white">
          <Clock className="h-5 w-5 text-blue-400" />
          Round Durations & Scheduling
        </h2>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div>
              <h3 className="text-base font-bold text-white">
                Global Duration Parameters
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Configures the Open window and Close window durations. Changes apply automatically to subsequent rounds.
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="rounded-lg bg-black/40 border border-white/10 px-2.5 py-1 text-zinc-300">
                Current: {formatDurationText(currentOpenDuration)} Open +{" "}
                {formatDurationText(currentCloseDuration)} Close
              </span>
            </div>
          </div>

          {/* Presets */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Schedule Presets
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: "Standard Production (24h)", open: "21", close: "3", desc: "21h Open + 3h Close" },
                { label: "Fast Test (15m)", open: "0.1667", close: "0.0833", desc: "10 min Open + 5 min Close" },
                { label: "Ultra Rapid (3m)", open: "0.0333", close: "0.0167", desc: "2 min Open + 1 min Close" },
              ].map((p) => (
                <button
                  key={p.label}
                  onClick={() => {
                    setOpenHoursInput(p.open);
                    setCloseHoursInput(p.close);
                  }}
                  className="rounded-xl border border-white/5 bg-white/5 p-3 text-left hover:bg-white/10 hover:border-white/20 transition-all"
                >
                  <p className="text-xs font-bold text-white">{p.label}</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Form Inputs */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Open Duration (Hours)
              </label>
              <input
                type="number"
                min="0.01"
                step="0.1"
                value={openHoursInput}
                onChange={(e) => setOpenHoursInput(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 font-mono text-white focus:border-violet-500 focus:outline-none"
              />
              <p className="text-[11px] text-zinc-500 font-mono">
                = {Math.round((parseFloat(openHoursInput) || 0) * 3600)} seconds
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Close Duration (Hours)
              </label>
              <input
                type="number"
                min="0.01"
                step="0.1"
                value={closeHoursInput}
                onChange={(e) => setCloseHoursInput(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 font-mono text-white focus:border-violet-500 focus:outline-none"
              />
              <p className="text-[11px] text-zinc-500 font-mono">
                = {Math.round((parseFloat(closeHoursInput) || 0) * 3600)} seconds
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              const openSec = Math.round((parseFloat(openHoursInput) || 0) * 3600);
              const closeSec = Math.round((parseFloat(closeHoursInput) || 0) * 3600);
              setDurations(openSec, closeSec);
            }}
            disabled={step === "submitting"}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 disabled:opacity-40 transition-all"
          >
            {step === "submitting" && activeAction === "durations" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating Durations…
              </>
            ) : (
              <>
                <Clock className="h-4 w-4" />
                Apply New Round Durations
              </>
            )}
          </button>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: ACTIVE ROUND LIFECYCLE & VRF TRIGGERS
      ───────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-white">
          <Zap className="h-5 w-5 text-violet-400" />
          Round Lifecycle & VRF Oversight
        </h2>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold text-white">
                  Round #{roundId ? roundId.toString() : "—"}
                </span>
                <span
                  className={`text-xs font-semibold ${round ? PHASE_COLORS[round.phase as RoundPhase] : "text-zinc-500"}`}
                >
                  [{round ? PHASE_LABELS[round.phase as RoundPhase] : "—"}]
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Monitor cutoff checkpoints and trigger permissionless Chainlink VRF requests.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <div className="rounded-lg bg-black/40 border border-white/10 px-3 py-1.5 text-zinc-300">
                Open Timer: {formatCountdown(openTimeRemaining)}
              </div>
              <div className="rounded-lg bg-black/40 border border-white/10 px-3 py-1.5 text-zinc-300">
                Close Timer: {formatCountdown(closeTimeRemaining)}
              </div>
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Action 1: Open Draw */}
            <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-300">Open Draw (VRF)</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isOpenDrawReady
                      ? "bg-green-500/20 text-green-400"
                      : isOpenCutoffPassed
                        ? "bg-zinc-700 text-zinc-400"
                        : "bg-white/5 text-zinc-500"
                  }`}
                >
                  {isOpenDrawReady ? "Ready to Trigger" : isOpenCutoffPassed ? "Fulfilled" : "Cutoff Pending"}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Requests Open random words once open cutoff elapses.
              </p>
              <button
                onClick={() => roundId && requestOpenDraw(roundId)}
                disabled={!isOpenDrawReady || step === "submitting"}
                className={`w-full rounded-lg py-2 text-xs font-semibold transition-all ${
                  isOpenDrawReady
                    ? "bg-violet-600 text-white hover:bg-violet-500 shadow-md shadow-violet-600/25"
                    : "bg-white/5 text-zinc-600 cursor-not-allowed"
                }`}
              >
                {step === "submitting" && activeAction === "openDraw" ? (
                  <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                ) : (
                  "Trigger Open Draw"
                )}
              </button>
            </div>

            {/* Action 2: Close Draw & Settle */}
            <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-300">Close Draw (Settle)</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isCloseDrawReady
                      ? "bg-green-500/20 text-green-400"
                      : isCloseCutoffPassed
                        ? "bg-zinc-700 text-zinc-400"
                        : "bg-white/5 text-zinc-500"
                  }`}
                >
                  {isCloseDrawReady ? "Ready to Trigger" : isCloseCutoffPassed ? "Fulfilled" : "Cutoff Pending"}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Requests Close draw & settles round advancing to Round N+1.
              </p>
              <button
                onClick={() => roundId && requestCloseDraw(roundId)}
                disabled={!isCloseDrawReady || step === "submitting"}
                className={`w-full rounded-lg py-2 text-xs font-semibold transition-all ${
                  isCloseDrawReady
                    ? "bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-600/25"
                    : "bg-white/5 text-zinc-600 cursor-not-allowed"
                }`}
              >
                {step === "submitting" && activeAction === "closeDraw" ? (
                  <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                ) : (
                  "Trigger Close Draw & Settle"
                )}
              </button>
            </div>

            {/* Action 3: Emergency Cancel */}
            <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-300">Emergency Recovery</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isEmergencyStale
                      ? "bg-red-500/20 text-red-400 animate-pulse"
                      : "bg-white/5 text-zinc-500"
                  }`}
                >
                  {isEmergencyStale ? "Stale VRF Active" : "Normal"}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Recovers stuck round if Chainlink VRF stalls for &gt; 24h.
              </p>
              <button
                onClick={() => roundId && cancelStaleRound(roundId)}
                disabled={!isEmergencyStale || step === "submitting"}
                className={`w-full rounded-lg py-2 text-xs font-semibold transition-all ${
                  isEmergencyStale
                    ? "bg-red-600 text-white hover:bg-red-500 shadow-md shadow-red-600/25"
                    : "bg-white/5 text-zinc-600 cursor-not-allowed"
                }`}
              >
                {step === "submitting" && activeAction === "cancelStale" ? (
                  <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                ) : (
                  "Cancel Stale Round"
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 4: PROTOCOL IMMUTABLES & VRF COORDINATOR
      ───────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-white">
          <KeyRound className="h-5 w-5 text-amber-400" />
          Protocol Immutables & Chainlink Config
        </h2>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <tbody className="divide-y divide-white/5 font-mono">
                <tr>
                  <td className="py-2.5 text-zinc-400 font-sans">VRF Coordinator:</td>
                  <td className="py-2.5 text-white flex items-center gap-2">
                    <span>{vrfCoordinator || "—"}</span>
                    {vrfCoordinator && (
                      <button
                        onClick={() => handleCopy(vrfCoordinator, "coordinator")}
                        className="text-zinc-500 hover:text-zinc-300"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {copiedAddr === "coordinator" && (
                      <span className="text-emerald-400 font-sans text-[10px]">Copied!</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 text-zinc-400 font-sans">Subscription ID:</td>
                  <td className="py-2.5 text-zinc-200">{subId}</td>
                </tr>
                <tr>
                  <td className="py-2.5 text-zinc-400 font-sans">Callback Gas Limit:</td>
                  <td className="py-2.5 text-zinc-200">{callbackGas}</td>
                </tr>
                <tr>
                  <td className="py-2.5 text-zinc-400 font-sans">Key Hash:</td>
                  <td className="py-2.5 text-zinc-400 truncate max-w-xs">{keyHash}</td>
                </tr>
                <tr>
                  <td className="py-2.5 text-zinc-400 font-sans">USDC Token Address:</td>
                  <td className="py-2.5 text-zinc-300">{USDC_ADDRESS}</td>
                </tr>
                <tr>
                  <td className="py-2.5 text-zinc-400 font-sans">Claim Period:</td>
                  <td className="py-2.5 text-zinc-300 font-sans">30 Days (2,592,000s)</td>
                </tr>
                <tr>
                  <td className="py-2.5 text-zinc-400 font-sans">Emergency VRF Timeout:</td>
                  <td className="py-2.5 text-zinc-300 font-sans">24 Hours (86,400s)</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Update VRF Coordinator Input */}
          <div className="border-t border-white/5 pt-4 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Update VRF Coordinator Address
            </h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="0x..."
                value={newCoordinatorInput}
                onChange={(e) => setNewCoordinatorInput(e.target.value)}
                className="flex-1 rounded-xl border border-white/10 bg-black/60 px-4 py-2.5 font-mono text-xs text-white focus:border-violet-500 focus:outline-none"
              />
              <button
                onClick={() => setCoordinator(newCoordinatorInput)}
                disabled={step === "submitting" || !newCoordinatorInput}
                className="rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-violet-500 disabled:opacity-40 transition-all"
              >
                {step === "submitting" && activeAction === "coordinator" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Set Coordinator"
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 5: OWNERSHIP MANAGEMENT (2-STEP TRANSFER)
      ───────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-white">
          <ShieldCheck className="h-5 w-5 text-purple-400" />
          Contract Ownership & Governance
        </h2>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-5">
          <div>
            <span className="text-xs text-zinc-500">Current Owner Address:</span>
            <div className="flex items-center gap-2 font-mono text-sm font-bold text-white mt-0.5">
              <span>{ownerAddress}</span>
              <button
                onClick={() => handleCopy(ownerAddress, "owner")}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              {copiedAddr === "owner" && (
                <span className="text-emerald-400 text-xs font-sans">Copied!</span>
              )}
            </div>
          </div>

          <div className="border-t border-white/5 pt-4 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Transfer Ownership (Step 1 of 2)
            </h3>
            <p className="text-xs text-zinc-400">
              Proposes a new contract owner. The recipient address must call{" "}
              <code className="font-mono text-purple-300">acceptOwnership()</code> to finalize.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="New owner address (0x...)"
                value={newOwnerInput}
                onChange={(e) => setNewOwnerInput(e.target.value)}
                className="flex-1 rounded-xl border border-white/10 bg-black/60 px-4 py-2.5 font-mono text-xs text-white focus:border-violet-500 focus:outline-none"
              />
              <button
                onClick={() => transferOwnership(newOwnerInput)}
                disabled={step === "submitting" || !newOwnerInput}
                className="rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-purple-500 disabled:opacity-40 transition-all"
              >
                {step === "submitting" && activeAction === "transferOwnership" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Propose New Owner"
                )}
              </button>
            </div>
          </div>

          <div className="border-t border-white/5 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-semibold text-white">
                Accept Pending Ownership (Step 2 of 2)
              </h3>
              <p className="text-xs text-zinc-400">
                If the connected wallet was designated as the pending owner, click below to accept.
              </p>
            </div>
            <button
              onClick={acceptOwnership}
              disabled={step === "submitting"}
              className="rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-xs font-semibold text-purple-300 hover:bg-purple-500/20 transition-all"
            >
              {step === "submitting" && activeAction === "acceptOwnership" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Accept Ownership"
              )}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
