# CSE3CWA Assessment 1 — Phoneme Activity Builder

Frontend-only builder interface for teachers to create and preview two phoneme-based classroom activities:
- **Phoneme Wordle**
- **Phoneme Word Search**

The app lets teachers configure settings, preview student gameplay, and download a **single self-contained `.html`** file for browser use.

## Tech stack
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4

## Required pages
- **Home**: project introduction + links to tools
- **About**: assessment context, tool overview, student details, video slot
- **Wordle**: phoneme Wordle builder
- **Word Search**: phoneme word-search builder
- **Settings**: theme/density preferences persisted in cookies

## Core workflow
1. Open **Wordle** or **Word Search**
2. Configure phoneme content + settings
3. Use the live **Activity Preview**
4. Click **Generate HTML** to download a standalone playable file

## Accessibility and usability highlights
- Keyboard-navigable controls and action buttons
- Visible focus states and skip link
- Hint tooltips with phoneme-to-grapheme mapping (e.g. `/θ/ → TH (as in thin)`)
- Color + pattern feedback for Wordle status clarity
- Responsive layout across compact and wide screens

## Project structure
- `app/` route pages and shared layout
- `components/layout/` shell, header, nav, footer, mobile menu
- `components/wordle/` Wordle builder + preview + gameplay UI
- `components/word-search/` Word Search builder + preview + gameplay UI
- `components/shared/` reusable form/layout cards
- `lib/generate-wordle-html.ts` and `lib/generate-word-search-html.ts` export generators
- `data/phonemes.ts` phoneme inventory and Assessment 1 defaults

## Local development
```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Quality checks
```bash
npm run lint
npm run build
```

## About page video
Place your walkthrough at:
- `public/howto.mp4`

The About page will render it automatically in the embedded player.
