'use client';

import React, { useState, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { calculateSoundingChord } from '@/lib/capcalc';

const CAPO_FRETS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

export default function CapCalc() {
  const shouldReduceMotion = useReducedMotion();

  // 1. User types the chord or progression (e.g. "C", "Dmaj7", "C Am F G")
  const [inputChord, setInputChord] = useState<string>('C');

  // 2. User selects the fret where they want to place their capo (0..12)
  const [capoFret, setCapoFret] = useState<number>(2);

  // 3. Instant sounding chord calculation
  const result = useMemo(() => {
    return calculateSoundingChord(inputChord, capoFret);
  }, [inputChord, capoFret]);

  const hasTyped = inputChord.trim().length > 0;
  const isInvalid = hasTyped && !result.allValid;

  return (
    <div className="w-full max-w-2xl mx-auto py-6 sm:py-10 select-none font-sans">
      {/* Editorial Header */}
      <div className="text-center space-y-2 mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider text-[#D4AD61] bg-[#D4AD61]/10 border border-[#D4AD61]/25 mb-1">
          Resources • Music Theory
        </div>
        <h1 className="text-3xl sm:text-4xl font-normal text-[#171717] dark:text-[#F5F5F4] tracking-[-0.025em]">
          CapCalc <span className="text-[#D4AD61] font-medium">Capo Calculator</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#77746F] dark:text-[#A8A29E] max-w-md mx-auto">
          Type any chord or progression, pick your capo fret, and instantly see what it sounds like.
        </p>
      </div>

      {/* Main Studio Card */}
      <div className="bg-[#FCFBF9] dark:bg-[#12100E] border border-[#EAE8E4] dark:border-white/10 rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm space-y-8">
        
        {/* Element A: Chord Input (Geist font, symmetrically aligned) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="chord-input"
              className="text-[11px] font-mono font-bold tracking-[0.14em] uppercase text-[#77746F] dark:text-[#A8A29E]"
            >
              Chord or Progression
            </label>
            
          </div>

          <div className="relative">
            <input
              id="chord-input"
              type="text"
              value={inputChord}
              onChange={(e) => setInputChord(e.target.value)}
              placeholder="Type your chord (e.g. C, Dmaj7, C Am F G)..."
              spellCheck={false}
              autoComplete="off"
              className={`w-full text-xl sm:text-2xl font-sans font-medium py-3.5 px-4.5 pr-12 rounded-2xl bg-white dark:bg-[#1A1816] border text-[#171717] dark:text-[#F5F5F4] placeholder:text-[#A8A29E]/45 placeholder:text-sm sm:placeholder:text-base focus:outline-none transition-all shadow-xs ${
                isInvalid
                  ? 'border-red-400 dark:border-red-500/60 focus:ring-2 focus:ring-red-400/20'
                  : 'border-[#EAE8E4] dark:border-white/10 focus:border-[#D4AD61] focus:ring-2 focus:ring-[#D4AD61]/20'
              }`}
            />
            {hasTyped && (
              <button
                type="button"
                onClick={() => setInputChord('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full text-[#77746F] hover:text-[#171717] dark:hover:text-white flex items-center justify-center bg-black/5 dark:bg-white/10 text-xs transition-colors cursor-pointer"
                aria-label="Clear chord input"
              >
                ✕
              </button>
            )}
          </div>

          {/* Subtle format validation hint */}
          {isInvalid && (
            <p className="text-xs text-amber-600 dark:text-amber-400 font-mono pt-0.5">
              Please enter valid chord symbols (e.g. C, G, Am, F#m, Dmaj7, G7, Cadd9)
            </p>
          )}
        </div>

        {/* Element B: Capo Selector (Matching header alignment) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-mono font-bold tracking-[0.14em] uppercase text-[#77746F] dark:text-[#A8A29E]">
              Capo Position
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D4AD61] bg-[#D4AD61]/10 px-2 py-0.5 rounded border border-[#D4AD61]/25">
              {capoFret === 0 ? 'No Capo (Open)' : `Capo Fret ${capoFret}`}
            </span>
          </div>

          {/* Horizontally scrollable segmented selector */}
          <div className="overflow-x-auto no-scrollbar touch-pan-x p-1.5 bg-[#F1F0ED] dark:bg-[#1A1816] rounded-2xl border border-[#EAE8E4] dark:border-white/10 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCapoFret(0)}
              className={`px-3 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer shrink-0 ${
                capoFret === 0
                  ? 'bg-[#D4AD61] text-zinc-950 shadow-xs'
                  : 'text-[#77746F] dark:text-[#A8A29E] hover:text-[#171717] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              No Capo
            </button>

            <div className="w-[1px] h-4 bg-[#EAE8E4] dark:bg-white/10 shrink-0 mx-0.5" />

            {CAPO_FRETS.filter((f) => f > 0).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setCapoFret(f)}
                className={`w-9 h-9 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer shrink-0 flex items-center justify-center ${
                  capoFret === f
                    ? 'bg-[#D4AD61] text-zinc-950 shadow-xs'
                    : 'text-[#77746F] dark:text-[#A8A29E] hover:text-[#171717] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Element C: Result Display (Aligned, Geist font, generous gaps) */}
        <div className="pt-6 sm:pt-8 border-t border-[#EAE8E4] dark:border-white/10 text-center space-y-4">
          <span className="block text-[11px] font-mono font-bold tracking-[0.14em] uppercase text-[#77746F] dark:text-[#A8A29E]">
            Your chord{result.chords.length > 1 ? 's' : ''} will sound like
          </span>

          <div className="min-h-[100px] sm:min-h-[120px] flex items-center justify-center px-2">
            {result.allValid && result.chords.length > 0 ? (
              <motion.div
                key={`${result.soundingString}-${capoFret}`}
                initial={shouldReduceMotion ? undefined : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="w-full flex flex-wrap items-center justify-center gap-6 sm:gap-10 md:gap-14 py-2"
              >
                {result.chords.map((chordToken, idx) => (
                  <div key={idx} className="inline-flex items-center">
                    <span
                      className={`font-sans font-bold tracking-tight text-[#171717] dark:text-[#F5F5F4] leading-none ${
                        result.chords.length === 1
                          ? 'text-6xl sm:text-7xl md:text-8xl'
                          : result.chords.length <= 3
                          ? 'text-5xl sm:text-6xl md:text-7xl'
                          : 'text-4xl sm:text-5xl md:text-6xl'
                      }`}
                    >
                      {chordToken.soundingChord}
                    </span>
                  </div>
                ))}
              </motion.div>
            ) : (
              <div className="text-4xl font-sans font-medium text-zinc-300 dark:text-zinc-700">
                —
              </div>
            )}
          </div>

          {result.allValid && (
            <div className="text-xs font-mono text-[#D4AD61] font-medium pt-1">
              {result.explanation}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
