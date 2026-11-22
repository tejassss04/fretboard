'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import CapCalc from '@/components/tools/CapCalc';
import StudioMiniDock from '@/components/tools/StudioMiniDock';
import {
  ArrowLeft,
  BookOpen,
  Guitar,
  Stack,
  Microphone,
} from '@phosphor-icons/react';

export default function CapCalcPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0C0A09] via-[#110F0D] to-[#0C0A09] text-[#F5F5F4] flex flex-col font-sans selection:bg-[#E9D8B7] selection:text-[#171717]">
      <Navbar />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-10 space-y-6">
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
            <span className="text-zinc-600 dark:text-zinc-700">•</span>
            <span className="text-xs font-mono text-[#D4AD61]">CapCalc Studio</span>
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
              href="/scales"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-medium bg-white dark:bg-[#181614] border border-[#EAE8E4] dark:border-white/10 hover:border-[#D4AD61]/50 text-[#171717] dark:text-[#F5F5F4] transition-all shadow-xs"
            >
              <Stack size={13} weight="regular" className="text-[#D4AD61]" />
              <span>Scales</span>
            </Link>
            <Link
              href="/tuner"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-medium bg-white dark:bg-[#181614] border border-[#EAE8E4] dark:border-white/10 hover:border-[#D4AD61]/50 text-[#171717] dark:text-[#F5F5F4] transition-all shadow-xs"
            >
              <Microphone size={13} weight="regular" className="text-[#D4AD61]" />
              <span>Tuner</span>
            </Link>
          </div>
        </div>

        {/* Master CapCalc Component */}
        <CapCalc />

        <StudioMiniDock />
      </main>

      <Footer />
    </div>
  );
}
