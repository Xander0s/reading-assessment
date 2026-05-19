# Reading Assessment

A Progressive Web App for DIBELS 8th Edition Oral Reading Fluency assessments. Works offline. Deployable via GitHub Pages and installable on iPad via JAMF Web Clip.

## Features

- Student management (manual entry + CSV import)
- Pre-loaded DIBELS Grade 4 passages (Beginning / Middle / End of Year, Australasian wording) plus custom texts
- One-minute countdown timer
- Three-state word marking (correct → error → self-corrected → cleared)
- One-minute mark (`]`) placement after the timer expires; words after the mark are disabled
- Live WCPM, accuracy %, errors and self-corrections
- Per-student and per-assessment CSV export
- Offline-first via a service worker; localStorage persistence

## Stack

- Vite + React 18
- Tailwind CSS 3
- `vite-plugin-pwa` (Workbox-based service worker)
- Sharp (for generating PNG app icons from `public/favicon.svg`)

## Local development

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # production build → dist/
npm run preview      # preview the built app
```

## Deployment (Cloudflare Pages)

Deployment uses Cloudflare's Git integration — pushes to `main` are built and published automatically. No CI workflow lives in this repo.

First-time setup:

1. In the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git**.
2. Authorize Cloudflare against GitHub and pick `Xander0s/reading-assessment`.
3. Configure the build:
   - **Project name:** `reading-assessment` (gives `reading-assessment.pages.dev`)
   - **Production branch:** `main`
   - **Framework preset:** *None* (or "Vite" if listed)
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node version:** `20` (set via env var `NODE_VERSION=20` if Cloudflare's default differs)
4. Save & deploy. Every subsequent push to `main` redeploys; PRs get preview URLs automatically.

Cloudflare-specific files in `public/`:

- `_redirects` — SPA fallback so deep links resolve to `index.html`.
- `_headers` — disables edge caching for `sw.js` / `manifest.webmanifest` (otherwise a stale service worker can be pinned), and marks hashed `/assets/*` as immutable.

The Vite `base` is `/` because Cloudflare Pages serves the project at the root of its subdomain.

## JAMF Web Clip

1. JAMF Pro → Configuration Profiles → New → add a **Web Clip** payload.
2. Label: `Reading Assessment`
3. URL: the Cloudflare Pages URL (e.g. `https://reading-assessment.pages.dev/`).
4. Icon: upload `public/icon-192.png`.
5. Full Screen: ✓
6. Scope and deploy.

## Data

All data is stored in `localStorage` under the `reading-assessment:` prefix:

- `reading-assessment:students` — array of student records
- `reading-assessment:assessmentTexts` — array of texts
- `reading-assessment:assessments:<studentId>` — per-student history
