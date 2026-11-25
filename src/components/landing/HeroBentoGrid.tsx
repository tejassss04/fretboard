'use client';

import React, { useRef, useState, useCallback, useSyncExternalStore } from 'react';
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion';
import { getAudioEngine, GuitarTone } from '@/lib/audio';
import { NoteName } from '@/lib/guitar';

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

function SpotlightCard({ children, className = '', style }: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={style}
      className={`group relative overflow-hidden rounded-3xl border border-[#EAE8E4]/50 dark:border-white/[0.04] bg-white/80 dark:bg-[#15111B]/75 backdrop-blur-md shadow-[0_16px_40px_rgba(23,23,23,0.04)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)] hover:border-[#D4AD61]/30 dark:hover:border-[#D4AD61]/30 hover:shadow-[0_16px_36px_rgba(212,173,97,0.06)] dark:hover:shadow-[0_0_16px_rgba(212,173,97,0.10),0_20px_50px_rgba(0,0,0,0.45)] transition-all duration-300 ${className}`}
    >
      {/* Dynamic Cursor Spotlight Layer */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          opacity,
          background: `radial-gradient(320px circle at ${position.x}px ${position.y}px, rgba(212, 173, 97, 0.10), rgba(245, 158, 11, 0.05), transparent 70%)`,
        }}
      />
      {children}
    </div>
  );
}

function subscribeToSm(callback: () => void) {
  const mq = window.matchMedia('(min-width: 640px)');
  mq.addEventListener('change', callback);
  return () => mq.removeEventListener('change', callback);
}

function getSmSnapshot() {
  return window.matchMedia('(min-width: 640px)').matches;
}

function getServerSnapshot() {
  return false;
}

export default function HeroBentoGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Scroll Progress Tracking for Velocity Parallax
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    restDelta: 0.001,
  });

  // Asymmetric Staggered Parallax Displacement for Sub-Columns
  const yCol1 = useTransform(smoothProgress, [0, 1], shouldReduceMotion ? [0, 0] : [35, -30]);
  const yCol2 = useTransform(smoothProgress, [0, 1], shouldReduceMotion ? [0, 0] : [70, -45]);
  const gridScale = useTransform(smoothProgress, [0, 0.35], shouldReduceMotion ? [1, 1] : [0.97, 1]);
  const gridOpacity = useTransform(smoothProgress, [0, 0.2], shouldReduceMotion ? [1, 1] : [0.75, 1]);

  // Interactive Micro-states
  const [activePluckNote, setActivePluckNote] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<NoteName>('A');
  const [selectedTone, setSelectedTone] = useState<GuitarTone>('acoustic');
  const [isJamSimActive, setIsJamSimActive] = useState<boolean>(true);
  const isSmUp = useSyncExternalStore(subscribeToSm, getSmSnapshot, getServerSnapshot);

  // Play micro note pluck
  const handlePluckMiniNote = useCallback((note: string, freq: number) => {
    try {
      const audio = getAudioEngine();
      audio.playNote(freq, 0.85);
    } catch {
      // Audio fallback
    }
    setActivePluckNote(note);
    setTimeout(() => setActivePluckNote(null), 500);
  }, []);

  const handleSelectTone = (tone: GuitarTone) => {
    setSelectedTone(tone);
    try {
      const audio = getAudioEngine();
      audio.setTone(tone);
      audio.playNote(220, 0.75);
    } catch {
      // Audio fallback
    }
  };

  const miniFretboardNotes = [
    { note: 'A4', freq: 440, label: 'A', isRoot: true },
    { note: 'E4', freq: 329.63, label: 'E', isRoot: false },
    { note: 'C4', freq: 261.63, label: 'C', isRoot: false },
    { note: 'A3', freq: 220, label: 'A', isRoot: true },
    { note: 'E3', freq: 164.81, label: 'E', isRoot: false },
  ];

  return (
    <div ref={containerRef} className="w-full select-none">
      <motion.div
        style={{ scale: gridScale, opacity: gridOpacity }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5"
      >
        {/* ======================================================== */}
        {/* SUB-COLUMN 1: TALL ANATOMY CARD + COMPACT TONE CARD */}
        {/* ======================================================== */}
        <motion.div style={{ y: isSmUp ? yCol1 : 0 }} className="flex flex-col gap-4 sm:gap-5">
          
          {/* Card 1: Virtual Fretboard Anatomy (Taller) */}
          <SpotlightCard className="p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="text-eyebrow text-[#D4AD61] bg-[#D4AD61]/10 px-2 py-0.5 rounded border border-[#D4AD61]/25">
                  01 • Anatomy
                </span>
                <span className="text-[11px] font-mono text-[#77746F] dark:text-[#A8A29E]">
                  Click note to play
                </span>
              </div>

              <h3 className="text-card-title text-lg text-[#171717] dark:text-[#F5F5F4] mb-1">
                Living Fretboard
              </h3>
              <p className="text-xs text-[#77746F] dark:text-[#A8A29E] leading-relaxed mb-4">
                Rosewood base, bone nut, and bronze strings with instant Web Audio synthesis.
              </p>
            </div>

            {/* Micro Fretboard Neck Slices */}
            <div className="relative w-full rounded-2xl bg-[#271A19] border border-[#38211F]/50 p-3 shadow-inner overflow-hidden">
              <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#FFEAB3_1px,transparent_1px)] [background-size:14px_14px]" />
              
              {/* Bone Nut */}
              <div className="absolute left-2.5 top-2.5 bottom-2.5 w-2 rounded bg-[#F4EFE6] shadow-sm z-10" />

              {/* Fret Dividers */}
              <div className="absolute inset-x-6 top-2.5 bottom-2.5 flex justify-between pointer-events-none">
                {[1, 2, 3, 4, 5].map((fret) => (
                  <div key={fret} className="relative flex flex-col items-center h-full">
                    <div className="w-[1.5px] h-full bg-[#E5E7EB] opacity-60" />
                    {fret === 3 ? (
                      <div className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#FAF5E6] opacity-75" />
                    ) : null}
                  </div>
                ))}
              </div>

              {/* 6 Guitar Strings */}
              <div className="relative flex flex-col justify-between h-24 pl-3 pr-1 z-20">
                {[
                  { gauge: 1.0, color: 'bg-[#C4CCD6]' },
                  { gauge: 1.2, color: 'bg-[#C4CCD6]' },
                  { gauge: 1.5, color: 'bg-[#C4CCD6]' },
                  { gauge: 2.0, color: 'bg-[#E2B565]' },
                  { gauge: 2.4, color: 'bg-[#E2B565]' },
                  { gauge: 3.0, color: 'bg-[#E2B565]' },
                ].map((string, sIdx) => (
                  <div key={sIdx} className="relative h-3 flex items-center">
                    <div className={`w-full ${string.color} opacity-85 shadow-xs`} style={{ height: `${string.gauge}px` }} />
                  </div>
                ))}

                {/* Clickable Plucking Nodes */}
                <div className="absolute inset-0 flex items-center justify-around px-5 pointer-events-auto">
                  {miniFretboardNotes.map((item, idx) => {
                    const isPlucked = activePluckNote === item.note;
                    return (
                      <motion.button
                        key={idx}
                        type="button"
                        onClick={() => handlePluckMiniNote(item.note, item.freq)}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[9px] font-bold transition-all duration-200 cursor-pointer shadow-sm ${
                          isPlucked
                            ? 'bg-gradient-to-tr from-[#FFE082] via-[#D4AD61] to-[#B8852B] text-zinc-950 scale-125 ring-2 ring-white z-30 shadow-[0_0_12px_rgba(212,173,97,0.9)]'
                            : item.isRoot
                            ? 'bg-[#D4AD61] text-zinc-950 border border-white/50 hover:bg-[#FFE082]'
                            : 'bg-white/90 text-zinc-900 hover:bg-white border border-black/15'
                        }`}
                        title={`Pluck ${item.note} (${item.freq} Hz)`}
                      >
                        {item.label}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-zinc-400">
              <span>Nut to 5th Fret</span>
              <span className="text-[#D4AD61]">48 kHz Native</span>
            </div>
          </SpotlightCard>

          {/* Card 3: 48 kHz Web Audio Tones (Compact) */}
          <SpotlightCard className="p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-eyebrow text-[#D4AD61] bg-[#D4AD61]/10 px-2 py-0.5 rounded border border-[#D4AD61]/25">
                  03 • Sound
                </span>
              </div>
              <h3 className="text-card-title text-base sm:text-lg text-[#171717] dark:text-[#F5F5F4] mb-1">
                Tone Studio
              </h3>
              <p className="text-xs text-[#77746F] dark:text-[#A8A29E] leading-relaxed mb-3">
                Zero plugins. Physical-modeling impulse synthesis.
              </p>
            </div>

            {/* 3 Tone Selector Pills */}
            <div className="flex flex-col gap-1.5 bg-[#F7F6F3] dark:bg-[#1A1816] p-2 rounded-xl border border-[#EAE8E4] dark:border-white/[0.08]">
              {[
                { id: 'acoustic', label: 'Acoustic Steel' },
                { id: 'electric', label: 'Electric Clean' },
                { id: 'nylon', label: 'Mellow Nylon' },
              ].map((tone) => {
                const isActive = selectedTone === tone.id;
                return (
                  <button
                    key={tone.id}
                    type="button"
                    onClick={() => handleSelectTone(tone.id as GuitarTone)}
                    className={`relative flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-left transition-colors cursor-pointer ${
                      isActive
                        ? 'text-white dark:text-[#171717] border-transparent'
                        : 'bg-white dark:bg-[#201D1A] text-[#171717] dark:text-[#F5F5F4] border-[#EAE8E4] dark:border-white/10 hover:border-[#D4AD61]/50'
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="heroBentoTonePillActive"
                        transition={
                          shouldReduceMotion
                            ? { duration: 0 }
                            : { type: 'spring', stiffness: 460, damping: 34 }
                        }
                        className="absolute inset-0 rounded-lg bg-[#171717] dark:bg-[#F5F5F4] shadow-xs"
                      />
                    )}
                    <span className="relative z-10 text-xs font-semibold">{tone.label}</span>
                    <span className="relative z-10 flex items-end gap-0.5 h-3">
                      <span className={`w-0.5 rounded-full transition-all ${isActive ? 'bg-[#D4AD61] h-3 animate-pulse' : 'bg-zinc-400 h-1.5'}`} />
                      <span className={`w-0.5 rounded-full transition-all ${isActive ? 'bg-[#D4AD61] h-2 animate-pulse' : 'bg-zinc-400 h-1'}`} style={{ animationDelay: '0.15s' }} />
                      <span className={`w-0.5 rounded-full transition-all ${isActive ? 'bg-[#D4AD61] h-2.5 animate-pulse' : 'bg-zinc-400 h-1.5'}`} style={{ animationDelay: '0.3s' }} />
                    </span>
                  </button>
                );
              })}
            </div>
          </SpotlightCard>

        </motion.div>

        {/* ======================================================== */}
        {/* SUB-COLUMN 2: ASYMMETRIC OFFSET (COMPACT THEORY + TALL JAM ROOM) */}
        {/* ======================================================== */}
        <motion.div style={{ y: isSmUp ? yCol2 : 0 }} className="flex flex-col gap-4 sm:gap-5 sm:pt-6 lg:pt-8">
          
          {/* Card 2: Scales & Music Theory (Compact) */}
          <SpotlightCard className="p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-eyebrow text-[#D4AD61] bg-[#D4AD61]/10 px-2 py-0.5 rounded border border-[#D4AD61]/25">
                  02 • Theory
                </span>
              </div>
              <h3 className="text-card-title text-base sm:text-lg text-[#171717] dark:text-[#F5F5F4] mb-1">
                Dynamic Scales
              </h3>
              <p className="text-xs text-[#77746F] dark:text-[#A8A29E] leading-relaxed mb-3">
                Transpose across all 12 keys with geometric interval highlighting.
              </p>
            </div>

            {/* Key Selector & Interval Badges */}
            <div className="flex flex-col gap-2.5 bg-[#F7F6F3] dark:bg-[#1A1816] p-2.5 rounded-xl border border-[#EAE8E4] dark:border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-eyebrow text-[#77746F] dark:text-[#A8A29E]">Root</span>
                <div className="flex items-center gap-1 p-0.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] border border-[#EAE8E4] dark:border-white/[0.08]">
                  {(['A', 'C', 'G', 'E'] as NoteName[]).map((k) => {
                    const active = selectedKey === k;
                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setSelectedKey(k)}
                        className={`relative w-6 h-6 rounded-md text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                          active
                            ? 'text-white dark:text-[#171717]'
                            : 'text-[#77746F] dark:text-[#A8A29E] hover:text-[#171717] dark:hover:text-[#F5F5F4]'
                        }`}
                      >
                        {active && (
                          <motion.span
                            layoutId="heroBentoKeyActive"
                            transition={
                              shouldReduceMotion
                                ? { duration: 0 }
                                : { type: 'spring', stiffness: 480, damping: 34 }
                            }
                            className="absolute inset-0 rounded-md bg-[#171717] dark:bg-[#F5F5F4] shadow-xs"
                          />
                        )}
                        <span className="relative z-10">{k}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Formula & Dynamic Pitch Readout */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#EAE8E4] dark:border-white/[0.06]">
                <div className="flex items-center gap-1">
                  {['R', '♭3', '4', '5', '♭7'].map((deg, idx) => (
                    <span
                      key={deg}
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        idx === 0
                          ? 'font-bold bg-[#D4AD61] text-zinc-950'
                          : 'text-[#77746F] dark:text-[#A8A29E] bg-white dark:bg-[#201D1A] border border-[#EAE8E4] dark:border-white/10'
                      }`}
                    >
                      {deg}
                    </span>
                  ))}
                </div>
                <span className="text-[11px] font-mono text-[#D4AD61] tabular-nums">
                  {selectedKey === 'A'
                    ? 'A·C·D·E·G'
                    : selectedKey === 'C'
                      ? 'C·Eb·F·G·Bb'
                      : selectedKey === 'G'
                        ? 'G·Bb·C·D·F'
                        : 'E·G·A·B·D'}
                </span>
              </div>
            </div>
          </SpotlightCard>

          {/* Card 4: Multiplayer Jam Rooms (Taller) */}
          <SpotlightCard className="p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#D4AD61] bg-[#D4AD61]/10 px-2 py-0.5 rounded border border-[#D4AD61]/25">
                  04 • MULTIPLAYER
                </span>
                <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE
                </span>
              </div>

              <h3 className="text-lg font-semibold text-[#171717] dark:text-[#F5F5F4] tracking-tight leading-[1.2] mb-1">
                Jam Room Sync
              </h3>
              <p className="text-xs text-[#77746F] dark:text-[#A8A29E] leading-relaxed mb-4">
                Collaborate in real time or jam alongside the automated Alex Bot.
              </p>
            </div>

            {/* Multiplayer Widget */}
            <div className="flex flex-col gap-3 bg-[#F7F6F3] dark:bg-[#1A1816] p-3 rounded-2xl border border-[#EAE8E4] dark:border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold uppercase text-[#77746F] dark:text-[#A8A29E] bg-white dark:bg-[#201D1A] px-2 py-0.5 rounded border border-[#EAE8E4] dark:border-white/10">
                  #JAM-8402
                </span>
                
                {/* Avatar Stack */}
                <div className="flex items-center -space-x-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#171717] dark:bg-white text-white dark:text-[#171717] text-[8px] font-bold flex items-center justify-center ring-2 ring-[#F7F6F3] dark:ring-[#1A1816]">
                    YO
                  </span>
                  <span className="w-5 h-5 rounded-full bg-[#D4AD61] text-zinc-950 text-[8px] font-bold flex items-center justify-center ring-2 ring-[#F7F6F3] dark:ring-[#1A1816]">
                    AL
                  </span>
                  <span className="w-5 h-5 rounded-full bg-[#A5AC94] text-white text-[8px] font-bold flex items-center justify-center ring-2 ring-[#F7F6F3] dark:ring-[#1A1816]">
                    SR
                  </span>
                </div>
              </div>

              {/* Collaborative Waveform */}
              <div className="h-10 w-full rounded-lg bg-white dark:bg-[#141210] border border-[#EAE8E4] dark:border-white/5 p-1 flex items-center justify-center overflow-hidden">
                <svg className="w-full h-8" viewBox="0 0 400 30" fill="none">
                  <motion.path
                    d="M 0 15 Q 50 3, 100 15 T 200 15 T 300 15 T 400 15"
                    stroke="#D4AD61"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    className={isJamSimActive ? 'animate-pulse' : ''}
                  />
                  <motion.path
                    d="M 0 15 Q 50 27, 100 15 T 200 15 T 300 15 T 400 15"
                    stroke="#A8A29E"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    style={{ opacity: isJamSimActive ? 0.75 : 0.25 }}
                  />
                </svg>
              </div>

              {/* Jam Bot Toggle Pill */}
              <button
                type="button"
                onClick={() => setIsJamSimActive(!isJamSimActive)}
                className="w-full py-1 rounded-lg text-[10px] font-semibold bg-[#171717] dark:bg-[#F5F5F4] text-white dark:text-[#171717] hover:bg-[#2b2b2b] dark:hover:bg-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isJamSimActive ? 'bg-emerald-400 animate-ping' : 'bg-zinc-400'}`} />
                <span>{isJamSimActive ? 'Jam Bot Active' : 'Toggle Jam Bot'}</span>
              </button>
            </div>

            <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-zinc-400">
              <span>WebRTC Mesh</span>
              <span className="text-[#D4AD61]">Active</span>
            </div>
          </SpotlightCard>

        </motion.div>

      </motion.div>
    </div>
  );
}
