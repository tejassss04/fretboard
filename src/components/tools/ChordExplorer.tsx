'use client';

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  BookOpen,
  CaretRight,
  Play,
  MagnifyingGlass,
  Sparkle,
  SpeakerHigh,
} from '@phosphor-icons/react';
import { chords } from '@/lib/data';
import type { Chord } from '@/lib/types';
import { guitarAudio } from '@/lib/audio';

// Standard base guitar tuning frequencies: E2, A2, D3, G3, B3, E4
const BASE_FREQS = [82.41, 110.0, 146.83, 196.0, 246.94, 329.63];

const STRING_GAUGES = [
  { name: 'E', gauge: 3.2, color: 'bg-[#B8852B]' }, // Low E
  { name: 'A', gauge: 2.6, color: 'bg-[#C59B3F]' },
  { name: 'D', gauge: 2.1, color: 'bg-[#D4AD61]' },
  { name: 'G', gauge: 1.6, color: 'bg-[#C4CCD6]' },
  { name: 'B', gauge: 1.3, color: 'bg-[#D9E1E8]' },
  { name: 'e', gauge: 1.0, color: 'bg-[#F0F4F8]' }, // High e
];

function deriveTabString(fingers: [number, number | 'x'][]): string {
  return fingers.map(([, f]) => f).join('-');
}

export default function ChordExplorer() {
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Open' | 'Barre' | '7th'>('All');
  const [selected, setSelected] = useState<Chord>(chords[0]);
  const [isStrumming, setIsStrumming] = useState(false);

  const shouldReduceMotion = useReducedMotion();

  const filtered = chords.filter((chord) => {
    const matchesQuery = `${chord.name} ${chord.short} ${chord.type} ${chord.difficulty}`
      .toLowerCase()
      .includes(query.toLowerCase());
    if (filterType === 'All') return matchesQuery;
    if (filterType === 'Open') return matchesQuery && chord.type.toLowerCase().includes('open');
    if (filterType === 'Barre') return matchesQuery && chord.type.toLowerCase().includes('barre');
    if (filterType === '7th') return matchesQuery && (chord.type.toLowerCase().includes('7') || chord.name.includes('7'));
    return matchesQuery;
  });

  const handleStrum = (chord: Chord) => {
    setIsStrumming(true);
    const freqs = chord.fingers.map(([stringIndex, fret]) => {
      if (fret === 'x') return 0;
      const base = BASE_FREQS[stringIndex];
      return base * Math.pow(2, (fret as number) / 12);
    });

    guitarAudio.strum(freqs, 42);
    setTimeout(() => setIsStrumming(false), 650);
  };

  const currentTab = deriveTabString(selected.fingers);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 select-none">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider bg-[#F5EEDF] dark:bg-[#201D1A] text-[#9E7A32] dark:text-[#D4AD61] border border-[#E9D8B7] dark:border-white/10 mb-2">
            <BookOpen size={12} weight="regular" />
            <span>Harmonic Voicings</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-normal text-[#171717] dark:text-[#F5F5F4] tracking-[-0.025em] leading-[1.12]">
            Chord <span className="font-serif italic text-[#D4AD61]">Voicings &amp; Shapes</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#77746F] dark:text-[#A8A29E] mt-1">
            Physical fretboard fingerings, tab positions, interval degrees, and authentic acoustic strumming.
          </p>
        </div>

        {/* Master Strum Action Button */}
        <button
          type="button"
          onClick={() => handleStrum(selected)}
          disabled={isStrumming}
          className={`inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-xs font-semibold tracking-tight transition-all cursor-pointer shadow-md shrink-0 active:scale-95 ${
            isStrumming
              ? 'bg-[#D4AD61] text-zinc-950 ring-2 ring-[#D4AD61]/50'
              : 'bg-[#171717] dark:bg-[#F5F5F4] hover:bg-[#2b2b2b] dark:hover:bg-white text-white dark:text-[#171717]'
          }`}
        >
          <SpeakerHigh size={15} weight="regular" className={isStrumming ? 'animate-bounce' : ''} />
          <span>{isStrumming ? 'Strumming Voicing...' : `Strum ${selected.short}`}</span>
        </button>
      </div>

      {/* 2. Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Chord Browser & Search */}
        <section className="lg:col-span-5 bg-[#FCFBF9] dark:bg-[#12100E] border border-[#EAE8E4] dark:border-white/10 rounded-3xl p-5 shadow-[0_20px_50px_rgba(23,23,23,0.03)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.5)] space-y-4">
          
          {/* Search Input Field */}
          <div className="flex items-center gap-2.5 bg-[#F7F6F3] dark:bg-[#1A1816] border border-[#EAE8E4] dark:border-white/10 rounded-full px-3.5 py-2.5">
            <MagnifyingGlass size={14} weight="regular" className="text-[#77746F] dark:text-[#A8A29E] shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search chords (C, Em, D7, barre...)"
              className="bg-transparent border-none text-[#171717] dark:text-[#F5F5F4] text-xs w-full focus:outline-hidden placeholder:text-[#A8A29E] dark:placeholder:text-[#6A6662] font-mono"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 p-1 bg-[#F1F0ED] dark:bg-[#1A1816] rounded-xl border border-[#EAE8E4] dark:border-white/10">
            {(['All', 'Open', 'Barre', '7th'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFilterType(type)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer text-center ${
                  filterType === type
                    ? 'bg-white dark:bg-[#25221F] text-[#171717] dark:text-[#F5F5F4] shadow-xs'
                    : 'text-[#77746F] dark:text-[#A8A29E] hover:text-[#171717] dark:hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Chord Cards List */}
          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {filtered.map((chord) => {
              const isSelected = selected.id === chord.id;
              const tab = deriveTabString(chord.fingers);
              return (
                <button
                  key={chord.id}
                  type="button"
                  onClick={() => {
                    setSelected(chord);
                    handleStrum(chord);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#E9D8B7]/30 dark:bg-[#D4AD61]/20 border-[#D4AD61] shadow-xs'
                      : 'bg-[#F7F6F3]/60 dark:bg-[#181614]/60 border-transparent hover:border-[#EAE8E4] dark:hover:border-white/10 hover:bg-[#F7F6F3] dark:hover:bg-[#1A1816]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-11 h-11 rounded-xl flex items-center justify-center font-mono font-bold text-sm border transition-colors ${
                      isSelected
                        ? 'bg-[#D4AD61] text-zinc-950 border-[#8C6B24]'
                        : 'bg-white dark:bg-[#201D1A] border-[#EAE8E4] dark:border-white/10 text-[#171717] dark:text-[#F5F5F4]'
                    }`}>
                      {chord.short}
                    </span>
                    <div>
                      <div className="text-xs font-semibold text-[#171717] dark:text-[#F5F5F4]">
                        {chord.name}
                      </div>
                      <div className="text-[10px] font-mono text-[#77746F] dark:text-[#A8A29E] flex items-center gap-1.5 mt-0.5">
                        <span>{chord.type}</span>
                        <span>•</span>
                        <span className="text-[#D4AD61]">{tab}</span>
                      </div>
                    </div>
                  </div>
                  <CaretRight
                    size={14}
                    weight="regular"
                    className={isSelected ? 'text-[#D4AD61]' : 'text-[#77746F]/40 dark:text-[#A8A29E]/40'}
                  />
                </button>
              );
            })}

            {filtered.length === 0 && (
              <div className="py-12 text-center text-xs font-mono text-[#77746F] dark:text-[#A8A29E]">
                No chords match your query.
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Physical Chord Fretboard Diagram & Mechanics */}
        <section className="lg:col-span-7 bg-[#FCFBF9] dark:bg-[#12100E] border border-[#EAE8E4] dark:border-white/10 rounded-3xl p-6 sm:p-7 shadow-[0_20px_50px_rgba(23,23,23,0.03)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.5)] space-y-6">
          
          {/* Detail Header Strip */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#EAE8E4] dark:border-white/10 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D4AD61] bg-[#D4AD61]/10 px-2 py-0.5 rounded border border-[#D4AD61]/25">
                  {selected.type}
                </span>
                <span className="text-[10px] font-mono text-[#77746F] dark:text-[#A8A29E]">
                  {selected.difficulty}
                </span>
              </div>

              <h3 className="text-3xl font-serif font-normal tracking-tight text-[#171717] dark:text-[#F5F5F4]">
                {selected.name}
              </h3>

              {/* Pitch Component Notes & Tab */}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <div className="flex items-center gap-1">
                  {selected.notes.map((note, idx) => (
                    <span
                      key={note}
                      className={`px-2 py-0.5 rounded-md font-mono text-xs font-bold border ${
                        idx === 0
                          ? 'bg-[#D4AD61] text-zinc-950 border-[#8C6B24]'
                          : 'bg-[#F7F6F3] dark:bg-[#1A1816] border-[#EAE8E4] dark:border-white/10 text-[#171717] dark:text-[#F5F5F4]'
                      }`}
                    >
                      {note}
                    </span>
                  ))}
                </div>

                <span className="text-zinc-300 dark:text-zinc-700">•</span>

                <div className="text-xs font-mono text-[#77746F] dark:text-[#A8A29E]">
                  Tab: <span className="font-semibold text-[#171717] dark:text-[#F5F5F4]">{currentTab}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleStrum(selected)}
              title="Click to strum chord"
              className="w-12 h-12 rounded-full flex items-center justify-center bg-[#D4AD61] text-zinc-950 shadow-md hover:bg-[#c99f4f] transition-all cursor-pointer active:scale-95 shrink-0"
            >
              <Play size={18} weight="regular" className="ml-0.5" />
            </button>
          </div>

          {/* Rosewood Chord Box & Technique Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            
            {/* Visual Physical Neck Diagram (7 cols) */}
            <div className="sm:col-span-7 flex justify-center">
              <PhysicalChordNeck
                chord={selected}
                isStrumming={isStrumming}
                onStrum={() => handleStrum(selected)}
                shouldReduceMotion={shouldReduceMotion ?? false}
              />
            </div>

            {/* Technique & Finger Placement Legend (5 cols) */}
            <div className="sm:col-span-5 space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#77746F] dark:text-[#A8A29E] block mb-1">
                  TECHNIQUE TIPS
                </span>
                <h4 className="text-xs font-semibold text-[#171717] dark:text-[#F5F5F4] mb-1">
                  Hand Posture &amp; Voicing
                </h4>
                <p className="text-xs text-[#77746F] dark:text-[#A8A29E] leading-relaxed">
                  {selected.tip}
                </p>
              </div>

              {/* Finger Assignment Legend */}
              <div className="bg-[#F7F6F3] dark:bg-[#181614] border border-[#EAE8E4] dark:border-white/10 rounded-2xl p-3.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#77746F] dark:text-[#A8A29E] block mb-2 font-semibold">
                  Fingering Legend
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-[#171717] dark:text-[#F5F5F4]">
                    <span className="w-5 h-5 rounded-full bg-[#D4AD61] text-zinc-950 font-bold text-[10px] flex items-center justify-center">1</span>
                    <span>Index</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#171717] dark:text-[#F5F5F4]">
                    <span className="w-5 h-5 rounded-full bg-[#D4AD61] text-zinc-950 font-bold text-[10px] flex items-center justify-center">2</span>
                    <span>Middle</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#171717] dark:text-[#F5F5F4]">
                    <span className="w-5 h-5 rounded-full bg-[#D4AD61] text-zinc-950 font-bold text-[10px] flex items-center justify-center">3</span>
                    <span>Ring</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#171717] dark:text-[#F5F5F4]">
                    <span className="w-5 h-5 rounded-full bg-[#D4AD61] text-zinc-950 font-bold text-[10px] flex items-center justify-center">4</span>
                    <span>Pinky</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Harmonic Progression Suggestion */}
          <div className="bg-[#F5EEDF]/40 dark:bg-[#1C1814] border border-[#E9D8B7] dark:border-white/10 rounded-2xl p-4 flex items-start gap-3">
            <Sparkle size={18} weight="regular" className="text-[#D4AD61] shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-[#171717] dark:text-[#F5F5F4]">
                Harmonic Progression Context
              </div>
              <div className="text-xs text-[#77746F] dark:text-[#A8A29E] mt-0.5 leading-relaxed">
                {selected.next}
              </div>
            </div>
          </div>

        </section>
      </div>
    </div>
  );
}

/**
 * Authentic 5-Fret Physical Rosewood Neck Box Diagram
 */
function PhysicalChordNeck({
  chord,
  isStrumming,
  onStrum,
  shouldReduceMotion,
}: {
  chord: Chord;
  isStrumming: boolean;
  onStrum: () => void;
  shouldReduceMotion: boolean;
}) {
  return (
    <div
      onClick={onStrum}
      title="Click fretboard to strum voicing"
      className="cursor-pointer select-none bg-[#1A1413] text-[#E8DFD3] p-5 rounded-3xl border border-[#3E2A27] shadow-xl flex flex-col items-center hover:border-[#D4AD61]/60 transition-all active:scale-98"
    >
      {/* 1. Open (○) and Muted (×) Nut Head Indicators */}
      <div className="flex justify-between w-52 mb-2 font-mono text-xs font-bold">
        {chord.fingers.map(([, fret], index) => (
          <span
            key={index}
            className={`w-7 text-center transition-colors ${
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

      {/* 2. Rosewood Neck Box */}
      <div className="relative w-52 h-64 fretboard-wood rounded-b-lg border-x-2 border-b-2 border-[#52453F] shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)] overflow-hidden">
        
        {/* Bone Nut at top */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-[#EDE6D8] via-[#F4EFE6] to-[#DDD4C1] border-b-2 border-[#1E1614] z-20 shadow-sm flex items-center justify-between px-2.5">
          {/* Subtle string notches in nut */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-[1.5px] h-full bg-zinc-600/30" />
          ))}
        </div>

        {/* 5 Equal-Tempered Fret Dividers (Nickel-Silver) */}
        {[1, 2, 3, 4, 5].map((fret) => (
          <div
            key={fret}
            className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-[#A8A29E] via-[#F5F5F4] to-[#A8A29E] shadow-[0_1px_2px_rgba(0,0,0,0.7)] z-10"
            style={{ top: `${(fret / 5) * 100}%` }}
          />
        ))}

        {/* 6 Physical Wound Bronze & Steel Strings */}
        <div className="absolute inset-0 flex justify-between px-3 z-15 pointer-events-none">
          {STRING_GAUGES.map((stringInfo, sIdx) => (
            <div key={sIdx} className="relative h-full flex justify-center items-center w-5">
              <div
                className={`h-full ${stringInfo.color} opacity-90 shadow-sm transition-transform duration-75`}
                style={{
                  width: `${stringInfo.gauge}px`,
                  transform: isStrumming && !shouldReduceMotion ? `scaleX(1.4)` : 'scaleX(1)',
                }}
              />
            </div>
          ))}
        </div>

        {/* Finger Placement Dots */}
        {chord.fingers.map(([stringIndex, fret], index) => {
          if (typeof fret === 'number' && fret > 0) {
            const leftPercent = 12 + (stringIndex / 5) * 76;
            const topPercent = ((fret - 0.5) / 5) * 100;
            const fingerNumber = Math.min(index + 1, 4);

            return (
              <motion.div
                key={`${stringIndex}-${fret}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute w-7 h-7 rounded-full bg-[#D4AD61] text-zinc-950 font-mono font-bold text-xs flex items-center justify-center shadow-[0_0_12px_rgba(212,173,97,0.95)] border-2 border-white z-30"
                style={{
                  left: `${leftPercent}%`,
                  top: `${topPercent}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {fingerNumber}
              </motion.div>
            );
          }
          return null;
        })}
      </div>

      {/* 3. String Names at bottom (E A D G B E) */}
      <div className="flex justify-between w-52 mt-2 font-mono text-[11px] text-[#A8A29E]">
        {STRING_GAUGES.map((str, i) => (
          <span key={i} className="w-7 text-center font-bold">
            {str.name}
          </span>
        ))}
      </div>
    </div>
  );
}
