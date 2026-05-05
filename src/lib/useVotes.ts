"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { useAuth } from "@/lib/useAuth";

const MAX_VOTES = 5;

export function useVotes(options?: { unlimited?: boolean }) {
  const unlimited = options?.unlimited ?? false;
  const { user } = useAuth();
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [favorite, setFavorite] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchVotes = async () => {
      try {
        const voteDoc = await getDoc(doc(getFirebaseDb(), "votes", user.uid));
        if (voteDoc.exists()) {
          setSelectedNames(voteDoc.data().names || []);
          setFavorite(voteDoc.data().favorite || null);
        }
      } catch {
        // Votes not found, start fresh
      }
      setLoading(false);
    };

    fetchVotes();
  }, [user]);

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const saveVotes = useCallback(
    (names: string[], fav: string | null) => {
      if (!user) return;

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(async () => {
        try {
          await setDoc(doc(getFirebaseDb(), "votes", user.uid), {
            email: user.email || "",
            displayName: user.displayName || "",
            photoURL: user.photoURL || "",
            names,
            favorite: fav,
            updatedAt: serverTimestamp(),
          });
        } catch {
          // Silent fail — will retry on next interaction
        }
      }, 500);
    },
    [user]
  );

  const toggleVote = useCallback(
    (name: string) => {
      setSelectedNames((prev) => {
        let next: string[];
        if (prev.includes(name)) {
          next = prev.filter((n) => n !== name);
          // Clear favorite if the removed name was the favorite
          if (favorite === name) {
            setFavorite(null);
            saveVotes(next, null);
            return next;
          }
          saveVotes(next, favorite);
          return next;
        } else if (unlimited || prev.length < MAX_VOTES) {
          next = [...prev, name];
        } else {
          return prev;
        }
        saveVotes(next, favorite);
        return next;
      });
    },
    [saveVotes, favorite, unlimited]
  );

  const toggleFavorite = useCallback(
    (name: string) => {
      if (!selectedNames.includes(name)) return;
      const next = favorite === name ? null : name;
      setFavorite(next);
      saveVotes(selectedNames, next);
    },
    [selectedNames, favorite, saveVotes]
  );

  const isFavorite = useCallback(
    (name: string) => favorite === name,
    [favorite]
  );

  const isSelected = useCallback(
    (name: string) => selectedNames.includes(name),
    [selectedNames]
  );

  return {
    selectedNames,
    toggleVote,
    isSelected,
    loading,
    maxVotes: unlimited ? Infinity : MAX_VOTES,
    favorite,
    toggleFavorite,
    isFavorite,
  };
}
