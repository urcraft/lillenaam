# Naamam — Baby Names Voting

A small Next.js + Firebase web app that lets friends and family browse a curated list of baby names, pick their top 5, and crown a #1 favorite. The original build was for one Indian family expecting a baby girl in Denmark, where parents must choose from an officially approved name list. The codebase is now an open-source template — fork it for your own family, swap the name list, rebrand the copy, and ship it.

It's intentionally small: ~750 lines of TypeScript, no API routes, all data flows directly from the browser to Firestore via the Firebase JS SDK.

## Screenshots

_Add your own screenshots here once deployed._

## Tech stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.1.6 | App Router, TypeScript, Turbopack (default in v16) |
| React | 19.2.3 | UI library |
| Tailwind CSS | v4 | Utility-first CSS with `@theme inline` in `globals.css` |
| Firebase | 12.9.0 | Client-side Auth (Google Sign-In) + Firestore |
| PapaParse | 5.5.3 | CSV parsing for bulk name import |
| TypeScript | 5.x | Type safety |
| ESLint | 9.x | Linting with Next.js + TypeScript configs |

## Quick start (local dev)

Requires Node.js 20+ (see `.nvmrc`).

```bash
git clone https://github.com/YOUR-USERNAME/YOUR-FORK.git
cd YOUR-FORK
npm install
cp .env.local.example .env.local
# Fill in Firebase config + NEXT_PUBLIC_SITE_URL in .env.local
npm run dev
```

Open `http://localhost:3000`.

## Firebase setup

1. **Create a project** at [console.firebase.google.com](https://console.firebase.google.com).
2. **Enable Google sign-in:** *Authentication* → *Sign-in method* → enable **Google**.
3. **Create the Firestore database:** *Firestore Database* → *Create database*. Production mode is fine — security rules are deployed below.
4. **Bootstrap the admin doc (this is the chicken-and-egg gotcha):** in *Firestore* → *Data*, manually create document `config/admins` with field `emails` (array) containing your Gmail address. **This must be done before `/admin/seed` will let you in.** Without it, no one is an admin and you can't seed names through the UI.
5. **Authorize localhost:** *Authentication* → *Settings* → *Authorized domains* → add `localhost`. Your Vercel domain doesn't exist yet — add it in step 7.4 below after the first deploy.
6. **Deploy Firestore rules:**
   ```bash
   npm i -g firebase-tools
   firebase login
   firebase use --add        # link to your project
   firebase deploy --only firestore:rules
   ```
7. **Copy the web config:** *Project Settings* → *General* → *Your apps* → *Web app* (create one if missing) → copy the config values into `.env.local`. The six required vars are listed in `.env.local.example`.

## Seeding the names database

1. Sign in to your dev or deployed app with the admin email you added in step 4 above.
2. Go to `/admin/seed`.
3. Upload a CSV with this exact schema (column names are case-sensitive):

   | Column | Values |
   |---|---|
   | `Name` | string |
   | `Hindu` | `YES` or `MAYBE` |
   | `Meaning` | string (can be empty) |
   | `Origin_Notes` | comma-separated origins, e.g. `Tamil, Sanskrit` |
   | `Danish_Pronunciation_Issues` | string (can be empty) |
   | `Danish_Difficulty` | `EASY`, `MODERATE`, or `HARD` |

The repo includes `hindu_names.csv` (2,655 names) as a template for Indian families. Replace it with your own dataset otherwise. Re-seeding prompts to wipe existing names first.

## Vercel deployment

1. Push your fork to GitHub.
2. Import the repo at [vercel.com/new](https://vercel.com/new).
3. Set **all 7** `NEXT_PUBLIC_*` env vars in the Vercel project settings — the 6 Firebase ones plus `NEXT_PUBLIC_SITE_URL` set to your production Vercel URL (e.g. `https://your-app.vercel.app`). `NEXT_PUBLIC_SITE_URL` is required for OG images on social shares to resolve correctly.
4. After the first deploy succeeds, add the Vercel URL to:
   - **Firebase** → *Authentication* → *Authorized domains*
   - **Google Cloud Console** → *APIs & Services* → *Credentials* → your OAuth 2.0 client → *Authorized redirect URIs*
5. Redeploy so the new auth config takes effect.

## Customization checklist (fork-and-edit)

Personal copy and branding stay in source so forkers have one place to grep. Use these search anchors instead of line numbers — line numbers go stale on the first edit.

- **App name and OG description:** `src/app/layout.tsx` — change the `APP_NAME` and `APP_DESCRIPTION` constants at the top of the file. Two edit points to rebrand all metadata.
- **Landing page heading + copy + Danish registry link:** `src/app/page.tsx` — search for `"baby girl"` and `"familieretshuset.dk"`.
- **Footer text:** `src/components/Footer.tsx` — search for `"Made with"`.
- **Navbar brand:** `src/components/Navbar.tsx` — search for `<span>Naamam</span>`.
- **Help modal copy:** `src/components/Navbar.tsx` — search for `"How voting works"`.
- **Logos:** replace `public/icon.png`, `public/apple-icon.png`, `public/opengraph-image.png`.

## Localizing for non-Denmark forks

The data model uses `danishDifficulty` and `danishPronunciationIssues` fields. **These are repurposable for any country** — for German names, fill in German pronunciation difficulty under the same field names; the UI will display whatever you put there.

If you want to rename the fields properly, the relevant files are:

- `src/lib/useNames.ts`
- `src/components/NameCard.tsx`
- `src/components/DifficultyBadge.tsx`
- `src/components/NameFilters.tsx`
- `src/app/admin/seed/page.tsx` (CSV column mapping)
- `src/app/names/page.tsx` (filter state)

## Security notes

Read these before deploying anywhere outside a closed family circle.

- `firestore.rules` allows **any authenticated user to read all `votes/*` documents.** The admin dashboard depends on this. **For a closed family circle this is fine. If you deploy publicly, anyone who signs in with Google can see every voter's picks.** Tighten the rules before public deployment.
- The `config/admins` document is similarly readable by all authenticated users — admin email addresses are not secret in this app.
- All Firebase config lives in `NEXT_PUBLIC_*` vars. **These are safe to commit and expose** — Firebase security is enforced by `firestore.rules` and Authorized domains, not by hiding the API key.

## Project structure

```
naamam/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout: Inter font, AuthProvider, Navbar, Footer
│   │   ├── page.tsx                # Landing page with Google sign-in
│   │   ├── globals.css             # Tailwind v4 import + @theme inline colors
│   │   ├── names/
│   │   │   └── page.tsx            # Name browser — main app screen
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Admin dashboard — stats + charts
│   │   └── admin/
│   │       └── seed/
│   │           └── page.tsx        # CSV upload + Firestore seeding
│   ├── components/
│   │   ├── AuthProvider.tsx        # React Context: user, loading, signInWithGoogle, signOut
│   │   ├── Navbar.tsx              # Responsive sticky nav, hamburger menu, admin links
│   │   ├── Footer.tsx              # Footer copy
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
├── hindu_names.csv                 # 2,655 names (template — swap for your own)
├── firestore.rules                 # Security rules (deployed to Firebase)
├── firebase.json                   # Points Firestore to rules file
├── .env.local.example              # Template for env vars
└── package.json
```

## Troubleshooting

- **Build passes but app won't connect at runtime.** `npm run build` succeeds even without `.env.local` because Firebase is lazy-initialized. Check that all 7 `NEXT_PUBLIC_*` vars are set in your runtime environment.
- **Admin features missing (`/dashboard` or `/admin/seed` redirects you out).** Check that `config/admins.emails` contains your exact Gmail address. The check is case-sensitive on the email string.
- **OAuth `redirect_uri_mismatch`.** Add the Vercel URL to the Google Cloud OAuth client's *Authorized redirect URIs* (Firebase auth domain alone isn't enough).
- **OG images not rendering on social shares.** Confirm `NEXT_PUBLIC_SITE_URL` is set in Vercel and points to your production URL. If unset, Next.js falls back to `localhost:3000` and bakes that into the image URLs in metadata.
- **CSV upload errors.** Column names are case-sensitive and must match the schema in *Seeding* above exactly.

## License

MIT — see [`LICENSE`](./LICENSE).
