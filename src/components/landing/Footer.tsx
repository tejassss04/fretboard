'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUp } from '@phosphor-icons/react';

interface FooterProps {
  onStartPlaying?: () => void;
}

export default function Footer({ onStartPlaying }: FooterProps = {}) {
  const scrollTo = (id: string) => {
    if (id === 'fretboard' && onStartPlaying) {
      onStartPlaying();
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
    }
  };

  const scrollToTop = () => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
  };

  return (
    <footer
      className="relative w-full max-w-full bg-transparent pt-[clamp(2.5rem,5vw,4.5rem)] text-xs text-[#77746F] dark:text-[#A8A29E] z-10 overflow-x-clip transition-colors duration-300"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="w-full max-w-7xl mx-auto px-[clamp(1.125rem,4vw,3rem)]">
        {/* ─── Upper Editorial Grid: Brand Philosophy & Structured Links ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-10 lg:gap-x-12 pb-[clamp(2.25rem,4vw,3.5rem)] pt-[clamp(2.25rem,4vw,3.5rem)] border-t border-[#EAE8E4]/70 dark:border-white/10">

          {/* Brand & Purpose (Full row on mobile/tablet, 5 Columns on desktop) */}
          <div className="lg:col-span-5 flex flex-col items-start">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 mb-3.5 group py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AD61]/60 rounded-md"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#D4AD61] transition-transform duration-200 group-hover:scale-110 motion-reduce:transition-none shrink-0" />
              <span className="font-serif italic text-[clamp(1.35rem,1.2rem+0.6vw,1.65rem)] tracking-tight text-[#38211F] dark:text-[#E9D8B7] leading-none">
                Fretboard
              </span>
            </Link>

            <p className="text-[clamp(0.8125rem,0.78rem+0.2vw,0.9rem)] text-[#77746F] dark:text-[#A8A29E] leading-[1.65] max-w-md mb-5">
              An interactive guitar practice and music exploration platform combining responsive visual fretboard anatomy, dynamic interval theory, and native browser Web Audio synthesis.
            </p>

            {/* Primary Action + Engine Spec Badge */}
            <div className="flex flex-wrap items-center gap-3 w-full">
              {onStartPlaying ? (
                <button
                  type="button"
                  onClick={onStartPlaying}
                  className="group inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[40px] rounded-full bg-[#171717] dark:bg-[#F5F5F4] hover:bg-[#2b2b2b] dark:hover:bg-white text-white dark:text-[#171717] text-xs font-semibold tracking-tight transition-all duration-200 shadow-xs active:scale-[0.98] motion-reduce:transition-none cursor-pointer"
                >
                  <span>Explore Studio</span>
                  <span className="text-[#D4AD61] transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none">→</span>
                </button>
              ) : (
                <Link
                  href="/fretboard"
                  className="group inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[40px] rounded-full bg-[#171717] dark:bg-[#F5F5F4] hover:bg-[#2b2b2b] dark:hover:bg-white text-white dark:text-[#171717] text-xs font-semibold tracking-tight transition-all duration-200 shadow-xs active:scale-[0.98] motion-reduce:transition-none"
                >
                  <span>Explore Studio</span>
                  <span className="text-[#D4AD61] transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none">→</span>
                </Link>
              )}
            </div>
          </div>

          {/* Navigation Links (7 Columns on desktop; adaptive grid on mobile/tablet) */}
          <nav
            aria-label="Footer navigation"
            className="lg:col-span-7 grid grid-cols-1 min-[360px]:grid-cols-2 min-[600px]:grid-cols-3 gap-x-6 sm:gap-x-8 gap-y-8"
          >
            {/* Core Product */}
            <div className="min-w-0">
              <span className="text-[11px] font-mono font-bold tracking-[0.14em] uppercase text-[#171717] dark:text-[#F5F5F4] block mb-3">
                Product
              </span>
              <ul className="space-y-1 text-xs">
                <li>
                  {onStartPlaying ? (
                    <button
                      type="button"
                      onClick={onStartPlaying}
                      className="inline-flex items-center min-h-[34px] sm:min-h-[28px] py-1 hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer text-left"
                    >
                      Virtual Fretboard
                    </button>
                  ) : (
                    <Link
                      href="/fretboard"
                      className="inline-flex items-center min-h-[34px] sm:min-h-[28px] py-1 hover:text-[#171717] dark:hover:text-white transition-colors text-left"
                    >
                      Virtual Fretboard
                    </Link>
                  )}
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollTo('features')}
                    className="inline-flex items-center min-h-[34px] sm:min-h-[28px] py-1 hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Interactive Features
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollTo('jam')}
                    className="inline-flex items-center min-h-[34px] sm:min-h-[28px] py-1 hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Jam Room Sync
                  </button>
                </li>
                <li>
                  <Link
                    href="/fretboard"
                    className="inline-flex items-center min-h-[34px] sm:min-h-[28px] py-1 hover:text-[#171717] dark:hover:text-white transition-colors text-left text-[#D4AD61] font-semibold"
                  >
                    Launch Studio ↗
                  </Link>
                </li>
              </ul>
            </div>

            {/* Practice Tools */}
            <div className="min-w-0">
              <span className="text-[11px] font-mono font-bold tracking-[0.14em] uppercase text-[#171717] dark:text-[#F5F5F4] block mb-3">
                Practice Tools
              </span>
              <ul className="space-y-1 text-xs">
                <li>
                  <Link
                    href="/tuner"
                    className="inline-flex items-center min-h-[34px] sm:min-h-[28px] py-1 hover:text-[#171717] dark:hover:text-white transition-colors text-[#D4AD61] font-semibold"
                  >
                    Microphone Tuner ↗
                  </Link>
                </li>
                <li>
                  <Link
                    href="/metronome"
                    className="inline-flex items-center min-h-[34px] sm:min-h-[28px] py-1 hover:text-[#171717] dark:hover:text-white transition-colors"
                  >
                    Tap Metronome
                  </Link>
                </li>
                <li>
                  <Link
                    href="/practice"
                    className="inline-flex items-center min-h-[34px] sm:min-h-[28px] py-1 hover:text-[#171717] dark:hover:text-white transition-colors"
                  >
                    Practice Routine
                  </Link>
                </li>
                <li>
                  <Link
                    href="/songs"
                    className="inline-flex items-center min-h-[34px] sm:min-h-[28px] py-1 hover:text-[#171717] dark:hover:text-white transition-colors"
                  >
                    Song Vault
                  </Link>
                </li>
                <li>
                  <Link
                    href="/chords"
                    className="inline-flex items-center min-h-[34px] sm:min-h-[28px] py-1 hover:text-[#171717] dark:hover:text-white transition-colors"
                  >
                    Chord Library
                  </Link>
                </li>
                <li>
                  <Link
                    href="/scales"
                    className="inline-flex items-center min-h-[34px] sm:min-h-[28px] py-1 hover:text-[#171717] dark:hover:text-white transition-colors"
                  >
                    Scale Visualizer
                  </Link>
                </li>
                <li>
                  <Link
                    href="/progress"
                    className="inline-flex items-center min-h-[34px] sm:min-h-[28px] py-1 hover:text-[#171717] dark:hover:text-white transition-colors"
                  >
                    Practice Telemetry
                  </Link>
                </li>
              </ul>
            </div>

            {/* Theory Engines & Account (Spans full width cleanly in 2-col mobile mode to prevent orphan gap) */}
            <div className="min-w-0 min-[360px]:col-span-2 min-[600px]:col-span-1 pt-2 min-[600px]:pt-0 border-t border-[#EAE8E4]/50 dark:border-white/5 min-[600px]:border-t-0">
              <span className="text-[11px] font-mono font-bold tracking-[0.14em] uppercase text-[#171717] dark:text-[#F5F5F4] block mb-3">
                Architecture
              </span>
              <ul className="grid grid-cols-1 min-[360px]:grid-cols-2 min-[600px]:grid-cols-1 gap-x-6 gap-y-1 text-xs">
                <li className="inline-flex items-center min-h-[30px] sm:min-h-[28px] py-0.5 text-zinc-500 dark:text-zinc-400">
                  12 Musical Keys
                </li>
                <li className="inline-flex items-center min-h-[30px] sm:min-h-[28px] py-0.5 text-zinc-500 dark:text-zinc-400">
                  Pentatonic &amp; Modes
                </li>
                <li className="inline-flex items-center min-h-[30px] sm:min-h-[28px] py-0.5 text-zinc-500 dark:text-zinc-400">
                  Standard · Drop D · DADGAD
                </li>
                <li>
                  <Link
                    href="/signup"
                    className="inline-flex items-center min-h-[34px] sm:min-h-[28px] py-1 hover:text-[#171717] dark:hover:text-white transition-colors font-medium text-[#171717]/80 dark:text-[#F5F5F4]/80"
                  >
                    Create Account
                  </Link>
                </li>
              </ul>
            </div>
          </nav>

        </div>

        {/* ─── Trove-Inspired Credits, Copyright & Back-to-Top Strip ─── */}
        <div className="border-t border-[#EAE8E4]/70 dark:border-white/10 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 text-[11px]">

          <div className="w-full md:w-auto flex flex-wrap items-center justify-between md:justify-end gap-x-5 gap-y-3 shrink-0">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[#77746F] dark:text-[#A8A29E]">
              <Link
                href="/fretboard"
                className="inline-flex items-center min-h-[32px] hover:text-[#171717] dark:hover:text-white transition-colors"
              >
                Studio
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center min-h-[32px] hover:text-[#171717] dark:hover:text-white transition-colors"
              >
                Log in
              </Link>
              <span className="text-[#77746F]/70 dark:text-[#A8A29E]/60">
                © 2026 Fretboard
              </span>
            </div>

            <button
              type="button"
              onClick={scrollToTop}
              aria-label="Back to top"
              className="group inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[32px] rounded-full bg-[#F7F6F3] dark:bg-[#1A1816] border border-[#EAE8E4] dark:border-white/10 hover:border-[#D4AD61]/50 text-[#171717] dark:text-[#F5F5F4] text-[11px] font-medium transition-all duration-200 active:scale-[0.97] motion-reduce:transition-none cursor-pointer"
            >
              <span>Back to top</span>
              <ArrowUp size={12} className="text-[#D4AD61] transition-transform duration-200 group-hover:-translate-y-0.5 motion-reduce:transition-none" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Signature Trove-Inspired Serif Letterpress Watermark (Fluidly scaled across all viewports) ─── */}
      <div
        aria-hidden="true"
        className="relative w-full max-w-7xl mx-auto overflow-hidden select-none pointer-events-none pt-2 px-[clamp(0.75rem,3vw,3rem)]"
        style={{
          height: 'clamp(50px, 15.8vw, 210px)',
          WebkitMaskImage:
            'linear-gradient(to bottom, rgba(0,0,0,1) 25%, rgba(0,0,0,0.65) 75%, rgba(0,0,0,0.12) 100%)',
          maskImage:
            'linear-gradient(to bottom, rgba(0,0,0,1) 25%, rgba(0,0,0,0.65) 75%, rgba(0,0,0,0.12) 100%)',
        }}
      >
        <div className="w-full flex justify-center">
          <span
            className="font-serif uppercase whitespace-nowrap tracking-[-0.03em] leading-[0.84] text-[#171717]/[0.035] dark:text-[#E9D8B7]/[0.04] [--stroke:rgba(23,23,23,0.09)] dark:[--stroke:rgba(233,216,183,0.1)]"
            style={{
              fontSize: 'clamp(64px, 20.8vw, 290px)',
              WebkitTextStroke: '1px var(--stroke)',
            }}
          >
            FRETBOARD
          </span>
        </div>
      </div>
    </footer>
  );
}
