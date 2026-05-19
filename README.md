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

## Deployment (GitHub Pages)

Pushes to `main` trigger `.github/workflows/deploy.yml`, which builds and publishes `dist/` to Pages.

First-time setup:

1. In the repo on GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Push to `main`.
3. The first run will publish to `https://<user>.github.io/reading-assessment/`.

The Vite `base` in `vite.config.js` is hard-coded to `/reading-assessment/` — change it if you rename the repo.

## JAMF Web Clip

1. JAMF Pro → Configuration Profiles → New → add a **Web Clip** payload.
2. Label: `Reading Assessment`
3. URL: the GitHub Pages URL.
4. Icon: upload `public/icon-192.png`.
5. Full Screen: ✓
6. Scope and deploy.

## Data

All data is stored in `localStorage` under the `reading-assessment:` prefix:

- `reading-assessment:students` — array of student records
- `reading-assessment:assessmentTexts` — array of texts
- `reading-assessment:assessments:<studentId>` — per-student history
