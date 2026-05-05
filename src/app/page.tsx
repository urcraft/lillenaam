"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/useAuth";

export default function LandingPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/names");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-saffron" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <div className="flex items-center gap-4 mb-2">
        <Image
          src="/icon.png"
          alt="Naamam logo"
          width={72}
          height={72}
          className="w-16 h-16 md:w-18 md:h-18"
          priority
        />
        <h1 className="text-5xl md:text-6xl font-bold text-saffron">
          Naamam
        </h1>
      </div>
      <p className="text-lg text-gray-600 max-w-2xl mt-4 mb-8">
        Help us choose a name for our baby girl! Browse{" "}
        <a
          href="https://familieretshuset.dk/emner/navne/navnelister/godkendte-fornavne/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-saffron hover:underline"
        >
          officially approved Danish names
        </a>{" "}
        with Indic origins and pick your top 5, including your #1 favorite.
      </p>
      <button
        onClick={signInWithGoogle}
        className="bg-saffron hover:bg-saffron-dark text-white font-semibold py-3 px-8 rounded-xl shadow-md transition-colors text-lg cursor-pointer"
      >
        Sign in with Google
      </button>
    </div>
  );
}
