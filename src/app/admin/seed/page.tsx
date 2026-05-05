"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { collection, writeBatch, doc, getDocs } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { useAuth } from "@/lib/useAuth";
import { useAdmin } from "@/lib/useAdmin";

interface CsvRow {
  Name: string;
  Hindu: string;
  Meaning: string;
  Origin_Notes: string;
  Danish_Pronunciation_Issues: string;
  Danish_Difficulty: string;
}

export default function SeedPage() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<"idle" | "parsing" | "seeding" | "done" | "error">("idle");
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!authLoading && !adminLoading) {
      if (!user || !isAdmin) {
        router.push("/");
      }
    }
  }, [user, isAdmin, authLoading, adminLoading, router]);

  const handleUpload = async () => {
    const file = fileInput.current?.files?.[0];
    if (!file) return;

    setStatus("parsing");
    setMessage("");

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data.filter((r) => r.Name);

        // Check for existing data
        const existing = await getDocs(collection(getFirebaseDb(), "names"));
        if (existing.size > 0) {
          const confirmed = window.confirm(
            `The names collection already has ${existing.size} documents. Do you want to delete them and re-seed?`
          );
          if (!confirmed) {
            setStatus("idle");
            return;
          }

          // Delete existing docs in batches
          setMessage("Deleting existing names...");
          const deleteBatches = [];
          let delBatch = writeBatch(getFirebaseDb());
          let delCount = 0;
          for (const d of existing.docs) {
            delBatch.delete(d.ref);
            delCount++;
            if (delCount % 500 === 0) {
              deleteBatches.push(delBatch);
              delBatch = writeBatch(getFirebaseDb());
            }
          }
          if (delCount % 500 !== 0) deleteBatches.push(delBatch);
          for (const b of deleteBatches) await b.commit();
        }

        setStatus("seeding");
        const totalBatches = Math.ceil(rows.length / 500);
        setProgress({ current: 0, total: totalBatches });

        try {
          for (let i = 0; i < rows.length; i += 500) {
            const batch = writeBatch(getFirebaseDb());
            const chunk = rows.slice(i, i + 500);
            for (const row of chunk) {
              const ref = doc(collection(getFirebaseDb(), "names"));
              batch.set(ref, {
                name: row.Name.trim(),
                hindu: row.Hindu?.trim() || "YES",
                meaning: row.Meaning?.trim() || "",
                originNotes: row.Origin_Notes?.trim() || "",
                danishPronunciationIssues:
                  row.Danish_Pronunciation_Issues?.trim() || "",
                danishDifficulty: row.Danish_Difficulty?.trim() || "",
              });
            }
            await batch.commit();
            setProgress((p) => ({ ...p, current: p.current + 1 }));
          }
          setStatus("done");
          setMessage(`Successfully seeded ${rows.length} names.`);
        } catch (err) {
          setStatus("error");
          setMessage(
            err instanceof Error ? err.message : "Failed to seed data"
          );
        }
      },
      error: (err) => {
        setStatus("error");
        setMessage(err.message);
      },
    });
  };

  if (authLoading || adminLoading || !user || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-saffron" />
      </div>
    );
  }

  const progressPercent =
    progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-charcoal mb-6">
        Seed Names Database
      </h1>

      <div className="bg-white rounded-xl shadow-md p-6">
        <p className="text-sm text-gray-500 mb-4">
          Upload the <code className="bg-gray-100 px-1 rounded">hindu_names.csv</code> file to
          populate the names collection in Firestore.
        </p>

        <input
          ref={fileInput}
          type="file"
          accept=".csv"
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-saffron/10 file:text-saffron hover:file:bg-saffron/20 mb-4"
        />

        <button
          onClick={handleUpload}
          disabled={status === "parsing" || status === "seeding"}
          className="bg-saffron hover:bg-saffron-dark text-white font-semibold py-2 px-6 rounded-xl shadow-md transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          {status === "parsing"
            ? "Parsing..."
            : status === "seeding"
              ? "Seeding..."
              : "Upload & Seed"}
        </button>

        {/* Progress bar */}
        {status === "seeding" && (
          <div className="mt-4">
            <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className="bg-saffron h-full rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Batch {progress.current} / {progress.total} ({progressPercent}%)
            </p>
          </div>
        )}

        {/* Status message */}
        {message && (
          <p
            className={`mt-4 text-sm ${
              status === "error" ? "text-[#EF4444]" : "text-[#22C55E]"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
