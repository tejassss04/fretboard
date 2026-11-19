# Fretboard

> **An interactive guitar studio and music theory playground built to explore the fretboard, refine your timing and pitch, and jam with friends directly in the browser.**

[![Next.js](https://img.shields.io/badge/Next.js-16.4.5-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Web Audio API](https://img.shields.io/badge/Web_Audio_API-Zero--Latency-orange?style=flat)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

---

## Overview

# 🎸 Fretboard

As a guitar player and enthusiast myself, I've always wanted to build something around this beautiful instrument. I wanted to create something that could make guitar practice easier and bring all the useful tools a guitarist needs into one place.

That's how **Fretboard** started.

Fretboard is a guitar practice companion where you can explore chords and scales, practise with a timer, tune your guitar, keep track of rhythm with a metronome, save your favourite songs, and track your progress over time.

The idea behind Fretboard is simple: to make practising guitar more enjoyable and help guitar players keep learning and improving at their own pace.

This project brings together two things I love: playing guitar and building things. I'm excited to keep working on it and make it better, one step at a time. 🎶
---

## Key Features

### 1. Landing Experience & Asymmetric Bento Overview (`/`)
- **Scroll-Driven Bento Grid**: Two staggered columns showcasing `01 • Anatomy` (playable mini fretboard slice), `02 • Theory` (root key & scale interval badges), `03 • Sound` (live tone switcher), and `04 • Multiplayer` (Jam Room sync preview) with cursor-tracking spotlight cards.
- **3-in-1 Feature Showcase (`#features`)**: Tabbed interactive studio switching smoothly between `01 / Explore` (tunings & fret counts), `02 / Understand` (scale patterns & interval visualization), and `03 / Play` (tone presets & chord strumming).
- **Multiplayer Jam Preview (`#jam`)**: Interactive room preview (`Jam Room Alpha` / `#JAM-8402`) with live activity logs, one-click invite link copying, and an automated **Alex Bot** pentatonic lick simulator.

### 2. Dedicated Virtual Fretboard Studio (`/fretboard`)
- **Authentic Neck Anatomy**: Dark rosewood fretboard base (`.fretboard-wood`), bone nut (Fret 0), equal-tempered fret spacing, pearloid inlay markers, and string gauges with pluck animations.
- **Configurable Tunings & Frets**: Switch between Standard (`E-A-D-G-B-E`), Drop D, DADGAD, and Open D, and adjust fretboard length between 12, 15, 21, and 24 frets.
- **Pure Web Audio Synthesis**: Physical plucked-string modeling with **Acoustic Steel**, **Electric Clean**, and **Mellow Nylon** tone presets plus quick-strum chord pads with staggered 35ms pick timing.

### 3. Practice Companion Suite
- **Chromatic Tuner (`/tuner`)**: Real-time microphone pitch detection using autocorrelation, cent offset feedback, and 6-string reference tone playback.
- **Tap Metronome (`/metronome`)**: 30–260 BPM range, adaptive tap-tempo averaging, synthesized click accents, and `2/4`, `3/4`, `4/4`, and `6/8` time signatures.
- **Chord Library (`/chords`)**: Interactive open and barre chord voicings, finger placements, and audio strums.
- **Scale & Mode Visualizer (`/scales`)**: 12 root keys, scale formulas, interval degrees, and ascending Web Audio playback.
- **Song Repertoire Vault (`/songs`)**: Filterable song list, chord progression previews, mastery tracking, and custom song creation.
- **Practice Session (`/practice`)**: Built-in session timer and checklist synced to local storage.
- **Practice Telemetry (`/progress`)**: 30-day practice rhythm calendar, weekly minutes bar chart, streak tracking, and milestone badges.
- **Studio Profile UI (`/signup`)**: UI-only profile form (`fretboard:` data currently persists locally in browser `localStorage`; no backend authentication provider is connected yet).

---

## Tech Stack & Design System

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16.4.5](https://nextjs.org/) (App Router + Turbopack) |
| **Library** | [React 19.3](https://react.dev/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **Animation** | [Framer Motion](https://www.framer.com/motion/) / Motion |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Typography** | **Geist** (primary UI, labels, tabular figures) + **Instrument Serif** (display/editorial accents) via `next/font/google` |
| **Audio & Persistence** | Native Web Audio API + browser `localStorage` (`fretboard:` prefix) |

---

## Project Structure

```bash
fretboard/
├── public/
│   └── images/
│       └── bg-crimson-violet-haze.*  # Landing page atmospheric backdrop assets
├── src/
│   ├── app/
│   │   ├── chords/page.tsx           # Chord library route
│   │   ├── fretboard/page.tsx        # Dedicated Virtual Fretboard Studio route
│   │   ├── metronome/page.tsx        # Tap metronome route
│   │   ├── practice/page.tsx         # Guided practice session timer & tasks
│   │   ├── progress/page.tsx         # Practice telemetry & 30-day log
│   │   ├── scales/page.tsx           # Scale & mode visualizer route
│   │   ├── signup/page.tsx           # Studio profile UI page
│   │   ├── songs/page.tsx            # Song repertoire vault route
│   │   ├── tuner/page.tsx            # Chromatic microphone tuner route
│   │   ├── globals.css               # Tailwind v4 tokens, theme transitions & wood textures
│   │   ├── layout.tsx                # Root layout loading Geist & Instrument Serif
│   │   └── page.tsx                  # Landing page with continuous Crimson Violet Haze layer
│   ├── components/
│   │   ├── landing/                  # Navbar, HeroSection, HeroBentoGrid, StartPlayingButton,
│   │   │                             # FeatureShowcase, MultiplayerShowcase,
│   │   │                             # PracticeSuiteShowcase, GuitarPreview, FinalCTA, Footer
│   │   └── tools/                    # Tuner, Metronome, ChordExplorer, ScaleExplorer,
│   │                                 # SongLibrary, PracticeSession, ProgressTelemetry
│   └── lib/
│       ├── audio.ts                  # Web Audio API plucked-string & click synthesis engine
│       ├── data.ts                   # Seed data for chords, scales, songs, and practice tasks
│       ├── guitar.ts                 # Equal-tempered fret math, tunings, scales & chord shapes
│       ├── music.ts                  # Pitch autocorrelation & note/frequency helpers
│       ├── storage.ts                # localStorage load/save helpers (`fretboard:` namespace)
│       └── use-stored-state.ts       # React hook for persistent local-first state
├── skills.md                         # Design system tokens & component guidelines
├── package.json
└── tsconfig.json
```

---

## Getting Started

### Prerequisites
- [Bun](https://bun.sh/) 1.1+ (recommended) or Node.js 18.18+

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/fretboard.git
   cd fretboard
   ```

2. **Install dependencies:**
   ```bash
   bun install
   ```

3. **Start the local development server:**
   ```bash
   bun dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to explore the landing page, or go directly to [http://localhost:3000/fretboard](http://localhost:3000/fretboard) for the Virtual Fretboard Studio.

---

## Scripts

- `bun dev` (or `bun run dev`) — Starts the Next.js development server with Turbopack.
- `bun run build` — Generates an optimized production build and runs TypeScript type checking.
- `bun run start` — Serves the built production application.
- `bun run lint` — Runs ESLint across the codebase.
- `bunx prisma generate` — Generates the Prisma Client.

---

## Roadmap

- [ ] **Authentication & Cloud Sync**: Connect an auth provider and database for `/signup` and cross-device sync of songs and telemetry.
- [ ] **Live WebSockets / PartyKit Sync**: Real-time peer-to-peer note replication in Jam Rooms.
- [ ] **MIDI Support**: Plug in a USB MIDI guitar or keyboard controller to trigger notes directly.
- [ ] **Custom Tunings & Loop Station**: User-defined tunings and built-in backing drum grooves.

---

## License

This project is licensed under the [MIT License](LICENSE).
