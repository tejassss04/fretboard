'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  LinkSimple,
  Check,
  Play,
  Pause,
  LockSimple,
  Sparkle,
  Users,
} from '@phosphor-icons/react';

interface ActivityItem {
  id: string;
  user: string;
  avatar: string;
  action: string;
  time: string;
  avatarBg?: string;
  avatarColor?: string;
}

const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    user: 'You',
    avatar: 'YO',
    action: 'connected to room #JAM-8402',
    time: 'Just now',
    avatarBg: 'bg-[#171717] dark:bg-white',
    avatarColor: 'text-white dark:text-[#171717]',
  },
];

export default function MacBookShowcase() {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const activeTargetRef = useRef<{ key: string; xPct: number; yPct: number }>({
    key: 'entrance',
    xPct: 0.75,
    yPct: 0.88,
  });

  // Cursor & Accuracy State
  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: 450, y: 350 });
  const [activeTargetKey, setActiveTargetKey] = useState<string>('entrance');
  const [isClicking, setIsClicking] = useState<boolean>(false);
  const [tooltip, setTooltip] = useState<string | null>(null);
  const [showInvitePopover, setShowInvitePopover] = useState<boolean>(false);

  // In-Screen Jamroom State
  const [copiedLink, setCopiedLink] = useState<boolean>(shouldReduceMotion ? true : false);
  const [isJamBotActive, setIsJamBotActive] = useState<boolean>(shouldReduceMotion ? true : false);
  const [sarahInRoom, setSarahInRoom] = useState<boolean>(shouldReduceMotion ? true : false);
  const [waveformActive, setWaveformActive] = useState<boolean>(shouldReduceMotion ? true : false);
  const [highlightAll, setHighlightAll] = useState<boolean>(shouldReduceMotion ? true : false);
  const [activities, setActivities] = useState<ActivityItem[]>(
    shouldReduceMotion
      ? [
          {
            id: 'act-5',
            user: 'Alex',
            avatar: 'AL',
            action: 'plucked E4 in Pentatonic Box 1',
            time: 'Just now',
            avatarBg: 'bg-[#D4AD61]',
            avatarColor: 'text-zinc-950',
          },
          {
            id: 'act-4',
            user: 'Sarah',
            avatar: 'SR',
            action: 'strummed A Minor',
            time: '3s ago',
            avatarBg: 'bg-[#A5AC94]',
            avatarColor: 'text-white',
          },
          {
            id: 'act-1',
            user: 'You',
            avatar: 'YO',
            action: 'connected to room #JAM-8402',
            time: '1m ago',
            avatarBg: 'bg-[#171717] dark:bg-white',
            avatarColor: 'text-white dark:text-[#171717]',
          },
        ]
      : INITIAL_ACTIVITIES
  );

  // Exact Coordinate Resolver (Measures actual DOM bounding boxes)
  const moveToTarget = useCallback(
    (targetKey: string, xPct = 0.5, yPct = 0.5, tipLabel?: string | null) => {
      activeTargetRef.current = { key: targetKey, xPct, yPct };
      setActiveTargetKey(targetKey);
      if (tipLabel !== undefined) setTooltip(tipLabel);

      if (!containerRef.current) return;
      const c = containerRef.current.getBoundingClientRect();

      if (targetKey === 'entrance') {
        setCoords({ x: c.width * 0.82, y: c.height * 0.9 });
        return;
      }
      if (targetKey === 'exit') {
        setCoords({ x: c.width * 0.88, y: c.height * 0.94 });
        return;
      }

      const el = containerRef.current.querySelector<HTMLElement>(`[data-target="${targetKey}"]`);
      if (!el) return;

      const r = el.getBoundingClientRect();
      // Calculate exact pixel position relative to container
      const targetX = r.left - c.left + r.width * xPct;
      const targetY = r.top - c.top + r.height * yPct;

      setCoords({ x: targetX, y: targetY });
    },
    []
  );

  // Re-measure on window resize to ensure permanent micro-precision
  useEffect(() => {
    const handleResize = () => {
      if (activeTargetRef.current) {
        moveToTarget(
          activeTargetRef.current.key,
          activeTargetRef.current.xPct,
          activeTargetRef.current.yPct
        );
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [moveToTarget]);

  // Guided Cursor Choreography Script
  useEffect(() => {
    if (shouldReduceMotion) return;

    let isMounted = true;
    const timeouts: NodeJS.Timeout[] = [];

    const schedule = (fn: () => void, ms: number) => {
      const t = setTimeout(() => {
        if (isMounted) fn();
      }, ms);
      timeouts.push(t);
      return t;
    };

    const runLoop = () => {
      // ------------------------------------------------------------------
      // ACT 1: JOIN (0ms - 1800ms) - Quick entrance & room identification
      // ------------------------------------------------------------------
      setCopiedLink(false);
      setIsJamBotActive(false);
      setSarahInRoom(false);
      setWaveformActive(false);
      setHighlightAll(false);
      setShowInvitePopover(false);
      setActivities(INITIAL_ACTIVITIES);

      // Start cursor at entrance
      moveToTarget('entrance', 0.82, 0.9, null);

      schedule(() => {
        // Swift glide to Room Header
        moveToTarget('room-header', 0.5, 0.5, 'Entering Jam Room Alpha...');
      }, 350);

      // ------------------------------------------------------------------
      // ACT 2: INVITE (1800ms - 4600ms) - Rapid move, click & Sarah joins
      // ------------------------------------------------------------------
      schedule(() => {
        moveToTarget('btn-invite', 0.5, 0.5, 'Invite musicians to collaborate');
      }, 1800);

      // Crisp click down
      schedule(() => {
        setIsClicking(true);
      }, 2500);

      // Click release & copy feedback
      schedule(() => {
        setIsClicking(false);
        setCopiedLink(true);
        setShowInvitePopover(true);
      }, 2680);

      // Sarah joins the room promptly
      schedule(() => {
        setShowInvitePopover(false);
        setSarahInRoom(true);
        setActivities((prev) => [
          {
            id: `act-sarah-${Date.now()}`,
            user: 'Sarah',
            avatar: 'SR',
            action: 'connected via invite link',
            time: 'Just now',
            avatarBg: 'bg-[#A5AC94]',
            avatarColor: 'text-white',
          },
          ...prev.slice(0, 3),
        ]);
      }, 3500);

      // ------------------------------------------------------------------
      // ACT 3: JAM BOT (4600ms - 7400ms) - Swift move to Jam Bot & activate
      // ------------------------------------------------------------------
      schedule(() => {
        moveToTarget('btn-jambot', 0.5, 0.5, 'Activate Jam Bot (Alex) accompaniment');
      }, 4600);

      // Click down
      schedule(() => {
        setIsClicking(true);
      }, 5300);

      // Click release & activation
      schedule(() => {
        setIsClicking(false);
        setIsJamBotActive(true);
        setActivities((prev) => [
          {
            id: `act-bot-${Date.now()}`,
            user: 'Alex (Bot)',
            avatar: 'AL',
            action: 'loaded A Pentatonic solo engine',
            time: 'Just now',
            avatarBg: 'bg-[#D4AD61]',
            avatarColor: 'text-zinc-950',
          },
          ...prev.slice(0, 3),
        ]);
      }, 5480);

      // ------------------------------------------------------------------
      // ACT 4: COLLABORATE (7400ms - 10500ms) - Swift move to Waveform
      // ------------------------------------------------------------------
      schedule(() => {
        moveToTarget('waveform', 0.5, 0.48, 'Low-latency synchronized Web Audio streams');
        setWaveformActive(true);
      }, 7400);

      schedule(() => {
        setActivities((prev) => [
          {
            id: `act-note-1-${Date.now()}`,
            user: 'Sarah',
            avatar: 'SR',
            action: 'strummed A Minor',
            time: 'Just now',
            avatarBg: 'bg-[#A5AC94]',
            avatarColor: 'text-white',
          },
          ...prev.slice(0, 3),
        ]);
      }, 8200);

      schedule(() => {
        setActivities((prev) => [
          {
            id: `act-note-2-${Date.now()}`,
            user: 'Alex',
            avatar: 'AL',
            action: 'plucked E4 in Pentatonic Box 1',
            time: 'Just now',
            avatarBg: 'bg-[#D4AD61]',
            avatarColor: 'text-zinc-950',
          },
          ...prev.slice(0, 3),
        ]);
      }, 9200);

      // ------------------------------------------------------------------
      // ACT 5: TOGETHER (10500ms - 13200ms) - Harmony highlight
      // ------------------------------------------------------------------
      schedule(() => {
        moveToTarget('musicians-panel', 0.35, 0.45, 'All musicians in sync • Locked in');
        setHighlightAll(true);
      }, 10500);

      // ------------------------------------------------------------------
      // RESET LOOP (13200ms - 14500ms) - Swift exit and repeat
      // ------------------------------------------------------------------
      schedule(() => {
        moveToTarget('exit', 0.88, 0.94, null);
      }, 13200);

      schedule(() => {
        runLoop();
      }, 14500);
    };

    // Small delay for DOM layout and fonts to settle before first measurement
    const initTimer = setTimeout(runLoop, 200);

    return () => {
      isMounted = false;
      clearTimeout(initTimer);
      timeouts.forEach(clearTimeout);
    };
  }, [moveToTarget, shouldReduceMotion]);

  // Waveform SVG Paths for Act 4 & 5
  const hostWaveform = waveformActive
    ? 'M 0 30 Q 100 10, 200 30 T 400 30 T 600 30 T 800 30'
    : 'M 0 30 Q 100 20, 200 30 T 400 30 T 600 30 T 800 30';

  const remoteWaveform = waveformActive
    ? 'M 0 30 Q 100 50, 200 30 T 400 30 T 600 30 T 800 30'
    : 'M 0 30 Q 100 40, 200 30 T 400 30 T 600 30 T 800 30';

  return (
    <div
      aria-label="Animated demonstration showing how Fretboard Jamroom works"
      className="relative w-full flex flex-col items-center justify-center select-none"
    >
      {/* ==================================================================== */}
      {/* MACBOOK HARDWARE ENCLOSURE (CSS-ONLY REALISTIC MODEL)                 */}
      {/* ==================================================================== */}
      <div
        className="w-full max-w-[1040px] mx-auto relative perspective-[1400px] transition-transform duration-500 ease-out"
        style={{
          perspective: '1400px',
        }}
      >
        {/* Ambient Display Glow behind the MacBook */}
        <div className="absolute -inset-4 sm:-inset-8 bg-gradient-to-b from-[#D4AD61]/10 via-[#F59E0B]/5 to-transparent rounded-[40px] blur-2xl -z-10 pointer-events-none" />

        {/* MacBook Display Lid (Tilted subtly for realistic depth) */}
        <div
          className="relative rounded-[22px] sm:rounded-[30px] p-[6px] sm:p-[10px] bg-gradient-to-b from-[#383340] via-[#221E29] to-[#15121B] border border-white/15 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),0_12px_24px_-10px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.25)] transition-all duration-300"
          style={{
            transform: 'rotateX(2.2deg) rotateY(-0.5deg)',
            transformOrigin: 'bottom center',
          }}
        >
          {/* Inner Matte Bezel */}
          <div className="relative rounded-[16px] sm:rounded-[22px] bg-[#09080C] p-2 sm:p-3 overflow-hidden ring-1 ring-black">
            
            {/* Camera / iSight Sensor Housing */}
            <div className="hidden sm:flex items-center justify-center pb-2 relative z-20">
              <div className="w-2.5 h-2.5 rounded-full bg-[#050407] ring-1 ring-white/10 flex items-center justify-center shadow-inner">
                <div className="w-1 h-1 rounded-full bg-[#18152B] ring-0.5 ring-emerald-500/30" />
              </div>
            </div>

            {/* Glass Glare / Screen Sheen Overlay */}
            <div className="pointer-events-none absolute inset-0 z-30 bg-gradient-to-tr from-transparent via-white/[0.015] to-white/[0.04]" />

            {/* ============================================================== */}
            {/* DISPLAY SCREEN CONTENT: FRETBOARD JAMROOM INSIDE BROWSER        */}
            {/* ============================================================== */}
            <div
              ref={containerRef}
              className="relative w-full rounded-[10px] sm:rounded-[14px] bg-[#0E0B14] border border-white/[0.08] shadow-[inset_0_2px_8px_rgba(0,0,0,0.7)] overflow-hidden text-left"
            >
              {/* Browser Window Chrome / Navigation Bar */}
              <div className="w-full bg-[#14101A] border-b border-white/[0.07] px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-3">
                
                {/* macOS Window Controls (Red, Yellow, Green) */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] border border-black/20" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] border border-black/20" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F] border border-black/20" />
                </div>

                {/* Browser URL Bar */}
                <div className="flex-1 max-w-[280px] sm:max-w-md mx-auto bg-[#0A080E] border border-white/[0.08] rounded-md px-2.5 py-1 flex items-center justify-center sm:justify-between text-[10px] sm:text-[11px] font-mono text-[#A8A29E] shadow-inner">
                  <div className="flex items-center gap-1.5 truncate">
                    <LockSimple size={11} weight="fill" className="text-emerald-400 shrink-0" />
                    <span className="text-[#E9D8B7] font-semibold">fretboard.app</span>
                    <span className="text-[#77746F]">/jam/JAM-8402</span>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[9px] text-emerald-400 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    18ms
                  </span>
                </div>

                {/* Right Status Pill */}
                <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-[#77746F]">
                  <Users size={12} weight="regular" className="text-[#D4AD61]" />
                  <span>3 in room</span>
                </div>
              </div>

              {/* Jamroom Application Canvas */}
              <div className="p-3.5 sm:p-6 lg:p-7 relative min-h-[460px] sm:min-h-[510px] flex flex-col justify-between">
                
                {/* 1. Top Room Header & Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-white/[0.08] relative">
                  
                  {/* Room Status & Identity */}
                  <div
                    data-target="room-header"
                    className="flex items-center gap-2.5 p-1 rounded-lg transition-colors duration-200"
                  >
                    <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <div className="flex items-center gap-2">
                      <span className="text-sm sm:text-base font-semibold text-[#F5F5F4] tracking-tight">
                        Jam Room Alpha
                      </span>
                      <span className="text-[10px] sm:text-xs font-mono text-[#A8A29E] bg-[#1A1816] px-2 py-0.5 rounded border border-white/10">
                        #JAM-8402
                      </span>
                    </div>
                  </div>

                  {/* Actions: Bot Toggle & Copy Link */}
                  <div className="flex items-center gap-2 relative">
                    
                    {/* Jam Bot Action Button */}
                    <div
                      data-target="btn-jambot"
                      className={`px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold transition-all duration-200 inline-flex items-center gap-1.5 whitespace-nowrap border cursor-default select-none ${
                        isClicking && activeTargetKey === 'btn-jambot'
                          ? 'scale-95 brightness-90'
                          : ''
                      } ${
                        isJamBotActive
                          ? 'bg-emerald-500 text-zinc-950 border-emerald-400 shadow-[0_0_14px_rgba(16,185,129,0.4)]'
                          : activeTargetKey === 'btn-jambot'
                          ? 'bg-white text-[#171717] border-white ring-2 ring-[#D4AD61]/40'
                          : 'bg-[#F5F5F4] text-[#171717] border-white/20'
                      }`}
                    >
                      {isJamBotActive ? (
                        <Pause size={12} weight="fill" className="shrink-0" />
                      ) : (
                        <Play size={12} weight="fill" className="text-emerald-600 shrink-0" />
                      )}
                      <span>{isJamBotActive ? 'Pause Jam Bot' : 'Play with Jam Bot (Alex)'}</span>
                    </div>

                    {/* Invite Link Action Button */}
                    <div
                      data-target="btn-invite"
                      className={`text-[11px] sm:text-xs font-medium px-3 py-1.5 rounded-xl transition-all duration-200 inline-flex items-center gap-1.5 whitespace-nowrap border cursor-default select-none ${
                        isClicking && activeTargetKey === 'btn-invite'
                          ? 'scale-95 brightness-90'
                          : ''
                      } ${
                        copiedLink
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                          : activeTargetKey === 'btn-invite'
                          ? 'bg-[#221F28] border-[#D4AD61]/60 text-[#F5F5F4] ring-2 ring-[#D4AD61]/30'
                          : 'bg-[#1A1816] border-white/10 text-[#A8A29E]'
                      }`}
                    >
                      {copiedLink ? (
                        <>
                          <Check size={12} weight="bold" className="text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <LinkSimple size={12} weight="regular" />
                          <span>Invite Link</span>
                        </>
                      )}
                    </div>

                    {/* Invite Link Popover Notification */}
                    <AnimatePresence>
                      {showInvitePopover && (
                        <motion.div
                          initial={{ opacity: 0, y: -6, scale: 0.94 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -4, scale: 0.94 }}
                          transition={{ duration: 0.2 }}
                          className="absolute -bottom-10 right-0 z-40 bg-[#1A1828] border border-emerald-500/50 text-emerald-300 text-[10px] sm:text-[11px] font-mono px-2.5 py-1 rounded-lg shadow-xl flex items-center gap-1.5 whitespace-nowrap backdrop-blur-md"
                        >
                          <Check size={12} weight="bold" className="text-emerald-400" />
                          <span>Invite link copied to clipboard!</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* 2. Collaborative Web Audio Streams Waveform Visualization */}
                <div
                  data-target="waveform"
                  className={`w-full h-20 sm:h-24 rounded-2xl bg-[#14101A] border transition-all duration-500 p-3 sm:p-4 mb-4 relative overflow-hidden flex items-center justify-center ${
                    waveformActive
                      ? 'border-[#D4AD61]/60 shadow-[0_0_24px_rgba(212,173,97,0.16),inset_0_2px_6px_rgba(0,0,0,0.6)]'
                      : 'border-white/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.45)]'
                  }`}
                >
                  {/* Ambient Label */}
                  <div className="absolute top-2 left-3 text-[9px] sm:text-[10px] font-mono text-[#A8A29E] uppercase tracking-wider flex items-center gap-1.5 z-10">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        waveformActive ? 'bg-[#D4AD61] animate-ping' : 'bg-[#D4AD61]'
                      }`}
                    />
                    <span>Synchronized Web Audio Streams (Local & Remote)</span>
                  </div>

                  {/* Dynamic SVG Waveform */}
                  <svg className="w-full h-12 sm:h-16" viewBox="0 0 800 60" fill="none">
                    {/* Waveform 1: Host (You - Golden Amber) */}
                    <motion.path
                      animate={{
                        d: waveformActive
                          ? [
                              'M 0 30 Q 100 8, 200 30 T 400 30 T 600 30 T 800 30',
                              'M 0 30 Q 100 50, 200 30 T 400 30 T 600 30 T 800 30',
                              'M 0 30 Q 100 8, 200 30 T 400 30 T 600 30 T 800 30',
                            ]
                          : hostWaveform,
                      }}
                      transition={{
                        repeat: waveformActive ? Infinity : 0,
                        duration: 1.8,
                        ease: 'easeInOut',
                      }}
                      stroke="#D4AD61"
                      strokeWidth={waveformActive ? '2.6' : '2'}
                      strokeLinecap="round"
                    />

                    {/* Waveform 2: Remote Peer (Alex / Sarah - Subtle Gray-Silver) */}
                    <motion.path
                      animate={{
                        d: waveformActive
                          ? [
                              'M 0 30 Q 100 52, 200 30 T 400 30 T 600 30 T 800 30',
                              'M 0 30 Q 100 12, 200 30 T 400 30 T 600 30 T 800 30',
                              'M 0 30 Q 100 52, 200 30 T 400 30 T 600 30 T 800 30',
                            ]
                          : remoteWaveform,
                      }}
                      transition={{
                        repeat: waveformActive ? Infinity : 0,
                        duration: 2.1,
                        ease: 'easeInOut',
                      }}
                      stroke="#A8A29E"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      style={{ opacity: isJamBotActive || sarahInRoom ? 0.85 : 0.3 }}
                    />
                  </svg>
                </div>

                {/* 3. Musicians & Live Activity Stream Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start flex-1">
                  
                  {/* Connected Musicians Column (5 cols) */}
                  <div data-target="musicians-panel" className="lg:col-span-5 flex flex-col gap-2">
                    <span className="text-[10px] sm:text-[11px] font-mono font-semibold uppercase tracking-wider text-[#A8A29E] mb-0.5">
                      Connected Musicians
                    </span>

                    {/* You (Host) */}
                    <div
                      className={`p-2.5 sm:p-3 rounded-2xl border transition-all duration-300 flex items-center justify-between ${
                        highlightAll
                          ? 'bg-[#201D1A] border-[#D4AD61] shadow-[0_0_14px_rgba(212,173,97,0.22)]'
                          : 'bg-[#1A1816] border-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-[#171717] font-bold text-[11px] sm:text-xs flex items-center justify-center shadow-sm">
                          YO
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-[#F5F5F4] block">You</span>
                          <span className="text-[9px] sm:text-[10px] text-emerald-400 font-mono">
                            Host • Plucking Active
                          </span>
                        </div>
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-mono text-zinc-400">48 kHz</span>
                    </div>

                    {/* Alex (Bot) */}
                    <div
                      className={`p-2.5 sm:p-3 rounded-2xl border transition-all duration-300 flex items-center justify-between ${
                        highlightAll || isJamBotActive
                          ? 'bg-[#D4AD61]/15 border-[#D4AD61] shadow-[0_0_14px_rgba(212,173,97,0.22)]'
                          : 'bg-[#1A1816] border-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#D4AD61] text-zinc-950 font-bold text-[11px] sm:text-xs flex items-center justify-center">
                          AL
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-[#F5F5F4] block">Alex (Bot)</span>
                          <span className="text-[9px] sm:text-[10px] text-[#D4AD61] font-mono">
                            {isJamBotActive ? 'Soloing • In Sync' : 'Jam Bot • Ready'}
                          </span>
                        </div>
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-mono text-[#D4AD61]">
                        {isJamBotActive ? 'Active' : 'Interactive'}
                      </span>
                    </div>

                    {/* Sarah */}
                    <div
                      className={`p-2.5 sm:p-3 rounded-2xl border transition-all duration-300 flex items-center justify-between ${
                        highlightAll || sarahInRoom
                          ? 'bg-[#1F1D20] border-[#A5AC94]/80 shadow-[0_0_14px_rgba(165,172,148,0.2)]'
                          : 'bg-[#1A1816]/60 border-white/5 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#A5AC94] text-white font-bold text-[11px] sm:text-xs flex items-center justify-center">
                          SR
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-[#F5F5F4] block">Sarah</span>
                          <span className="text-[9px] sm:text-[10px] text-zinc-400 font-mono">
                            {sarahInRoom ? 'Rhythm • In Room' : 'Invited • Waiting'}
                          </span>
                        </div>
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-mono text-zinc-400">
                        {sarahInRoom ? 'Listening' : 'Standby'}
                      </span>
                    </div>
                  </div>

                  {/* Real-Time Activity Stream Column (7 cols) */}
                  <div data-target="activity-stream" className="lg:col-span-7 flex flex-col gap-2">
                    <span className="text-[10px] sm:text-[11px] font-mono font-semibold uppercase tracking-wider text-[#A8A29E] mb-0.5">
                      Real-Time Activity Stream
                    </span>

                    <div className="space-y-1.5 sm:space-y-2">
                      <AnimatePresence initial={false}>
                        {activities.map((log) => (
                          <motion.div
                            key={log.id}
                            initial={{ opacity: 0, x: -8, y: -4 }}
                            animate={{ opacity: 1, x: 0, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-[#1A1816] border border-white/5 text-[11px] sm:text-xs font-mono"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span
                                className={`w-5 h-5 rounded-full ${
                                  log.avatarBg || 'bg-zinc-800'
                                } ${
                                  log.avatarColor || 'text-zinc-300'
                                } font-bold text-[9px] flex items-center justify-center shrink-0`}
                              >
                                {log.avatar}
                              </span>
                              <span className="font-semibold text-[#F5F5F4] shrink-0">{log.user}</span>
                              <span className="text-[#A8A29E] truncate">{log.action}</span>
                            </div>
                            <span className="text-[9px] sm:text-[10px] text-zinc-500 shrink-0 ml-2">
                              {log.time}
                            </span>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* 4. Bottom Understated Disclaimer Ribbon */}
                <div className="mt-4 pt-3.5 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-2 text-xs text-[#A8A29E]">
                  <span className="font-mono text-[10px] sm:text-[11px] inline-flex items-center gap-1.5">
                    <Sparkle size={12} weight="regular" className="text-[#D4AD61] shrink-0" />
                    <span>DEMO PREVIEW • Instant room link sharing with local browser-synthesized audio.</span>
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-mono text-[#D4AD61]">
                    Zero software installation required
                  </span>
                </div>
              </div>

              {/* ============================================================ */}
              {/* HIGH-PRECISION FAUX CURSOR STORYTELLER                        */}
              {/* Point of arrow is locked directly onto measured target pixels */}
              {/* ============================================================ */}
              {!shouldReduceMotion && (
                <motion.div
                  aria-hidden="true"
                  className="pointer-events-none absolute z-50 select-none"
                  animate={{
                    x: coords.x,
                    y: coords.y,
                    scale: isClicking ? 0.82 : 1,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 220,
                    damping: 24,
                    mass: 0.45,
                  }}
                  style={{
                    left: 0,
                    top: 0,
                    // Hotspot of the arrow tip is exactly at (0, 0)
                    transformOrigin: '0px 0px',
                  }}
                >
                  {/* Apple / macOS Precision Pointer Arrow */}
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.85)] filter"
                    style={{
                      display: 'block',
                      transform: 'translate(0px, 0px)',
                    }}
                  >
                    <path
                      d="M0.5 0.5L7.5 21.5L11.5 12.5L20.5 8.5L0.5 0.5Z"
                      fill="#120F17"
                      stroke="#F5F5F4"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                  </svg>

                  {/* Concentric Precision Click Ring Feedback (Originating from tip) */}
                  {isClicking && (
                    <motion.span
                      initial={{ scale: 0.2, opacity: 1 }}
                      animate={{ scale: 2.2, opacity: 0 }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      className="absolute -top-3.5 -left-3.5 w-7 h-7 rounded-full border-2 border-[#D4AD61] pointer-events-none"
                    />
                  )}

                  {/* Contextual Story Tooltip */}
                  <AnimatePresence>
                    {tooltip && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.94 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.94 }}
                        transition={{ duration: 0.18 }}
                        className="absolute left-6 top-3 px-2.5 py-1 rounded-full bg-[#181422]/95 border border-[#D4AD61]/60 text-[#F5F5F4] text-[10px] sm:text-[11px] font-mono whitespace-nowrap shadow-[0_8px_20px_rgba(0,0,0,0.7)] flex items-center gap-1.5 backdrop-blur-md z-50 pointer-events-none"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D4AD61] animate-ping" />
                        <span className="tracking-tight">{tooltip}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* MACBOOK HINGE & LOWER CHASSIS / KEYBOARD LIP                         */}
        {/* ==================================================================== */}
        <div className="relative w-full z-10 flex flex-col items-center">
          
          {/* Screen Hinge Recess Bar */}
          <div className="h-1.5 sm:h-2 w-[88%] bg-gradient-to-b from-[#131019] to-[#1E1A26] rounded-t-sm border-t border-black/80" />

          {/* Lower Aluminum Base Plate (Extends subtly wider than screen) */}
          <div className="w-[103%] -ml-[1.5%] h-3.5 sm:h-4.5 rounded-b-[16px] sm:rounded-b-[20px] bg-gradient-to-b from-[#342F3D] via-[#24202B] to-[#17141D] border-t border-white/25 shadow-[0_20px_45px_rgba(0,0,0,0.85),inset_0_-1px_2px_rgba(255,255,255,0.15)] relative">
            
            {/* Center Thumb Notch for Opening Lid */}
            <div className="w-14 sm:w-20 h-1 sm:h-1.5 rounded-b-[4px] bg-[#0E0C12] mx-auto border-t border-black/80 shadow-inner" />
          </div>

          {/* Ground Ambient Reflection & Soft Contact Shadow */}
          <div className="w-[90%] mx-auto h-3 bg-gradient-to-r from-transparent via-black/80 to-transparent blur-md -mt-1" />
        </div>
      </div>
    </div>
  );
}
