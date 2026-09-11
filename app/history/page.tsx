"use client";

import { useReadContract, useReadContracts } from "wagmi";
import { genieMarketsAbi, GENIE_MARKETS_ADDRESS } from "@/lib/contracts";
import {
  RoundPhase,
  PHASE_LABELS,
  PHASE_COLORS,
} from "@/lib/utils";
import { useState, useMemo } from "react";
import { History, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { ClaimCard } from "@/components/claim-card";

const ROUNDS_PER_PAGE = 10;

export default function HistoryPage() {
  const [page, setPage] = useState(0);

  // Get current round ID
  const { data: currentRoundId } = useReadContract({
    address: GENIE_MARKETS_ADDRESS,
    abi: genieMarketsAbi,
    functionName: "s_currentRoundId",
  });

  const totalRounds = currentRoundId ? Number(currentRoundId as bigint) : 0;
  const totalPages = Math.ceil(totalRounds / ROUNDS_PER_PAGE);

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
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
      <div>
        <h1 className="flex items-center gap-3 text-3xl font-bold text-white">
          <History className="h-8 w-8 text-violet-400" />
          Round History
        </h1>
        <p className="mt-2 text-zinc-400">
          Browse past rounds and their results.
        </p>
      </div>

      <ClaimCard />


      {isLoading || totalRounds === 0 ? (
        <div className="flex items-center justify-center py-20">
          {isLoading ? (
            <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
          ) : (
            <p className="text-zinc-500">No rounds yet.</p>
          )}
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03]">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Round
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Open Draw
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Close Draw
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Pair
                  </th>
                </tr>
              </thead>
              <tbody>
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
                      className="border-b border-white/5 transition-colors hover:bg-white/[0.02]"
                    >
                      <td className="px-4 py-3 font-mono text-sm font-semibold text-white">
                        #{id.toString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-semibold ${PHASE_COLORS[phase]}`}
                        >
                          {PHASE_LABELS[phase]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {showOpen ? (
                          <div>
                            <span className="font-mono text-sm text-white">
                              {openD1}-{openD2}-{openD3}
                            </span>
                            <span className="ml-2 text-xs text-violet-400">
                              ({openSingle})
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {showClose ? (
                          <div>
                            <span className="font-mono text-sm text-white">
                              {closeD1}-{closeD2}-{closeD3}
                            </span>
                            <span className="ml-2 text-xs text-blue-400">
                              ({closeSingle})
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {showClose ? (
                          <span className="font-mono text-sm font-bold text-amber-400">
                            {pairResult.toString().padStart(2, "0")}
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-600">—</span>
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
            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-400 transition-all hover:bg-white/10 disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
                Newer
              </button>
              <span className="text-sm text-zinc-500">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-400 transition-all hover:bg-white/10 disabled:opacity-30"
              >
                Older
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
