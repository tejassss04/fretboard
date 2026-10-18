# Fretboard

As a guitar player and enthusiast myself, I've always wanted to build something around this beautiful instrument. I wanted to create something that could make guitar practice easier and bring all the useful tools a guitarist needs into one place.

That's how Fretboard started.

Fretboard is a guitar practice companion where you can explore chords and scales, practise with a timer, tune your guitar, keep track of rhythm with a metronome, save your favourite songs, and track your progress over time.

The idea behind Fretboard is simple: to make practising guitar more enjoyable and help guitar players keep learning and improving at their own pace.

This project brings together two things I love: playing guitar and building things. I'm excited to keep working on it and make it better, one step at a time. 🎶

## Run it locally

1. Install dependencies: `npm install`
2. Start the app: `npm run dev`
3. Open the local address Next.js prints, usually `http://localhost:3000`.

Build a production bundle with `npm run build`, then serve it with `npm start`.

## Accounts and sync

The account interface already supports email/password and Google through Supabase. Until Supabase is configured, the app works locally and keeps demo practice data in the browser.

To activate real accounts:

1. Create a Supabase project.
2. Run [`supabase/schema.sql`](supabase/schema.sql) in its SQL editor.
3. Copy `.env.example` to `.env.local`, then add the project URL and anon key.
4. In Supabase Authentication, enable Email and Google. Add the local URL and your eventual production URL to the redirect allow list.
5. Restart the development server.

Never put a Supabase service-role key in a Next.js environment file; the app only uses the public anon key.

## Product decisions in v1

- The first visit asks for a player’s level; users can change it from the header later.
- Practice, songs, weekly minutes, and metronome settings persist in browser storage right now.
- The tuner uses browser microphone access; it works only over localhost or HTTPS in supported browsers.
- Content is deliberately modular in `lib/data.ts` so chord, scale, and song libraries can grow without changing the interface.

## Recommended next release

Wire the local storage layer to the provided Supabase tables after account credentials are supplied, add server-side streak calculations, broaden the guitar content library, and introduce song import or shareable practice plans.
