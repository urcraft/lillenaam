# Naamam — Baby Names Voting App

> End users setting up a fork should start with `README.md`. This file is for coding agents working in the codebase.

## Context

Indian Hindu couple from Kerala expecting a baby girl in Denmark. Denmark has an official list of approved names. ~25,000 names were processed through Gemini Flash and filtered to 2,655 Hindu/Hindu-sounding names with metadata (meaning, origin, Danish pronunciation difficulty).

This app lets friends and family browse and vote for their top 5 favorites. Parents get an admin dashboard to see which names are most popular.

This repo is now an open-source template — the family-specific context above describes the original build; treat copy and branding as fork-edit targets, not architectural requirements.

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.1.6 | App Router, TypeScript, Turbopack (default in v16) |
| React | 19.2.3 | UI library |
| Tailwind CSS | v4 | Utility-first CSS with `@theme inline` in `globals.css` |
| Firebase | 12.9.0 | Client-side Auth (Google Sign-In) + Firestore |
| PapaParse | 5.5.3 | CSV parsing for bulk name import |
| TypeScript | 5.x | Type safety |
| ESLint | 9.x | Linting with Next.js + TypeScript configs |

**No API routes, no server-side data fetching, no firebase-admin.** All Firestore reads/writes happen client-side using the Firebase JS SDK.

## Quick Start

```bash
npm install
```

Create `.env.local` (see `.env.local.example`):
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

```bash
npm run dev      # Dev server at http://localhost:3000
npm run build    # Production build (passes without .env.local due to lazy Firebase init)
npm run lint     # ESLint
```

## Project Structure

```
naamam/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout: Inter font, AuthProvider, Navbar, Footer
│   │   ├── page.tsx                # Landing page with Google sign-in (42 lines)
│   │   ├── globals.css             # Tailwind v4 import + @theme inline colors (19 lines)
│   │   ├── names/
│   │   │   └── page.tsx            # Name browser — main app screen (212 lines)
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Admin dashboard — stats + charts (197 lines)
│   │   └── admin/
│   │       └── seed/
│   │           └── page.tsx        # CSV upload + Firestore seeding (190 lines)
│   ├── components/
│   │   ├── AuthProvider.tsx        # React Context: user, loading, signInWithGoogle, signOut
│   │   ├── Navbar.tsx              # Responsive sticky nav, hamburger menu, admin links
│   │   ├── Footer.tsx              # "Made with 🪷 for our little one"
│   │   ├── NameCard.tsx            # Mobile card: heart toggle, name, origin, badge, meaning
│   │   ├── NameFilters.tsx         # 5 filters: search, Hindu, difficulty, origin multi-select, My Picks
│   │   ├── VoteCounter.tsx         # Fixed-bottom floating pill "X/5 selected"
│   │   └── DifficultyBadge.tsx     # Green/amber/red pill for EASY/MODERATE/HARD
│   └── lib/
│       ├── firebase.ts             # Lazy Firebase init: getFirebaseAuth(), getFirebaseDb()
│       ├── useAuth.ts              # Auth context consumer hook
│       ├── useAdmin.ts             # Checks config/admins doc for user email
│       ├── useVotes.ts             # Vote management: max 5, 500ms debounced save
│       └── useNames.ts             # Fetches all names, extracts unique origins
├── hindu_names.csv                 # 2,655 names (source data)
├── firestore.rules                 # Security rules (deployed to Firebase)
├── firebase.json                   # Points Firestore to rules file
├── .env.local.example              # Template for Firebase env vars
├── NEXT_STEPS.md                   # Implementation status and testing checklist
└── package.json                    # Scripts: dev, build, start, lint
```

## Architecture & Key Patterns

### Component Architecture
- **Pages** are data-fetching containers. All hooks and state live at the page level.
- **Components** are presentational. They receive data and callbacks via props (no internal data fetching).
- **Hooks** (`src/lib/use*.ts`) encapsulate reusable logic (auth, admin check, votes, names).

### Layout Hierarchy
`layout.tsx` wraps the entire app:
```
<html> → <body> → <AuthProvider> → <Navbar /> + <main>{children}</main> + <Footer />
```
Every page inherits the auth context, navbar, and footer automatically.

### State Management
- **Global auth state**: React Context (`AuthProvider`) — `user`, `loading`, `signInWithGoogle()`, `signOut()`
- **Local component state**: `useState()` for filters, pagination, UI toggles
- **Firestore reads**: Batch reads on mount (no real-time listeners / `onSnapshot`)
- **Firestore writes**: Debounced (500ms) in `useVotes` to avoid excessive writes

### Firebase Client Init (`src/lib/firebase.ts`)
Uses **lazy initialization** — Firebase app is only created when `getFirebaseAuth()` or `getFirebaseDb()` is first called. This ensures `npm run build` passes even without `.env.local`. Never import Firebase eagerly at module scope from page/component files.

### Responsive Design
- **Mobile-first**: Cards layout by default, hamburger nav
- **Desktop**: Table layout at `md:` breakpoint (768px+)
- Pattern: `md:hidden` for mobile-only elements, `hidden md:block` for desktop-only

### Error Handling
- **Silent failures** for vote saves and admin checks — app continues working
- **Loading states**: Boolean flags (`loading`, `authLoading`) in hooks
- **Error state**: `useNames` exposes `error` string for fetch failures

## Firestore Data Model

### Collections

**`names/{auto-id}`** — 2,655 documents (read-only after seeding)
```typescript
interface NameEntry {
  id: string;                                    // Firestore doc ID
  name: string;                                  // e.g., "Abarna"
  hindu: "YES" | "MAYBE";
  meaning: string;                               // can be empty
  originNotes: string;                           // comma-separated, e.g., "Tamil, Sanskrit"
  danishPronunciationIssues: string;             // e.g., "Retroflex R" (often empty)
  danishDifficulty: "EASY" | "MODERATE" | "HARD" | "";
}
```

**`votes/{googleUserId}`** — one doc per voter
```typescript
{
  email: string;
  displayName: string;
  photoURL: string;
  names: string[];          // up to 5 name strings
  favorite: string | null;  // user's #1 pick (must be one of `names`, or null)
  updatedAt: Timestamp;
}
```

**`config/admins`** — single document
```typescript
{
  emails: string[];         // array of admin Gmail addresses
}
```

### Security Rules (actual `firestore.rules`)
```
names/*     → read: authenticated; write: denied
votes/*     → read: authenticated; write: authenticated AND uid matches doc ID
config/*    → read: authenticated; write: denied
```
Any authenticated user can read all votes (needed for the admin dashboard). This is acceptable since vote data is not sensitive.

## CSV Data Source

`hindu_names.csv` in project root. Columns:
- `Name`, `Hindu` (YES/MAYBE), `Meaning`, `Origin_Notes`, `Danish_Pronunciation_Issues`, `Danish_Difficulty` (EASY/MODERATE/HARD)

Seeded via `/admin/seed` page using PapaParse. Batch-writes 500 documents at a time.

## Firebase Setup

Firebase project: **your-project-id**

Required console setup:
1. **Authentication** > Sign-in method > Google — enabled
2. **Firestore Database** > Create database
3. **Firestore** > Create document `config/admins` with `emails` array containing admin Gmail addresses
4. **Authentication** > Settings > Authorized domains — add `localhost` and Vercel URL
5. Deploy rules: `firebase deploy --only firestore:rules`

## Design System

### Colors (defined in `globals.css` via `@theme inline`)
| Token | Hex | Usage | Tailwind class |
|---|---|---|---|
| saffron | `#FF6B35` | Primary/buttons | `bg-saffron`, `text-saffron` |
| saffron-dark | `#E55A2B` | Hover states | `hover:bg-saffron-dark` |
| cream | `#FFF8F0` | Page background | `bg-cream` |
| charcoal | `#2D2D2D` | Body text | `text-charcoal` |

### Difficulty Badge Colors (use explicit hex, not theme vars)
| Level | Background | Text | Example class |
|---|---|---|---|
| EASY | `#22C55E26` | `#22C55E` | `bg-[#22C55E26] text-[#22C55E]` |
| MODERATE | `#F59E0B26` | `#F59E0B` | `bg-[#F59E0B26] text-[#F59E0B]` |
| HARD | `#EF444426` | `#EF4444` | `bg-[#EF444426] text-[#EF444426]` |

**Important**: Use explicit hex values (e.g., `bg-[#22C55E26]`) for difficulty badge colors instead of Tailwind theme references. Tailwind v4 opacity modifiers on custom `@theme inline` colors can produce unreliable results.

### Visual Style
- Rounded corners: `rounded-xl`
- Soft shadows: `shadow-md`
- Font: Inter (via `next/font/google`, variable `--font-inter`)
- Feel: warm, joyful, celebratory — not clinical

## Pages & Routes

### `/` — Landing Page
- Sign-in with Google button
- Auto-redirects to `/names` if already authenticated
- No protection — public

### `/names` — Name Browser (protected)
- Redirects to `/` if not signed in
- Loads all 2,655 names from Firestore on mount (small enough for client-side)
- **5 filters**: text search, Hindu (YES/MAYBE/Both), difficulty (EASY/MODERATE/HARD/All), origin (multi-select checkbox dropdown), My Picks toggle
- **Voting**: heart toggle, max 5, floating counter, 500ms debounced save to `votes/{uid}`
- **Pagination**: 50 names per page
- **Responsive**: cards on mobile (`md:hidden`), table on desktop (`hidden md:block`)

### `/dashboard` — Admin Dashboard (admin-only)
- Protected: must be signed in AND email in `config/admins.emails`
- Stats cards: total voters, unique names voted, names appearing on 2+ lists
- Top 20 bar chart (pure CSS bars, no chart library)
- Voter breakdown: profile photos, display names, their 5 picks as chips

### `/admin/seed` — CSV Seeder (admin-only)
- Upload `hindu_names.csv`, parse with PapaParse
- Batch-write to Firestore in chunks of 500
- Progress bar during seeding
- Handles re-seeding: prompts to delete existing names first

## Development Conventions

### Naming
- **Components**: PascalCase (`NameCard.tsx`, `AuthProvider.tsx`)
- **Hooks**: `use` prefix, camelCase (`useAuth.ts`, `useVotes.ts`)
- **Firestore fields**: camelCase (`originNotes`, `danishDifficulty`)
- **CSS**: Tailwind utility classes only, no CSS modules

### Code Style
- All page/component files use `"use client"` directive (client-side Firebase SDK)
- Path alias `@/*` maps to `./src/*` (configured in `tsconfig.json`)
- TypeScript strict mode enabled
- No API routes — all data access is client-side Firestore

### Key Implementation Details
- `useVotes` debounces saves with a 500ms timer and cleans up on unmount
- `useNames` splits comma-separated `originNotes` to extract unique origins for the filter dropdown
- `useAdmin` fetches the `config/admins` document and checks if the current user's email is in the array
- Names are sorted alphabetically on fetch
- The `names` collection is write-once (only the seed page writes; no edits from the app)

### What NOT to Do
- Do NOT use `firebase-admin` on the client side
- Do NOT add real-time listeners (`onSnapshot`) for the names collection — batch read is fine for 2,655 docs
- Do NOT use Tailwind `@theme inline` color tokens with opacity modifiers for badge colors — use explicit hex
- Do NOT eagerly initialize Firebase at module scope — always use `getFirebaseAuth()` / `getFirebaseDb()`
- Do NOT add API routes for basic CRUD — the Firebase JS SDK handles everything client-side

## Deployment

1. Push to GitHub
2. Connect repo to Vercel
3. Set all `NEXT_PUBLIC_FIREBASE_*` env vars in Vercel project settings
4. Add Vercel deployment URL to Firebase Auth authorized domains
5. Add Vercel URL to Google Cloud OAuth authorized redirect URIs
6. Deploy Firestore rules: `firebase deploy --only firestore:rules`
7. Test production build end-to-end

## Implementation Status

All features are fully implemented:
- 4 pages (landing, names browser, admin dashboard, seed page)
- 7 components (AuthProvider, Navbar, Footer, NameCard, NameFilters, VoteCounter, DifficultyBadge)
- 5 hooks (firebase init, useAuth, useAdmin, useVotes, useNames)
- ~764 lines of TypeScript total

See `NEXT_STEPS.md` for the testing checklist and optional polish items.
