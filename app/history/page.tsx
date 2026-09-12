"use client";

import { useReadContract, useReadContracts } from "wagmi";
import { genieMarketsAbi, GENIE_MARKETS_ADDRESS } from "@/lib/contracts";
import {
  RoundPhase,
  PHASE_LABELS,
  PHASE_COLORS,
} from "@/lib/utils";
import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  History,
  ChevronLeft,
  ChevronRight,
  Hash,
  Clock,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

const ROUNDS_PER_PAGE = 10;

export function HistoryPageContent() {
  const [page, setPage] = useState(0);

  // Get current round ID
  const { data: currentRoundId } = useReadContract({
    address: GENIE_MARKETS_ADDRESS,
    abi: genieMarketsAbi,
    functionName: "s_currentRoundId",
  });

  const totalRounds = currentRoundId ? Number(currentRoundId as bigint) : 0;
  const totalPages = Math.max(1, Math.ceil(totalRounds / ROUNDS_PER_PAGE));

  // Calculate which round IDs to fetch for this page (newest first)
  const roundIds = useMemo(() => {
    if (totalRounds === 0) return [];
    const start = totalRounds - page * ROUNDS_PER_PAGE;
    const end = Math.max(1, start - ROUNDS_PER_PAGE + 1);
    return Array.from({ length: start - end + 1 }, (_, i) =>
      BigInt(start - i)
    );
  }, [totalRounds, page]);

  // Multicall to fetch all round data
  const roundCalls = useMemo(
    () =>
      roundIds.map((id) => ({
        address: GENIE_MARKETS_ADDRESS as `0x${string}`,
        abi: genieMarketsAbi,
        functionName: "s_rounds" as const,
        args: [id] as const,
      })),
    [roundIds]
  );

  const { data: roundsData, isLoading } = useReadContracts({
    contracts: roundCalls,
    query: { enabled: roundCalls.length > 0 },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shadow-xl shadow-cyan-500/15">
            <History className="h-7 w-7" />
          </div>
          <div>
            <h1 className="font-heading font-black text-3xl sm:text-4xl text-white tracking-tight">
              Round Explorer
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
              Cryptographic ledger of protocol rounds, Chainlink VRF verified draws, and onchain settlements.
            </p>
          </div>
        </div>

        <Badge
          variant="cyber"
          className="self-start sm:self-auto text-xs font-hud uppercase tracking-wider px-3.5 py-1.5 rounded-xl flex items-center gap-2"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500" />
          </span>
          Onchain Archive // Sepolia
        </Badge>
      </div>

      {/* Metric Overview HUD Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Rounds */}
        <Card className="rounded-2xl bg-[#0B0F1A]/85 backdrop-blur-xl border border-white/10 p-5 shadow-xl flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
            <Hash className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[11px] font-hud uppercase tracking-wider text-slate-400">Total Rounds Deployed</span>
            <p className="font-hud text-2xl sm:text-3xl font-black text-white tabular-nums">
              #{totalRounds}
            </p>
            <span className="text-[11px] text-cyan-400 font-mono">Ethereum Sepolia (11155111)</span>
          </div>
        </Card>

        {/* Card 2: VRF Engine */}
        <Card className="rounded-2xl bg-[#0B0F1A]/85 backdrop-blur-xl border border-white/10 p-5 shadow-xl flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[11px] font-hud uppercase tracking-wider text-slate-400">Entropy Verification</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-heading text-lg sm:text-xl font-bold text-white">
                Chainlink VRF v2.5
              </span>
            </div>
            <span className="text-[11px] text-emerald-400 font-mono font-medium">
              Direct Verifiable Oracles
            </span>
          </div>
        </Card>

        {/* Card 3: Settlement Cadence */}
        <Card className="rounded-2xl bg-[#0B0F1A]/85 backdrop-blur-xl border border-white/10 p-5 shadow-xl flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-400">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[11px] font-hud uppercase tracking-wider text-slate-400">Execution Schedule</span>
            <p className="font-heading text-lg sm:text-xl font-bold text-white mt-0.5">
              Continuous Rounds
            </p>
            <span className="text-[11px] text-violet-400 font-mono">Open & Close dual market draws</span>
          </div>
        </Card>
      </div>

      {/* Main Table Card */}
      {isLoading ? (
        <Card className="rounded-2xl bg-[#0B0F1A]/85 backdrop-blur-xl border border-white/10 p-7 space-y-4 shadow-2xl">
          <Skeleton className="h-10 w-full bg-white/5 rounded-xl" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full bg-white/5 rounded-xl" />
          ))}
        </Card>
      ) : totalRounds === 0 ? (
        <Card className="rounded-2xl bg-[#0B0F1A]/85 backdrop-blur-xl border border-white/10 p-12 text-center text-slate-400 shadow-2xl space-y-3">
          <History className="mx-auto h-12 w-12 text-slate-600" />
          <p className="font-heading font-bold text-lg text-white">No Rounds Recorded Yet</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Once round #1 completes initialization, cryptographic draws and historical settlements will populate this ledger.
          </p>
        </Card>
      ) : (
        <Card className="rounded-2xl bg-[#0B0F1A]/85 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-[#07090E]/90 text-[11px] font-hud font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4">Round</th>
                  <th className="px-6 py-4">Protocol State</th>
                  <th className="px-6 py-4 text-center">Open Draw (3 Digits + Single)</th>
                  <th className="px-6 py-4 text-center">Close Draw (3 Digits + Single)</th>
                  <th className="px-6 py-4 text-center">Winning Pair</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {roundIds.map((id, i) => {
                  const result = roundsData?.[i];
                  if (result?.status !== "success" || !result.result)
                    return null;

                  const r = result.result as readonly unknown[];
                  const phase = Number(r[0]) as RoundPhase;
                  const openD1 = Number(r[6]);
                  const openD2 = Number(r[7]);
                  const openD3 = Number(r[8]);
                  const closeD1 = Number(r[9]);
                  const closeD2 = Number(r[10]);
                  const closeD3 = Number(r[11]);
                  const openSingle = Number(r[12]);
                  const closeSingle = Number(r[13]);
                  const pairResult = Number(r[14]);

                  const showOpen =
                    phase >= RoundPhase.CloseBetting &&
                    phase !== RoundPhase.Cancelled;
                  const showClose = phase >= RoundPhase.Settled;

                  return (
                    <tr
                      key={id.toString()}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4 font-mono">
                        <span className="inline-flex h-9 px-3 items-center justify-center rounded-xl bg-[#05070B] border border-white/10 font-hud font-black text-sm text-cyan-400 tabular-nums">
                          #{id.toString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className={`font-mono text-xs font-semibold h-9 px-3 rounded-xl border-white/10 bg-[#05070B] inline-flex items-center gap-1.5 ${PHASE_COLORS[phase]}`}
                        >
                          {phase === RoundPhase.Settled ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                          ) : phase === RoundPhase.OpenBetting ? (
                            <span className="relative flex h-2 w-2">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                            </span>
                          ) : null}
                          {PHASE_LABELS[phase]}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {showOpen ? (
                          <div className="inline-flex items-center justify-center gap-2.5 font-mono tabular-nums">
                            <span className="font-hud font-bold text-sm tracking-widest text-white px-3 py-1.5 rounded-xl bg-[#05070B] border border-white/10">
                              {openD1} · {openD2} · {openD3}
                            </span>
                            <span className="font-hud text-xs font-bold px-2.5 py-1.5 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-300 flex items-center gap-1.5">
                              <span className="text-[10px] uppercase text-violet-400/80">Single</span>
                              <span className="text-sm font-black text-white">{openSingle}</span>
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-xl bg-[#05070B] border border-white/5 text-xs font-hud text-slate-500 uppercase">
                            Awaiting VRF
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {showClose ? (
                          <div className="inline-flex items-center justify-center gap-2.5 font-mono tabular-nums">
                            <span className="font-hud font-bold text-sm tracking-widest text-white px-3 py-1.5 rounded-xl bg-[#05070B] border border-white/10">
                              {closeD1} · {closeD2} · {closeD3}
                            </span>
                            <span className="font-hud text-xs font-bold px-2.5 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 flex items-center gap-1.5">
                              <span className="text-[10px] uppercase text-cyan-400/80">Single</span>
                              <span className="text-sm font-black text-white">{closeSingle}</span>
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-xl bg-[#05070B] border border-white/5 text-xs font-hud text-slate-500 uppercase">
                            Awaiting VRF
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {showClose ? (
                          <span className="font-hud text-base font-black text-amber-400 tabular-nums px-3.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 inline-flex items-center justify-center tracking-wide">
                            {pairResult.toString().padStart(2, "0")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-xl bg-[#05070B] border border-white/5 text-xs font-hud text-slate-500 uppercase">
                            Awaiting VRF
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-white/5 bg-[#07090E]/90 p-4 px-6 flex items-center justify-between flex-wrap gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="h-9 px-4 rounded-xl border-white/10 bg-[#05070B] hover:bg-white/5 text-slate-300 font-hud uppercase tracking-wider text-xs gap-1.5"
              >
                <ChevronLeft className="h-4 w-4" />
                Newer Rounds
              </Button>
              <span className="text-xs font-mono text-slate-400 tabular-nums">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="h-9 px-4 rounded-xl border-white/10 bg-[#05070B] hover:bg-white/5 text-slate-300 font-hud uppercase tracking-wider text-xs gap-1.5"
              >
                Older Rounds
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

export default function HistoryPage() {
  return <HistoryPageContent />;
}
