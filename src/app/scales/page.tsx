'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import ScaleExplorer from '@/components/tools/ScaleExplorer';
import StudioMiniDock from '@/components/tools/StudioMiniDock';
import {
  ArrowLeft,
  Microphone,
  Metronome,
  Guitar,
  BookOpen,
  Timer,
  SlidersHorizontal,
} from '@phosphor-icons/react';

export default function ScalesPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0C0A09] via-[#110F0D] to-[#0C0A09] text-[#F5F5F4] flex flex-col font-sans selection:bg-[#E9D8B7] selection:text-[#171717]">
      <Navbar />

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-8 sm:py-10 space-y-6">
        {/* Editorial Sub-Navigation Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[#77746F] dark:text-[#A8A29E] hover:text-[#171717] dark:hover:text-[#F5F5F4] transition-colors"
            >
              <ArrowLeft size={13} />
              <span>Overview</span>
            </Link>
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
            <Link
              href="/practice"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-medium bg-white dark:bg-[#181614] border border-[#EAE8E4] dark:border-white/10 hover:border-[#D4AD61]/50 text-[#171717] dark:text-[#F5F5F4] transition-all shadow-xs"
            >
              <Timer size={13} weight="regular" className="text-[#D4AD61]" />
              <span>Routine</span>
            </Link>
            <Link
              href="/capcalc"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-medium bg-white dark:bg-[#181614] border border-[#EAE8E4] dark:border-white/10 hover:border-[#D4AD61]/50 text-[#171717] dark:text-[#F5F5F4] transition-all shadow-xs"
            >
              <SlidersHorizontal size={13} weight="regular" className="text-[#D4AD61]" />
              <span>CapCalc</span>
            </Link>
          </div>
        </div>

        {/* Master Scale Explorer Component */}
        <ScaleExplorer />

        <StudioMiniDock />
      </main>

      <Footer />
    </div>
  );
}
