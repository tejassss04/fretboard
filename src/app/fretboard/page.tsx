'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import GuitarPreview from '@/components/landing/GuitarPreview';
import StudioMiniDock from '@/components/tools/StudioMiniDock';
import {
  ArrowLeft,
  Microphone,
  Metronome,
  BookOpen,
  Timer,
  Stack,
  MusicNotes,
  TrendUp,
  ArrowRight,
  SlidersHorizontal,
} from '@phosphor-icons/react';
import BlurReveal from '@/components/ui/BlurReveal';

export default function FretboardPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0C0A09] via-[#110F0D] to-[#0C0A09] text-[#F5F5F4] flex flex-col font-sans selection:bg-[#E9D8B7] selection:text-[#171717]">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8 sm:py-12 space-y-8">
        {/* Editorial Page Header */}
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
            </div>

            <BlurReveal
              as="h1"
              immediate
              className="text-3xl sm:text-4xl font-normal text-[#171717] dark:text-[#F5F5F4] tracking-[-0.025em] leading-[1.12]"
            >
              Interactive <span className="font-serif italic text-[#E9D8B7]">Fretboard Studio</span>
            </BlurReveal>
            <p className="text-xs sm:text-sm text-[#77746F] dark:text-[#A8A29E] mt-1">
              Pluck strings, explore scale degree intervals, trigger real-time chord strum pads, and test Web Audio synthesis.
            </p>
          </div>

          {/* Quick Studio Practice Launchers */}
          <div className="flex items-center gap-2 flex-wrap">
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
              href="/capcalc"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-medium bg-white dark:bg-[#181614] border border-[#EAE8E4] dark:border-white/10 hover:border-[#D4AD61]/50 text-[#171717] dark:text-[#F5F5F4] transition-all shadow-xs"
            >
              <SlidersHorizontal size={13} weight="regular" className="text-[#D4AD61]" />
              <span>CapCalc</span>
            </Link>
          </div>
        </div>

        {/* The 2D Living Fretboard Studio */}
        <div className="w-full">
          <GuitarPreview />
        </div>

        {/* Integrated Studio Practice Companions */}
        <div className="pt-4 border-t border-[#EAE8E4] dark:border-white/10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#77746F] dark:text-[#A8A29E]">
              Studio Companion Tools
            </span>
            <span className="text-[11px] font-mono text-[#D4AD61]">
              7 integrated modules
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/chords"
              className="group p-4 rounded-2xl bg-white dark:bg-[#121110] border border-[#EAE8E4] dark:border-white/10 hover:border-[#D4AD61]/50 transition-all shadow-xs flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-[#F7F6F3] dark:bg-[#1A1816] flex items-center justify-center text-[#171717] dark:text-[#F5F5F4] group-hover:text-[#D4AD61] transition-colors">
                  <BookOpen size={16} />
                </span>
                <div>
                  <h3 className="text-xs font-semibold text-[#171717] dark:text-[#F5F5F4]">Chord Voicings</h3>
                  <p className="text-[10px] text-[#77746F] dark:text-[#A8A29E]">9 finger shapes & strums</p>
                </div>
              </div>
              <ArrowRight size={13} className="text-[#77746F] group-hover:text-[#D4AD61] group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href="/scales"
              className="group p-4 rounded-2xl bg-white dark:bg-[#121110] border border-[#EAE8E4] dark:border-white/10 hover:border-[#D4AD61]/50 transition-all shadow-xs flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-[#F7F6F3] dark:bg-[#1A1816] flex items-center justify-center text-[#171717] dark:text-[#F5F5F4] group-hover:text-[#D4AD61] transition-colors">
                  <Stack size={16} weight="regular" />
                </span>
                <div>
                  <h3 className="text-xs font-semibold text-[#171717] dark:text-[#F5F5F4]">Scale Matrix</h3>
                  <p className="text-[10px] text-[#77746F] dark:text-[#A8A29E]">12 keys & modal degrees</p>
                </div>
              </div>
              <ArrowRight size={13} weight="regular" className="text-[#77746F] group-hover:text-[#D4AD61] group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href="/songs"
              className="group p-4 rounded-2xl bg-white dark:bg-[#121110] border border-[#EAE8E4] dark:border-white/10 hover:border-[#D4AD61]/50 transition-all shadow-xs flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-[#F7F6F3] dark:bg-[#1A1816] flex items-center justify-center text-[#171717] dark:text-[#F5F5F4] group-hover:text-[#D4AD61] transition-colors">
                  <MusicNotes size={16} weight="regular" />
                </span>
                <div>
                  <h3 className="text-xs font-semibold text-[#171717] dark:text-[#F5F5F4]">Song Vault</h3>
                  <p className="text-[10px] text-[#77746F] dark:text-[#A8A29E]">Repertoire & chords</p>
                </div>
              </div>
              <ArrowRight size={13} weight="regular" className="text-[#77746F] group-hover:text-[#D4AD61] group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href="/progress"
              className="group p-4 rounded-2xl bg-white dark:bg-[#121110] border border-[#EAE8E4] dark:border-white/10 hover:border-[#D4AD61]/50 transition-all shadow-xs flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-[#F7F6F3] dark:bg-[#1A1816] flex items-center justify-center text-[#171717] dark:text-[#F5F5F4] group-hover:text-[#D4AD61] transition-colors">
                  <TrendUp size={16} weight="regular" />
                </span>
                <div>
                  <h3 className="text-xs font-semibold text-[#171717] dark:text-[#F5F5F4]">Telemetry</h3>
                  <p className="text-[10px] text-[#77746F] dark:text-[#A8A29E]">30-day rhythm heatmap</p>
                </div>
              </div>
              <ArrowRight size={13} weight="regular" className="text-[#77746F] group-hover:text-[#D4AD61] group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>
      </main>

      <StudioMiniDock />

      <Footer />
    </div>
  );
}
