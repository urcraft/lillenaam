"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { useAdmin } from "@/lib/useAdmin";

const HELP_SEEN_KEY = "naamam_help_seen";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(() => {
    if (typeof window !== "undefined" && !localStorage.getItem(HELP_SEEN_KEY)) {
      localStorage.setItem(HELP_SEEN_KEY, "1");
      return true;
    }
    return false;
  });

  const isNamesPage = pathname === "/names";

  if (!user) return null;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/names" className="flex items-center gap-2 text-xl font-bold text-saffron">
          <Image
            src="/icon.png"
            alt="Naamam"
            width={32}
            height={32}
            className="w-8 h-8"
          />
          <span>Naamam</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-4">
          <Link
            href="/names"
            className="text-charcoal hover:text-saffron transition-colors"
          >
            Names
          </Link>
          {isAdmin && (
            <>
              <Link
                href="/dashboard"
                className="text-charcoal hover:text-saffron transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/seed"
                className="text-charcoal hover:text-saffron transition-colors"
              >
                Seed
              </Link>
            </>
          )}
          {isNamesPage && (
            <button
              onClick={() => setShowHelp(true)}
              className="w-7 h-7 rounded-full bg-saffron/10 text-saffron font-bold text-sm hover:bg-saffron hover:text-white transition-colors cursor-pointer flex items-center justify-center"
              aria-label="Help"
            >
              ?
            </button>
          )}
          <div className="flex items-center gap-2 ml-4">
            {user.photoURL && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={user.photoURL}
                alt=""
                className="w-8 h-8 rounded-full"
                referrerPolicy="no-referrer"
              />
            )}
            <button
              onClick={signOut}
              className="text-sm text-gray-500 hover:text-charcoal transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Mobile: help + hamburger */}
        <div className="sm:hidden flex items-center gap-1">
          {isNamesPage && (
            <button
              onClick={() => setShowHelp(true)}
              className="w-7 h-7 rounded-full bg-saffron/10 text-saffron font-bold text-sm hover:bg-saffron hover:text-white transition-colors cursor-pointer flex items-center justify-center"
              aria-label="Help"
            >
              ?
            </button>
          )}
        <button
          className="p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6 text-charcoal"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden border-t px-4 pb-3 bg-white">
          <Link
            href="/names"
            className="block py-2 text-charcoal"
            onClick={() => setMenuOpen(false)}
          >
            Names
          </Link>
          {isAdmin && (
            <>
              <Link
                href="/dashboard"
                className="block py-2 text-charcoal"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/admin/seed"
                className="block py-2 text-charcoal"
                onClick={() => setMenuOpen(false)}
              >
                Seed
              </Link>
            </>
          )}
          <button
            onClick={() => {
              signOut();
              setMenuOpen(false);
            }}
            className="block py-2 text-gray-500"
          >
            Sign out
          </button>
        </div>
      )}
      {/* Help modal */}
      {showHelp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] px-6 py-5 text-center relative">
              <button
                onClick={() => setShowHelp(false)}
                className="absolute top-3 right-4 text-white/60 hover:text-white text-xl leading-none cursor-pointer"
                aria-label="Close"
              >
                {"\u00D7"}
              </button>
              <div className="text-3xl mb-1">{"\u{1F9E1}"}</div>
              <h2 className="text-lg font-bold text-white">How voting works</h2>
              <p className="text-sm text-white/70 mt-1">Pick your top 5 names</p>
            </div>
            <div className="px-5 py-4 space-y-2.5">
              <div className="flex items-center gap-3 rounded-xl border border-gray-100 px-3.5 py-3">
                <span className="w-9 h-9 flex items-center justify-center rounded-full bg-[#FFF1F0] text-xl shrink-0">{"\u2661"}</span>
                <div>
                  <span className="text-sm font-medium text-charcoal">Tap the heart</span>
                  <span className="text-xs text-gray-400 block">Vote for a name (max 5)</span>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-gray-100 px-3.5 py-3">
                <span className="w-9 h-9 flex items-center justify-center rounded-full bg-[#FFF1F0] text-xl shrink-0">{"\u{1F9E1}"}</span>
                <div>
                  <span className="text-sm font-medium text-charcoal">Tap again</span>
                  <span className="text-xs text-gray-400 block">Remove a vote</span>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-gray-100 px-3.5 py-3">
                <span className="w-9 h-9 flex items-center justify-center rounded-full bg-[#FFFBEB] text-xl shrink-0">{"\u2606"}</span>
                <div>
                  <span className="text-sm font-medium text-charcoal">Tap the star</span>
                  <span className="text-xs text-gray-400 block">Mark your #1 favorite</span>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-gray-100 px-3.5 py-3">
                <span className="w-9 h-9 flex items-center justify-center rounded-full bg-[#FFFBEB] text-xl shrink-0">{"\u2B50"}</span>
                <div>
                  <span className="text-sm font-medium text-charcoal">Tap star again</span>
                  <span className="text-xs text-gray-400 block">Remove the favorite</span>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-gray-100 px-3.5 py-3">
                <span className="w-9 h-9 flex items-center justify-center rounded-full bg-[#6366F1]/10 shrink-0">
                  <span className="text-xs font-bold text-[#6366F1]">0/5</span>
                </span>
                <div>
                  <span className="text-sm font-medium text-charcoal">Bottom pill</span>
                  <span className="text-xs text-gray-400 block">Tracks your picks</span>
                </div>
              </div>
            </div>
            <div className="px-5 pb-5">
              <button
                onClick={() => setShowHelp(false)}
                className="w-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white py-2.5 rounded-xl font-medium hover:opacity-90 transition-opacity cursor-pointer"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
