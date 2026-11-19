🎸 Fretboard

An interactive guitar practice and music theory app to explore the fretboard, learn chords and scales, improve your timing, and make practising guitar more enjoyable.

---

About Fretboard

As a guitar player and enthusiast myself, I've always wanted to build something around this beautiful instrument.

I wanted to bring together some of the tools I use and the things I enjoy learning about guitar into one place. Something where you can explore the fretboard, understand chords and scales, practise your timing, and keep track of your progress without having to switch between different apps.

That's how Fretboard started.

It's a project that brings together two things I enjoy: playing guitar and building things. I'm still working on it, learning along the way, and looking forward to adding more to it.

Screenshots

Here are a few glimpses of Fretboard.

<!-- Add actual screenshots to the public/images/screenshots/ directory -->Home

"Fretboard Home" (public/images/screenshots/home.png)

Virtual Fretboard

"Virtual Fretboard" (public/images/screenshots/fretboard.png)

Guitar Tools

"Guitar Tools" (public/images/screenshots/tools.png)

Practice & Songs

"Practice and Songs" (public/images/screenshots/practice.png)

---

Features

1. Landing Page

- Interactive bento grid introducing different parts of the application.
- Playable guitar fretboard preview.
- Chord, scale and sound previews.
- Interactive feature showcase with Explore, Understand and Play sections.
- Jam Room preview with activity logs, invite link copying and an Alex Bot demonstration.
- Cursor-based effects and scroll animations.

2. Virtual Fretboard ("/fretboard")

Explore notes and experiment with different guitar tunings through an interactive fretboard.

- Six-string fretboard with fret markers and string animations.
- Standard, Drop D, DADGAD and Open D tunings.
- Adjustable fret count: 12, 15, 21 and 24 frets.
- Three sound presets:
  - Acoustic Steel
  - Electric Clean
  - Mellow Nylon
- Play individual notes and strum chords directly in the browser.

3. Guitar Tools

Chromatic Tuner ("/tuner")

- Detects pitch through your microphone.
- Displays the detected note and frequency.
- Shows how sharp or flat a string is.
- Includes reference tones for all six strings.

Metronome ("/metronome")

- Adjustable tempo from 30 to 260 BPM.
- Tap tempo functionality.
- 2/4, 3/4, 4/4 and 6/8 time signatures.
- Synthesized clicks with beat accents.

Chord Explorer ("/chords")

- Explore open and barre chords.
- View finger positions and chord shapes.
- Play chords directly in the browser.

Scale Explorer ("/scales")

- Explore scales and modes in all 12 root keys.
- View scale formulas and intervals.
- Visualize patterns on the fretboard.
- Play scales using Web Audio.

4. Practice & Songs

Song Library ("/songs")

- Browse songs and chord progressions.
- Filter the available songs.
- Preview chord progressions.
- Track your progress with individual songs.
- Add custom songs.

Practice Session ("/practice")

- Set up practice sessions.
- Use the built-in timer.
- Follow a checklist of practice tasks.
- Save session data locally.

Progress ("/progress")

- View practice history.
- Track daily practice streaks.
- See weekly practice time.
- View a 30-day practice calendar.
- Track milestones.

5. Jam Room Preview

A preview of the multiplayer experience planned for Fretboard.

- Sample room interface.
- Activity logs.
- Invite link copying.
- Alex Bot demonstration.

Note: This is currently an interactive preview, not a fully implemented real-time multiplayer feature.

6. Profile ("/signup")

A basic profile interface for the studio. Profile information is currently stored in browser localStorage. Backend authentication is not connected yet.

---

Tech Stack

Area| Technology
Framework| Next.js 16.4.5 (App Router + Turbopack)
UI Library| React 19.3
Language| TypeScript 5
Styling| Tailwind CSS v4
Animations| Motion / Framer Motion
Icons| Lucide React
Fonts| Geist and Instrument Serif
Audio| Native Web Audio API
Storage| Browser localStorage

Some implementation details

- Audio: Web Audio API is used to generate guitar sounds, metronome clicks and reference tones directly in the browser.
- Tuner: Uses microphone input and autocorrelation to detect pitch.
- Fretboard: Custom utilities handle fret calculations, note positions, tunings, scales and chord shapes.
- Local storage: Practice sessions, songs and other user data are stored locally using a "fretboard:" namespace.
- Animations: Motion is used for transitions and interactions throughout the application.

One of the things I wanted to explore with this project was how much could be done using native browser APIs without relying on external audio plugins.

---

Getting Started

Want to run Fretboard locally? Follow these steps.

Prerequisites

- "Bun" (https://bun.sh/) 1.1+ (recommended)
- Alternatively, Node.js 18.18+

Installation

1. Clone the repository

git clone https://github.com/your-username/fretboard.git
cd fretboard

2. Install dependencies

bun install

3. Start the development server

bun dev

4. Open the application

Visit "http://localhost:3000" (http://localhost:3000) in your browser.

To open the virtual fretboard directly:

"http://localhost:3000/fretboard" (http://localhost:3000/fretboard)

---

Available Scripts

Command| Description
"bun dev"| Start the development server
"bun run build"| Create a production build
"bun run start"| Start the production server
"bun run lint"| Run ESLint
"bunx prisma generate"| Generate Prisma Client

---

What's Next?

Fretboard is still a work in progress. Some things I'd like to work on next:

- Improving the existing guitar tools.
- Making practice sessions more useful.
- Expanding the song library.
- Working on the multiplayer Jam Room.
- Exploring better ways to visualize music theory.

There's still a lot I'd like to build, and I'm looking forward to seeing where this project goes.

Thanks for checking it out!

Made with ❤️ and a little too much guitar practice. 🎸
