# CSE3CWA — Assessment 1: Phoneme Activity Builder

Frontend builder for Speech Pathology teachers and students to create phoneme-based **Wordle** and **Word Search** classroom activities, preview them in the browser, and download a single playable `.html` file.

Assessment 1 is **frontend only** (no database or dynamic word lists).

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

| Route | Purpose |
| --- | --- |
| `/` | Home / introduction |
| `/about` | Project explanation, student details, how-to video |
| `/wordle` | Phoneme Wordle builder, preview, Generate HTML |
| `/word-search` | Phoneme Word Search builder, preview, Generate HTML |
| `/settings` | Light/dark theme and layout density (cookie-persisted) |

## Generate HTML

On the Wordle or Word Search page, use **Generate HTML** to download a self-contained activity file. Open the downloaded file in any modern browser (including offline / `file://`).

## Before submission

1. Set your student number in [`lib/student.ts`](lib/student.ts).
2. Add your how-to video as [`public/howto.mp4`](public/howto.mp4) or replace the About page video with an embed.
3. Record the verbal justification covering design decisions, component structure, usability, accessibility, trade-offs, and Speech Pathology classroom support.

## Scripts

```bash
npm run lint
npm run build
npm start
```

## Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS v4
- Cookie-based theme / layout preferences via Server Actions
