'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  SpeakerHigh,
  Sparkle,
  Info,
} from '@phosphor-icons/react';
import {
  PITCH_NAMES_SHARP,
  PITCH_NAMES_FLAT,
  CHORD_QUALITIES,
  COMMON_OPEN_SHAPES,
  calculateSoundingChord,
  calculateShapeToPlay,
  findBestCapoPositionsForTarget,
  getCapoChordFrequencies,
  OpenChordShape,
  parseChord,
} from '@/lib/capcalc';
import { guitarAudio } from '@/lib/audio';
import { chords as defaultChords } from '@/lib/data';
import type { Chord } from '@/lib/types';

// Preset shapes that guitarists use 90% of the time with a capo
const QUICK_SHAPES = [
  { label: 'C', shape: 'C', category: 'Major' },
  { label: 'G', shape: 'G', category: 'Major' },
  { label: 'D', shape: 'D', category: 'Major' },
  { label: 'A', shape: 'A', category: 'Major' },
  { label: 'E', shape: 'E', category: 'Major' },
  { label: 'Am', shape: 'Am', category: 'Minor' },
  { label: 'Em', shape: 'Em', category: 'Minor' },
  { label: 'Dm', shape: 'Dm', category: 'Minor' },
  { label: 'F', shape: 'F', category: 'Major' },
  { label: 'C7', shape: 'C7', category: '7th' },
  { label: 'G7', shape: 'G7', category: '7th' },
  { label: 'E7', shape: 'E7', category: '7th' },
];

// Fret marker positions on acoustic guitar (single at 3, 5, 7, 9, double at 12)
const FRET_MARKERS = [3, 5, 7, 9];

export default function CapCalc() {
  const shouldReduceMotion = useReducedMotion();

  // Mode: 'shape-to-chord' (Mode 1) vs 'chord-to-shape' (Mode 2)
  const [mode, setMode] = useState<'shape-to-chord' | 'chord-to-shape'>('shape-to-chord');

  // Capo position: 0 (No Capo / Open) to 12
  const [capoFret, setCapoFret] = useState<number>(2);

  // Enharmonic preference: sharp vs flat
  const [preferFlats, setPreferFlats] = useState<boolean>(false);

  // Mode 1 State: Input chord shape
  const [selectedShape, setSelectedShape] = useState<string>('C');

  // Mode 2 State: Input desired sounding chord
  const [targetSoundingChord, setTargetSoundingChord] = useState<string>('D');

  // Custom chord builder states
  const [customRoot, setCustomRoot] = useState<string>('C');
  const [customQuality, setCustomQuality] = useState<string>('');
  const [customBass, setCustomBass] = useState<string>('');
  const [isCustomChord, setIsCustomChord] = useState<boolean>(false);

  // Strumming state for audio feedback
  const [isStrumming, setIsStrumming] = useState<boolean>(false);

  // Tab view: 'calculator' vs 'matrix-cheat-sheet'
  const [viewTab, setViewTab] = useState<'calculator' | 'matrix'>('calculator');

  // Calculate results based on mode
  const mode1Result = useMemo(() => {
    return calculateSoundingChord(selectedShape, capoFret, preferFlats);
  }, [selectedShape, capoFret, preferFlats]);

  const mode2Result = useMemo(() => {
    return calculateShapeToPlay(targetSoundingChord, capoFret, preferFlats);
  }, [targetSoundingChord, capoFret, preferFlats]);

  // Mode 2: Find all capo positions where this target chord can be played with open shapes
  const bestCapoPositions = useMemo(() => {
    return findBestCapoPositionsForTarget(targetSoundingChord);
  }, [targetSoundingChord]);

  // Resolved chord shape for chord diagram rendering
  const displayedChordShape = useMemo<OpenChordShape | null>(() => {
    if (mode === 'shape-to-chord') {
      const parsed = parseChord(selectedShape);
      return (
        COMMON_OPEN_SHAPES.find(
          (s) => s.root === parsed.root && s.quality === parsed.quality
        ) || null
      );
    } else {
      return mode2Result.matchedOpenShape || null;
    }
  }, [mode, selectedShape, mode2Result]);

  // Strum audio handler
  const handleStrum = () => {
    setIsStrumming(true);
    let fingers: [number, number | 'x'][] = [[0, 'x'], [1, 3], [2, 2], [3, 0], [4, 1], [5, 0]];

    if (displayedChordShape) {
      fingers = displayedChordShape.fingers;
    } else {
      // Find fallback from default chords library
      const fallback = defaultChords.find(
        (c: Chord) =>
          c.short.toLowerCase() ===
          (mode === 'shape-to-chord' ? selectedShape : mode2Result.shapeChord).toLowerCase()
      );
      if (fallback) fingers = fallback.fingers;
    }

    const freqs = getCapoChordFrequencies(fingers, capoFret);
    guitarAudio.strum(freqs, 42);
    setTimeout(() => setIsStrumming(false), 700);
  };

  // Quick preset click in Mode 1
  const handleQuickShapeClick = (shapeStr: string) => {
    setSelectedShape(shapeStr);
    setIsCustomChord(false);
  };

  // Quick preset click in Mode 2
  const handleQuickTargetClick = (targetStr: string) => {
    setTargetSoundingChord(targetStr);
  };

  // Build custom chord
  const handleApplyCustomChord = (root: string, quality: string, bass: string) => {
    const chordStr = `${root}${quality}${bass ? `/${bass}` : ''}`;
    if (mode === 'shape-to-chord') {
      setSelectedShape(chordStr);
    } else {
      setTargetSoundingChord(chordStr);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 select-none">
      {/* ─── 1. Header Toolbar & Mode Switcher ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D4AD61] bg-[#D4AD61]/10 px-2 py-0.5 rounded border border-[#D4AD61]/25">
              Resources • Music Theory
            </span>
            <span className="text-[10px] font-mono text-[#77746F] dark:text-[#A8A29E]">
              Capo Transposition Engine
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-normal text-[#171717] dark:text-[#F5F5F4] tracking-[-0.025em] leading-[1.12]">
            CapCalc <span className="font-serif italic text-[#E9D8B7]">Capo Calculator</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#77746F] dark:text-[#A8A29E] mt-1 max-w-xl">
            Calculate actual sounding chords, transpose progressions, and discover open chord shapes across frets 1–12.
          </p>
        </div>

        {/* View Mode Toggle (Calculator vs Transposition Cheat Sheet) */}
        <div className="flex items-center gap-1 bg-[#F1F0ED] dark:bg-[#1A1816] p-1 rounded-2xl border border-[#EAE8E4] dark:border-white/10 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewTab('calculator')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
              viewTab === 'calculator'
                ? 'bg-white dark:bg-[#25221F] text-[#171717] dark:text-[#F5F5F4] shadow-xs'
                : 'text-[#77746F] dark:text-[#A8A29E] hover:text-[#171717] dark:hover:text-white'
            }`}
          >
            Calculator
          </button>
          <button
            type="button"
            onClick={() => setViewTab('matrix')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
              viewTab === 'matrix'
                ? 'bg-white dark:bg-[#25221F] text-[#171717] dark:text-[#F5F5F4] shadow-xs'
                : 'text-[#77746F] dark:text-[#A8A29E] hover:text-[#171717] dark:hover:text-white'
            }`}
          >
            Cheat Sheet
          </button>
        </div>
      </div>

      {viewTab === 'calculator' ? (
        <>
          {/* ─── 2. Interactive Capo Fretboard Neck Visualizer ─── */}
          <div className="relative rounded-3xl bg-[#140F0E] border border-[#3E2A27] p-4 sm:p-6 shadow-2xl overflow-hidden group">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D4AD61] shadow-[0_0_8px_rgba(212,173,97,0.7)]" />
                <span className="text-xs font-mono font-bold text-[#E8DFD3] uppercase tracking-wider">
                  Interactive Capo Clamp
                </span>
                <span className="text-[11px] font-mono text-[#D4AD61] bg-[#D4AD61]/15 px-2 py-0.5 rounded border border-[#D4AD61]/30">
                  {capoFret === 0 ? 'No Capo (Open Nut)' : `Capo Fret ${capoFret}`}
                </span>
              </div>

              {/* Enharmonic Selector (# vs b) */}
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <span className="text-[10px] uppercase text-[#A8A29E]">Spelling:</span>
                <button
                  type="button"
                  onClick={() => setPreferFlats(false)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                    !preferFlats
                      ? 'bg-[#D4AD61] text-zinc-950 shadow-xs'
                      : 'text-[#A8A29E] hover:text-white bg-white/5'
                  }`}
                  title="Spell chords with Sharps (C#, D#, F#, G#, A#)"
                >
                  ♯ Sharps
                </button>
                <button
                  type="button"
                  onClick={() => setPreferFlats(true)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                    preferFlats
                      ? 'bg-[#D4AD61] text-zinc-950 shadow-xs'
                      : 'text-[#A8A29E] hover:text-white bg-white/5'
                  }`}
                  title="Spell chords with Flats (Db, Eb, Gb, Ab, Bb)"
                >
                  ♭ Flats
                </button>
              </div>
            </div>

            {/* Fret Register Header */}
            <div className="grid grid-cols-13 gap-1 mb-2 text-center font-mono text-[10px] text-[#A8A29E]">
              <span className="font-bold text-zinc-500 uppercase text-[9px] pt-1">Open</span>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setCapoFret(f)}
                  className={`flex flex-col items-center cursor-pointer transition-colors ${
                    capoFret === f
                      ? 'text-[#D4AD61] font-bold scale-110'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <span>{f}</span>
                  {f === 12 && (
                    <span className="text-[8px] text-[#D4AD61]/80 font-serif italic">XII</span>
                  )}
                </button>
              ))}
            </div>

            {/* Bound Rosewood Neck with Metal Frets & Physical Capo */}
            <div className="relative fretboard-wood rounded-2xl border-y-2 border-[#52453F] py-3.5 px-1 shadow-[inset_0_2px_10px_rgba(0,0,0,0.7)] overflow-x-auto no-scrollbar touch-pan-x">
              <div className="min-w-[640px] relative">
                {/* 6 Horizontal Strings */}
                <div className="space-y-3 relative z-10">
                  {[
                    { note: 'e', gauge: 1.0, color: 'bg-[#F0F4F8]' },
                    { note: 'B', gauge: 1.3, color: 'bg-[#D9E1E8]' },
                    { note: 'G', gauge: 1.6, color: 'bg-[#C4CCD6]' },
                    { note: 'D', gauge: 2.1, color: 'bg-[#D4AD61]' },
                    { note: 'A', gauge: 2.6, color: 'bg-[#C59B3F]' },
                    { note: 'E', gauge: 3.2, color: 'bg-[#B8852B]' },
                  ].map((str, sIdx) => (
                    <div key={sIdx} className="relative h-6 flex items-center">
                      <div
                        className={`absolute inset-x-0 ${str.color} opacity-85 shadow-sm`}
                        style={{ height: `${str.gauge}px` }}
                      />
                    </div>
                  ))}
                </div>

                {/* 13 Fret Columns (Clickable to position Capo) */}
                <div className="absolute inset-0 grid grid-cols-13 gap-1 z-20">
                  {/* Fret 0 (Nut) */}
                  <div
                    onClick={() => setCapoFret(0)}
                    title="No Capo (Open Nut)"
                    className={`h-full border-r-4 border-[#1E1614] dark:border-black cursor-pointer transition-all flex items-center justify-center ${
                      capoFret === 0
                        ? 'bg-[#D4AD61]/25 ring-2 ring-[#D4AD61]'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <span className="text-[9px] font-mono text-zinc-400 rotate-90 uppercase">Nut</span>
                  </div>

                  {/* Frets 1..12 */}
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((fret) => {
                    const isCapoOnThisFret = capoFret === fret;
                    const hasSingleDot = FRET_MARKERS.includes(fret);
                    const hasDoubleDot = fret === 12;

                    return (
                      <div
                        key={fret}
                        onClick={() => setCapoFret(fret)}
                        title={`Place Capo on Fret ${fret}`}
                        className={`h-full relative border-r-2 border-[#8C7A6B]/50 cursor-pointer transition-all flex flex-col justify-between items-center py-1 group/fret ${
                          isCapoOnThisFret ? 'bg-[#D4AD61]/15' : 'hover:bg-white/5'
                        }`}
                      >
                        {/* Mother-of-pearl inlays */}
                        {hasSingleDot && (
                          <div className="w-2.5 h-2.5 rounded-full bg-white/20 group-hover/fret:bg-white/40 my-auto pointer-events-none" />
                        )}
                        {hasDoubleDot && (
                          <div className="flex gap-1 my-auto pointer-events-none">
                            <div className="w-2 h-2 rounded-full bg-white/25" />
                            <div className="w-2 h-2 rounded-full bg-white/25" />
                          </div>
                        )}

                        {/* Metallic Capo Clamp Bar */}
                        {isCapoOnThisFret && (
                          <motion.div
                            layoutId="capoClamp"
                            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                            className="absolute inset-y-0 w-3.5 bg-gradient-to-r from-[#201D1A] via-[#D4AD61] to-[#151210] rounded-xs shadow-[0_0_16px_rgba(212,173,97,0.8)] border border-[#FFE082] z-30 flex flex-col items-center justify-between py-1"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-950" />
                            <span className="text-[8px] font-mono font-bold text-zinc-950 uppercase rotate-90 leading-none">
                              Capo
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-950" />
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Capo Segmented Pills (Fast touch selector) */}
            <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-[#3E2A27] overflow-x-auto no-scrollbar touch-pan-x">
              <span className="text-[10px] font-mono uppercase text-[#A8A29E] mr-1 shrink-0">
                Fret:
              </span>
              <button
                type="button"
                onClick={() => setCapoFret(0)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer shrink-0 ${
                  capoFret === 0
                    ? 'bg-[#D4AD61] text-zinc-950 font-bold shadow-xs'
                    : 'bg-[#201513] text-[#A8A29E] hover:text-white border border-[#3E2A27]'
                }`}
              >
                None
              </button>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setCapoFret(f)}
                  className={`w-7 h-7 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                    capoFret === f
                      ? 'bg-[#D4AD61] text-zinc-950 font-bold shadow-xs'
                      : 'bg-[#201513] text-[#A8A29E] hover:text-white border border-[#3E2A27]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* ─── 3. Two-Mode Studio Console ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Calculation Inputs (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Mode Selector Tabs */}
              <div className="p-1 bg-[#F1F0ED] dark:bg-[#1A1816] rounded-2xl border border-[#EAE8E4] dark:border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => setMode('shape-to-chord')}
                  className={`p-3 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between ${
                    mode === 'shape-to-chord'
                      ? 'bg-white dark:bg-[#25221F] text-[#171717] dark:text-[#F5F5F4] shadow-xs ring-1 ring-[#D4AD61]/40'
                      : 'text-[#77746F] dark:text-[#A8A29E] hover:text-[#171717] dark:hover:text-white'
                  }`}
                >
                  <span className="text-xs font-bold font-mono tracking-tight flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#D4AD61]" />
                    Mode 1: I know my shape
                  </span>
                  <span className="text-[11px] opacity-75 mt-0.5">
                    Shape + Capo → Actual Sounding Chord
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('chord-to-shape')}
                  className={`p-3 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between ${
                    mode === 'chord-to-shape'
                      ? 'bg-white dark:bg-[#25221F] text-[#171717] dark:text-[#F5F5F4] shadow-xs ring-1 ring-[#D4AD61]/40'
                      : 'text-[#77746F] dark:text-[#A8A29E] hover:text-[#171717] dark:hover:text-white'
                  }`}
                >
                  <span className="text-xs font-bold font-mono tracking-tight flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Mode 2: I know the chord I want
                  </span>
                  <span className="text-[11px] opacity-75 mt-0.5">
                    Desired Chord + Capo → Shape to Play
                  </span>
                </button>
              </div>

              {/* Input Card Container */}
              <div className="bg-[#FCFBF9] dark:bg-[#12100E] border border-[#EAE8E4] dark:border-white/10 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
                {mode === 'shape-to-chord' ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#171717] dark:text-[#F5F5F4]">
                        Select Chord Shape Finger Position
                      </span>
                      <span className="text-[11px] font-mono text-[#D4AD61]">
                        Playing: {selectedShape} Shape
                      </span>
                    </div>

                    {/* Quick Shape Presets */}
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {QUICK_SHAPES.map((item) => {
                        const isSelected = selectedShape === item.shape && !isCustomChord;
                        return (
                          <button
                            key={item.shape}
                            type="button"
                            onClick={() => handleQuickShapeClick(item.shape)}
                            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#D4AD61] text-zinc-950 font-bold border-[#8C6B24] shadow-xs'
                                : 'bg-white dark:bg-[#1A1816] border-[#EAE8E4] dark:border-white/10 text-[#171717] dark:text-[#F5F5F4] hover:border-[#D4AD61]/50'
                            }`}
                          >
                            <div className="text-sm font-bold font-mono">{item.shape}</div>
                            <div className="text-[9px] opacity-60 uppercase">{item.category}</div>
                          </button>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#171717] dark:text-[#F5F5F4]">
                        Select Desired Sounding Chord
                      </span>
                      <span className="text-[11px] font-mono text-emerald-500 font-bold">
                        Target Sound: {targetSoundingChord}
                      </span>
                    </div>

                    {/* Common Target Presets */}
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {['D', 'E', 'F', 'G', 'A', 'B', 'Bb', 'Eb', 'Ab', 'Bm', 'F#m', 'C#m'].map(
                        (target) => {
                          const isSelected = targetSoundingChord === target;
                          return (
                            <button
                              key={target}
                              type="button"
                              onClick={() => handleQuickTargetClick(target)}
                              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-emerald-500 text-zinc-950 font-bold border-emerald-600 shadow-xs'
                                  : 'bg-white dark:bg-[#1A1816] border-[#EAE8E4] dark:border-white/10 text-[#171717] dark:text-[#F5F5F4] hover:border-emerald-500/50'
                              }`}
                            >
                              <div className="text-sm font-bold font-mono">{target}</div>
                            </button>
                          );
                        }
                      )}
                    </div>
                  </>
                )}

                {/* Custom Chord Builder Dropdowns */}
                <div className="pt-4 border-t border-[#EAE8E4] dark:border-white/10">
                  <span className="text-[11px] font-mono text-[#77746F] dark:text-[#A8A29E] block mb-2 font-medium">
                    Or compose any root, quality, or slash chord:
                  </span>
                  <div className="grid grid-cols-3 gap-2.5">
                    {/* Root Selector */}
                    <div>
                      <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
                        Root
                      </label>
                      <select
                        value={customRoot}
                        onChange={(e) => {
                          setCustomRoot(e.target.value);
                          setIsCustomChord(true);
                          handleApplyCustomChord(e.target.value, customQuality, customBass);
                        }}
                        className="w-full text-xs font-bold py-2 px-2.5 rounded-xl bg-white dark:bg-[#1A1816] border border-[#EAE8E4] dark:border-white/10 text-[#171717] dark:text-[#F5F5F4] focus:outline-none focus:border-[#D4AD61] cursor-pointer"
                      >
                        {(preferFlats ? PITCH_NAMES_FLAT : PITCH_NAMES_SHARP).map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quality Selector */}
                    <div>
                      <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
                        Quality
                      </label>
                      <select
                        value={customQuality}
                        onChange={(e) => {
                          setCustomQuality(e.target.value);
                          setIsCustomChord(true);
                          handleApplyCustomChord(customRoot, e.target.value, customBass);
                        }}
                        className="w-full text-xs font-bold py-2 px-2.5 rounded-xl bg-white dark:bg-[#1A1816] border border-[#EAE8E4] dark:border-white/10 text-[#171717] dark:text-[#F5F5F4] focus:outline-none focus:border-[#D4AD61] cursor-pointer"
                      >
                        {CHORD_QUALITIES.map((q) => (
                          <option key={q.id} value={q.symbol}>
                            {q.name} ({q.symbol || 'maj'})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Bass Note (Slash Chord) */}
                    <div>
                      <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
                        Bass (Slash)
                      </label>
                      <select
                        value={customBass}
                        onChange={(e) => {
                          setCustomBass(e.target.value);
                          setIsCustomChord(true);
                          handleApplyCustomChord(customRoot, customQuality, e.target.value);
                        }}
                        className="w-full text-xs font-bold py-2 px-2.5 rounded-xl bg-white dark:bg-[#1A1816] border border-[#EAE8E4] dark:border-white/10 text-[#171717] dark:text-[#F5F5F4] focus:outline-none focus:border-[#D4AD61] cursor-pointer"
                      >
                        <option value="">None (Standard)</option>
                        {(preferFlats ? PITCH_NAMES_FLAT : PITCH_NAMES_SHARP).map((p) => (
                          <option key={p} value={p}>
                            /{p}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mode 2: Open Chord Recommendation Helper */}
              {mode === 'chord-to-shape' && bestCapoPositions.length > 0 && (
                <div className="bg-[#F5EEDF]/40 dark:bg-[#1C1814] border border-[#E9D8B7] dark:border-white/10 rounded-3xl p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkle size={16} weight="regular" className="text-[#D4AD61]" />
                    <span className="text-xs font-mono font-bold text-[#171717] dark:text-[#F5F5F4] uppercase tracking-wider">
                      Best Open Shape Capo Positions for {targetSoundingChord}
                    </span>
                  </div>
                  <p className="text-xs text-[#77746F] dark:text-[#A8A29E] leading-relaxed">
                    Guitarists use capos to avoid barres. Here are frets where you can play familiar open shapes to sound {targetSoundingChord}:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                    {bestCapoPositions.slice(0, 4).map((pos) => (
                      <button
                        key={pos.capoFret}
                        type="button"
                        onClick={() => setCapoFret(pos.capoFret)}
                        className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          capoFret === pos.capoFret
                            ? 'bg-[#D4AD61] text-zinc-950 border-[#8C6B24] font-bold shadow-xs'
                            : 'bg-white dark:bg-[#201D1A] border-[#EAE8E4] dark:border-white/10 text-[#171717] dark:text-[#F5F5F4] hover:border-[#D4AD61]/50'
                        }`}
                      >
                        <span className="text-xs font-mono font-bold">Capo {pos.capoFret}</span>
                        <span className="text-[11px] opacity-75">Play {pos.shape.name} shape</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Live Result HUD & Diagram Card (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#FCFBF9] dark:bg-[#12100E] border border-[#EAE8E4] dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-[#EAE8E4] dark:border-white/10 pb-4">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#77746F] dark:text-[#A8A29E] font-bold">
                    {mode === 'shape-to-chord' ? 'Actual Sounding Chord' : 'Recommended Shape to Play'}
                  </span>
                  <button
                    type="button"
                    onClick={handleStrum}
                    disabled={isStrumming}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all active:scale-95 ${
                      isStrumming
                        ? 'bg-[#D4AD61] text-zinc-950'
                        : 'bg-[#171717] dark:bg-[#F5F5F4] text-white dark:text-[#171717] hover:bg-[#2e2e2e]'
                    }`}
                  >
                    <SpeakerHigh size={13} weight="regular" className={isStrumming ? 'animate-bounce' : ''} />
                    <span>{isStrumming ? 'Strumming...' : 'Strum'}</span>
                  </button>
                </div>

                {/* Big Editorial Transposition Display */}
                <div className="flex flex-col items-center justify-center py-2 text-center">
                  <div className="text-[11px] font-mono text-[#77746F] dark:text-[#A8A29E] uppercase mb-1">
                    {mode === 'shape-to-chord'
                      ? `Fingering: ${selectedShape} • Capo Fret ${capoFret}`
                      : `Desired: ${targetSoundingChord} • Capo Fret ${capoFret}`}
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={mode === 'shape-to-chord' ? mode1Result.soundingChord : mode2Result.shapeChord}
                      initial={shouldReduceMotion ? undefined : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="text-6xl sm:text-7xl font-serif font-normal text-[#171717] dark:text-[#F5F5F4] tracking-tight leading-none"
                    >
                      {mode === 'shape-to-chord'
                        ? mode1Result.soundingChord
                        : mode2Result.shapeChord}
                    </motion.div>
                  </AnimatePresence>

                  <div className="text-xs font-mono text-[#D4AD61] font-semibold mt-2">
                    {mode === 'shape-to-chord'
                      ? `${mode1Result.qualityName || 'Major'} Chord • Shifted +${capoFret} semitones`
                      : `${mode2Result.qualityName || 'Major'} Shape • ${mode2Result.isOpenShape ? 'Open Cowboy Shape' : 'Standard Voicing'}`}
                  </div>
                </div>

                {/* Musical Explanation Callout */}
                <div className="bg-[#F7F6F3] dark:bg-[#1A1816] border border-[#EAE8E4] dark:border-white/10 rounded-2xl p-4 text-xs text-[#77746F] dark:text-[#A8A29E] leading-relaxed">
                  <div className="flex items-start gap-2">
                    <Info size={15} weight="regular" className="text-[#D4AD61] shrink-0 mt-0.5" />
                    <span>{mode === 'shape-to-chord' ? mode1Result.explanation : mode2Result.explanation}</span>
                  </div>
                </div>

                {/* Mini Physical Chord Diagram */}
                {displayedChordShape && (
                  <div className="pt-2 flex flex-col items-center">
                    <span className="text-[10px] font-mono uppercase text-[#A8A29E] mb-2 font-semibold">
                      Finger Shape: {displayedChordShape.name}
                    </span>
                    <MiniCapoChordBox
                      shape={displayedChordShape}
                      capoFret={capoFret}
                      isStrumming={isStrumming}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        /* ─── 4. Full Capo Transposition Cheat Sheet Matrix ─── */
        <div className="bg-[#FCFBF9] dark:bg-[#12100E] border border-[#EAE8E4] dark:border-white/10 rounded-3xl p-5 sm:p-7 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE8E4] dark:border-white/10 pb-4">
            <div>
              <h3 className="text-base font-semibold text-[#171717] dark:text-[#F5F5F4] tracking-tight">
                Capo Transposition Matrix (Frets 0–12)
              </h3>
              <p className="text-xs text-[#77746F] dark:text-[#A8A29E]">
                See what every standard open guitar chord shape sounds like at every capo position. Click any cell to load it.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreferFlats((p) => !p)}
                className="px-3 py-1.5 rounded-xl text-xs font-mono font-medium bg-[#F7F6F3] dark:bg-[#1A1816] border border-[#EAE8E4] dark:border-white/10 hover:border-[#D4AD61]/50 text-[#171717] dark:text-[#F5F5F4] transition-all cursor-pointer"
              >
                Toggle {preferFlats ? '♯ Sharps' : '♭ Flats'}
              </button>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto no-scrollbar touch-pan-x">
            <table className="w-full text-xs font-mono border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-[#EAE8E4] dark:border-white/10 text-[#77746F] dark:text-[#A8A29E]">
                  <th className="py-2.5 px-3 text-left font-bold uppercase tracking-wider text-[10px]">
                    Capo Position
                  </th>
                  {['C', 'A', 'G', 'E', 'D', 'Am', 'Em', 'Dm'].map((s) => (
                    <th key={s} className="py-2.5 px-3 text-center font-bold text-[#D4AD61]">
                      {s} Shape
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE8E4]/60 dark:divide-white/5">
                {Array.from({ length: 13 }, (_, f) => f).map((fret) => {
                  const isCurrent = capoFret === fret;
                  return (
                    <tr
                      key={fret}
                      className={`transition-colors ${
                        isCurrent
                          ? 'bg-[#D4AD61]/10 font-bold'
                          : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-semibold text-[#171717] dark:text-[#F5F5F4]">
                        {fret === 0 ? 'No Capo (Open)' : `Capo Fret ${fret}`}
                      </td>
                      {['C', 'A', 'G', 'E', 'D', 'Am', 'Em', 'Dm'].map((s) => {
                        const sounding = calculateSoundingChord(s, fret, preferFlats).soundingChord;
                        return (
                          <td key={s} className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setCapoFret(fret);
                                setSelectedShape(s);
                                setMode('shape-to-chord');
                                setViewTab('calculator');
                              }}
                              className="px-2 py-1 rounded hover:bg-[#D4AD61] hover:text-zinc-950 transition-all cursor-pointer"
                              title={`Capo ${fret} + ${s} Shape = ${sounding}`}
                            >
                              {sounding}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact Capo Chord Box Diagram
 */
function MiniCapoChordBox({
  shape,
  capoFret,
  isStrumming,
}: {
  shape: OpenChordShape;
  capoFret: number;
  isStrumming: boolean;
}) {
  return (
    <div className="bg-[#1A1413] text-[#E8DFD3] p-4 rounded-2xl border border-[#3E2A27] shadow-lg flex flex-col items-center select-none w-48">
      {/* Nut / Open / Mute Indicators */}
      <div className="flex justify-between w-40 mb-1.5 font-mono text-[11px] font-bold">
        {shape.fingers.map(([, fret], index) => (
          <span
            key={index}
            className={`w-6 text-center ${
              fret === 'x'
                ? 'text-red-400 font-bold'
                : fret === 0
                ? 'text-[#D4AD61] font-bold'
                : 'text-transparent'
            }`}
          >
            {fret === 'x' ? '×' : fret === 0 ? '○' : '·'}
          </span>
        ))}
      </div>

      {/* 5-Fret Neck Box */}
      <div className="relative w-40 h-44 fretboard-wood rounded-b-md border-x-2 border-b-2 border-[#52453F] shadow-inner overflow-hidden">
        {/* Capo or Bone Nut Bar */}
        <div
          className={`absolute top-0 left-0 right-0 h-3.5 z-20 flex items-center justify-between px-2 shadow-sm ${
            capoFret > 0
              ? 'bg-gradient-to-r from-[#201D1A] via-[#D4AD61] to-[#201D1A] border-b border-[#FFE082]'
              : 'bg-gradient-to-b from-[#EDE6D8] via-[#F4EFE6] to-[#DDD4C1] border-b-2 border-[#1E1614]'
          }`}
        >
          {capoFret > 0 && (
            <span className="w-full text-center text-[7px] font-mono font-bold text-zinc-950 uppercase tracking-widest">
              Capo {capoFret}
            </span>
          )}
        </div>

        {/* 5 Frets */}
        {[1, 2, 3, 4, 5].map((f) => (
          <div
            key={f}
            className="absolute left-0 right-0 h-[1.5px] bg-[#A8A29E]/60"
            style={{ top: `${(f / 5) * 100}%` }}
          />
        ))}

        {/* 6 Strings */}
        <div className="absolute inset-0 flex justify-between px-2.5 z-10 pointer-events-none">
          {[1.0, 1.3, 1.6, 2.1, 2.6, 3.2].map((gauge, i) => (
            <div key={i} className="h-full flex justify-center items-center w-3">
              <div
                className="h-full bg-[#EAE8E4] opacity-80 transition-transform duration-75"
                style={{
                  width: `${Math.max(1, gauge * 0.7)}px`,
                  transform: isStrumming ? 'scaleX(1.4)' : 'scaleX(1)',
                }}
              />
            </div>
          ))}
        </div>

        {/* Finger Dots */}
        {shape.fingers.map(([stringIndex, fret], index) => {
          if (typeof fret === 'number' && fret > 0) {
            const leftPercent = 12 + (stringIndex / 5) * 76;
            const topPercent = ((fret - 0.5) / 5) * 100;
            const fingerNum = Math.min(index + 1, 4);

            return (
              <div
                key={`${stringIndex}-${fret}`}
                className="absolute w-5 h-5 rounded-full bg-[#D4AD61] text-zinc-950 font-mono font-bold text-[10px] flex items-center justify-center shadow-md border border-white z-30"
                style={{
                  left: `${leftPercent}%`,
                  top: `${topPercent}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {fingerNum}
              </div>
            );
          }
          return null;
        })}
      </div>

      {/* String names at bottom */}
      <div className="flex justify-between w-40 mt-1.5 font-mono text-[9px] text-[#A8A29E]">
        {['E', 'A', 'D', 'G', 'B', 'e'].map((s, i) => (
          <span key={i} className="w-6 text-center font-bold">
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}
