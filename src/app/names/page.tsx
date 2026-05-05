"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { useAdmin } from "@/lib/useAdmin";
import { useNames, NameEntry } from "@/lib/useNames";
import { useVotes } from "@/lib/useVotes";
import NameCard from "@/components/NameCard";
import NameFilters from "@/components/NameFilters";
import VoteCounter from "@/components/VoteCounter";
import DifficultyBadge from "@/components/DifficultyBadge";

const PAGE_SIZE = 50;

function getOriginColor(origin: string): { bg: string; text: string } {
  const lower = origin.toLowerCase();
  if (lower.includes("sanskrit")) return { bg: "bg-purple-100", text: "text-purple-700" };
  if (lower.includes("tamil")) return { bg: "bg-teal-100", text: "text-teal-700" };
  if (lower.includes("hindi")) return { bg: "bg-blue-100", text: "text-blue-700" };
  if (lower.includes("malayalam")) return { bg: "bg-green-100", text: "text-green-700" };
  return { bg: "bg-gray-100", text: "text-gray-600" };
}

export default function NamesPage() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin } = useAdmin();
  const { names, loading: namesLoading } = useNames();
  const { selectedNames, toggleVote, isSelected, isFavorite, toggleFavorite, maxVotes, favorite } = useVotes({ unlimited: isAdmin });
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("ALL");
  const [showMyPicks, setShowMyPicks] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  const filtered = useMemo(() => {
    let result: NameEntry[] = names;

    if (showMyPicks) {
      result = result.filter((n) => selectedNames.includes(n.name));
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((n) => n.name.toLowerCase().includes(q));
    }

    if (difficultyFilter !== "ALL") {
      result = result.filter((n) => n.danishDifficulty === difficultyFilter);
    }

    return result;
  }, [names, search, difficultyFilter, showMyPicks, selectedNames]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const effectivePage = Math.min(page, Math.max(1, totalPages));
  const paginated = filtered.slice((effectivePage - 1) * PAGE_SIZE, effectivePage * PAGE_SIZE);

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-saffron" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
      <h1 className="text-xl font-bold text-charcoal mb-4">Browse Names</h1>

      <NameFilters
        search={search}
        onSearchChange={setSearch}
        difficultyFilter={difficultyFilter}
        onDifficultyChange={setDifficultyFilter}
        showMyPicks={showMyPicks}
        onMyPicksChange={setShowMyPicks}
        selectedNames={selectedNames}
        maxVotes={maxVotes}
        onRemovePick={toggleVote}
        favoriteName={favorite}
      />

      {namesLoading ? (
        <div className="text-center py-12 text-gray-400">Loading names...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          No names match your filters.
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-400 mb-3">
            {filtered.length} name{filtered.length !== 1 ? "s" : ""} found
          </p>

          {/* Mobile: cards */}
          <div className="grid gap-3 md:hidden">
            {paginated.map((entry) => (
              <NameCard
                key={entry.id}
                entry={entry}
                isSelected={isSelected(entry.name)}
                isFavorite={isFavorite(entry.name)}
                onToggle={() => toggleVote(entry.name)}
                onToggleFavorite={() => toggleFavorite(entry.name)}
                disabled={selectedNames.length >= maxVotes}
              />
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden md:block bg-white rounded-xl shadow-md overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-white shadow-sm">
                <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                  <th className="px-4 py-3 w-10"></th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Meaning</th>
                  <th className="px-4 py-3">Origin</th>
                  <th className="px-4 py-3">Difficulty</th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((entry) => {
                  const selected = isSelected(entry.name);
                  const fav = isFavorite(entry.name);
                  const atMax = selectedNames.length >= maxVotes;
                  return (
                    <tr
                      key={entry.id}
                      className={`border-b border-gray-50 hover:bg-saffron/5 ${selected ? "bg-saffron/5" : "even:bg-orange-50/40"}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-center gap-0.5">
                          <button
                            onClick={() => toggleVote(entry.name)}
                            disabled={atMax && !selected}
                            className={`text-2xl transition-transform cursor-pointer ${
                              selected ? "scale-110" : ""
                            } ${atMax && !selected ? "cursor-not-allowed" : "hover:scale-125"}`}
                            aria-label={selected ? `Remove ${entry.name}` : `Vote for ${entry.name}`}
                          >
                            {selected ? "\u{1F9E1}" : "\u{2661}"}
                          </button>
                          {selected && (
                            <button
                              onClick={() => toggleFavorite(entry.name)}
                              className="text-lg cursor-pointer hover:scale-125 transition-transform"
                              aria-label={fav ? `Unmark ${entry.name} as favorite` : `Mark ${entry.name} as favorite`}
                            >
                              {fav ? "\u2B50" : "\u2606"}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold text-base text-charcoal">
                        {entry.name}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {entry.meaning || "\u2014"}
                      </td>
                      <td className="px-4 py-3">
                        {entry.originNotes ? (
                          (() => {
                            const colors = getOriginColor(entry.originNotes);
                            return (
                              <span className={`text-xs ${colors.bg} ${colors.text} px-2 py-0.5 rounded-full`}>
                                {entry.originNotes}
                              </span>
                            );
                          })()
                        ) : (
                          "\u2014"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <DifficultyBadge difficulty={entry.danishDifficulty} />
                      </td>
                      <td className="px-4 py-3">
                        {entry.danishPronunciationIssues ? (
                          <span className="relative group/pron">
                            <span className="text-gray-400 cursor-help">{"\u2139\uFE0F"}</span>
                            <span className="absolute bottom-full right-0 mb-2 px-3 py-1.5 text-xs text-white bg-charcoal rounded-lg w-64 opacity-0 group-hover/pron:opacity-100 transition-opacity pointer-events-none z-20">
                              {entry.danishPronunciationIssues}
                            </span>
                          </span>
                        ) : (
                          <span className="text-gray-300">&mdash;</span>
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
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={effectivePage === 1}
                className="px-3 py-1 rounded-lg text-sm bg-white shadow disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <span className="px-3 py-1 text-sm text-gray-500">
                {effectivePage} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={effectivePage === totalPages}
                className="px-3 py-1 rounded-lg text-sm bg-white shadow disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <VoteCounter count={selectedNames.length} max={maxVotes} />
    </div>
  );
}
