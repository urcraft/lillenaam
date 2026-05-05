"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { useAuth } from "@/lib/useAuth";

export function useAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const checkAdmin = async () => {
      try {
        const adminDoc = await getDoc(doc(getFirebaseDb(), "config", "admins"));
        if (adminDoc.exists()) {
          const emails: string[] = adminDoc.data().emails || [];
          setIsAdmin(emails.includes(user.email || ""));
        } else {
          setIsAdmin(false);
        }
      } catch {
        setIsAdmin(false);
      }
      setLoading(false);
    };

    checkAdmin();
  }, [user]);

  return { isAdmin: user ? isAdmin : false, loading: user ? loading : false };
}
