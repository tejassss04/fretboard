'use client';

import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { LinkSimple, Check, Play, Pause, Sparkle } from '@phosphor-icons/react';
import BlurReveal from '@/components/ui/BlurReveal';
import { getAudioEngine } from '@/lib/audio';
import { TUNINGS, getFretInfo } from '@/lib/guitar';

const CUBIC_EASE = [0.22, 1, 0.36, 1] as const;

interface ActivityLogItem {
  id: number;
  user: string;
  avatar: string;
  action: string;
  time: string;
}

export default function MultiplayerShowcase() {
  const shouldReduceMotion = useReducedMotion();
  const [isJamBotActive, setIsJamBotActive] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [activePlayer, setActivePlayer] = useState<'YO' | 'AL' | 'SR'>('YO');
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([
    { id: 1, user: 'Sarah', avatar: 'SR', action: 'strummed A Minor', time: 'Just now' },
    { id: 2, user: 'Alex', avatar: 'AL', action: 'plucked E4 in Pentatonic Box 1', time: '3s ago' },
    { id: 3, user: 'You', avatar: 'YO', action: 'connected to room #JAM-8402', time: '1m ago' },
  ]);

  // Jam Bot (Alex) Simulation
  useEffect(() => {
    if (!isJamBotActive) return;

    const lickNotes = [
      { str: 2, fret: 5, note: 'C4' },
      { str: 2, fret: 7, note: 'D4' },
      { str: 1, fret: 5, note: 'E4' },
      { str: 1, fret: 8, note: 'G4' },
      { str: 0, fret: 5, note: 'A4' },
      { str: 1, fret: 8, note: 'G4' },
      { str: 1, fret: 5, note: 'E4' },
      { str: 2, fret: 7, note: 'D4' },
    ];

    let noteIdx = 0;
    const interval = setInterval(() => {
      const target = lickNotes[noteIdx % lickNotes.length];
      const str = TUNINGS.standard.strings[target.str];
      const fretInfo = getFretInfo(str.note, str.octave, target.fret);

      try {
        const audio = getAudioEngine();
        audio.playNote(fretInfo.frequency, 0.72);
      } catch {
        // Fallback
      }

      setActivePlayer('AL');

      setActivityLogs((prev) => [
        {
          id: Date.now(),
          user: 'Alex (Bot)',
          avatar: 'AL',
          action: `plucked ${target.note} in A Pentatonic`,
          time: 'Just now',
        },
        ...prev.slice(0, 3),
      ]);

      noteIdx++;
    }, 480);

    return () => clearInterval(interval);
  }, [isJamBotActive]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.origin + '/#JAM-8402');
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <section id="jam" className="relative w-full py-10 sm:py-14 lg:py-16 overflow-hidden scroll-mt-14">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-8 sm:mb-10">
          <BlurReveal
            delay={0}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F7F6F3] dark:bg-[#1A1816] border border-[#EAE8E4] dark:border-white/10 text-[11px] font-mono font-medium text-[#77746F] dark:text-[#A8A29E] mb-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AD61]" />
            SECTION 03 • REAL-TIME MULTIPLAYER
          </BlurReveal>

          <BlurReveal
            as="h2"
            delay={0.08}
            className="text-3xl sm:text-4xl lg:text-5xl font-normal text-[#171717] dark:text-[#F5F5F4] tracking-[-0.03em] leading-[1.14] mb-4 text-balance"
          >
            Music is better{' '}
            <span className="font-serif italic text-[1.1em] text-[#38211F] dark:text-[#E9D8B7]">
              together.
            </span>
          </BlurReveal>

          <BlurReveal
            as="p"
            delay={0.14}
            className="text-base sm:text-lg text-[#77746F] dark:text-[#A8A29E] font-normal leading-[1.65]"
          >
            Create a jam room, invite your friends and explore musical ideas together. Whether practicing a lick or exchanging chord progressions, Fretboard brings musicians into the same space.
          </BlurReveal>
        </div>

        {/* Compact Multiplayer Showcase Card */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.65, ease: CUBIC_EASE }}
          className="rounded-3xl bg-white/80 dark:bg-[#15111B]/75 backdrop-blur-md border border-[#EAE8E4]/70 dark:border-white/[0.06] hover:border-[#D4AD61]/25 dark:hover:border-[#D4AD61]/25 p-5 sm:p-8 lg:p-10 shadow-[0_20px_50px_rgba(23,23,23,0.04)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_25px_60px_rgba(0,0,0,0.35)] hover:shadow-[0_16px_36px_rgba(212,173,97,0.04)] dark:hover:shadow-[0_0_16px_rgba(212,173,97,0.06),0_25px_60px_rgba(0,0,0,0.35)] transition-all duration-300"
        >
          {/* Top Room Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-[#EAE8E4] dark:border-white/10">
            <div className="flex flex-wrap items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-[#171717] dark:text-[#F5F5F4] tracking-tight">
                  Jam Room Alpha
                </span>
                <span className="text-xs font-mono text-[#77746F] dark:text-[#A8A29E] bg-[#F7F6F3] dark:bg-[#201D1A] px-2 py-0.5 rounded border border-[#EAE8E4] dark:border-white/10">
                  #JAM-8402
                </span>
              </div>
            </div>

            {/* Actions: Bot Toggle & Copy Link */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsJamBotActive(!isJamBotActive)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-2 whitespace-nowrap ${
                  isJamBotActive
                    ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                    : 'bg-[#171717] dark:bg-[#F5F5F4] text-white dark:text-[#171717]'
                }`}
              >
                {isJamBotActive ? (
                  <Pause size={12} weight="regular" className="shrink-0" />
                ) : (
                  <Play size={12} weight="regular" className="text-emerald-400 dark:text-emerald-600 shrink-0" />
                )}
                <span>{isJamBotActive ? 'Pause Jam Bot' : 'Play with Jam Bot (Alex)'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="text-xs font-medium text-[#77746F] dark:text-[#A8A29E] hover:text-[#171717] dark:hover:text-white bg-[#F7F6F3] dark:bg-[#201D1A] border border-[#EAE8E4] dark:border-white/10 px-3 py-1.5 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
              >
                {copiedLink ? (
                  <>
                    <Check size={12} weight="regular" className="text-emerald-500" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <LinkSimple size={12} weight="regular" />
                    <span>Invite Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Two Synchronized Collaborative Waveforms Visualization */}
          <div className="w-full h-24 rounded-2xl bg-[#F7F6F3] dark:bg-[#171412] border border-[#EAE8E4] dark:border-white/10 shadow-[inset_0_1px_3px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.45)] p-4 mb-6 relative overflow-hidden flex items-center justify-center">
            {/* Ambient Label */}
            <div className="absolute top-2 left-3 text-[10px] font-mono text-[#77746F] dark:text-[#A8A29E] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AD61]" />
              <span>Synchronized Web Audio Streams (Local & Remote)</span>
            </div>

            <svg className="w-full h-16" viewBox="0 0 800 60" fill="none">
              {/* Waveform 1: Host (You) */}
              <motion.path
                d="M 0 30 Q 100 10, 200 30 T 400 30 T 600 30 T 800 30"
                stroke="#D4AD61"
                strokeWidth="2.2"
                strokeLinecap="round"
                className={isJamBotActive ? 'animate-pulse' : ''}
              />
              {/* Waveform 2: Remote Peer (Alex) */}
              <motion.path
                d="M 0 30 Q 100 50, 200 30 T 400 30 T 600 30 T 800 30"
                stroke="#A8A29E"
                strokeWidth="1.8"
                strokeLinecap="round"
                className={isJamBotActive ? 'animate-pulse' : ''}
                style={{ opacity: isJamBotActive ? 0.8 : 0.4 }}
              />
            </svg>
          </div>

          {/* Musicians & Live Activity Stream Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* In-Room Musicians (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col gap-2.5">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#77746F] dark:text-[#A8A29E] mb-1">
                Connected Musicians
              </span>

              <div className={`p-3 rounded-2xl border transition-all ${
                activePlayer === 'YO' ? 'bg-[#F1F0ED] dark:bg-[#201D1A] border-[#D4AD61]' : 'bg-[#F7F6F3] dark:bg-[#1A1816] border-[#EAE8E4] dark:border-white/5'
              } flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#171717] dark:bg-white text-white dark:text-[#171717] font-bold text-xs flex items-center justify-center">
                    YO
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#171717] dark:text-[#F5F5F4] block">You</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">Host • Plucking Active</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-zinc-400">48 kHz</span>
              </div>

              <div className={`p-3 rounded-2xl border transition-all ${
                activePlayer === 'AL' && isJamBotActive ? 'bg-[#E9D8B7]/30 dark:bg-[#D4AD61]/20 border-[#D4AD61]' : 'bg-[#F7F6F3] dark:bg-[#1A1816] border-[#EAE8E4] dark:border-white/5'
              } flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#D4AD61] text-zinc-950 font-bold text-xs flex items-center justify-center">
                    AL
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#171717] dark:text-[#F5F5F4] block">Alex (Bot)</span>
                    <span className="text-[10px] text-[#D4AD61] font-mono">
                      {isJamBotActive ? 'Soloing • In Sync' : 'Jam Bot • Ready'}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#D4AD61]">Interactive</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#F7F6F3] dark:bg-[#1A1816] border border-[#EAE8E4] dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#A5AC94] text-white font-bold text-xs flex items-center justify-center">
                    SR
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#171717] dark:text-[#F5F5F4] block">Sarah</span>
                    <span className="text-[10px] text-zinc-500 font-mono">Rhythm • In Room</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-zinc-400">Listening</span>
              </div>
            </div>

            {/* Live Synchronized Activity Stream (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col gap-2">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#77746F] dark:text-[#A8A29E] mb-1">
                Real-Time Activity Stream
              </span>

              <div className="space-y-2">
                {activityLogs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#F7F6F3] dark:bg-[#1A1816] border border-[#EAE8E4] dark:border-white/5 text-xs font-mono"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-[9px] flex items-center justify-center">
                        {log.avatar}
                      </span>
                      <span className="font-semibold text-[#171717] dark:text-[#F5F5F4]">{log.user}</span>
                      <span className="text-[#77746F] dark:text-[#A8A29E]">{log.action}</span>
                    </div>
                    <span className="text-[10px] text-zinc-400">{log.time}</span>
                  </motion.div>
                ))}
              </div>
            </div>

          </div>

          {/* Understated Disclaimer Ribbon */}
          <div className="mt-6 pt-5 border-t border-[#EAE8E4] dark:border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-[#77746F] dark:text-[#A8A29E]">
            <span className="font-mono text-[11px] inline-flex items-center gap-1.5">
              <Sparkle size={12} weight="regular" className="text-[#D4AD61] shrink-0" />
              <span>DEMO PREVIEW • Instant room link sharing with local browser-synthesized audio.</span>
            </span>
            <span className="text-[11px] font-mono text-[#D4AD61]">Zero software installation required</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
