'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import BlurReveal from '@/components/ui/BlurReveal';
import { getAudioEngine } from '@/lib/audio';
import { TUNINGS, getFretInfo } from '@/lib/guitar';
import {
  Users,
  LinkSimple,
  Check,
  Play,
  Pause,
  Broadcast,
  Sparkle,
  ArrowLeft,
  Waveform,
} from '@phosphor-icons/react';

interface Musician {
  id: string;
  name: string;
  avatar: string;
  role: string;
  status: string;
  latency: string;
  isHost?: boolean;
  isBot?: boolean;
  avatarBg: string;
  avatarColor: string;
}

interface ActivityEvent {
  id: string;
  user: string;
  avatar: string;
  action: string;
  time: string;
  avatarBg: string;
  avatarColor: string;
}

export default function JamPage() {
  const [copied, setCopied] = useState(false);
  const [isJamBotActive, setIsJamBotActive] = useState(false);
  const [activeNote, setActiveNote] = useState<string | null>(null);

  const musicians: Musician[] = [
    {
      id: 'you',
      name: 'You',
      avatar: 'YO',
      role: 'Lead Guitar',
      status: 'Connected • Host',
      latency: '0 ms',
      isHost: true,
      avatarBg: 'bg-[#171717] dark:bg-white',
      avatarColor: 'text-white dark:text-[#171717]',
    },
    {
      id: 'bot',
      name: 'Alex (Jam Bot)',
      avatar: 'AL',
      role: 'Backing Rhythm',
      status: 'Standby • Ready to Solo',
      latency: 'Local',
      isBot: true,
      avatarBg: 'bg-[#D4AD61]',
      avatarColor: 'text-zinc-950',
    },
    {
      id: 'peer-1',
      name: 'Waiting for Musician...',
      avatar: '+',
      role: 'Open Slot',
      status: 'Share invite link to join',
      latency: '--',
      avatarBg: 'bg-zinc-800/50',
      avatarColor: 'text-zinc-400',
    },
  ];

  const [activities, setActivities] = useState<ActivityEvent[]>([
    {
      id: '1',
      user: 'You',
      avatar: 'YO',
      action: 'created Jam Room #JAM-8402',
      time: 'Just now',
      avatarBg: 'bg-white',
      avatarColor: 'text-zinc-950',
    },
    {
      id: '2',
      user: 'System',
      avatar: 'SYS',
      action: 'Web Audio engine calibrated at 48 kHz',
      time: 'Just now',
      avatarBg: 'bg-zinc-800',
      avatarColor: 'text-zinc-400',
    },
  ]);

  // Audio Pluck Handler
  const playFretNote = (stringIdx: number, fret: number) => {
    try {
      const str = TUNINGS.standard.strings[stringIdx];
      const fretInfo = getFretInfo(str.note, str.octave, fret);
      const audio = getAudioEngine();
      audio.playNote(fretInfo.frequency, 0.75);

      setActiveNote(`${fretInfo.note}${fretInfo.octave}`);
      setTimeout(() => setActiveNote(null), 300);

      // Add to activity stream
      setActivities((prev) => [
        {
          id: String(Date.now()),
          user: 'You',
          avatar: 'YO',
          action: `plucked ${fretInfo.note}${fretInfo.octave} on String ${6 - stringIdx}`,
          time: 'Just now',
          avatarBg: 'bg-white',
          avatarColor: 'text-zinc-950',
        },
        ...prev.slice(0, 5),
      ]);
    } catch {
      // Audio engine fallback
    }
  };

  // Jam Bot Simulation Loop
  const botIntervalRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!isJamBotActive) {
      if (botIntervalRef.current) clearInterval(botIntervalRef.current);
      return;
    }

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
    botIntervalRef.current = setInterval(() => {
      const target = lickNotes[noteIdx % lickNotes.length];
      const str = TUNINGS.standard.strings[target.str];
      const fretInfo = getFretInfo(str.note, str.octave, target.fret);

      try {
        const audio = getAudioEngine();
        audio.playNote(fretInfo.frequency, 0.7);
      } catch {
        // Fallback
      }

      setActivities((prev) => [
        {
          id: String(Date.now()),
          user: 'Alex (Bot)',
          avatar: 'AL',
          action: `soloed ${target.note} in A Pentatonic`,
          time: 'Just now',
          avatarBg: 'bg-[#D4AD61]',
          avatarColor: 'text-zinc-950',
        },
        ...prev.slice(0, 5),
      ]);

      noteIdx++;
    }, 550);

    return () => {
      if (botIntervalRef.current) clearInterval(botIntervalRef.current);
    };
  }, [isJamBotActive]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0C0A09] via-[#110F0D] to-[#0C0A09] text-[#F5F5F4] flex flex-col font-sans selection:bg-[#E9D8B7] selection:text-[#171717]">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-10 space-y-8">
        
        {/* Navigation & Room Metadata Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-mono text-[#A8A29E] hover:text-white transition-colors"
              >
                <ArrowLeft size={13} />
                <span>Overview</span>
              </Link>
            </div>

            <BlurReveal
              as="h1"
              immediate
              className="text-3xl sm:text-4xl lg:text-[42px] text-display-h1 text-[#F5F5F4]"
            >
              Live Collaborative{' '}
              <span className="font-serif italic text-[#E9D8B7]">Jamroom</span>
            </BlurReveal>
            <p className="text-xs sm:text-sm text-[#A8A29E] mt-1.5 max-w-2xl leading-relaxed">
              Play together with synchronized audio streams, harmonic scale visualizers, and AI accompaniment.
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3.5 py-2 rounded-xl text-xs font-medium bg-[#1A1816] border border-white/10 hover:border-[#D4AD61]/50 text-[#F5F5F4] transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
            >
              {copied ? (
                <>
                  <Check size={14} weight="bold" className="text-emerald-400" />
                  <span className="text-emerald-400">Link Copied!</span>
                </>
              ) : (
                <>
                  <LinkSimple size={14} />
                  <span>Invite Link</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsJamBotActive(!isJamBotActive)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-md active:scale-95 border ${
                isJamBotActive
                  ? 'bg-emerald-500 text-zinc-950 border-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.35)]'
                  : 'bg-[#F5F5F4] text-[#171717] border-white/20 hover:bg-white'
              }`}
            >
              {isJamBotActive ? (
                <>
                  <Pause size={14} weight="fill" />
                  <span>Pause Jam Bot</span>
                </>
              ) : (
                <>
                  <Play size={14} weight="fill" className="text-emerald-600" />
                  <span>Play with Jam Bot (Alex)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Audio Engine Status Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-2xl bg-[#14111A] border border-white/[0.06] flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <Broadcast size={16} weight="fill" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#A8A29E] block">
                Audio Stream
              </span>
              <span className="text-xs font-semibold text-[#F5F5F4] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active (48 kHz)
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#14111A] border border-white/[0.06] flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#D4AD61]/10 text-[#D4AD61] border border-[#D4AD61]/20 flex items-center justify-center">
              <Waveform size={16} weight="fill" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#A8A29E] block">
                Local Latency
              </span>
              <span className="text-xs font-semibold text-[#F5F5F4]">
                12 ms (Ultra Low)
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#14111A] border border-white/[0.06] flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
              <Users size={16} weight="fill" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#A8A29E] block">
                In Session
              </span>
              <span className="text-xs font-semibold text-[#F5F5F4]">
                {isJamBotActive ? '2 Musicians' : '1 Musician'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#14111A] border border-white/[0.06] flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Sparkle size={16} weight="fill" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#A8A29E] block">
                Key / Scale
              </span>
              <span className="text-xs font-semibold text-[#F5F5F4]">
                A Pentatonic Minor
              </span>
            </div>
          </div>
        </div>

        {/* Synchronized Waveform Monitor */}
        <div className="rounded-3xl bg-[#14101A] border border-white/[0.08] p-5 relative overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between mb-3 text-xs font-mono text-[#A8A29E]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D4AD61] animate-ping" />
              <span className="uppercase tracking-wider font-semibold text-[#E9D8B7]">
                Live Web Audio Oscilloscope
              </span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-0.5 bg-[#D4AD61] inline-block" /> Host (You)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-0.5 bg-[#A8A29E] inline-block" /> Remote Peer / Bot
              </span>
            </div>
          </div>

          <div className="h-24 sm:h-28 w-full flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 1000 80" fill="none">
              {/* Host Waveform */}
              <path
                d={
                  activeNote || isJamBotActive
                    ? 'M 0 40 Q 125 10, 250 40 T 500 40 T 750 40 T 1000 40'
                    : 'M 0 40 Q 125 25, 250 40 T 500 40 T 750 40 T 1000 40'
                }
                stroke="#D4AD61"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="transition-all duration-300"
              />
              {/* Remote / Bot Waveform */}
              <path
                d={
                  isJamBotActive
                    ? 'M 0 40 Q 125 68, 250 40 T 500 40 T 750 40 T 1000 40'
                    : 'M 0 40 Q 125 50, 250 40 T 500 40 T 750 40 T 1000 40'
                }
                stroke="#A8A29E"
                strokeWidth="1.8"
                strokeLinecap="round"
                style={{ opacity: isJamBotActive ? 0.9 : 0.3 }}
                className="transition-all duration-300"
              />
            </svg>
          </div>
        </div>

        {/* Interactive Jam Console: Fretboard Pluck & Musician Roster */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left: Interactive Pluck Console (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="rounded-3xl bg-[#14111A] border border-white/[0.08] p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-[#F5F5F4]">
                    Interactive Jamming Board
                  </h3>
                  <p className="text-xs text-[#A8A29E]">
                    Tap any note to broadcast guitar tones into the synchronized audio room.
                  </p>
                </div>
                {activeNote && (
                  <span className="px-3 py-1 rounded-full bg-[#D4AD61] text-zinc-950 text-xs font-mono font-bold animate-pulse">
                    Plucked: {activeNote}
                  </span>
                )}
              </div>

              {/* Mobile Scroll Hint Affordance */}
              <div className="sm:hidden flex items-center justify-between text-[10px] font-mono text-[#A8A29E] px-1 mb-1 select-none">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AD61] animate-pulse" />
                  <span>Swipe to play frets 0–12</span>
                </span>
                <span className="text-zinc-500">Nut • Frets 1–12</span>
              </div>

              {/* Fretboard Strings Interaction Grid */}
              <div className="space-y-2.5 pt-1">
                {TUNINGS.standard.strings.map((str, strIdx) => (
                  <div key={strIdx} className="flex items-center gap-2">
                    <span className="w-8 text-[11px] font-mono text-[#D4AD61] font-semibold text-right shrink-0">
                      {str.note}{str.octave}
                    </span>
                    <div className="flex-1 flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 touch-pan-x no-scrollbar">
                      {[0, 1, 3, 5, 7, 8, 10, 12].map((fret) => {
                        const fretInfo = getFretInfo(str.note, str.octave, fret);
                        return (
                          <button
                            key={fret}
                            type="button"
                            onClick={() => playFretNote(strIdx, fret)}
                            className="flex-1 min-w-[36px] sm:min-w-[46px] h-9 rounded-xl bg-[#1C1824] hover:bg-[#D4AD61] hover:text-zinc-950 border border-white/5 hover:border-[#D4AD61] text-xs font-mono font-medium transition-all duration-150 flex flex-col items-center justify-center cursor-pointer active:scale-95 group"
                          >
                            <span className="text-[11px] group-hover:font-bold">{fretInfo.note}</span>
                            <span className="text-[8px] text-zinc-500 group-hover:text-zinc-950">F{fret}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-[#A8A29E] pt-3 border-t border-white/[0.06]">
                <span className="font-mono text-[11px] text-[#D4AD61]">
                  Tip: Frets 0, 3, 5, 7, 8, 10, 12 match standard A Minor Pentatonic
                </span>
                <span className="font-mono text-[11px]">Standard E-A-D-G-B-E</span>
              </div>
            </div>

            {/* Live Activity Stream */}
            <div className="rounded-3xl bg-[#14111A] border border-white/[0.08] p-5 sm:p-6 space-y-3">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#A8A29E] block">
                Session Activity Feed
              </span>

              <div className="space-y-2">
                {activities.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#1A1824] border border-white/5 text-xs font-mono"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span
                        className={`w-5 h-5 rounded-full ${act.avatarBg} ${act.avatarColor} font-bold text-[9px] flex items-center justify-center shrink-0`}
                      >
                        {act.avatar}
                      </span>
                      <span className="font-semibold text-[#F5F5F4]">{act.user}</span>
                      <span className="text-[#A8A29E] truncate">{act.action}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 shrink-0 ml-2">{act.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Connected Musicians (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-3xl bg-[#14111A] border border-white/[0.08] p-5 space-y-3">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#A8A29E] block">
                Musicians in Room
              </span>

              <div className="space-y-2.5">
                {musicians.map((m) => (
                  <div
                    key={m.id}
                    className={`p-3 rounded-2xl border transition-all ${
                      m.id === 'bot' && isJamBotActive
                        ? 'bg-[#D4AD61]/15 border-[#D4AD61] shadow-[0_0_12px_rgba(212,173,97,0.2)]'
                        : 'bg-[#1A1824] border-white/5'
                    } flex items-center justify-between`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full ${m.avatarBg} ${m.avatarColor} font-bold text-xs flex items-center justify-center shadow-sm`}
                      >
                        {m.avatar}
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-[#F5F5F4] block">{m.name}</span>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {m.id === 'bot' && isJamBotActive ? 'Soloing • In Sync' : m.status}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-[#D4AD61]">{m.latency}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Audio Settings Card */}
            <div className="rounded-3xl bg-[#14111A] border border-white/[0.08] p-5 space-y-3 text-xs">
              <span className="font-mono font-semibold uppercase tracking-wider text-[#A8A29E] block">
                Room Settings
              </span>
              <div className="space-y-2 text-[#A8A29E] font-mono text-[11px]">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span>Transport Protocol</span>
                  <span className="text-[#F5F5F4]">WebRTC / Opus</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span>Sample Rate</span>
                  <span className="text-[#F5F5F4]">48,000 Hz</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span>Audio Buffer</span>
                  <span className="text-[#F5F5F4]">128 Samples</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Signaling Server</span>
                  <span className="text-emerald-400">Ready</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
