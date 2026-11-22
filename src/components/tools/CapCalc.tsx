'use client';

import React, { useState, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { calculateSoundingChord } from '@/lib/capcalc';

const CAPO_FRETS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

export default function CapCalc() {
  const shouldReduceMotion = useReducedMotion();

  // 1. User types the chord they want to change (default 'C')
  const [inputChord, setInputChord] = useState<string>('C');

  // 2. User selects the fret where they want to place their capo (default 2)
  const [capoFret, setCapoFret] = useState<number>(2);

  // 3. Instant sounding chord calculation
  const result = useMemo(() => {
    return calculateSoundingChord(inputChord, capoFret);
  }, [inputChord, capoFret]);

  const hasTyped = inputChord.trim().length > 0;
  const isInvalid = hasTyped && !result.isValid;

  return (
    <div className="w-full max-w-xl mx-auto py-6 sm:py-12 select-none">
      {/* Editorial Title */}
      <div className="text-center space-y-2 mb-8 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl font-normal text-[#171717] dark:text-[#F5F5F4] tracking-[-0.025em]">
          CapCalc <span className="font-serif italic text-[#E9D8B7]">Capo Calculator</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#77746F] dark:text-[#A8A29E] max-w-sm mx-auto">
          Type your chord, choose your capo position, and see the sounding result.
        </p>
      </div>

      {/* Main Minimal Studio Card */}
      <div className="bg-[#FCFBF9] dark:bg-[#12100E] border border-[#EAE8E4] dark:border-white/10 rounded-3xl p-6 sm:p-9 shadow-sm space-y-8">
        
        {/* Element A: Chord Input */}
        <div className="space-y-2.5">
          <label
            htmlFor="chord-input"
            className="block text-[11px] font-mono uppercase tracking-wider text-[#77746F] dark:text-[#A8A29E] font-semibold"
          >
            Chord
          </label>
          <div className="relative">
            <input
              id="chord-input"
              type="text"
              value={inputChord}
              onChange={(e) => setInputChord(e.target.value)}
              placeholder="Type your chord..."
              spellCheck={false}
              autoComplete="off"
              className={`w-full text-2xl sm:text-3xl font-mono font-medium py-3.5 px-4 rounded-2xl bg-white dark:bg-[#1A1816] border text-[#171717] dark:text-[#F5F5F4] placeholder:text-[#A8A29E]/50 focus:outline-none transition-all ${
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
              Enter a valid chord name (e.g. C, G, Am, F#m, Bb, Cmaj7, Dm7)
            </p>
          )}
        </div>

        {/* Element B: Capo Selector */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#77746F] dark:text-[#A8A29E] font-semibold">
              Capo
            </span>
            <span className="text-[11px] font-mono text-[#D4AD61] font-medium">
              {capoFret === 0 ? 'No Capo (Open)' : `Fret ${capoFret}`}
            </span>
          </div>

          {/* Horizontally scrollable segmented selector */}
          <div className="overflow-x-auto no-scrollbar touch-pan-x p-1 bg-[#F1F0ED] dark:bg-[#1A1816] rounded-2xl border border-[#EAE8E4] dark:border-white/10 flex items-center gap-1">
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

        {/* Element C: Result Display */}
        <div className="pt-6 sm:pt-8 border-t border-[#EAE8E4] dark:border-white/10 text-center space-y-3">
          <span className="block text-xs font-mono uppercase tracking-wider text-[#77746F] dark:text-[#A8A29E]">
            Your chord will sound like
          </span>

          <div className="min-h-[96px] sm:min-h-[112px] flex items-center justify-center">
            {result.isValid ? (
              <motion.div
                key={`${result.soundingChord}-${capoFret}`}
                initial={shouldReduceMotion ? undefined : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="text-7xl sm:text-8xl md:text-9xl font-serif text-[#171717] dark:text-[#F5F5F4] tracking-tight leading-none"
              >
                {result.soundingChord}
              </motion.div>
            ) : (
              <div className="text-4xl font-serif text-zinc-300 dark:text-zinc-700 italic">
                —
              </div>
            )}
          </div>

          {result.isValid && (
            <div className="text-xs font-mono text-[#D4AD61] font-medium">
              {capoFret === 0
                ? 'Original chord • Standard concert pitch'
                : `Transposed +${capoFret} semitone${capoFret === 1 ? '' : 's'}`}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
