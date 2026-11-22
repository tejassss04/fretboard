'use client';

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Play, Sparkle, Eye } from '@phosphor-icons/react';
import { scaleLibrary } from '@/lib/data';
import { roots, scaleIntervals, type RootNote, type ScaleId } from '@/lib/music';
import { guitarAudio } from '@/lib/audio';

const STRINGS_DISPLAY = [
  { name: 'e', openMidi: 64, gauge: 1.0, color: 'bg-[#F0F4F8]' }, // High e
  { name: 'B', openMidi: 59, gauge: 1.3, color: 'bg-[#D9E1E8]' },
  { name: 'G', openMidi: 55, gauge: 1.6, color: 'bg-[#C4CCD6]' },
  { name: 'D', openMidi: 50, gauge: 2.1, color: 'bg-[#D4AD61]' },
  { name: 'A', openMidi: 45, gauge: 2.6, color: 'bg-[#C59B3F]' },
  { name: 'E', openMidi: 40, gauge: 3.2, color: 'bg-[#B8852B]' }, // Low E
];

const FRET_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const ROMAN_MAP: Record<number, string> = {
  3: 'III',
  5: 'V',
  7: 'VII',
  9: 'IX',
  12: 'XII',
};

export default function ScaleExplorer() {
  const [root, setRoot] = useState<RootNote>('A');
  const [scaleId, setScaleId] = useState<ScaleId>('minor-pentatonic');
  const [displayMode, setDisplayMode] = useState<'notes' | 'degrees'>('notes');
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePluckedMidi, setActivePluckedMidi] = useState<number | null>(null);

  const shouldReduceMotion = useReducedMotion();
  const currentScale = scaleLibrary.find((s) => s.id === scaleId) ?? scaleLibrary[1];
  const intervals = scaleIntervals[scaleId] ?? [0, 3, 5, 7, 10];

  const handlePlayScale = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    const rootIndex = roots.indexOf(root);

    intervals.forEach((interval, idx) => {
      const note = roots[(rootIndex + interval) % 12];
      const octave = idx >= 4 ? 4 : 3;
      setTimeout(() => {
        guitarAudio.playNote(note.replace('♯', '#').replace('♭', 'b'), octave, 0);
      }, idx * 280);
    });

    const lastIdx = intervals.length;
    setTimeout(() => {
      guitarAudio.playNote(root.replace('♯', '#').replace('♭', 'b'), 4, 0);
    }, lastIdx * 280);

    setTimeout(() => {
      setIsPlaying(false);
    }, (lastIdx + 1) * 280);
  };

  const handlePluckNote = (midiNote: number, noteName: string) => {
    const octave = Math.floor(midiNote / 12) - 1;
    guitarAudio.playNote(noteName.replace('♯', '#').replace('♭', 'b'), octave);
    setActivePluckedMidi(midiNote);
    setTimeout(() => setActivePluckedMidi(null), 450);
  };

  const rootIndex = roots.indexOf(root);
  const scaleNoteIndices = new Set(intervals.map((inv) => (rootIndex + inv) % 12));

  // Map interval degree to human label (1, b3, 4, 5, b7 etc.)
  const getDegreeLabel = (inv: number) => {
    if (inv === 0) return '1';
    if (inv === 1) return '♭2';
    if (inv === 2) return '2';
    if (inv === 3) return '♭3';
    if (inv === 4) return '3';
    if (inv === 5) return '4';
    if (inv === 6) return '♭5';
    if (inv === 7) return '5';
    if (inv === 8) return '♭6';
    if (inv === 9) return '6';
    if (inv === 10) return '♭7';
    if (inv === 11) return '7';
    return `${inv}`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 select-none">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-normal text-[#171717] dark:text-[#F5F5F4] tracking-[-0.025em] leading-[1.12]">
            Scale &amp; Mode <span className="font-serif italic text-[#E9D8B7]">Matrix</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#77746F] dark:text-[#A8A29E] mt-1">
            Map fretboard positions, hear scalar degrees, and practice soloing shapes in any key.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Toggle Display Mode: Notes vs Degrees */}
          <button
            type="button"
            onClick={() => setDisplayMode(displayMode === 'notes' ? 'degrees' : 'notes')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-mono font-medium border border-[#EAE8E4] dark:border-white/10 text-[#171717] dark:text-[#F5F5F4] bg-white dark:bg-[#181614] hover:bg-[#F7F6F3] dark:hover:bg-[#201D1A] transition-all cursor-pointer shadow-xs"
          >
            <Eye size={13} weight="regular" />
            <span>{displayMode === 'notes' ? 'View Degrees' : 'View Notes'}</span>
          </button>

          {/* Play Scale Arpeggio */}
          <button
            type="button"
            onClick={handlePlayScale}
            disabled={isPlaying}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold tracking-tight transition-all cursor-pointer shadow-md shrink-0 active:scale-95 ${
              isPlaying
                ? 'bg-[#D4AD61] text-zinc-950 ring-2 ring-[#D4AD61]/50'
                : 'bg-[#171717] dark:bg-[#F5F5F4] hover:bg-[#2b2b2b] dark:hover:bg-white text-white dark:text-[#171717]'
            }`}
          >
            <Play size={13} weight="regular" className={isPlaying ? 'animate-pulse text-zinc-950' : ''} />
            <span>{isPlaying ? 'Auditioning Scale...' : 'Audition Scale'}</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Selector Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Root Selector & Scale Palette */}
        <div className="lg:col-span-5 bg-[#FCFBF9] dark:bg-[#12100E] border border-[#EAE8E4] dark:border-white/10 rounded-3xl p-5 shadow-[0_20px_50px_rgba(23,23,23,0.03)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.5)] space-y-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#77746F] dark:text-[#A8A29E] block mb-2 font-semibold">
              Root Tonic Key
            </span>
            <div className="grid grid-cols-6 gap-1.5">
              {roots.map((note) => {
                const isSelected = root === note;
                return (
                  <button
                    key={note}
                    type="button"
                    onClick={() => setRoot(note)}
                    className={`py-2 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#D4AD61] text-zinc-950 border-[#8C6B24] shadow-xs'
                        : 'bg-[#F7F6F3] dark:bg-[#1A1816] border-[#EAE8E4] dark:border-white/10 text-[#171717] dark:text-[#F5F5F4] hover:border-[#D4AD61]/50'
                    }`}
                  >
                    {note}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#77746F] dark:text-[#A8A29E] block mb-2 font-semibold">
              Select Scale / Mode
            </span>
            <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
              {scaleLibrary.map((scale) => {
                const isSelected = scaleId === scale.id;
                return (
                  <button
                    key={scale.id}
                    type="button"
                    onClick={() => setScaleId(scale.id as ScaleId)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#E9D8B7]/30 dark:bg-[#D4AD61]/20 border-[#D4AD61] shadow-xs'
                        : 'bg-[#F7F6F3]/60 dark:bg-[#181614]/60 border-transparent hover:border-[#EAE8E4] dark:hover:border-white/10 hover:bg-[#F7F6F3] dark:hover:bg-[#1A1816]'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold text-[#171717] dark:text-[#F5F5F4]">
                        {scale.name}
                      </div>
                      <div className="text-[10px] font-mono text-[#D4AD61]">
                        {scale.intervals}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-[#77746F] dark:text-[#A8A29E]">
                      {scale.mood}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Scale Insight Card */}
        <div className="lg:col-span-7 bg-[#FCFBF9] dark:bg-[#12100E] border border-[#EAE8E4] dark:border-white/10 rounded-3xl p-6 sm:p-7 shadow-[0_20px_50px_rgba(23,23,23,0.03)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.5)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#D4AD61] font-bold">
                Formula Analysis • {root} {currentScale.name}
              </span>
              <span className="text-[11px] font-mono text-[#77746F] dark:text-[#A8A29E]">
                {currentScale.positions} Box Positions
              </span>
            </div>

            <h3 className="text-2xl font-serif font-normal tracking-tight text-[#171717] dark:text-[#F5F5F4] mb-2">
              {currentScale.blurb}
            </h3>

            {/* Note Interval Degrees Strip */}
            <div className="flex items-center gap-2 my-4 flex-wrap">
              {intervals.map((inv, idx) => {
                const noteName = roots[(rootIndex + inv) % 12];
                const degreeStr = getDegreeLabel(inv);
                const isRoot = idx === 0;

                return (
                  <div
                    key={idx}
                    className={`flex flex-col items-center justify-center w-12 h-14 rounded-2xl border transition-all ${
                      isRoot
                        ? 'bg-[#D4AD61] text-zinc-950 border-[#8C6B24] shadow-sm font-bold'
                        : 'bg-[#F7F6F3] dark:bg-[#1A1816] border-[#EAE8E4] dark:border-white/10 text-[#171717] dark:text-[#F5F5F4]'
                    }`}
                  >
                    <span className="text-sm font-bold font-mono">
                      {noteName}
                    </span>
                    <span className={`text-[10px] font-mono ${isRoot ? 'text-zinc-900 font-bold' : 'text-[#D4AD61]'}`}>
                      {degreeStr}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-[#F5EEDF]/40 dark:bg-[#1C1814] border border-[#E9D8B7] dark:border-white/10 rounded-2xl p-4 flex items-start gap-3 mt-4">
            <Sparkle size={18} weight="regular" className="text-[#D4AD61] shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-[#171717] dark:text-[#F5F5F4]">
                Improvisation &amp; Phrasing Insight
              </div>
              <div className="text-xs text-[#77746F] dark:text-[#A8A29E] mt-0.5 leading-relaxed">
                {currentScale.suggestion}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Master 12-Fret Rosewood Neck Matrix */}
      {/* Mobile Scroll Hint Affordance */}
      <div className="sm:hidden flex items-center justify-between text-[10px] font-mono text-[#A8A29E] px-1 mb-1.5 select-none">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AD61] animate-pulse" />
          <span>Swipe horizontally for 12 frets</span>
        </span>
        <span className="text-zinc-500">Nut • Frets 1–12</span>
      </div>

      <div className="relative rounded-3xl bg-[#140F0E] border border-[#3E2A27] p-3 sm:p-7 shadow-2xl overflow-hidden group">
        {/* Horizontal edge gradient shadow cues */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 sm:w-10 bg-gradient-to-r from-[#140F0E] to-transparent z-30 opacity-70" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 sm:w-10 bg-gradient-to-l from-[#140F0E] to-transparent z-30 opacity-70" />

        <div className="overflow-x-auto touch-pan-x scroll-smooth no-scrollbar">
          <div className="min-w-[700px]">
          
          {/* Header Info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D4AD61]" />
              <span className="text-xs font-mono font-bold text-[#E8DFD3] uppercase tracking-wider">
                12-Fret Rosewood Neck • {root} {currentScale.name}
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#A8A29E]">
              Gold = Root Tonic • Satin = Scale Degrees • Click node to pluck
            </span>
          </div>

          {/* Fret Register Header with Roman Numerals */}
          <div className="grid grid-cols-13 gap-1 mb-2 text-center font-mono text-[10px] text-[#A8A29E]">
            <span className="font-bold text-zinc-500 uppercase text-[9px] pt-1">Nut</span>
            {FRET_NUMBERS.map((f) => (
              <div key={f} className="flex flex-col items-center">
                <span className={ROMAN_MAP[f] ? 'text-[#D4AD61] font-bold' : 'text-zinc-400'}>
                  {f}
                </span>
                {ROMAN_MAP[f] && (
                  <span className="text-[8px] text-[#D4AD61]/80 font-serif italic">
                    {ROMAN_MAP[f]}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Bound Rosewood Neck Container */}
          <div className="relative fretboard-wood rounded-xl border-y-2 border-[#52453F] py-3 px-1 shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)]">
            
            {/* 6 Physical Strings */}
            <div className="space-y-3 relative">
              {STRINGS_DISPLAY.map((stringInfo, sIdx) => {
                const baseMidi = stringInfo.openMidi;

                return (
                  <div key={sIdx} className="grid grid-cols-13 gap-1 items-center relative h-7">
                    
                    {/* Continuous Metallic String Wire */}
                    <div
                      className={`absolute inset-x-0 ${stringInfo.color} opacity-85 shadow-sm -z-0 pointer-events-none`}
                      style={{ height: `${stringInfo.gauge}px` }}
                    />

                    {/* 13 Fret Slots (0 = Nut, 1..12) */}
                    {Array.from({ length: 13 }).map((_, fret) => {
                      const midiNote = baseMidi + fret;
                      const noteIndex = midiNote % 12;
                      const noteName = roots[noteIndex];
                      const isRoot = noteIndex === rootIndex;
                      const isInScale = scaleNoteIndices.has(noteIndex);
                      const isPlucked = activePluckedMidi === midiNote;

                      const semitonesFromRoot = (noteIndex - rootIndex + 12) % 12;
                      const degreeLabel = getDegreeLabel(semitonesFromRoot);

                      return (
                        <div key={fret} className="flex justify-center z-10">
                          {/* Fret wire divider (except nut) */}
                          {fret > 0 && (
                            <div className="absolute top-0 bottom-0 w-[1.5px] bg-gradient-to-b from-[#A8A29E] via-[#F5F5F4] to-[#A8A29E] opacity-40 pointer-events-none -translate-x-[26px]" />
                          )}

                          {isInScale ? (
                            <motion.button
                              type="button"
                              whileHover={shouldReduceMotion ? undefined : { scale: 1.15 }}
                              whileTap={shouldReduceMotion ? undefined : { scale: 0.9 }}
                              onClick={() => handlePluckNote(midiNote, noteName)}
                              className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[9px] font-bold cursor-pointer transition-all duration-150 shadow-sm ${
                                isPlucked
                                  ? 'bg-gradient-to-tr from-[#FFE082] via-[#D4AD61] to-[#B8852B] text-zinc-950 scale-125 ring-2 ring-white z-30 shadow-[0_0_12px_rgba(212,173,97,0.95)]'
                                  : isRoot
                                  ? 'bg-[#D4AD61] text-zinc-950 shadow-[0_0_8px_rgba(212,173,97,0.8)] border border-white'
                                  : 'bg-[#EDE6D8] dark:bg-[#3D332A] text-zinc-900 dark:text-[#F5F5F4] border border-[#8C7A6B]/50'
                              }`}
                              title={`Pluck ${noteName} (${displayMode === 'notes' ? noteName : degreeLabel})`}
                            >
                              {displayMode === 'notes' ? noteName : degreeLabel}
                            </motion.button>
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#4A3D36] opacity-35" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Pearloid dot inlays in background */}
            <div className="absolute inset-0 pointer-events-none flex justify-between px-10 items-center -z-0 opacity-20">
              {/* Markers at 3, 5, 7, 9 */}
              <div className="w-2 h-2 rounded-full bg-white" />
              <div className="w-2 h-2 rounded-full bg-white" />
              <div className="w-2 h-2 rounded-full bg-white" />
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>

          </div>

        </div>
        </div>
      </div>

    </div>
  );
}
