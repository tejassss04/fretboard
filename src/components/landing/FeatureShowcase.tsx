'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, MusicNotes, Play } from '@phosphor-icons/react';
import BlurReveal from '@/components/ui/BlurReveal';
import {
  TUNINGS,
  SCALES,
  NOTES,
  FRET_MARKERS,
  DOUBLE_FRET_MARKERS,
  getFretInfo,
  NoteName
} from '@/lib/guitar';
import { getAudioEngine, GuitarTone } from '@/lib/audio';

const CUBIC_EASE = [0.22, 1, 0.36, 1] as const;

type FeatureTab = 'explore' | 'understand' | 'play';

interface ChordItem {
  id: string;
  name: string;
  frets: (number | 'x')[];
  tabString: string;
}

const COMMON_CHORDS: ChordItem[] = [
  { id: 'C', name: 'C Major', frets: [0, 1, 0, 2, 3, 'x'], tabString: 'x-3-2-0-1-0' },
  { id: 'G', name: 'G Major', frets: [3, 0, 0, 0, 2, 3], tabString: '3-2-0-0-0-3' },
  { id: 'D', name: 'D Major', frets: [2, 3, 2, 0, 'x', 'x'], tabString: 'x-x-0-2-3-2' },
  { id: 'Em', name: 'E Minor', frets: [0, 0, 0, 2, 2, 0], tabString: '0-2-2-0-0-0' },
  { id: 'Am', name: 'A Minor', frets: [0, 1, 2, 2, 0, 'x'], tabString: 'x-0-2-2-1-0' },
  { id: 'E', name: 'E Major', frets: [0, 0, 1, 2, 2, 0], tabString: '0-2-2-1-0-0' },
  { id: 'A', name: 'A Major', frets: [0, 2, 2, 2, 0, 'x'], tabString: 'x-0-2-2-2-0' },
  { id: 'F', name: 'F Major', frets: [1, 1, 2, 3, 'x', 'x'], tabString: 'x-x-3-2-1-1' },
];

export default function FeatureShowcase() {
  const [activeTab, setActiveTab] = useState<FeatureTab>('explore');

  // Explore Tab State
  const [exploreTuningKey, setExploreTuningKey] = useState<string>('standard');
  const [exploreFretCount, setExploreFretCount] = useState<number>(15);
  const [exploreActivePluck, setExploreActivePluck] = useState<string | null>(null);

  // Understand Tab State
  const [theoryKey, setTheoryKey] = useState<NoteName>('A');
  const [theoryScaleId, setTheoryScaleId] = useState<string>('minor-pentatonic');
  const [theoryDisplayMode, setTheoryDisplayMode] = useState<'notes' | 'intervals' | 'clean'>('notes');
  const [theoryActiveNote, setTheoryActiveNote] = useState<string | null>(null);

  // Play Tab State
  const [selectedTone, setSelectedTone] = useState<GuitarTone>('acoustic');
  const [activeChordPad, setActiveChordPad] = useState<string | null>(null);
  const [playStatusMessage, setPlayStatusMessage] = useState<string>('Tap any chord pad to strum');

  const currentTuning = TUNINGS[exploreTuningKey] || TUNINGS.standard;
  const currentScale = SCALES.find((s) => s.id === theoryScaleId) || SCALES[1];

  // Equal temperament fret spacing calculation
  const frets = useMemo(() => {
    const dN = 1 - Math.pow(2, -exploreFretCount / 12);
    const result = [];
    for (let n = 1; n <= exploreFretCount; n++) {
      const dPrev = 1 - Math.pow(2, -(n - 1) / 12);
      const dCurr = 1 - Math.pow(2, -n / 12);
      const leftPercent = (dPrev / dN) * 100;
      const widthPercent = ((dCurr - dPrev) / dN) * 100;
      const centerPercent = ((dPrev + dCurr) / (2 * dN)) * 100;
      result.push({
        fret: n,
        leftPercent,
        widthPercent,
        centerPercent,
        hasSingleMarker: FRET_MARKERS.includes(n),
        hasDoubleMarker: DOUBLE_FRET_MARKERS.includes(n),
      });
    }
    return result;
  }, [exploreFretCount]);

  const stringYPercentages = [13, 27.8, 42.6, 57.4, 72.2, 87];

  // Pluck audio handler
  const handlePluckNote = (stringIdx: number, fret: number, tuning = currentTuning) => {
    const str = tuning.strings[stringIdx];
    const fretInfo = getFretInfo(str.note, str.octave, fret);
    try {
      const audio = getAudioEngine();
      audio.playNote(fretInfo.frequency, 0.85);
    } catch {
      // Audio fallback
    }
    const key = `${stringIdx}-${fret}`;
    setExploreActivePluck(key);
    setTimeout(() => setExploreActivePluck(null), 500);
  };

  // Tone switch handler
  const handleSelectTone = (tone: GuitarTone) => {
    setSelectedTone(tone);
    try {
      const audio = getAudioEngine();
      audio.setTone(tone);
      // Play a gentle single test note
      audio.playNote(tone === 'acoustic' ? 146.83 : tone === 'electric' ? 196.0 : 110.0, 0.7);
    } catch {
      // Audio fallback
    }
  };

  // Strum chord handler
  const handleStrumChord = (chord: ChordItem) => {
    setActiveChordPad(chord.id);
    setPlayStatusMessage(`Strummed ${chord.name} (${chord.tabString}) with ${selectedTone} tone`);

    try {
      const audio = getAudioEngine();
      audio.setTone(selectedTone);
      const tuning = TUNINGS.standard;
      const reversedStrings = [...tuning.strings].reverse();
      const reversedFrets = [...chord.frets].reverse();

      reversedFrets.forEach((fret, i) => {
        if (fret === 'x') return;
        const str = reversedStrings[i];
        const fretNum = fret as number;
        const fretInfo = getFretInfo(str.note, str.octave, fretNum);

        setTimeout(() => {
          try {
            audio.playNote(fretInfo.frequency, 0.78);
          } catch {
            // Audio fallback
          }
        }, i * 35);
      });
    } catch {
      // Audio fallback
    }

    setTimeout(() => setActiveChordPad(null), 700);
  };

  return (
    <section id="features" className="relative w-full py-10 sm:py-14 lg:py-16 overflow-hidden scroll-mt-14">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">

        {/* Section Header */}
        <div className="max-w-3xl mb-8 sm:mb-10">
          <BlurReveal
            as="h2"
            delay={0.08}
            className="text-3xl sm:text-4xl lg:text-5xl font-normal text-[#171717] dark:text-[#F5F5F4] tracking-[-0.03em] leading-[1.14] mb-4 text-balance"
          >
            Everything you need to{' '}
            <span className="font-serif italic text-[1.1em] text-[#38211F] dark:text-[#E9D8B7]">
              explore your guitar.
            </span>
          </BlurReveal>

          <BlurReveal
            as="p"
            delay={0.14}
            className="text-base sm:text-lg text-[#77746F] dark:text-[#A8A29E] font-normal leading-[1.65]"
          >
            From discovering notes and understanding scales to experimenting with tones and chords. Explore your instrument in a completely different way.
          </BlurReveal>
        </div>

        {/* Feature Experience Segmented Tabs */}
        <div className="flex items-center gap-1 sm:gap-2 mb-8 bg-[#F1F0ED] dark:bg-[#171412] p-1 sm:p-1.5 rounded-2xl w-full max-w-md border border-[#EAE8E4] dark:border-white/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1px_3px_rgba(0,0,0,0.45)]">
          {[
            { id: 'explore', label: '01 / Explore', subtitle: 'Anatomy' },
            { id: 'understand', label: '02 / Understand', subtitle: 'Theory' },
            { id: 'play', label: '03 / Play', subtitle: 'Tones & Chords' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as FeatureTab)}
                className={`relative flex-1 py-2 sm:py-2.5 px-1.5 sm:px-3 rounded-xl text-[11px] sm:text-xs font-semibold tracking-tight transition-colors duration-200 cursor-pointer flex flex-col items-center justify-center whitespace-nowrap ${isActive
                    ? 'text-[#171717] dark:text-[#F5F5F4]'
                    : 'text-[#77746F] dark:text-[#A8A29E] hover:text-[#171717] dark:hover:text-[#F5F5F4]'
                  }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeFeatureTab"
                    className="absolute inset-0 bg-white dark:bg-[#282420] rounded-xl shadow-xs border border-black/5 dark:border-white/10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Unified Interactive Feature Container */}
        <div className="rounded-3xl bg-white/80 dark:bg-[#15111B]/75 backdrop-blur-md border border-[#EAE8E4]/50 dark:border-white/[0.04] hover:border-[#D4AD61]/25 dark:hover:border-[#D4AD61]/25 p-4 sm:p-8 lg:p-10 shadow-[0_20px_50px_rgba(23,23,23,0.04)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.35)] hover:shadow-[0_16px_36px_rgba(212,173,97,0.04)] dark:hover:shadow-[0_0_16px_rgba(212,173,97,0.06),0_25px_60px_rgba(0,0,0,0.35)] transition-all duration-300 min-h-[460px] flex flex-col justify-between overflow-hidden">

          <AnimatePresence mode="wait">

            {/* ======================================================== */}
            {/* EXPERIENCE A: EXPLORE (Anatomy & Tunings) */}
            {/* ======================================================== */}
            {activeTab === 'explore' && (
              <motion.div
                key="explore"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: CUBIC_EASE }}
                className="flex flex-col gap-6"
              >
                {/* Title & Controls Bar */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#EAE8E4] dark:border-white/10">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-[#171717] dark:text-[#F5F5F4] tracking-tight leading-[1.2]">
                      Every note has a place.
                    </h3>
                    <p className="text-xs sm:text-sm text-[#77746F] dark:text-[#A8A29E] mt-1">
                      Explore your guitar visually. Experiment with different tunings, fret positions and note locations.
                    </p>
                  </div>

                  {/* Tunings & Fret Count Selector */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-mono text-[#77746F] dark:text-[#A8A29E] mr-0.5">Tuning:</span>
                      {Object.values(TUNINGS).map((tuning) => (
                        <button
                          key={tuning.id}
                          onClick={() => setExploreTuningKey(tuning.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${exploreTuningKey === tuning.id
                              ? 'bg-[#171717] dark:bg-[#F5F5F4] text-white dark:text-[#171717] shadow-xs'
                              : 'bg-[#F7F6F3] dark:bg-[#201D1A] text-[#77746F] dark:text-[#A8A29E] hover:text-[#171717]'
                            }`}
                        >
                          {tuning.name.split(' (')[0]}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-1 bg-[#F7F6F3] dark:bg-[#201D1A] p-0.5 rounded-lg border border-[#EAE8E4] dark:border-white/10 w-fit">
                      {[12, 15, 21, 24].map((count) => (
                        <button
                          key={count}
                          onClick={() => setExploreFretCount(count)}
                          className={`px-2 py-0.5 text-xs font-mono font-medium rounded transition-all cursor-pointer ${exploreFretCount === count
                              ? 'bg-[#D4AD61] text-zinc-950 font-bold shadow-xs'
                              : 'text-[#77746F] dark:text-[#A8A29E]'
                            }`}
                        >
                          {count}F
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Large Fretboard Visualizer */}
                <div className="relative w-full rounded-2xl bg-[#201513] p-2.5 sm:p-5 shadow-inner border border-[#38211F]/40 select-none overflow-hidden group">
                  {/* Edge gradient cues */}
                  <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 sm:w-10 bg-gradient-to-r from-[#201513] to-transparent z-30 opacity-70" />
                  <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 sm:w-10 bg-gradient-to-l from-[#201513] to-transparent z-30 opacity-70" />

                  <div className="overflow-x-auto no-scrollbar touch-pan-x scroll-smooth">
                    <div className="min-w-[720px] relative">

                    {/* Fret Numbers Header */}
                    <div className="relative h-5 mb-1.5 text-[10px] font-mono text-zinc-400">
                      <div className="absolute left-0 w-[42px] text-center font-bold text-zinc-500 uppercase text-[9px]">
                        Nut
                      </div>
                      <div className="absolute left-[42px] right-0 h-full">
                        {frets.map(({ fret, centerPercent, hasSingleMarker, hasDoubleMarker }) => (
                          <div
                            key={fret}
                            style={{ left: `${centerPercent}%` }}
                            className={`absolute top-0 -translate-x-1/2 text-center ${hasDoubleMarker
                                ? 'text-[#D4AD61] font-bold'
                                : hasSingleMarker
                                  ? 'text-zinc-200 font-semibold'
                                  : 'text-zinc-500'
                              }`}
                          >
                            {fret}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Fretboard Surface */}
                    <div className="relative h-[210px] rounded-xl fretboard-wood border-t-2 border-b-2 border-[#E8DFD3] dark:border-[#52453F] shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)]">
                      {/* Bone Nut */}
                      <div className="absolute left-0 top-0 bottom-0 w-[42px] bg-gradient-to-r from-[#EDE6D8] via-[#F4EFE6] to-[#DDD4C1] dark:from-[#3D332A] dark:via-[#4F443A] dark:to-[#332A22] border-r-2 border-black z-20 shadow-md" />

                      {/* Frets & Inlay Markers */}
                      <div className="absolute left-[42px] right-0 top-0 bottom-0 pointer-events-none z-10">
                        {frets.map(({ fret, leftPercent, widthPercent, centerPercent, hasSingleMarker, hasDoubleMarker }) => (
                          <React.Fragment key={fret}>
                            <div
                              style={{ left: `${leftPercent + widthPercent}%` }}
                              className="absolute top-0 bottom-0 w-[2px] -translate-x-1/2 bg-gradient-to-b from-[#B8B8B4] via-[#D8D8D4] to-[#989894]"
                            />
                            {hasSingleMarker && (
                              <div
                                style={{ left: `${centerPercent}%`, top: '50%' }}
                                className="absolute -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-linear-to-br from-[#FAF9F5] via-[#E4E0D5] to-[#BDB7A6] border border-[#A8A190]/60 opacity-85"
                              />
                            )}
                            {hasDoubleMarker && (
                              <div
                                style={{ left: `${centerPercent}%` }}
                                className="absolute top-0 bottom-0 -translate-x-1/2 flex flex-col justify-around py-8 items-center"
                              >
                                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[#FAF9F5] via-[#E4E0D5] to-[#BDB7A6] opacity-90" />
                                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[#FAF9F5] via-[#E4E0D5] to-[#BDB7A6] opacity-90" />
                              </div>
                            )}
                          </React.Fragment>
                        ))}
                      </div>

                      {/* 6 Physical Strings */}
                      <div className="absolute left-0 right-0 top-0 bottom-0 pointer-events-none z-15">
                        {currentTuning.strings.map((str, stringIdx) => {
                          const yPercent = stringYPercentages[stringIdx];
                          const isBassWound = stringIdx >= 3;
                          return (
                            <div
                              key={stringIdx}
                              style={{ top: `${yPercent}%` }}
                              className="absolute left-0 right-0 -translate-y-1/2"
                            >
                              <div
                                style={{
                                  height: `${str.gauge * 1.05}px`,
                                  background: isBassWound
                                    ? 'linear-gradient(180deg, #E2B565 0%, #B8852B 50%, #825B16 100%)'
                                    : 'linear-gradient(180deg, #F0F4F8 0%, #C4CCD6 50%, #8A94A0 100%)',
                                }}
                                className="w-full relative shadow-sm"
                              />
                            </div>
                          );
                        })}
                      </div>

                      {/* Clickable Notes */}
                      <div className="absolute inset-0 z-30">
                        {/* Open Strings at Nut */}
                        <div className="absolute left-0 top-0 bottom-0 w-[42px] flex flex-col justify-between py-1">
                          {currentTuning.strings.map((str, stringIdx) => {
                            const yPercent = stringYPercentages[stringIdx];
                            const openInfo = getFretInfo(str.note, str.octave, 0);
                            const isCurrent = exploreActivePluck === `${stringIdx}-0`;

                            return (
                              <div
                                key={`open-${stringIdx}`}
                                style={{ top: `${yPercent}%` }}
                                className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
                              >
                                <button
                                  type="button"
                                  onClick={() => handlePluckNote(stringIdx, 0)}
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold tracking-tight transition-all cursor-pointer ${isCurrent
                                      ? 'bg-[#D4AD61] text-zinc-950 scale-110 shadow-lg ring-2 ring-white'
                                      : 'bg-black/25 hover:bg-black/40 text-zinc-300'
                                    }`}
                                >
                                  {openInfo.note}
                                </button>
                              </div>
                            );
                          })}
                        </div>

                        {/* Frets 1..N */}
                        <div className="absolute left-[42px] right-0 top-0 bottom-0">
                          {frets.map(({ fret, centerPercent }) => (
                            <React.Fragment key={fret}>
                              {currentTuning.strings.map((str, stringIdx) => {
                                const yPercent = stringYPercentages[stringIdx];
                                const fretInfo = getFretInfo(str.note, str.octave, fret);
                                const isCurrent = exploreActivePluck === `${stringIdx}-${fret}`;

                                return (
                                  <div
                                    key={`note-${stringIdx}-${fret}`}
                                    style={{ left: `${centerPercent}%`, top: `${yPercent}%` }}
                                    className="absolute -translate-x-1/2 -translate-y-1/2"
                                  >
                                    <button
                                      type="button"
                                      onClick={() => handlePluckNote(stringIdx, fret)}
                                      className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[9px] transition-all cursor-pointer ${isCurrent
                                          ? 'bg-[#D4AD61] text-zinc-950 font-bold scale-125 shadow-[0_0_12px_rgba(212,173,97,0.9)] z-40 ring-1 ring-white'
                                          : 'opacity-0 hover:opacity-100 bg-white/90 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                                        }`}
                                      title={`Fret ${fret}, String ${stringIdx + 1}: ${fretInfo.note}${fretInfo.octave}`}
                                    >
                                      {fretInfo.note}
                                    </button>
                                  </div>
                                );
                              })}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#77746F] dark:text-[#A8A29E] font-mono">
                  <span className="inline-flex items-center gap-1.5">
                    <Lightbulb size={13} weight="regular" className="text-[#D4AD61] shrink-0" />
                    <span>Click any note or open string to pluck it in native 48 kHz Web Audio.</span>
                  </span>
                  <span className="hidden sm:inline">Active Tuning: {currentTuning.name}</span>
                </div>
              </motion.div>
            )}

            {/* ======================================================== */}
            {/* EXPERIENCE B: UNDERSTAND (Theory & Scales) */}
            {/* ======================================================== */}
            {activeTab === 'understand' && (
              <motion.div
                key="understand"
                id="theory"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: CUBIC_EASE }}
                className="flex flex-col gap-6 scroll-mt-24"
              >
                {/* Title & Controls */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#EAE8E4] dark:border-white/10">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-[#171717] dark:text-[#F5F5F4] tracking-tight leading-[1.2]">
                      See the music behind the notes.
                    </h3>
                    <p className="text-xs sm:text-sm text-[#77746F] dark:text-[#A8A29E] mt-1">
                      Explore scales, intervals and musical relationships across the fretboard.
                    </p>
                  </div>

                  {/* Scale & Display Selectors */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Key Dropdown */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono text-[#77746F] dark:text-[#A8A29E]">Key:</span>
                      <select
                        value={theoryKey}
                        onChange={(e) => setTheoryKey(e.target.value as NoteName)}
                        className="text-xs font-semibold text-[#171717] dark:text-[#F5F5F4] bg-[#F7F6F3] dark:bg-[#201D1A] border border-[#EAE8E4] dark:border-white/10 rounded-lg px-2.5 py-1 outline-none shadow-xs cursor-pointer"
                      >
                        {NOTES.map((n) => (
                          <option key={n} value={n} className="dark:bg-[#151311]">{n} Root</option>
                        ))}
                      </select>
                    </div>

                    {/* Scale Dropdown */}
                    <select
                      value={theoryScaleId}
                      onChange={(e) => setTheoryScaleId(e.target.value)}
                      className="text-xs font-medium text-[#171717] dark:text-[#F5F5F4] bg-[#F7F6F3] dark:bg-[#201D1A] border border-[#EAE8E4] dark:border-white/10 rounded-lg px-3 py-1 outline-none shadow-xs cursor-pointer"
                    >
                      {SCALES.filter(s => s.id !== 'none').map((s) => (
                        <option key={s.id} value={s.id} className="dark:bg-[#151311]">{s.name}</option>
                      ))}
                    </select>

                    {/* Display Mode Pills */}
                    <div className="flex items-center bg-[#F7F6F3] dark:bg-[#201D1A] p-0.5 rounded-lg border border-[#EAE8E4] dark:border-white/10">
                      {(['notes', 'intervals', 'clean'] as const).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setTheoryDisplayMode(mode)}
                          className={`px-2.5 py-0.5 text-xs font-medium rounded capitalize transition-all cursor-pointer ${theoryDisplayMode === mode
                              ? 'bg-[#171717] dark:bg-[#F5F5F4] text-white dark:text-[#171717] shadow-xs'
                              : 'text-[#77746F] dark:text-[#A8A29E]'
                            }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Scale Formula Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-[#F7F6F3] dark:bg-[#1E1B18] border border-[#EAE8E4] dark:border-white/10 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#171717] dark:text-[#F5F5F4]">
                      {theoryKey} {currentScale.name}
                    </span>
                    <span className="text-[#77746F] dark:text-[#A8A29E]">•</span>
                    <span className="text-[#D4AD61] font-mono font-semibold">
                      Gold dots highlight Root ({theoryKey})
                    </span>
                  </div>
                  <div className="font-mono text-[#77746F] dark:text-[#A8A29E]">
                    {theoryDisplayMode === 'intervals' ? 'Showing Interval Formulas (R, ♭3, 4, 5, ♭7)' : 'Showing Chromatic Spellings'}
                  </div>
                </div>

                {/* 12-Fret Theory Visualization */}
                <div className="relative w-full rounded-2xl bg-[#201513] p-2.5 sm:p-5 shadow-inner border border-[#38211F]/30 select-none overflow-hidden group">
                  {/* Edge gradient cues */}
                  <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 sm:w-10 bg-gradient-to-r from-[#201513] to-transparent z-30 opacity-70" />
                  <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 sm:w-10 bg-gradient-to-l from-[#201513] to-transparent z-30 opacity-70" />

                  <div className="overflow-x-auto no-scrollbar touch-pan-x scroll-smooth">
                    <div className="min-w-[700px]">
                    <div className="grid grid-cols-13 text-center text-[10px] font-mono text-zinc-400 mb-2">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((fret) => (
                        <div key={fret} className={fret === 12 ? 'text-[#D4AD61] font-bold' : ''}>
                          {fret === 0 ? 'Nut' : fret}
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col gap-1.5 fretboard-wood p-3 rounded-xl border border-[#38211F]">
                      {TUNINGS.standard.strings.map((str, stringIdx) => (
                        <div key={stringIdx} className="relative h-7 flex items-center">
                          <div className="absolute inset-x-0 h-[1.5px] bg-[#9A9895] opacity-50 z-0 pointer-events-none" />

                          <div className="grid grid-cols-13 w-full z-10">
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((fret) => {
                              const fretInfo = getFretInfo(str.note, str.octave, fret, theoryKey);
                              const isRoot = fretInfo.interval === 0;
                              const isScaleNote =
                                currentScale.intervals.length > 0 &&
                                fretInfo.interval !== null &&
                                currentScale.intervals.includes(fretInfo.interval);

                              const keyStr = `${stringIdx}-${fret}`;
                              const isClicked = theoryActiveNote === keyStr;

                              return (
                                <div key={fret} className="flex items-center justify-center">
                                  {isScaleNote ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        try {
                                          getAudioEngine().playNote(fretInfo.frequency, 0.85);
                                        } catch { }
                                        setTheoryActiveNote(keyStr);
                                        setTimeout(() => setTheoryActiveNote(null), 500);
                                      }}
                                      className={`rounded-full flex items-center justify-center font-mono font-semibold transition-all cursor-pointer ${theoryDisplayMode === 'clean'
                                          ? isRoot
                                            ? 'w-3 h-3 bg-[#D4AD61] shadow-[0_0_8px_rgba(212,173,97,0.8)]'
                                            : 'w-2 h-2 bg-white/70'
                                          : isRoot
                                            ? 'w-6 h-6 bg-[#D4AD61] text-zinc-950 text-[10px] font-bold shadow-[0_0_10px_rgba(212,173,97,0.8)] ring-1 ring-white/70'
                                            : 'w-5 h-5 bg-white/90 dark:bg-zinc-800 text-[#171717] dark:text-[#F5F5F4] text-[9px] border border-black/10 dark:border-white/10'
                                        } ${isClicked ? 'scale-125 ring-2 ring-white z-20' : 'hover:scale-115'}`}
                                      title={`String ${stringIdx + 1}, Fret ${fret}: ${fretInfo.note} (${fretInfo.intervalName || 'R'})`}
                                    >
                                      {theoryDisplayMode !== 'clean' && (
                                        theoryDisplayMode === 'intervals' ? (fretInfo.intervalName || 'R') : fretInfo.note
                                      )}
                                    </button>
                                  ) : (
                                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-700/30" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                </div>

                <div className="text-xs text-[#77746F] dark:text-[#A8A29E] font-mono">
                  Scale notes transpose dynamically across all 12 root keys without breaking interval geometry.
                </div>
              </motion.div>
            )}

            {/* ======================================================== */}
            {/* EXPERIENCE C: PLAY (Tones & Chord Pads) */}
            {/* ======================================================== */}
            {activeTab === 'play' && (
              <motion.div
                key="play"
                id="sound"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: CUBIC_EASE }}
                className="flex flex-col gap-6 scroll-mt-24"
              >
                {/* Title & Controls */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#EAE8E4] dark:border-white/10">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-[#171717] dark:text-[#F5F5F4] tracking-tight leading-[1.2]">
                      Find your sound.
                    </h3>
                    <p className="text-xs sm:text-sm text-[#77746F] dark:text-[#A8A29E] mt-1">
                      Experiment with different guitar tones and bring chord shapes to life with realistic 35ms pick strumming.
                    </p>
                  </div>

                  {/* 3 Tone Presets Pill Selector */}
                  <div className="flex flex-wrap items-center gap-1.5 bg-[#F7F6F3] dark:bg-[#1E1B18] p-1 rounded-xl border border-[#EAE8E4] dark:border-white/10 w-fit max-w-full">
                    {[
                      { id: 'acoustic', label: 'Acoustic Steel', badge: 'Dreadnought' },
                      { id: 'electric', label: 'Electric Clean', badge: 'Single-Coil' },
                      { id: 'nylon', label: 'Mellow Nylon', badge: 'Classical' },
                    ].map((tone) => (
                      <button
                        key={tone.id}
                        type="button"
                        onClick={() => handleSelectTone(tone.id as GuitarTone)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${selectedTone === tone.id
                            ? 'bg-[#171717] dark:bg-[#F5F5F4] text-white dark:text-[#171717] shadow-xs'
                            : 'text-[#77746F] dark:text-[#A8A29E] hover:text-[#171717]'
                          }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${selectedTone === tone.id ? 'bg-[#D4AD61]' : 'bg-transparent'}`} />
                        <span>{tone.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feedback Ticker */}
                <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-[#F7F6F3] dark:bg-[#1E1B18] border border-[#EAE8E4] dark:border-white/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)] text-xs font-mono text-[#77746F] dark:text-[#A8A29E]">
                  <div className="flex items-center gap-2">
                    <MusicNotes size={14} weight="regular" className="text-[#D4AD61] shrink-0" />
                    <span>{playStatusMessage}</span>
                  </div>
                  <span className="text-[11px] text-[#D4AD61]">Active Engine: {selectedTone.toUpperCase()}</span>
                </div>

                {/* 8 Common Quick-Strum Chord Pads */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                  {COMMON_CHORDS.map((chord) => {
                    const isStrumming = activeChordPad === chord.id;
                    return (
                      <motion.button
                        key={chord.id}
                        type="button"
                        onClick={() => handleStrumChord(chord)}
                        whileHover={{ y: -3 }}
                        whileTap={{ scale: 0.94 }}
                        className={`group relative flex flex-col items-center justify-between p-3.5 rounded-2xl border text-center transition-all duration-200 cursor-pointer shadow-xs ${isStrumming
                            ? 'bg-[#E9D8B7]/30 dark:bg-[#D4AD61]/25 border-[#D4AD61] shadow-md ring-2 ring-[#D4AD61]/60'
                            : 'bg-[#F7F6F3] dark:bg-[#1C1A17] hover:bg-white dark:hover:bg-[#24201D] border-[#EAE8E4] dark:border-white/10 hover:border-[#D4AD61]/50'
                          }`}
                      >
                        <span className="text-[10px] font-mono uppercase text-[#77746F] dark:text-[#A8A29E] mb-1">
                          Chord
                        </span>
                        <span className={`text-base font-bold transition-colors mb-1 ${isStrumming ? 'text-[#D4AD61]' : 'text-[#171717] dark:text-[#F5F5F4] group-hover:text-[#D4AD61]'
                          }`}>
                          {chord.name.split(' ')[0]}
                        </span>
                        <span className="text-[9px] font-mono text-[#77746F] dark:text-[#A8A29E] bg-white dark:bg-[#141210] px-1.5 py-0.5 rounded border border-[#EAE8E4] dark:border-white/5">
                          {chord.tabString}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#77746F] dark:text-[#A8A29E] font-mono pt-2">
                  <span className="inline-flex items-center gap-1.5">
                    <Play size={12} weight="regular" className="text-[#D4AD61] shrink-0" />
                    <span>Click any chord pad to strum with 35ms authentic downstroke delay.</span>
                  </span>
                  <span>Pure 48 kHz Web Audio • No Autoplay</span>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

        </div>

      </div>
    </section>
  );
}
