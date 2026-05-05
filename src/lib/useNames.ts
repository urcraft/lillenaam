"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";

export interface NameEntry {
  id: string;
  name: string;
  hindu: "YES" | "MAYBE";
  meaning: string;
  originNotes: string;
  danishPronunciationIssues: string;
  danishDifficulty: "EASY" | "MODERATE" | "HARD" | "";
}

export function useNames() {
  const [names, setNames] = useState<NameEntry[]>([]);
  const [origins, setOrigins] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNames = async () => {
      try {
        const snapshot = await getDocs(collection(getFirebaseDb(), "names"));
        const data: NameEntry[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name || "",
          hindu: doc.data().hindu || "YES",
          meaning: doc.data().meaning || "",
          originNotes: doc.data().originNotes || "",
          danishPronunciationIssues: doc.data().danishPronunciationIssues || "",
          danishDifficulty: doc.data().danishDifficulty || "",
        }));
        data.sort((a, b) => a.name.localeCompare(b.name));
        setNames(data);

        const originSet = new Set<string>();
        data.forEach((n) => {
          if (n.originNotes) {
            n.originNotes.split(",").forEach((o) => {
              const trimmed = o.trim();
              if (trimmed) originSet.add(trimmed);
            });
          }
        });
        setOrigins(Array.from(originSet).sort());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch names");
      }
      setLoading(false);
    };

    fetchNames();
  }, []);

  return { names, origins, loading, error };
}
