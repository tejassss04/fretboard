'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  TUNINGS, 
  SCALES, 
  getFretInfo,
  NoteName 
} from '@/lib/guitar';

export type DisplayMode = 'notes' | 'intervals' | 'clean';

export interface ActivePluck2D {
  id: number;
  stringIdx: number; // 0 (high E) to 5 (low E)
  fret: number;      // 0 (nut) to fretCount
  isRoot: boolean;
  frequency: number;
  timestamp: number;
}

export interface HoveredNoteInfo {
  stringIdx: number;
  fret: number;
  note: string;
  intervalName: string;
  frequency: number;
}

export interface LivingFretboard2DProps {
  selectedKey: NoteName;
  selectedScaleId: string;
  displayMode: DisplayMode;
  tuningKey: string;
  fretCount?: number;
  activePlucks?: ActivePluck2D[];
  vibratingStrings?: Record<number, boolean>;
  activeChordNotes?: { stringIdx: number; fret: number }[];
  onNoteClick: (stringIdx: number, fret: number) => void;
  onHoverNote: (info: HoveredNoteInfo | null) => void;
  hoveredNote?: HoveredNoteInfo | null;
}

const SINGLE_FRET_MARKERS = [3, 5, 7, 9, 15, 17, 19, 21];
const DOUBLE_FRET_MARKERS = [12, 24];

const ROMAN_FRET_NUMERALS: Record<number, string> = {
  3: 'III',
  5: 'V',
  7: 'VII',
  9: 'IX',
  12: 'XII',
  15: 'XV',
  17: 'XVII',
  19: 'XIX',
  21: 'XXI',
  24: 'XXIV',
};

export default function LivingFretboard2D({
  selectedKey,
  selectedScaleId,
  displayMode,
  tuningKey,
  fretCount = 15,
  activePlucks = [],
  vibratingStrings = {},
  activeChordNotes = [],
  onNoteClick,
  onHoverNote,
  hoveredNote,
}: LivingFretboard2DProps) {
  const currentTuning = TUNINGS[tuningKey] || TUNINGS.standard;
  const currentScale = SCALES.find((s) => s.id === selectedScaleId) || SCALES[0];

  // Mathematical Equal-Tempered Fret Spacing using 12th root of 2
  const frets = useMemo(() => {
    const dN = 1 - Math.pow(2, -fretCount / 12);
    const result = [];

    for (let n = 1; n <= fretCount; n++) {
      const dPrev = 1 - Math.pow(2, -(n - 1) / 12);
      const dCurr = 1 - Math.pow(2, -n / 12);
      const leftPercent = (dPrev / dN) * 100;
      const widthPercent = ((dCurr - dPrev) / dN) * 100;
      const centerPercent = leftPercent + widthPercent / 2;

      result.push({
        fret: n,
        leftPercent,
        widthPercent,
        centerPercent,
        hasSingleMarker: SINGLE_FRET_MARKERS.includes(n),
        hasDoubleMarker: DOUBLE_FRET_MARKERS.includes(n),
        roman: ROMAN_FRET_NUMERALS[n] || null,
      });
    }

    return result;
  }, [fretCount]);

  // Vertical positions for the 6 strings (0 = High E at top, 5 = Low E at bottom)
  const stringYPercentages = useMemo(() => {
    return [13, 27.8, 42.6, 57.4, 72.2, 87];
  }, []);

  return (
    <div className="w-full relative flex flex-col select-none">
      {/* 1. Fret Numbers & Roman Register Header */}
      <div className="w-full relative h-7 mb-1 text-[11px] font-mono text-[#77746F] dark:text-[#A8A29E]">
        {/* Nut Label */}
        <div className="absolute left-0 w-[44px] text-center font-bold text-[#A8A29E] dark:text-zinc-500 uppercase tracking-widest text-[9px] pt-1.5">
          Nut
        </div>

        {/* Fretted Numbers 1..fretCount */}
        <div className="absolute left-[44px] right-0 h-full">
          {frets.map(({ fret, centerPercent, hasSingleMarker, hasDoubleMarker, roman }) => (
            <div
              key={fret}
              style={{ left: `${centerPercent}%` }}
              className={`absolute top-0 -translate-x-1/2 flex flex-col items-center leading-none transition-colors ${
                hasDoubleMarker
                  ? 'text-[#D4AD61] font-bold'
                  : hasSingleMarker
                  ? 'text-[#171717] dark:text-zinc-200 font-semibold'
                  : 'text-zinc-400 dark:text-zinc-600'
              }`}
            >
              <span className="text-[11px] font-mono font-medium">{fret}</span>
              {roman && (
                <span className="text-[8px] font-mono tracking-tighter opacity-60 mt-0.5 hidden sm:inline">
                  {roman}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 2. The Guitar Fretboard Neck (Bound Rosewood Neck with Metal Frets & Strings) */}
      <div className="relative w-full h-[224px] sm:h-[244px] rounded-xl overflow-hidden fretboard-wood border-t-[2.5px] border-b-[2.5px] border-[#E8DFD3] dark:border-[#52453F] shadow-[inset_0_2px_10px_rgba(0,0,0,0.65),inset_0_-2px_10px_rgba(0,0,0,0.65)]">
        
        {/* Subtle wood lighting sheen */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] via-transparent to-black/35 pointer-events-none" />

        {/* --- LAYER A: The Polished Bone Nut at Fret 0 --- */}
        <div className="absolute left-0 top-0 bottom-0 w-[44px] bg-gradient-to-r from-[#EDE6D8] via-[#F4EFE6] to-[#DDD4C1] dark:from-[#3D332A] dark:via-[#4F443A] dark:to-[#332A22] border-r-2 border-[#1E1614] dark:border-black z-20 shadow-md flex flex-col justify-between items-center py-2">
          {/* Subtle Nut Ivory Vertical Grain */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/[0.03] to-transparent pointer-events-none" />
          
          {/* Physical string notches (slots) in bone nut */}
          {stringYPercentages.map((yPercent, idx) => (
            <div
              key={`nut-notch-${idx}`}
              style={{ top: `${yPercent}%` }}
              className="absolute right-0 w-[4px] h-[1.5px] -translate-y-1/2 bg-[#271A19]/80 dark:bg-black/80 rounded-l-xs pointer-events-none"
            />
          ))}
        </div>

        {/* --- LAYER B: Nickel-Silver Frets & Pearloid Inlays --- */}
        <div className="absolute left-[44px] right-0 top-0 bottom-0 pointer-events-none z-10">
          {frets.map(({ fret, leftPercent, widthPercent, centerPercent, hasSingleMarker, hasDoubleMarker }) => (
            <React.Fragment key={fret}>
              {/* Nickel-Silver Fret Wire at right boundary of fret space */}
              <div
                style={{ left: `${leftPercent + widthPercent}%` }}
                className="absolute top-0 bottom-0 w-[2.5px] -translate-x-1/2 flex items-center justify-center pointer-events-none"
              >
                {/* Metallic Highlight & Shadow bevel */}
                <div className="w-[1px] h-full bg-white/45" />
                <div className="w-[1.5px] h-full bg-gradient-to-b from-[#B8B8B4] via-[#D8D8D4] to-[#989894] shadow-[0.5px_0_1px_rgba(0,0,0,0.85)]" />
              </div>

              {/* Pearloid Inlay Marker: Single Dot at Frets 3, 5, 7, 9, 15, 17, 19, 21 */}
              {hasSingleMarker && (
                <div
                  style={{ left: `${centerPercent}%`, top: '50%' }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-[#FAF9F5] via-[#E4E0D5] to-[#BDB7A6] border border-[#A8A190]/60 shadow-[inset_0_1px_2px_rgba(255,255,255,0.7),0_1px_3px_rgba(0,0,0,0.6)] opacity-85"
                />
              )}

              {/* Pearloid Inlay Marker: Double Dots at Octave (Fret 12 & 24) */}
              {hasDoubleMarker && (
                <div
                  style={{ left: `${centerPercent}%` }}
                  className="absolute top-0 bottom-0 -translate-x-1/2 flex flex-col justify-around py-9 items-center pointer-events-none"
                >
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[#FAF9F5] via-[#E4E0D5] to-[#BDB7A6] border border-[#A8A190]/60 shadow-[inset_0_1px_2px_rgba(255,255,255,0.7),0_1px_3px_rgba(0,0,0,0.6)] opacity-90" />
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[#FAF9F5] via-[#E4E0D5] to-[#BDB7A6] border border-[#A8A190]/60 shadow-[inset_0_1px_2px_rgba(255,255,255,0.7),0_1px_3px_rgba(0,0,0,0.6)] opacity-90" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* --- LAYER C: 6 Physical Guitar Strings --- */}
        <div className="absolute left-0 right-0 top-0 bottom-0 pointer-events-none z-15">
          {currentTuning.strings.map((str, stringIdx) => {
            const isVibrating = vibratingStrings[stringIdx];
            const yPercent = stringYPercentages[stringIdx];
            const isBassWound = stringIdx >= 3;

            // Gauge animation class
            const pluckAnimationClass = isVibrating
              ? stringIdx >= 4
                ? 'animate-string-pluck-bass'
                : stringIdx >= 2
                ? 'animate-string-pluck-mid'
                : 'animate-string-pluck-treble'
              : '';

            return (
              <div
                key={stringIdx}
                style={{ top: `${yPercent}%` }}
                className={`absolute left-0 right-0 -translate-y-1/2 transition-transform ${pluckAnimationClass}`}
              >
                {/* String Wire with realistic material texture */}
                <div
                  style={{
                    height: `${str.gauge * 1.05}px`,
                    background: isBassWound
                      ? 'linear-gradient(180deg, #E2B565 0%, #B8852B 50%, #825B16 100%)'
                      : 'linear-gradient(180deg, #F0F4F8 0%, #C4CCD6 50%, #8A94A0 100%)',
                    boxShadow: isVibrating
                      ? '0 0 10px rgba(212, 173, 97, 0.95), 0 1px 3px rgba(0,0,0,0.9)'
                      : '0 1px 3px rgba(0,0,0,0.85), 0 0.5px 1px rgba(0,0,0,0.9)',
                  }}
                  className={`w-full relative ${
                    isBassWound
                      ? 'after:absolute after:inset-0 after:bg-[repeating-linear-gradient(90deg,transparent,transparent_2px,rgba(0,0,0,0.25)_2px,rgba(0,0,0,0.25)_3px)]'
                      : ''
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* --- LAYER D: Interactive Note Nodes (Nut & Frets) --- */}
        <div className="absolute inset-0 z-30">
          
          {/* Fret 0 / Open String Buttons (Mounted on Bone Nut) */}
          <div className="absolute left-0 top-0 bottom-0 w-[44px] flex flex-col justify-between py-1">
            {currentTuning.strings.map((str, stringIdx) => {
              const yPercent = stringYPercentages[stringIdx];
              const openInfo = getFretInfo(str.note, str.octave, 0, selectedKey);
              const isRoot = openInfo.interval === 0;
              const isScaleNote =
                currentScale.intervals.length > 0 &&
                openInfo.interval !== null &&
                currentScale.intervals.includes(openInfo.interval);

              // Check if actively plucked
              const activePluck = activePlucks.find(
                (p) => p.stringIdx === stringIdx && p.fret === 0
              );
              const isChordActive = activeChordNotes.some(
                (c) => c.stringIdx === stringIdx && c.fret === 0
              );

              return (
                <div
                  key={`open-${stringIdx}`}
                  style={{ top: `${yPercent}%` }}
                  className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
                >
                  <motion.button
                    type="button"
                    onClick={() => onNoteClick(stringIdx, 0)}
                    onMouseEnter={() =>
                      onHoverNote({
                        stringIdx,
                        fret: 0,
                        note: openInfo.note,
                        intervalName: openInfo.intervalName || 'R',
                        frequency: Math.round(openInfo.frequency),
                      })
                    }
                    onMouseLeave={() => onHoverNote(null)}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-9 h-9 min-w-[36px] min-h-[36px] flex items-center justify-center p-0 bg-transparent border-0 cursor-pointer relative"
                    title={`Open ${str.note} (String ${stringIdx + 1})`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold tracking-tight transition-all duration-150 ${
                        activePluck
                          ? 'bg-gradient-to-tr from-[#FFE082] via-[#D4AD61] to-[#B8852B] text-zinc-950 font-black shadow-[0_0_15px_rgba(212,173,97,0.95)] ring-2 ring-white scale-110 z-40'
                          : isChordActive
                          ? 'bg-[#D4AD61] text-zinc-950 font-bold shadow-[0_0_8px_rgba(212,173,97,0.7)] ring-1 ring-white/60'
                          : isRoot
                          ? 'bg-[#D4AD61] text-zinc-950 font-black shadow-[0_0_6px_rgba(212,173,97,0.5)] ring-1 ring-white/70'
                          : isScaleNote
                          ? 'bg-white/85 dark:bg-[#25201C]/90 hover:bg-white text-[#171717] dark:text-[#E8E6E3] border border-black/15 dark:border-white/20'
                          : 'bg-black/15 dark:bg-black/35 hover:bg-black/30 text-zinc-600 dark:text-zinc-400 border border-transparent'
                      }`}
                    >
                      {activePluck && (
                        <motion.span
                          initial={{ scale: 0.8, opacity: 0.85 }}
                          animate={{ scale: 2.3, opacity: 0 }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                          className="absolute inset-0 rounded-full border-2 border-[#D4AD61] pointer-events-none"
                        />
                      )}
                      {displayMode === 'intervals' ? (openInfo.intervalName || openInfo.note) : openInfo.note}
                    </span>
                  </motion.button>
                </div>
              );
            })}
          </div>

          {/* Frets 1..fretCount Notes */}
          <div className="absolute left-[44px] right-0 top-0 bottom-0">
            {frets.map(({ fret, centerPercent }) => (
              <React.Fragment key={fret}>
                {currentTuning.strings.map((str, stringIdx) => {
                  const yPercent = stringYPercentages[stringIdx];
                  const fretInfo = getFretInfo(str.note, str.octave, fret, selectedKey);
                  const isRoot = fretInfo.interval === 0;
                  const isScaleNote =
                    currentScale.intervals.length > 0 &&
                    fretInfo.interval !== null &&
                    currentScale.intervals.includes(fretInfo.interval);

                  const activePluck = activePlucks.find(
                    (p) => p.stringIdx === stringIdx && p.fret === fret
                  );
                  const isChordActive = activeChordNotes.some(
                    (c) => c.stringIdx === stringIdx && c.fret === fret
                  );
                  const isHovered =
                    hoveredNote?.stringIdx === stringIdx && hoveredNote?.fret === fret;

                  return (
                    <div
                      key={`note-${stringIdx}-${fret}`}
                      style={{
                        left: `${centerPercent}%`,
                        top: `${yPercent}%`,
                      }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 group/node"
                    >
                      <motion.button
                        type="button"
                        onClick={() => onNoteClick(stringIdx, fret)}
                        onMouseEnter={() =>
                          onHoverNote({
                            stringIdx,
                            fret,
                            note: fretInfo.note,
                            intervalName: fretInfo.intervalName || 'R',
                            frequency: Math.round(fretInfo.frequency),
                          })
                        }
                        onMouseLeave={() => onHoverNote(null)}
                        whileHover={{ scale: 1.22 }}
                        whileTap={{ scale: 0.88 }}
                        className="w-9 h-9 min-w-[36px] min-h-[36px] flex items-center justify-center p-0 bg-transparent border-0 cursor-pointer relative"
                        title={`Fret ${fret}, String ${stringIdx + 1} (${fretInfo.note})`}
                      >
                        <span
                          className={`relative flex items-center justify-center font-mono transition-all duration-150 ${
                            activePluck
                              ? 'w-7 h-7 rounded-full bg-gradient-to-tr from-[#FFE082] via-[#D4AD61] to-[#B8852B] text-zinc-950 font-bold text-[11px] shadow-[0_0_18px_rgba(212,173,97,0.95)] ring-2 ring-white z-40 scale-110'
                              : isChordActive
                              ? 'w-6 h-6 rounded-full bg-[#D4AD61] text-zinc-950 font-bold text-[10px] shadow-[0_0_10px_rgba(212,173,97,0.7)] ring-1 ring-white/60 z-35'
                              : isRoot
                              ? 'w-6 h-6 rounded-full bg-[#D4AD61] text-zinc-950 font-black text-[10px] shadow-[0_0_8px_rgba(212,173,97,0.5)] ring-1 ring-white/70 z-30'
                              : isScaleNote
                              ? displayMode === 'clean'
                                ? 'w-3 h-3 rounded-full bg-white/80 dark:bg-white/60 border border-black/20 hover:scale-150 z-20 shadow-xs'
                                : 'w-5.5 h-5.5 rounded-full bg-white/90 dark:bg-[#25201C]/90 hover:bg-white text-[#171717] dark:text-[#E8E6E3] border border-black/15 dark:border-white/20 text-[9px] font-semibold shadow-xs z-20'
                              : isHovered
                              ? 'w-5.5 h-5.5 rounded-full bg-zinc-800 text-zinc-200 border border-zinc-600 text-[9px] z-30'
                              : 'w-4 h-4 rounded-full opacity-25 dark:opacity-20 hover:opacity-100 bg-zinc-800/80 text-zinc-300 border border-zinc-600 text-[8px] z-20'
                          }`}
                        >
                          {/* Ripple Aura on Pluck */}
                          {activePluck && (
                            <motion.span
                              initial={{ scale: 0.9, opacity: 0.85 }}
                              animate={{ scale: 2.4, opacity: 0 }}
                              transition={{ duration: 0.55, ease: 'easeOut' }}
                              className="absolute inset-0 rounded-full border-2 border-[#D4AD61] pointer-events-none"
                            />
                          )}

                          {/* Note / Interval Label */}
                          {displayMode !== 'clean' && !activePluck && !isChordActive ? (
                            displayMode === 'intervals' ? (
                              fretInfo.intervalName || fretInfo.note
                            ) : (
                              fretInfo.note
                            )
                          ) : isChordActive || activePluck ? (
                            displayMode === 'intervals' ? (
                              fretInfo.intervalName || fretInfo.note
                            ) : (
                              fretInfo.note
                            )
                          ) : null}
                        </span>
                      </motion.button>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>

        </div>

      </div>

      {/* 3. Subtle Under-neck Inset Shadow Bar */}
      <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#D4AD61]/25 to-transparent mt-1" />
    </div>
  );
}
