'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Guitar,
  BookOpen,
  Stack,
  Timer,
  Microphone,
  Metronome,
  TrendUp,
  List,
  X,
  CaretDown,
  ArrowUpRight,
  PlayCircle,
  Sparkle,
  BookmarkSimple,
  Broadcast,
} from '@phosphor-icons/react';
import AuthNav from '@/components/auth/AuthNav';
import StartPlayingButton from '@/components/landing/StartPlayingButton';

interface NavbarProps {
  onStartPlaying?: () => void;
}

export default function Navbar({ onStartPlaying }: NavbarProps = {}) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  // Mega dropdown state (desktop)
  const [activeDropdown, setActiveDropdown] = useState<'resources' | 'songs' | null>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Mobile / Tablet drawer state (< 1024px)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(true);
  const [mobileSongsOpen, setMobileSongsOpen] = useState(false);

  // Route change handler to auto-close menus
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  }

  const navContainerRef = useRef<HTMLDivElement>(null);
  const centerNavRef = useRef<HTMLDivElement>(null);

  // Global outside click and Escape listeners
  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      if (
        navContainerRef.current &&
        !navContainerRef.current.contains(e.target as Node)
      ) {
        setActiveDropdown(null);
        setMobileMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  // Hover intent helpers for desktop mega-dropdown
  const handleTriggerEnter = (menu: 'resources' | 'songs') => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setActiveDropdown(menu);
  };

  const handleTriggerLeave = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const handlePanelEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const handlePanelLeave = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const toggleDropdown = (menu: 'resources' | 'songs') => {
    setActiveDropdown((prev) => (prev === menu ? null : menu));
  };

  // Active route helpers
  const isFretboardActive = pathname === '/fretboard';
  const isResourcesActive = ['/chords', '/scales', '/tuner', '/metronome'].includes(pathname);
  const isSongsActive = pathname === '/songs';
  const isPracticeActive = pathname === '/practice';
  const isTelemetryActive = pathname === '/progress';

  return (
    <header
      role="banner"
      className="navbar-shell"
    >
      <div ref={navContainerRef} className="navbar-inner">
        {/* ===================================================================== */}
        {/* LEFT SECTION — FRETBOARD BRANDING                                     */}
        {/* ===================================================================== */}
        <Link
          href="/"
          onClick={() => {
            if (pathname === '/' && onStartPlaying) {
              onStartPlaying();
            }
          }}
          className="flex items-center gap-2.5 group shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AD61]/60 rounded-lg py-1 pr-2"
          aria-label="Fretboard Home"
        >
          <div className="w-7 h-7 rounded-lg bg-[#171717] dark:bg-white flex items-center justify-center text-white dark:text-[#171717] shadow-xs transition-transform duration-200 group-hover:scale-105 shrink-0">
            {/* Geometric fret markers & strings icon */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="6" y1="3" x2="6" y2="21" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.4" />
              <line x1="12" y1="3" x2="12" y2="21" stroke="currentColor" strokeWidth="1.6" strokeOpacity="0.8" />
              <line x1="18" y1="3" x2="18" y2="21" stroke="currentColor" strokeWidth="2.2" strokeOpacity="1" />
              <line x1="3" y1="12" x2="21" y2="12" stroke="#D4AD61" strokeWidth="1.5" />
              <circle cx="12" cy="7.5" r="1.8" fill="#D4AD61" />
            </svg>
          </div>
          <span className="font-semibold text-sm sm:text-[15px] tracking-[-0.015em] text-[#171717] dark:text-[#F5F5F4] group-hover:text-[#38211F] dark:group-hover:text-[#E9D8B7] transition-colors whitespace-nowrap">
            Fretboard
          </span>
        </Link>

        {/* ===================================================================== */}
        {/* CENTER SECTION — PRIMARY NAVIGATION (Exactly 5 Destinations)          */}
        {/* ===================================================================== */}
        <nav
          aria-label="Main Navigation"
          ref={centerNavRef}
          className="hidden lg:flex items-center gap-1 xl:gap-2 relative"
        >
          {/* 1. Fretboard — Direct Navigation */}
          <Link
            href="/fretboard"
            className={`px-3 py-1.5 rounded-lg text-xs xl:text-[13px] font-medium tracking-tight whitespace-nowrap transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AD61]/60 ${
              isFretboardActive
                ? 'text-[#171717] dark:text-[#F5F5F4] font-semibold bg-black/[0.05] dark:bg-white/[0.08]'
                : 'text-[#64605B] dark:text-[#A8A29E] hover:text-[#171717] dark:hover:text-[#F5F5F4] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
            }`}
          >
            Fretboard
          </Link>

          {/* 2. Resources — Animated Mega-Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => handleTriggerEnter('resources')}
            onMouseLeave={handleTriggerLeave}
          >
            <button
              type="button"
              onClick={() => toggleDropdown('resources')}
              aria-expanded={activeDropdown === 'resources'}
              aria-haspopup="true"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs xl:text-[13px] font-medium tracking-tight whitespace-nowrap transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AD61]/60 ${
                activeDropdown === 'resources' || isResourcesActive
                  ? 'text-[#171717] dark:text-[#F5F5F4] font-semibold bg-black/[0.05] dark:bg-white/[0.08]'
                  : 'text-[#64605B] dark:text-[#A8A29E] hover:text-[#171717] dark:hover:text-[#F5F5F4] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
              }`}
            >
              <span>Resources</span>
              <CaretDown
                size={11}
                weight="bold"
                className={`transition-transform duration-200 ${
                  activeDropdown === 'resources' ? 'rotate-180 text-[#D4AD61]' : 'opacity-65'
                }`}
              />
            </button>
          </div>

          {/* 3. Songs — Animated Mega-Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => handleTriggerEnter('songs')}
            onMouseLeave={handleTriggerLeave}
          >
            <button
              type="button"
              onClick={() => toggleDropdown('songs')}
              aria-expanded={activeDropdown === 'songs'}
              aria-haspopup="true"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs xl:text-[13px] font-medium tracking-tight whitespace-nowrap transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AD61]/60 ${
                activeDropdown === 'songs' || isSongsActive
                  ? 'text-[#171717] dark:text-[#F5F5F4] font-semibold bg-black/[0.05] dark:bg-white/[0.08]'
                  : 'text-[#64605B] dark:text-[#A8A29E] hover:text-[#171717] dark:hover:text-[#F5F5F4] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
              }`}
            >
              <span>Songs</span>
              <CaretDown
                size={11}
                weight="bold"
                className={`transition-transform duration-200 ${
                  activeDropdown === 'songs' ? 'rotate-180 text-[#D4AD61]' : 'opacity-65'
                }`}
              />
            </button>
          </div>

          {/* 4. Practice — Direct Navigation */}
          <Link
            href="/practice"
            className={`px-3 py-1.5 rounded-lg text-xs xl:text-[13px] font-medium tracking-tight whitespace-nowrap transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AD61]/60 ${
              isPracticeActive
                ? 'text-[#171717] dark:text-[#F5F5F4] font-semibold bg-black/[0.05] dark:bg-white/[0.08]'
                : 'text-[#64605B] dark:text-[#A8A29E] hover:text-[#171717] dark:hover:text-[#F5F5F4] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
            }`}
          >
            Practice
          </Link>

          {/* 5. Telemetry — Direct Navigation */}
          <Link
            href="/progress"
            className={`px-3 py-1.5 rounded-lg text-xs xl:text-[13px] font-medium tracking-tight whitespace-nowrap transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AD61]/60 ${
              isTelemetryActive
                ? 'text-[#171717] dark:text-[#F5F5F4] font-semibold bg-black/[0.05] dark:bg-white/[0.08]'
                : 'text-[#64605B] dark:text-[#A8A29E] hover:text-[#171717] dark:hover:text-[#F5F5F4] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
            }`}
          >
            Telemetry
          </Link>
        </nav>

        {/* =================================================================== */}
        {/* DESKTOP MEGA-DROPDOWN FLOATING PANELS                               */}
        {/* =================================================================== */}
        <AnimatePresence>
          {activeDropdown && (
            <motion.div
              key={activeDropdown}
              initial={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: 8, scale: 0.98 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: 6, scale: 0.98 }
              }
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              onMouseEnter={handlePanelEnter}
              onMouseLeave={handlePanelLeave}
              className="hidden lg:block absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 pointer-events-auto"
            >
              {/* Invisible hover bridge to eliminate pointer gap */}
              <div className="absolute -top-3 left-0 right-0 h-3" aria-hidden="true" />

              {/* Dropdown Container: Square-rounded surface, hairline border, soft ambient shadow */}
              <div className="rounded-2xl p-5 border border-[#EAE8E4] dark:border-white/10 bg-[#FCFBF9] dark:bg-[#15111B] shadow-[0_24px_64px_rgba(23,23,23,0.15),0_1px_1px_rgba(255,255,255,0.9)_inset] dark:shadow-[0_28px_72px_rgba(0,0,0,0.7),0_1px_1px_rgba(255,255,255,0.06)_inset] text-[#171717] dark:text-[#F5F5F4]">
                {/* =============================================================== */}
                {/* RESOURCES PANEL: Two-Column Composition                          */}
                {/* =============================================================== */}
                {activeDropdown === 'resources' && (
                  <div className="w-[560px]">
                    <div className="grid grid-cols-2 gap-3 relative">
                      {/* Column 1: Music Theory */}
                      <div className="space-y-1">
                        <div className="px-3 py-1">
                          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#9E7A32] dark:text-[#D4AD61]">
                            Music Theory
                          </span>
                        </div>

                        {/* Chord Explorer */}
                        <Link
                          href="/chords"
                          onClick={() => setActiveDropdown(null)}
                          className="group flex items-start gap-3 p-3 rounded-2xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
                        >
                          <div className="w-8 h-8 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.04] dark:border-white/10 flex items-center justify-center text-[#171717] dark:text-[#F5F5F4] group-hover:scale-105 group-hover:text-[#D4AD61] transition-all shrink-0 mt-0.5">
                            <BookOpen size={16} weight="regular" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-semibold text-[#171717] dark:text-[#F5F5F4] group-hover:text-[#38211F] dark:group-hover:text-[#E9D8B7] transition-colors">
                                Chord Explorer
                              </span>
                              <ArrowUpRight
                                size={11}
                                weight="bold"
                                className="opacity-0 group-hover:opacity-75 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-[#D4AD61]"
                              />
                            </div>
                            <p className="text-xs text-[#77746F] dark:text-[#A8A29E] mt-0.5 leading-relaxed">
                              Explore chord shapes, variations and guitar chord structures.
                            </p>
                          </div>
                        </Link>

                        {/* Scale Explorer */}
                        <Link
                          href="/scales"
                          onClick={() => setActiveDropdown(null)}
                          className="group flex items-start gap-3 p-3 rounded-2xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
                        >
                          <div className="w-8 h-8 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.04] dark:border-white/10 flex items-center justify-center text-[#171717] dark:text-[#F5F5F4] group-hover:scale-105 group-hover:text-[#D4AD61] transition-all shrink-0 mt-0.5">
                            <Stack size={16} weight="regular" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-semibold text-[#171717] dark:text-[#F5F5F4] group-hover:text-[#38211F] dark:group-hover:text-[#E9D8B7] transition-colors">
                                Scale Explorer
                              </span>
                              <ArrowUpRight
                                size={11}
                                weight="bold"
                                className="opacity-0 group-hover:opacity-75 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-[#D4AD61]"
                              />
                            </div>
                            <p className="text-xs text-[#77746F] dark:text-[#A8A29E] mt-0.5 leading-relaxed">
                              Discover scales, note relationships and patterns across the guitar fretboard.
                            </p>
                          </div>
                        </Link>
                      </div>

                      {/* Column 2: Practice Tools */}
                      <div className="space-y-1 relative pl-2 border-l border-[#EAE8E4]/70 dark:border-white/10">
                        <div className="px-3 py-1">
                          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#9E7A32] dark:text-[#D4AD61]">
                            Practice Tools
                          </span>
                        </div>

                        {/* Tuner */}
                        <Link
                          href="/tuner"
                          onClick={() => setActiveDropdown(null)}
                          className="group flex items-start gap-3 p-3 rounded-2xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
                        >
                          <div className="w-8 h-8 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.04] dark:border-white/10 flex items-center justify-center text-[#171717] dark:text-[#F5F5F4] group-hover:scale-105 group-hover:text-[#D4AD61] transition-all shrink-0 mt-0.5">
                            <Microphone size={16} weight="regular" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-semibold text-[#171717] dark:text-[#F5F5F4] group-hover:text-[#38211F] dark:group-hover:text-[#E9D8B7] transition-colors">
                                Tuner
                              </span>
                              <ArrowUpRight
                                size={11}
                                weight="bold"
                                className="opacity-0 group-hover:opacity-75 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-[#D4AD61]"
                              />
                            </div>
                            <p className="text-xs text-[#77746F] dark:text-[#A8A29E] mt-0.5 leading-relaxed">
                              Keep your guitar in tune with precision.
                            </p>
                          </div>
                        </Link>

                        {/* Metronome */}
                        <Link
                          href="/metronome"
                          onClick={() => setActiveDropdown(null)}
                          className="group flex items-start gap-3 p-3 rounded-2xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
                        >
                          <div className="w-8 h-8 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.04] dark:border-white/10 flex items-center justify-center text-[#171717] dark:text-[#F5F5F4] group-hover:scale-105 group-hover:text-[#D4AD61] transition-all shrink-0 mt-0.5">
                            <Metronome size={16} weight="regular" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-semibold text-[#171717] dark:text-[#F5F5F4] group-hover:text-[#38211F] dark:group-hover:text-[#E9D8B7] transition-colors">
                                Metronome
                              </span>
                              <ArrowUpRight
                                size={11}
                                weight="bold"
                                className="opacity-0 group-hover:opacity-75 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-[#D4AD61]"
                              />
                            </div>
                            <p className="text-xs text-[#77746F] dark:text-[#A8A29E] mt-0.5 leading-relaxed">
                              Build timing, rhythm and consistency with an adjustable metronome.
                            </p>
                          </div>
                        </Link>
                      </div>
                    </div>

                    {/* Sub-footer Bar */}
                    <div className="mt-3 pt-3 px-3 border-t border-[#EAE8E4]/70 dark:border-white/10 flex items-center justify-between text-xs text-[#77746F] dark:text-[#A8A29E]">
                      <span className="flex items-center gap-1.5 text-[11px] font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Zero-Latency Web Audio API
                      </span>
                      <Link
                        href="/fretboard"
                        onClick={() => setActiveDropdown(null)}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-[#171717] dark:text-[#F5F5F4] hover:text-[#D4AD61] transition-colors"
                      >
                        <span>Open Interactive Studio</span>
                        <ArrowUpRight size={11} weight="bold" />
                      </Link>
                    </div>
                  </div>
                )}

                {/* =============================================================== */}
                {/* SONGS PANEL: Gateway to Fretboard Music Ecosystem               */}
                {/* =============================================================== */}
                {activeDropdown === 'songs' && (
                  <div className="w-[640px]">
                    <div className="grid grid-cols-12 gap-4">
                      {/* The 3 Core Capabilities (Discover → Understand → Practice & Organize) */}
                      <div className="col-span-7 space-y-1">
                        <div className="px-3 py-1">
                          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#9E7A32] dark:text-[#D4AD61]">
                            Song Ecosystem
                          </span>
                        </div>

                        {/* A. Practice a Song */}
                        <Link
                          href="/songs"
                          onClick={() => setActiveDropdown(null)}
                          className="group flex items-start gap-3 p-3 rounded-2xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
                        >
                          <div className="w-8 h-8 rounded-xl bg-[#D4AD61]/15 text-[#9E7A32] dark:text-[#D4AD61] border border-[#D4AD61]/25 flex items-center justify-center group-hover:scale-105 transition-all shrink-0 mt-0.5">
                            <PlayCircle size={17} weight="fill" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-semibold text-[#171717] dark:text-[#F5F5F4] group-hover:text-[#38211F] dark:group-hover:text-[#E9D8B7] transition-colors">
                                Practice a Song
                              </span>
                              <ArrowUpRight
                                size={11}
                                weight="bold"
                                className="opacity-0 group-hover:opacity-75 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-[#D4AD61]"
                              />
                            </div>
                            <p className="text-xs text-[#77746F] dark:text-[#A8A29E] mt-0.5 leading-relaxed">
                              Bring your favorite songs to life. Explore and practice them with Fretboard.
                            </p>
                          </div>
                        </Link>

                        {/* B. Find Chords & Scales */}
                        <Link
                          href="/songs?view=chords"
                          onClick={() => setActiveDropdown(null)}
                          className="group flex items-start gap-3 p-3 rounded-2xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
                        >
                          <div className="w-8 h-8 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.04] dark:border-white/10 flex items-center justify-center text-[#171717] dark:text-[#F5F5F4] group-hover:scale-105 group-hover:text-[#D4AD61] transition-all shrink-0 mt-0.5">
                            <Sparkle size={16} weight="regular" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-semibold text-[#171717] dark:text-[#F5F5F4] group-hover:text-[#38211F] dark:group-hover:text-[#E9D8B7] transition-colors">
                                Find Chords & Scales
                              </span>
                              <ArrowUpRight
                                size={11}
                                weight="bold"
                                className="opacity-0 group-hover:opacity-75 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-[#D4AD61]"
                              />
                            </div>
                            <p className="text-xs text-[#77746F] dark:text-[#A8A29E] mt-0.5 leading-relaxed">
                              Discover a song&apos;s chords, progression, musical key and compatible scales.
                            </p>
                          </div>
                        </Link>

                        {/* C. Your Libraries */}
                        <Link
                          href="/songs?view=library"
                          onClick={() => setActiveDropdown(null)}
                          className="group flex items-start gap-3 p-3 rounded-2xl hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
                        >
                          <div className="w-8 h-8 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.04] dark:border-white/10 flex items-center justify-center text-[#171717] dark:text-[#F5F5F4] group-hover:scale-105 group-hover:text-[#D4AD61] transition-all shrink-0 mt-0.5">
                            <BookmarkSimple size={16} weight="regular" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-semibold text-[#171717] dark:text-[#F5F5F4] group-hover:text-[#38211F] dark:group-hover:text-[#E9D8B7] transition-colors">
                                Your Libraries
                              </span>
                              <ArrowUpRight
                                size={11}
                                weight="bold"
                                className="opacity-0 group-hover:opacity-75 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-[#D4AD61]"
                              />
                            </div>
                            <p className="text-xs text-[#77746F] dark:text-[#A8A29E] mt-0.5 leading-relaxed">
                              Create personal music collections and keep your favorite songs organized in one place.
                            </p>
                          </div>
                        </Link>
                      </div>

                      {/* Local-First Repertoire Card (Editorial feature spotlight) */}
                      <div className="col-span-5 flex flex-col justify-between p-4 rounded-2xl bg-[#F7F6F3] dark:bg-[#1A1816] border border-[#EAE8E4] dark:border-white/10">
                        <div>
                          <h4 className="text-sm font-serif font-normal tracking-tight text-[#171717] dark:text-[#F5F5F4] leading-[1.25]">
                            Local-first <span className="italic text-[#D4AD61]">Practice Sync</span>
                          </h4>
                          <p className="text-xs text-[#77746F] dark:text-[#A8A29E] mt-1.5 leading-relaxed">
                            Custom chord charts and mastery progress save directly in your browser. Fast, private, and always available offline.
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-[#EAE8E4]/70 dark:border-white/10">
                          <Link
                            href="/songs"
                            onClick={() => setActiveDropdown(null)}
                            className="inline-flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-semibold bg-[#171717] dark:bg-[#F5F5F4] text-white dark:text-[#171717] hover:bg-[#2b2b2b] dark:hover:bg-white transition-all shadow-xs"
                          >
                            <span>Explore Repertoire</span>
                            <ArrowUpRight size={12} weight="bold" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===================================================================== */}
        {/* RIGHT SECTION — UTILITY AND AUTHENTICATION                            */}
        {/* ===================================================================== */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Jam Button (Styled like Hero StartPlayingButton) */}
          <StartPlayingButton
            href="/jam"
            label="Jam"
            size="compact"
            className="hidden sm:inline-flex"
          />

          {/* Desktop Authentication Controls (Sign in + Sign up / User Profile) */}
          <div className="hidden lg:flex items-center">
            <AuthNav variant="desktop" />
          </div>

          {/* Mobile / Tablet Menu Toggle (< 1024px) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-[#171717] dark:text-[#F5F5F4] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AD61]/60"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={mobileMenuOpen ? 'close' : 'open'}
                initial={shouldReduceMotion ? undefined : { rotate: -45, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={shouldReduceMotion ? undefined : { rotate: 45, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-center"
              >
                {mobileMenuOpen ? <X size={18} weight="regular" /> : <List size={18} weight="regular" />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TABLET & MOBILE ANCHORED FLOATING DRAWER (< 1024px)                      */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden absolute top-full left-0 right-0 px-3 sm:px-6 pt-1 pb-4 z-50 pointer-events-auto"
          >
            <div className="w-full max-w-lg mx-auto rounded-2xl p-4 backdrop-blur-xl border border-[#EAE8E4] dark:border-white/10 bg-[#FCFBF9]/96 dark:bg-[#15111B]/96 text-[#171717] dark:text-[#F5F5F4] shadow-[0_20px_50px_rgba(23,23,23,0.14)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.7)] transition-colors space-y-1">
              {/* Direct Link: Fretboard */}
              <Link
                href="/fretboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                  isFretboardActive
                    ? 'bg-black/[0.06] dark:bg-white/[0.08] text-[#171717] dark:text-[#F5F5F4] font-semibold'
                    : 'text-[#64605B] dark:text-[#A8A29E] hover:text-[#171717] dark:hover:text-[#F5F5F4] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                }`}
              >
                <Guitar size={16} weight="regular" className={isFretboardActive ? 'text-[#D4AD61]' : 'opacity-70'} />
                <span>Fretboard Studio</span>
              </Link>

              {/* Direct Link: Jam Room */}
              <Link
                href="/jam"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                  pathname === '/jam'
                    ? 'bg-black/[0.06] dark:bg-white/[0.08] text-[#171717] dark:text-[#F5F5F4] font-semibold'
                    : 'text-[#64605B] dark:text-[#A8A29E] hover:text-[#171717] dark:hover:text-[#F5F5F4] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                }`}
              >
                <Broadcast size={16} weight="regular" className={pathname === '/jam' ? 'text-[#D4AD61]' : 'opacity-70'} />
                <span>Jam Room Alpha</span>
              </Link>

              {/* Expandable Accordion: Resources */}
              <div className="rounded-xl overflow-hidden border border-[#EAE8E4]/60 dark:border-white/5 bg-black/[0.015] dark:bg-white/[0.02]">
                <button
                  type="button"
                  onClick={() => setMobileResourcesOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-xs sm:text-sm font-medium text-[#171717] dark:text-[#F5F5F4] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
                >
                  <span className="font-semibold">Resources</span>
                  <CaretDown
                    size={13}
                    weight="bold"
                    className={`transition-transform duration-200 ${mobileResourcesOpen ? 'rotate-180 text-[#D4AD61]' : 'opacity-60'}`}
                  />
                </button>
                <AnimatePresence>
                  {mobileResourcesOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="px-2 pb-2 space-y-0.5"
                    >
                      <Link
                        href="/chords"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#64605B] dark:text-[#A8A29E] hover:text-[#171717] dark:hover:text-[#F5F5F4] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                      >
                        <BookOpen size={14} weight="regular" className="text-[#D4AD61]" />
                        <span>Chord Explorer</span>
                      </Link>
                      <Link
                        href="/scales"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#64605B] dark:text-[#A8A29E] hover:text-[#171717] dark:hover:text-[#F5F5F4] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                      >
                        <Stack size={14} weight="regular" className="text-[#D4AD61]" />
                        <span>Scale Explorer</span>
                      </Link>
                      <Link
                        href="/tuner"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#64605B] dark:text-[#A8A29E] hover:text-[#171717] dark:hover:text-[#F5F5F4] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                      >
                        <Microphone size={14} weight="regular" className="text-[#D4AD61]" />
                        <span>Guitar Tuner</span>
                      </Link>
                      <Link
                        href="/metronome"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#64605B] dark:text-[#A8A29E] hover:text-[#171717] dark:hover:text-[#F5F5F4] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                      >
                        <Metronome size={14} weight="regular" className="text-[#D4AD61]" />
                        <span>Metronome</span>
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Expandable Accordion: Songs */}
              <div className="rounded-xl overflow-hidden border border-[#EAE8E4]/60 dark:border-white/5 bg-black/[0.015] dark:bg-white/[0.02]">
                <button
                  type="button"
                  onClick={() => setMobileSongsOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-xs sm:text-sm font-medium text-[#171717] dark:text-[#F5F5F4] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
                >
                  <span className="font-semibold">Songs</span>
                  <CaretDown
                    size={13}
                    weight="bold"
                    className={`transition-transform duration-200 ${mobileSongsOpen ? 'rotate-180 text-[#D4AD61]' : 'opacity-60'}`}
                  />
                </button>
                <AnimatePresence>
                  {mobileSongsOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="px-2 pb-2 space-y-0.5"
                    >
                      <Link
                        href="/songs"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#64605B] dark:text-[#A8A29E] hover:text-[#171717] dark:hover:text-[#F5F5F4] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                      >
                        <PlayCircle size={14} weight="fill" className="text-[#D4AD61]" />
                        <span>Practice a Song</span>
                      </Link>
                      <Link
                        href="/songs?view=chords"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#64605B] dark:text-[#A8A29E] hover:text-[#171717] dark:hover:text-[#F5F5F4] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                      >
                        <Sparkle size={14} weight="regular" className="text-[#D4AD61]" />
                        <span>Find Chords & Scales</span>
                      </Link>
                      <Link
                        href="/songs?view=library"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#64605B] dark:text-[#A8A29E] hover:text-[#171717] dark:hover:text-[#F5F5F4] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                      >
                        <BookmarkSimple size={14} weight="regular" className="text-[#D4AD61]" />
                        <span>Your Libraries</span>
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Direct Link: Practice */}
              <Link
                href="/practice"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                  isPracticeActive
                    ? 'bg-black/[0.06] dark:bg-white/[0.08] text-[#171717] dark:text-[#F5F5F4] font-semibold'
                    : 'text-[#64605B] dark:text-[#A8A29E] hover:text-[#171717] dark:hover:text-[#F5F5F4] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                }`}
              >
                <Timer size={16} weight="regular" className={isPracticeActive ? 'text-[#D4AD61]' : 'opacity-70'} />
                <span>Practice Studio</span>
              </Link>

              {/* Direct Link: Telemetry */}
              <Link
                href="/progress"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                  isTelemetryActive
                    ? 'bg-black/[0.06] dark:bg-white/[0.08] text-[#171717] dark:text-[#F5F5F4] font-semibold'
                    : 'text-[#64605B] dark:text-[#A8A29E] hover:text-[#171717] dark:hover:text-[#F5F5F4] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                }`}
              >
                <TrendUp size={16} weight="regular" className={isTelemetryActive ? 'text-[#D4AD61]' : 'opacity-70'} />
                <span>Progress Telemetry</span>
              </Link>

              {/* Divider */}
              <div className="w-full h-[1px] bg-[#EAE8E4] dark:border-white/10 my-2" aria-hidden="true" />

              {/* Mobile Auth Controls */}
              <AuthNav variant="mobile" onNavigate={() => setMobileMenuOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
