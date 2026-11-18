'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import SongLibrary from '@/components/tools/SongLibrary';
import StudioMiniDock from '@/components/tools/StudioMiniDock';
import {
  ArrowLeft,
  Sparkle,
  Microphone,
  Metronome,
  Guitar,
  BookOpen,
  Timer,
} from '@phosphor-icons/react';
import BlurReveal from '@/components/ui/BlurReveal';

export default function SongsPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0C0A09] via-[#110F0D] to-[#0C0A09] text-[#F5F5F4] flex flex-col font-sans selection:bg-[#E9D8B7] selection:text-[#171717]">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8 sm:py-12 space-y-8">
        {/* Editorial Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-mono text-[#77746F] dark:text-[#A8A29E] hover:text-[#171717] dark:hover:text-[#F5F5F4] transition-colors"
              >
                <ArrowLeft size={13} />
                <span>Overview</span>
              </Link>
              <span className="text-zinc-300 dark:text-zinc-700">/</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider bg-[#F5EEDF] dark:bg-[#201D1A] text-[#9E7A32] dark:text-[#D4AD61] border border-[#E9D8B7] dark:border-white/10">
                <Sparkle size={11} weight="regular" />
                <span>Song Vault</span>
              </span>
            </div>

            <BlurReveal
              as="h1"
              immediate
              className="text-3xl sm:text-4xl font-serif font-normal text-[#171717] dark:text-[#F5F5F4] tracking-[-0.025em] leading-[1.12]"
            >
              Song &amp; Repertoire <span className="font-serif italic text-[#D4AD61]">Library</span>
            </BlurReveal>
            <p className="text-xs sm:text-sm text-[#77746F] dark:text-[#A8A29E] mt-1">
              Interactive chord voicings, scalar harmony analysis, dynamic audio playback, and custom playlists.
            </p>
          </div>

          {/* Quick Studio Practice Launchers */}
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/fretboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-medium bg-white dark:bg-[#181614] border border-[#EAE8E4] dark:border-white/10 hover:border-[#D4AD61]/50 text-[#171717] dark:text-[#F5F5F4] transition-all shadow-xs"
            >
              <Guitar size={13} weight="regular" className="text-[#D4AD61]" />
              <span>Fretboard</span>
            </Link>
            <Link
              href="/chords"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-medium bg-white dark:bg-[#181614] border border-[#EAE8E4] dark:border-white/10 hover:border-[#D4AD61]/50 text-[#171717] dark:text-[#F5F5F4] transition-all shadow-xs"
            >
              <BookOpen size={13} weight="regular" className="text-[#D4AD61]" />
              <span>Chords</span>
            </Link>
            <Link
              href="/practice"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-medium bg-white dark:bg-[#181614] border border-[#EAE8E4] dark:border-white/10 hover:border-[#D4AD61]/50 text-[#171717] dark:text-[#F5F5F4] transition-all shadow-xs"
            >
              <Timer size={13} weight="regular" className="text-[#D4AD61]" />
              <span>Routine</span>
            </Link>
            <Link
              href="/tuner"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-medium bg-white dark:bg-[#181614] border border-[#EAE8E4] dark:border-white/10 hover:border-[#D4AD61]/50 text-[#171717] dark:text-[#F5F5F4] transition-all shadow-xs"
            >
              <Microphone size={13} weight="regular" className="text-[#D4AD61]" />
              <span>Tuner</span>
            </Link>
            <Link
              href="/metronome"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-medium bg-white dark:bg-[#181614] border border-[#EAE8E4] dark:border-white/10 hover:border-[#D4AD61]/50 text-[#171717] dark:text-[#F5F5F4] transition-all shadow-xs"
            >
              <Metronome size={13} weight="regular" className="text-[#D4AD61]" />
              <span>Metronome</span>
            </Link>
          </div>
        </div>

        {/* Master Song Library Component */}
        <Suspense fallback={<div className="min-h-[400px] flex items-center justify-center animate-pulse text-xs font-mono text-[#77746F]">Loading Repertoire...</div>}>
          <SongLibrary />
        </Suspense>

        <StudioMiniDock />
      </main>

      <Footer />
    </div>
  );
}
