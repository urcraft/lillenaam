"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { useAuth } from "@/lib/useAuth";
import { useAdmin } from "@/lib/useAdmin";

interface VoteDoc {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  names: string[];
  favorite: string | null;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const router = useRouter();
  const [votes, setVotes] = useState<VoteDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !adminLoading) {
      if (!user || !isAdmin) {
        router.push("/");
      }
    }
  }, [user, isAdmin, authLoading, adminLoading, router]);

  useEffect(() => {
    if (!user || !isAdmin) return;

    const fetchVotes = async () => {
      const snapshot = await getDocs(collection(getFirebaseDb(), "votes"));
      const data: VoteDoc[] = snapshot.docs.map((d) => ({
        uid: d.id,
        email: d.data().email || "",
        displayName: d.data().displayName || "",
        photoURL: d.data().photoURL || "",
        names: d.data().names || [],
        favorite: d.data().favorite || null,
      }));
      setVotes(data);
      setLoading(false);
    };

    fetchVotes();
  }, [user, isAdmin]);

  const stats = useMemo(() => {
    const nameCounts = new Map<string, number>();
    const favCounts = new Map<string, number>();
    votes.forEach((v) => {
      v.names.forEach((name) => {
        nameCounts.set(name, (nameCounts.get(name) || 0) + 1);
      });
      if (v.favorite) {
        favCounts.set(v.favorite, (favCounts.get(v.favorite) || 0) + 1);
      }
    });

    const sorted = Array.from(nameCounts.entries())
      .sort((a, b) => b[1] - a[1]);
    const top20 = sorted.slice(0, 20);
    const maxCount = top20.length > 0 ? top20[0][1] : 1;
    const multiList = sorted.filter(([, count]) => count >= 2).length;

    const totalSelections = votes.reduce((sum, v) => sum + v.names.length, 0);
    const totalFavorites = votes.filter((v) => v.favorite).length;

    return {
      totalVoters: votes.length,
      uniqueNames: nameCounts.size,
      multiList,
      totalSelections,
      totalFavorites,
      top20,
      maxCount,
      favCounts,
    };
  }, [votes]);

  const removeVoteFromUser = async (voterUid: string, nameToRemove: string) => {
    const voter = votes.find((v) => v.uid === voterUid);
    if (!voter) return;

    const confirmed = window.confirm(
      `Remove "${nameToRemove}" from ${voter.displayName || voter.email}'s picks?`
    );
    if (!confirmed) return;

    const updatedNames = voter.names.filter((n) => n !== nameToRemove);
    const updatedFavorite = voter.favorite === nameToRemove ? null : voter.favorite;

    try {
      await updateDoc(doc(getFirebaseDb(), "votes", voterUid), {
        names: updatedNames,
        favorite: updatedFavorite,
      });
      setVotes((prev) =>
        prev.map((v) =>
          v.uid === voterUid
            ? { ...v, names: updatedNames, favorite: updatedFavorite }
            : v
        )
      );
    } catch (err) {
      console.error("Failed to remove vote:", err);
    }
  };

  if (authLoading || adminLoading || !user || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-saffron" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-charcoal mb-6">Admin Dashboard</h1>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading votes...</div>
      ) : (
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-md p-4 text-center">
              <div className="text-3xl font-bold text-saffron">
                {stats.totalVoters}
              </div>
              <div className="text-sm text-gray-500 mt-1">Total voters</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 text-center">
              <div className="text-3xl font-bold text-saffron">
                {stats.totalSelections}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Total selections
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 text-center">
              <div className="text-3xl font-bold text-saffron">
                {stats.totalFavorites}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Total favorites
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 text-center">
              <div className="text-3xl font-bold text-saffron">
                {stats.uniqueNames}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Unique names
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 text-center col-span-2 sm:col-span-1">
              <div className="text-3xl font-bold text-saffron">
                {stats.multiList}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                On 2+ lists
              </div>
            </div>
          </div>

          {/* Top 20 chart */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-lg font-semibold text-charcoal mb-4">
              Top 20 Names
            </h2>
            {stats.top20.length === 0 ? (
              <p className="text-gray-400">No votes yet.</p>
            ) : (
              <div className="space-y-2">
                {stats.top20.map(([name, count]) => {
                  const favCount = stats.favCounts.get(name) || 0;
                  return (
                    <div key={name} className="flex items-center gap-3">
                      <span className="w-28 text-sm font-medium text-charcoal truncate text-right">
                        {name}
                      </span>
                      <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                        <div
                          className="bg-saffron h-full rounded-full transition-all"
                          style={{
                            width: `${(count / stats.maxCount) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-500 w-8">{count}</span>
                      <span className="text-sm w-10 text-right" title={`${favCount} favorite${favCount !== 1 ? "s" : ""}`}>
                        {favCount > 0 ? `\u2B50${favCount}` : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Voter breakdown */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-charcoal mb-4">
              Voter Breakdown
            </h2>
            {votes.length === 0 ? (
              <p className="text-gray-400">No voters yet.</p>
            ) : (
              <div className="space-y-4">
                {votes.map((voter) => (
                  <div
                    key={voter.email}
                    className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0"
                  >
                    {voter.photoURL ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={voter.photoURL}
                        alt=""
                        className="w-10 h-10 rounded-full shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
                    )}
                    <div>
                      <div className="font-medium text-charcoal">
                        {voter.displayName || voter.email}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {voter.names.map((name) => (
                          <span
                            key={name}
                            className="text-xs bg-saffron/10 text-saffron px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                          >
                            {voter.favorite === name && "\u2B50 "}{name}
                            <button
                              onClick={() => removeVoteFromUser(voter.uid, name)}
                              className="text-saffron/50 hover:text-red-500 cursor-pointer ml-0.5 text-sm leading-none font-bold"
                              aria-label={`Remove ${name} from ${voter.displayName || voter.email}`}
                            >
                              {"\u00D7"}
                            </button>
                          </span>
                        ))}
                        {voter.names.length === 0 && (
                          <span className="text-xs text-gray-400">
                            No picks yet
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
