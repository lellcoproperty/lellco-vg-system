# Lellco On-Site Checklist App

A mobile-friendly React app for on-site assessment, package recommendation, completion sign-off, job photo capture, local save/load, PDF export, and an agent summary screen.

## Quick local run
1. Install Node.js 18+
2. Open this folder in a terminal
3. Run:
   npm install
   npm run dev

## Deploy on Vercel
1. Create a free Vercel account
2. Create a new GitHub repo and upload these files, or drag the folder into Vercel
3. Framework preset: Vite
4. Build command: npm run build
5. Output directory: dist

## What this app does
- Tap-to-check issue assessment
- Auto package recommendation
- Agent summary wording
- Before-start and completion sign-off
- Photo upload/capture
- Save/load jobs in browser storage
- Print-friendly PDF export

## Notes
- Saved jobs stay on the device/browser that created them
- PDF export opens the browser print dialog
- Camera capture support depends on the phone/browser

## Branded production additions
- Lellco-branded colour palette
- Home screen install manifest
- Home screen and Apple touch icons
- Install guidance inside the app

## After deployment
- Open the site on your phone
- iPhone: Share > Add to Home Screen
- Android Chrome: Menu > Install app or Add to Home screen


## Weekly scoreboard added
- Added Weekly Scoreboard tab
- Editable targets and actuals
- Auto KPI calculations
- Traffic-light status indicators
- Save/load weekly history in browser storage


## Case study + WordPress publish added
- Added Case Study tab
- Builds website-ready case study HTML from each job
- Can copy HTML for manual use
- Direct publish to WordPress via /api/publish-case-study
- Requires Vercel environment variables: WP_BASE_URL, WP_USERNAME, WP_APP_PASSWORD


## Checklist reintegrated
- Added Checklist tab back into the field app
- Assessment issues now auto-feed issue count and package recommendation
- Completion workflow, before-start checks, and post-job checks restored
- Case study builder now also uses assessment findings
