'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  motion, 
  AnimatePresence, 
  useInView, 
  useReducedMotion 
} from 'framer-motion';
import { 
  TUNINGS, 
  SCALES, 
  NOTES, 
  getFretInfo,
  NoteName 
} from '@/lib/guitar';
import { getAudioEngine, GuitarTone } from '@/lib/audio';
import {
  SpeakerHigh,
  SpeakerSlash,
  Sparkle,
  MusicNotes,
  Play,
  Pause,
  CaretDown,
  Waveform,
} from '@phosphor-icons/react';
import LivingFretboard2D, { 
  ActivePluck2D, 
  HoveredNoteInfo, 
  DisplayMode 
} from './LivingFretboard2D';

// Chords for demo and quick strum pads: Am -> C -> G -> Em -> D
const PREVIEW_CHORDS = [
  { id: 'Am', name: 'A Minor', formula: 'A · C · E', tab: 'x-0-2-2-1-0', frets: [0, 1, 2, 2, 0, 'x'] },
  { id: 'C', name: 'C Major', formula: 'C · E · G', tab: 'x-3-2-0-1-0', frets: [0, 1, 0, 2, 3, 'x'] },
  { id: 'G', name: 'G Major', formula: 'G · B · D', tab: '3-2-0-0-0-3', frets: [3, 0, 0, 0, 2, 3] },
  { id: 'Em', name: 'E Minor', formula: 'E · G · B', tab: '0-2-2-0-0-0', frets: [0, 0, 0, 2, 2, 0] },
  { id: 'D', name: 'D Major', formula: 'D · F# · A', tab: 'x-x-0-2-3-2', frets: [2, 3, 2, 0, 'x', 'x'] },
];

// Musical lick sequence: A Minor Pentatonic lick across the 2D neck
const LICK_SEQUENCE = [
  { stringIdx: 5, fret: 5, delay: 600, note: 'A2 (Root)' },
  { stringIdx: 4, fret: 7, delay: 520, note: 'E3 (5th)' },
  { stringIdx: 3, fret: 7, delay: 520, note: 'A3 (Root)' },
  { stringIdx: 2, fret: 5, delay: 520, note: 'C4 (♭3)' },
  { stringIdx: 2, fret: 7, delay: 520, note: 'D4 (4th)' },
  { stringIdx: 1, fret: 8, delay: 520, note: 'G4 (♭7)' },
  { stringIdx: 0, fret: 5, delay: 680, note: 'A4 (Root)' },
];

// Chord cycle during demo sequence
const CHORD_SEQUENCE = ['Am', 'C', 'G', 'Am'];

const TONE_PRESETS: { id: GuitarTone; label: string; desc: string }[] = [
  { id: 'acoustic', label: 'Acoustic Steel', desc: 'Dreadnought bronze' },
  { id: 'electric', label: 'Electric Clean', desc: 'Magnetic pickup sustain' },
  { id: 'nylon', label: 'Mellow Nylon', desc: 'Classical warm concert' },
];

const INTERVAL_SYMBOLS: Record<number, string> = {
  0: 'R',
  1: '♭2',
  2: '2',
  3: '♭3',
  4: '3',
  5: '4',
  6: '♭5',
  7: '5',
  8: '♭6',
  9: '6',
  10: '♭7',
  11: '7',
};

export default function GuitarPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { margin: '0px 0px -60px 0px' });
  const shouldReduceMotion = useReducedMotion();

  // Fretboard configuration states
  const [tuningKey, setTuningKey] = useState<string>('standard');
  const [selectedKey, setSelectedKey] = useState<NoteName>('A');
  const [selectedScaleId, setSelectedScaleId] = useState<string>('minor-pentatonic');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('notes');
  const [fretCount, setFretCount] = useState<number>(15);
  const [currentTone, setCurrentTone] = useState<GuitarTone>('acoustic');

  // Active musical playing states
  const [activePlucks, setActivePlucks] = useState<ActivePluck2D[]>([]);
  const [vibratingStrings, setVibratingStrings] = useState<Record<number, boolean>>({});
  const [activeChordPad, setActiveChordPad] = useState<string | null>(null);
  const [activeChordId, setActiveChordId] = useState<string>('Am');
  const [hoveredNote, setHoveredNote] = useState<HoveredNoteInfo | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);

  // Animation loop & tour controls (quiescent by default)
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);
  const [demoAudioEnabled, setDemoAudioEnabled] = useState<boolean>(false);
  const [demoStage, setDemoStage] = useState<'idle' | 'scale' | 'chords'>('idle');
  const [activityStatus, setActivityStatus] = useState<string>('Ready for interactive playback');

  const isUserInteractingRef = useRef<boolean>(false);
  const userInactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const loopTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pluckIdCounter = useRef<number>(0);

  const currentTuning = TUNINGS[tuningKey] || TUNINGS.standard;
  const currentScale = SCALES.find((s) => s.id === selectedScaleId) || SCALES[0];

  // Tone Switcher Handler
  const handleToneChange = (tone: GuitarTone) => {
    setCurrentTone(tone);
    try {
      getAudioEngine().setTone(tone);
    } catch {
      // Audio engine fallback
    }
  };

  // Toggle Master Mute
  const handleToggleMute = () => {
    try {
      const muted = getAudioEngine().toggleMute();
      setIsAudioMuted(muted);
    } catch {
      setIsAudioMuted((prev) => !prev);
    }
  };

  // Derive active chord fret coordinates for highlighting on fretboard
  const activeChordFrets = React.useMemo(() => {
    const chord = PREVIEW_CHORDS.find((c) => c.id === activeChordId);
    if (!chord) return [];
    return chord.frets
      .map((fret, stringIdx) => {
        if (fret === 'x') return null;
        return { stringIdx, fret: fret as number };
      })
      .filter((v): v is { stringIdx: number; fret: number } => v !== null);
  }, [activeChordId]);

  // Execute Note Pluck (Web Audio + Visual state + String vibration)
  const executeNotePluck = useCallback((
    stringIdx: number, 
    fret: number, 
    options: { isUserAction?: boolean; playAudio?: boolean; isChord?: boolean } = {}
  ) => {
    const { isUserAction = false, playAudio = false, isChord = false } = options;
    const stringConfig = currentTuning.strings[stringIdx];
    const fretInfo = getFretInfo(stringConfig.note, stringConfig.octave, fret, selectedKey);
    const isRoot = fretInfo.interval === 0;

    // 1. Web Audio Playback
    if (playAudio || (isUserAction && typeof window !== 'undefined')) {
      try {
        const audio = getAudioEngine();
        audio.playNote(fretInfo.frequency, isChord ? 0.72 : 0.85);
      } catch {
        // Audio fallback
      }
    }

    // 2. Trigger string physical vibration
    setVibratingStrings((prev) => ({ ...prev, [stringIdx]: true }));
    setTimeout(() => {
      setVibratingStrings((prev) => ({ ...prev, [stringIdx]: false }));
    }, 450);

    // 3. Add visual note pulse
    pluckIdCounter.current += 1;
    const newPluck: ActivePluck2D = {
      id: pluckIdCounter.current,
      stringIdx,
      fret,
      isRoot,
      frequency: fretInfo.frequency,
      timestamp: Date.now(),
    };

    setActivePlucks((prev) => [...prev.slice(-7), newPluck]);
    setTimeout(() => {
      setActivePlucks((prev) => prev.filter((p) => p.id !== newPluck.id));
    }, 600);
  }, [currentTuning, selectedKey]);

  // Execute Strummed Chord
  const executeStrumChord = useCallback((chordId: string, playAudio: boolean = false) => {
    const chord = PREVIEW_CHORDS.find((c) => c.id === chordId);
    if (!chord) return;

    setActiveChordId(chordId);
    setActiveChordPad(chordId);
    setTimeout(() => setActiveChordPad(null), 400);

    chord.frets.forEach((fret, stringIdx) => {
      if (fret === 'x') return;
      const delay = (5 - stringIdx) * 38; // Arpeggiated down-strum
      setTimeout(() => {
        executeNotePluck(stringIdx, fret as number, { playAudio, isChord: true });
      }, delay);
    });
  }, [executeNotePluck]);

  // User Interaction Handlers
  const handleUserClickNote = (stringIdx: number, fret: number) => {
    isUserInteractingRef.current = true;
    if (userInactivityTimerRef.current) clearTimeout(userInactivityTimerRef.current);
    userInactivityTimerRef.current = setTimeout(() => {
      isUserInteractingRef.current = false;
    }, 4000);

    executeNotePluck(stringIdx, fret, { isUserAction: true, playAudio: true });
  };

  const handleUserClickChord = (chordId: string) => {
    isUserInteractingRef.current = true;
    if (userInactivityTimerRef.current) clearTimeout(userInactivityTimerRef.current);
    userInactivityTimerRef.current = setTimeout(() => {
      isUserInteractingRef.current = false;
    }, 5000);

    executeStrumChord(chordId, true);
  };

  // Automated Tour Orchestration Loop (Runs only when explicitly activated)
  useEffect(() => {
    if (!isInView || shouldReduceMotion || !isDemoRunning) {
      return;
    }

    let isMounted = true;
    const currentLoopTimeout = loopTimeoutRef;
    const currentUserInactivityTimer = userInactivityTimerRef;

    const runSequence = async () => {
      if (!isMounted || !isDemoRunning) return;

      // Phase 1: Lick Demonstration
      setDemoStage('scale');
      setActivityStatus('Tour • A Minor Pentatonic solo phrase');

      for (let i = 0; i < LICK_SEQUENCE.length; i++) {
        if (!isMounted || !isDemoRunning) return;
        while (isUserInteractingRef.current && isMounted && isDemoRunning) {
          await new Promise((r) => setTimeout(r, 600));
        }

        const note = LICK_SEQUENCE[i];
        executeNotePluck(note.stringIdx, note.fret, { playAudio: demoAudioEnabled });
        await new Promise((r) => setTimeout(r, note.delay));
      }

      await new Promise((r) => setTimeout(r, 700));

      // Phase 2: Chord Progression Cycle
      if (!isMounted || !isDemoRunning) return;
      setDemoStage('chords');
      setActivityStatus('Tour • Harmonic progression arpeggiation');

      for (const chord of CHORD_SEQUENCE) {
        if (!isMounted || !isDemoRunning) return;
        while (isUserInteractingRef.current && isMounted && isDemoRunning) {
          await new Promise((r) => setTimeout(r, 600));
        }

        executeStrumChord(chord, demoAudioEnabled);
        await new Promise((r) => setTimeout(r, 1100));
      }

      // Settle and loop back cleanly
      if (!isMounted || !isDemoRunning) return;
      setDemoStage('idle');
      setActivePlucks([]);
      setActivityStatus('Tour • Seamless cycle settling');
      await new Promise((r) => setTimeout(r, 1000));

      if (isMounted && isDemoRunning) {
        runSequence();
      }
    };

    runSequence();

    return () => {
      isMounted = false;
      setDemoStage('idle');
      if (currentLoopTimeout.current) clearTimeout(currentLoopTimeout.current);
      if (currentUserInactivityTimer.current) clearTimeout(currentUserInactivityTimer.current);
    };
  }, [
    isInView, 
    shouldReduceMotion, 
    isDemoRunning, 
    demoAudioEnabled, 
    executeNotePluck, 
    executeStrumChord
  ]);

  return (
    <div
      ref={containerRef}
      className="w-full relative flex flex-col rounded-3xl bg-white/90 dark:bg-[#12100E]/90 backdrop-blur-md border border-[#EAE8E4] dark:border-white/10 p-4 sm:p-6 lg:p-7 shadow-[0_20px_50px_rgba(23,23,23,0.05),0_1px_2px_rgba(0,0,0,0.03)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.45)] transition-colors select-none"
    >
      {/* ======================================================== */}
      {/* 1. MASTER STUDIO CONSOLE (Top Control Bar)               */}
      {/* ======================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 mb-4 border-b border-[#EAE8E4] dark:border-white/10">
        
        {/* Left Wing: Instrument Tag, Timbre Presets & Tour Toggle */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Identity Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F7F6F3] dark:bg-[#1A1816] border border-[#EAE8E4] dark:border-white/10 text-[11px] font-mono font-medium text-[#77746F] dark:text-[#A8A29E] shadow-xs">
            <span className={`w-2 h-2 rounded-full ${isDemoRunning ? 'bg-[#D4AD61] animate-pulse' : 'bg-[#D4AD61]'}`} />
            <span className="font-semibold text-[#171717] dark:text-[#F5F5F4]">Rosewood Studio</span>
            <span className="text-zinc-400 dark:text-zinc-600">/</span>
            <span>6-String</span>
          </div>

          {/* 3-Way Timbre Preset Switcher */}
          <div className="inline-flex items-center bg-[#ECEBE7] dark:bg-[#1C1917] p-0.5 rounded-full border border-[#EAE8E4]/60 dark:border-white/5">
            {TONE_PRESETS.map((tone) => (
              <button
                key={tone.id}
                type="button"
                onClick={() => handleToneChange(tone.id)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-full transition-all cursor-pointer ${
                  currentTone === tone.id
                    ? 'bg-white dark:bg-[#2B2623] text-[#171717] dark:text-[#F5F5F4] shadow-xs font-semibold'
                    : 'text-[#77746F] dark:text-[#A8A29E] hover:text-[#171717] dark:hover:text-[#F5F5F4]'
                }`}
                title={tone.desc}
              >
                {tone.label}
              </button>
            ))}
          </div>

          {/* Master Audio Mute Toggle */}
          <button
            type="button"
            onClick={handleToggleMute}
            className={`p-1.5 rounded-full border transition-all cursor-pointer shadow-xs ${
              isAudioMuted
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                : 'bg-white dark:bg-[#1A1816] text-[#77746F] dark:text-[#A8A29E] hover:text-[#171717] dark:hover:text-[#F5F5F4] border-[#EAE8E4] dark:border-white/10'
            }`}
            title={isAudioMuted ? 'Unmute studio audio' : 'Mute studio audio'}
          >
            {isAudioMuted ? <SpeakerSlash size={14} /> : <SpeakerHigh size={14} />}
          </button>
        </div>

        {/* Right Wing: Tuning, Key, Scale, Display Mode, Frets & Tour Button */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tuning Picker */}
          <div className="relative inline-flex items-center">
            <select
              value={tuningKey}
              onChange={(e) => setTuningKey(e.target.value)}
              className="text-xs font-semibold appearance-none pr-6 pl-2.5 py-1.5 rounded-lg text-[#171717] dark:text-[#F5F5F4] bg-[#F7F6F3] dark:bg-[#1A1816] border border-[#EAE8E4] dark:border-white/10 hover:border-[#D4AD61]/50 outline-none shadow-xs cursor-pointer transition-colors"
              title="Tuning Preset"
            >
              {Object.entries(TUNINGS).map(([key, t]) => (
                <option key={key} value={key} className="dark:bg-[#151311]">
                  {t.name}
                </option>
              ))}
            </select>
            <CaretDown size={11} className="absolute right-2 pointer-events-none text-zinc-400" />
          </div>

          {/* Display Mode Slider */}
          <div className="flex items-center bg-[#ECEBE7] dark:bg-[#1C1917] p-0.5 rounded-lg border border-[#EAE8E4]/60 dark:border-white/5">
            {(['notes', 'intervals', 'clean'] as DisplayMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setDisplayMode(mode)}
                className={`px-2 py-1 text-[11px] font-medium rounded-md capitalize transition-all cursor-pointer ${
                  displayMode === mode
                    ? 'bg-white dark:bg-[#2B2623] text-[#171717] dark:text-[#F5F5F4] shadow-xs font-semibold'
                    : 'text-[#77746F] dark:text-[#A8A29E] hover:text-[#171717] dark:hover:text-[#F5F5F4]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Fret Count Segmented Selector */}
          <div className="flex items-center bg-[#ECEBE7] dark:bg-[#1C1917] p-0.5 rounded-lg border border-[#EAE8E4]/60 dark:border-white/5" title="Fretboard Length">
            {([12, 15, 21, 24] as const).map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setFretCount(count)}
                className={`px-2 py-1 text-[11px] font-mono font-medium rounded-md transition-all cursor-pointer ${
                  fretCount === count
                    ? 'bg-white dark:bg-[#2B2623] text-[#171717] dark:text-[#F5F5F4] shadow-xs font-semibold'
                    : 'text-[#77746F] dark:text-[#A8A29E] hover:text-[#171717] dark:hover:text-[#F5F5F4]'
                }`}
              >
                {count}F
              </button>
            ))}
          </div>

          {/* Tour / Demo Button */}
          {!isDemoRunning ? (
            <button
              type="button"
              onClick={() => setIsDemoRunning(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#171717] dark:bg-[#F5F5F4] hover:bg-[#2b2b2b] dark:hover:bg-white text-white dark:text-[#171717] text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
              title="Play guided lick & chord demonstration"
            >
              <Play size={11} weight="fill" className="text-[#D4AD61]" />
              <span>Tour</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-1 bg-[#D4AD61]/15 border border-[#D4AD61]/40 rounded-lg p-0.5">
              <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-mono text-[#D4AD61]">
                <span className="flex items-end gap-0.5 h-3 w-3">
                  <span className="w-0.5 bg-[#D4AD61] rounded-full h-3 animate-pulse" />
                  <span className="w-0.5 bg-[#D4AD61] rounded-full h-1.5 animate-pulse [animation-delay:0.15s]" />
                  <span className="w-0.5 bg-[#D4AD61] rounded-full h-2.5 animate-pulse [animation-delay:0.3s]" />
                </span>
                <span>{demoStage === 'scale' ? 'Scale Lick' : 'Chords'}</span>
              </div>

              <button
                type="button"
                onClick={() => setDemoAudioEnabled((p) => !p)}
                className={`p-1 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                  demoAudioEnabled ? 'bg-[#D4AD61] text-zinc-950 font-bold' : 'text-[#77746F]'
                }`}
                title="Sound during tour"
              >
                {demoAudioEnabled ? <SpeakerHigh size={12} /> : <SpeakerSlash size={12} />}
              </button>

              <button
                type="button"
                onClick={() => setIsDemoRunning(false)}
                className="px-2 py-1 text-[10px] font-mono text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
                title="Stop tour"
              >
                <Pause size={11} weight="fill" />
              </button>
            </div>
          )}
        </div>

      </div>

      {/* ======================================================== */}
      {/* 2. UNIFIED HARMONIC ENGINE VISOR                         */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-3 items-center">
        
        {/* Scale & Key Selectors in one cohesive module (8 cols) */}
        <div className="md:col-span-8 flex flex-wrap items-center gap-3 p-2.5 rounded-2xl bg-[#F7F6F3] dark:bg-[#1A1816] border border-[#EAE8E4] dark:border-white/10 shadow-xs">
          
          {/* Key Picker */}
          <div className="relative inline-flex items-center">
            <select
              value={selectedKey}
              onChange={(e) => setSelectedKey(e.target.value as NoteName)}
              className="text-xs font-bold appearance-none pr-5 pl-2.5 py-1 rounded-md text-[#171717] dark:text-[#F5F5F4] bg-white dark:bg-[#24201D] border border-[#EAE8E4] dark:border-white/10 hover:border-[#D4AD61]/50 outline-none shadow-xs cursor-pointer transition-colors"
            >
              {NOTES.map((n) => (
                <option key={n} value={n} className="dark:bg-[#151311]">{n} Root</option>
              ))}
            </select>
            <CaretDown size={10} className="absolute right-1.5 pointer-events-none text-zinc-400" />
          </div>

          {/* Scale Picker */}
          <div className="relative inline-flex items-center">
            <select
              value={selectedScaleId}
              onChange={(e) => setSelectedScaleId(e.target.value)}
              className="text-xs font-semibold appearance-none pr-6 pl-2.5 py-1 rounded-md text-[#171717] dark:text-[#F5F5F4] bg-white dark:bg-[#24201D] border border-[#EAE8E4] dark:border-white/10 hover:border-[#D4AD61]/50 outline-none shadow-xs cursor-pointer transition-colors"
            >
              {SCALES.map((s) => (
                <option key={s.id} value={s.id} className="dark:bg-[#151311]">{s.name}</option>
              ))}
            </select>
            <CaretDown size={10} className="absolute right-1.5 pointer-events-none text-zinc-400" />
          </div>

          <div className="h-4 w-[1px] bg-[#EAE8E4] dark:bg-white/10 hidden sm:block" />

          {/* Harmonic Formula Readout */}
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#77746F] dark:text-[#A8A29E]">
            <span className="text-[9px] uppercase tracking-wider text-[#A8A29E]">FORMULA:</span>
            <span className="font-semibold text-[#171717] dark:text-[#E8E6E3] flex items-center gap-1 flex-wrap">
              {currentScale.intervals.length > 0 ? (
                currentScale.intervals.map((iv, idx) => (
                  <React.Fragment key={iv}>
                    {idx > 0 && <span className="text-zinc-400 dark:text-zinc-600">·</span>}
                    <span className={iv === 0 ? 'text-[#D4AD61] font-bold' : ''}>
                      {INTERVAL_SYMBOLS[iv] || iv}
                    </span>
                  </React.Fragment>
                ))
              ) : (
                <span className="text-zinc-400 dark:text-zinc-500">Free Play</span>
              )}
            </span>
          </div>
        </div>

        {/* Active Harmony Pill Strip (4 cols) */}
        <div className="md:col-span-4 flex items-center justify-between md:justify-end gap-2 p-2.5 rounded-2xl bg-[#F7F6F3] dark:bg-[#1A1816] border border-[#EAE8E4] dark:border-white/10 shadow-xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#77746F] dark:text-[#A8A29E] shrink-0">
            Active:
          </span>
          <div className="flex items-center gap-1 overflow-x-auto">
            {PREVIEW_CHORDS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleUserClickChord(c.id)}
                className={`text-[10px] font-mono px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                  activeChordId === c.id
                    ? 'bg-[#D4AD61] text-zinc-950 font-bold shadow-xs'
                    : 'text-[#77746F] dark:text-[#A8A29E] hover:text-[#171717] dark:hover:text-white bg-white dark:bg-[#201D1A]'
                }`}
                title={`Voicing: ${c.name} (${c.tab})`}
              >
                {c.id}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 3. CENTERPIECE: LIVING 2D FRETBOARD                      */}
      {/* ======================================================== */}
      <div className="relative w-full rounded-2xl border border-[#38211F]/30 dark:border-white/10 bg-gradient-to-b from-[#2a1d1b]/20 via-transparent to-transparent dark:from-black/50 p-3 sm:p-4 overflow-x-auto no-scrollbar shadow-inner">
        <div className="min-w-[720px]">
          <LivingFretboard2D
            selectedKey={selectedKey}
            selectedScaleId={selectedScaleId}
            displayMode={displayMode}
            tuningKey={tuningKey}
            fretCount={fretCount}
            activePlucks={activePlucks}
            vibratingStrings={vibratingStrings}
            activeChordNotes={demoStage === 'chords' ? activeChordFrets : []}
            onNoteClick={handleUserClickNote}
            onHoverNote={setHoveredNote}
            hoveredNote={hoveredNote}
          />
        </div>

        {/* Tactile Watermark Badge */}
        <div className="absolute bottom-2 right-3 pointer-events-none inline-flex items-center gap-1.5 text-[10px] font-mono text-[#77746F] dark:text-[#A8A29E] bg-white/70 dark:bg-black/60 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-black/5 dark:border-white/5">
          <Sparkle size={10} weight="regular" className="text-[#D4AD61]" />
          <span>Interactive 2D Neck</span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. REAL-TIME INSPECTOR HUD / PITCH FEEDBACK              */}
      {/* ======================================================== */}
      <div className="h-7 mt-3 flex items-center justify-between text-xs px-2 font-mono">
        <AnimatePresence mode="wait">
          {hoveredNote ? (
            <motion.div
              key={`${hoveredNote.stringIdx}-${hoveredNote.fret}`}
              initial={{ opacity: 0, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -2 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2 text-xs"
            >
              <span className="w-5 h-5 rounded-full bg-[#D4AD61] text-zinc-950 font-bold flex items-center justify-center text-[10px]">
                {hoveredNote.note}
              </span>
              <span className="font-semibold text-[#171717] dark:text-[#F5F5F4]">
                {hoveredNote.intervalName === 'R' ? 'Root Degree' : `Interval ${hoveredNote.intervalName}`}
              </span>
              <span className="text-zinc-400 dark:text-zinc-600">•</span>
              <span className="text-[#77746F] dark:text-[#A8A29E]">
                String {hoveredNote.stringIdx + 1}, Fret {hoveredNote.fret}
              </span>
              <span className="text-zinc-400 dark:text-zinc-600">•</span>
              <span className="text-emerald-600 dark:text-emerald-400">
                {hoveredNote.frequency} Hz
              </span>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-xs text-[#77746F] dark:text-[#A8A29E]"
            >
              <Waveform size={14} weight="regular" className="text-[#D4AD61] shrink-0" />
              <span>{activityStatus}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <span className="text-[11px] hidden sm:inline text-[#77746F] dark:text-[#A8A29E]">
          Click any fret or open nut note • 48 kHz Native Audio
        </span>
      </div>

      {/* ======================================================== */}
      {/* 5. TACTILE CHORD STRUM PADS (Pedalboard / Strum Deck)    */}
      {/* ======================================================== */}
      <div className="mt-3 pt-4 border-t border-[#EAE8E4] dark:border-white/10 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#171717] dark:text-[#F5F5F4] uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <MusicNotes size={14} weight="regular" className="text-[#D4AD61]" />
            <span>Tactile Strumming Pads</span>
          </span>
          <span className="text-[11px] font-mono text-[#77746F] dark:text-[#A8A29E]">
            Arpeggiated pick action
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {PREVIEW_CHORDS.map((chord) => {
            const isActivePad = activeChordPad === chord.id;
            const isSelected = activeChordId === chord.id;

            return (
              <motion.button
                key={chord.id}
                type="button"
                onClick={() => handleUserClickChord(chord.id)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`p-3 rounded-2xl border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between relative overflow-hidden group shadow-xs ${
                  isSelected
                    ? 'bg-white dark:bg-[#1E1B18] border-[#D4AD61] shadow-[0_4px_16px_rgba(212,173,97,0.15)] ring-1 ring-[#D4AD61]/50'
                    : 'bg-[#F7F6F3] dark:bg-[#181614] border-[#EAE8E4] dark:border-white/10 hover:border-[#D4AD61]/40'
                }`}
              >
                {/* Active pick strum flash overlay */}
                {isActivePad && (
                  <motion.div
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 bg-[#D4AD61]/25 pointer-events-none"
                  />
                )}

                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-lg font-serif font-normal text-[#171717] dark:text-[#F5F5F4] group-hover:text-[#D4AD61] transition-colors">
                    {chord.id}
                  </span>
                  <span className="text-[10px] font-mono text-[#77746F] dark:text-[#A8A29E] bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded">
                    {chord.tab}
                  </span>
                </div>

                <div className="text-[11px] font-medium text-[#77746F] dark:text-[#A8A29E] truncate">
                  {chord.name}
                </div>

                <div className="text-[9px] font-mono text-zinc-400 dark:text-zinc-600 mt-1">
                  {chord.formula}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
