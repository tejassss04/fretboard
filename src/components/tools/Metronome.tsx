'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Play, Pause, ArrowCounterClockwise, Sparkle } from '@phosphor-icons/react';
import { getAudioEngine } from '@/lib/audio';

const TIME_SIGNATURES = [
  { id: '2/4', count: 2, label: '2/4' },
  { id: '3/4', count: 3, label: '3/4' },
  { id: '4/4', count: 4, label: '4/4' },
  { id: '5/4', count: 5, label: '5/4' },
  { id: '6/8', count: 6, label: '6/8' },
];

const TEMPO_PRESETS = [
  { label: 'Largo', bpm: 52 },
  { label: 'Adagio', bpm: 68 },
  { label: 'Andante', bpm: 88 },
  { label: 'Moderato', bpm: 108 },
  { label: 'Allegro', bpm: 132 },
  { label: 'Vivace', bpm: 156 },
  { label: 'Presto', bpm: 184 },
];

function getTempoMarking(bpm: number): string {
  if (bpm < 50) return 'Grave';
  if (bpm < 65) return 'Largo';
  if (bpm < 76) return 'Adagio';
  if (bpm < 108) return 'Andante';
  if (bpm < 120) return 'Moderato';
  if (bpm < 144) return 'Allegro';
  if (bpm < 176) return 'Vivace';
  return 'Presto';
}

export default function Metronome() {
  const [bpm, setBpm] = useState(108);
  const [playing, setPlaying] = useState(false);
  const [beat, setBeat] = useState(0);
  const [signature, setSignature] = useState(4);
  const [tapActive, setTapActive] = useState(false);

  const shouldReduceMotion = useReducedMotion();
  const timerRef = useRef<number | null>(null);
  const tapTimesRef = useRef<number[]>([]);

  const tick = useCallback(() => {
    setBeat((prev) => {
      const next = (prev + 1) % signature;
      try {
        const audio = getAudioEngine();
        audio.playClick(next === 0);
      } catch {
        // Audio fallback
      }
      return next;
    });
  }, [signature]);

  useEffect(() => {
    if (!playing) return;
    const interval = (60 / bpm) * 1000;
    const id = window.setInterval(tick, interval);
    timerRef.current = id;
    return () => clearInterval(id);
  }, [bpm, playing, tick]);

  const handleBpmChange = (newBpm: number) => {
    setBpm(Math.min(260, Math.max(30, Math.round(newBpm))));
  };

  const handleSignatureChange = (count: number) => {
    setSignature(count);
    setBeat(0);
  };

  // Tap tempo detector
  const handleTap = () => {
    setTapActive(true);
    setTimeout(() => setTapActive(false), 140);

    const now = performance.now();
    const taps = tapTimesRef.current;

    if (taps.length > 0 && now - taps[taps.length - 1] > 2400) {
      tapTimesRef.current = [now];
      return;
    }

    taps.push(now);
    if (taps.length > 4) taps.shift();

    if (taps.length >= 2) {
      const intervals = [];
      for (let i = 1; i < taps.length; i++) {
        intervals.push(taps[i] - taps[i - 1]);
      }
      const avg = intervals.reduce((a, b) => a + b) / intervals.length;
      const calculatedBpm = Math.round(60000 / avg);
      if (calculatedBpm >= 30 && calculatedBpm <= 260) {
        setBpm(calculatedBpm);
      }
    }
  };

  const tempoMarking = getTempoMarking(bpm);
  const beatDuration = (60 / bpm).toFixed(2);
  const pendulumAngle = playing ? (beat % 2 === 0 ? -18 : 18) : 0;

  return (
    <div className="w-full rounded-3xl bg-[#FCFBF9] dark:bg-[#12100E] border border-[#EAE8E4] dark:border-white/10 p-6 sm:p-8 lg:p-10 shadow-[0_20px_50px_rgba(23,23,23,0.04)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.5)] select-none transition-colors">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-5 border-b border-[#EAE8E4] dark:border-white/10">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D4AD61] shadow-[0_0_8px_rgba(212,173,97,0.7)]" />
          <div>
            <div className="text-[11px] font-mono font-bold tracking-[0.14em] uppercase text-[#171717] dark:text-[#F5F5F4]">
              Studio Metronome
            </div>
            <div className="text-[10px] font-mono text-[#77746F] dark:text-[#A8A29E]">
              Zero-latency click synthesis • {beatDuration}s / beat
            </div>
          </div>
        </div>

        {/* Time Signature Segmented Control */}
        <div className="flex items-center gap-1 bg-[#F1F0ED] dark:bg-[#1A1816] p-1 rounded-xl border border-[#EAE8E4] dark:border-white/10">
          {TIME_SIGNATURES.map((sig) => (
            <button
              key={sig.id}
              type="button"
              onClick={() => handleSignatureChange(sig.count)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                signature === sig.count
                  ? 'bg-white dark:bg-[#25221F] text-[#171717] dark:text-[#F5F5F4] shadow-xs'
                  : 'text-[#77746F] dark:text-[#A8A29E] hover:text-[#171717] dark:hover:text-white'
              }`}
            >
              {sig.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Visual Center Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-2">
        
        {/* Left Side: Mechanical Pendulum Chamber */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-[#F7F6F3] dark:bg-[#181614] border border-[#EAE8E4] dark:border-white/10">
          <div className="relative w-36 h-48 flex items-end justify-center overflow-hidden">
            {/* Background calibration tick marks */}
            <div className="absolute inset-x-0 top-3 flex justify-between px-3 text-[9px] font-mono text-[#77746F]/60 dark:text-[#A8A29E]/60">
              <span>L</span>
              <span>•</span>
              <span>C</span>
              <span>•</span>
              <span>R</span>
            </div>

            {/* Pivot Arc */}
            <div className="absolute bottom-2 inset-x-4 h-24 border-t border-dashed border-[#D4AD61]/30 rounded-t-full pointer-events-none" />

            {/* Pendulum Arm */}
            <motion.div
              animate={{ rotate: shouldReduceMotion ? 0 : pendulumAngle }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 18,
              }}
              style={{ transformOrigin: 'bottom center' }}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[3px] h-36 bg-gradient-to-t from-[#B8852B] via-[#D4AD61] to-[#FFE082] rounded-full shadow-md z-10 flex flex-col items-center justify-start pt-4"
            >
              {/* Sliding Bob Weight */}
              <div className="w-5 h-7 rounded-sm bg-gradient-to-b from-[#FAF5E6] to-[#D4AD61] shadow-md border border-[#8C6B24] flex items-center justify-center">
                <div className="w-3 h-[1px] bg-zinc-700/40" />
              </div>
            </motion.div>

            {/* Heavy Brass Pivot Base */}
            <div className="absolute bottom-1 w-8 h-4 rounded-t-lg bg-[#271A19] border border-[#D4AD61]/50 shadow-md z-20" />
          </div>

          <span className="mt-3 text-[10px] font-mono uppercase tracking-wider text-[#77746F] dark:text-[#A8A29E]">
            {playing ? 'Active Pulse' : 'Oscillator Quiescent'}
          </span>
        </div>

        {/* Right Side: Primary Digits, LED Beat Strip, Stepper */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center text-center">
          
          {/* Animated Beat Indicator Strip */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 mb-6 flex-wrap justify-center">
            {Array.from({ length: signature }).map((_, idx) => {
              const isCurrentBeat = playing && beat === idx;
              const isAccent = idx === 0;

              return (
                <motion.div
                  key={idx}
                  animate={{
                    scale: isCurrentBeat ? 1.25 : 1,
                    opacity: isCurrentBeat ? 1 : 0.45,
                  }}
                  transition={{ duration: 0.08 }}
                  className={`rounded-xl flex items-center justify-center font-mono text-xs font-bold transition-all ${
                    isAccent
                      ? isCurrentBeat
                        ? 'w-11 h-11 bg-[#D4AD61] text-zinc-950 shadow-[0_0_16px_rgba(212,173,97,0.9)] ring-2 ring-white dark:ring-[#D4AD61]/50'
                        : 'w-10 h-10 bg-[#D4AD61]/20 border border-[#D4AD61]/60 text-[#D4AD61]'
                      : isCurrentBeat
                      ? 'w-10 h-10 bg-[#171717] dark:bg-[#F5F5F4] text-white dark:text-[#171717] shadow-sm'
                      : 'w-9 h-9 bg-[#F1F0ED] dark:bg-[#201D1A] text-[#77746F] dark:text-[#A8A29E] border border-[#EAE8E4] dark:border-white/10'
                  }`}
                >
                  {idx + 1}
                </motion.div>
              );
            })}
          </div>

          {/* Italian Tempo Classification + Giant Monospace BPM */}
          <div className="flex flex-col items-center mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-mono uppercase tracking-wider bg-[#F5EEDF] dark:bg-[#201D1A] text-[#9E7A32] dark:text-[#D4AD61] border border-[#E9D8B7] dark:border-white/10 mb-2">
              <Sparkle size={11} weight="regular" />
              <span>{tempoMarking}</span>
            </span>

            <div className="flex items-baseline gap-2">
              <span className="text-7xl sm:text-8xl font-mono font-bold text-[#171717] dark:text-[#F5F5F4] tracking-tight tabular-nums">
                {bpm}
              </span>
              <span className="text-sm font-mono text-[#77746F] dark:text-[#A8A29E] font-semibold">BPM</span>
            </div>
          </div>

          {/* Tactile Range Slider */}
          <div className="w-full max-w-md flex flex-col items-center gap-4 mb-6">
            <input
              type="range"
              min="30"
              max="260"
              value={bpm}
              onChange={(e) => handleBpmChange(Number(e.target.value))}
              className="w-full h-2 bg-[#EAE8E4] dark:bg-[#201D1A] rounded-lg appearance-none cursor-pointer accent-[#D4AD61]"
            />

            {/* Tactile Stepper Strip */}
            <div className="flex items-center gap-2">
              {[-5, -1, 1, 5].map((delta) => (
                <button
                  key={delta}
                  type="button"
                  onClick={() => handleBpmChange(bpm + delta)}
                  className="px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold bg-[#F7F6F3] dark:bg-[#1A1816] border border-[#EAE8E4] dark:border-white/10 hover:border-[#D4AD61]/50 text-[#171717] dark:text-[#F5F5F4] transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  {delta > 0 ? `+${delta}` : delta}
                </button>
              ))}
            </div>
          </div>

          {/* Action Triggers */}
          <div className="flex items-center gap-3.5 flex-wrap justify-center">
            {/* Primary Start / Pause Pill Button */}
            <button
              type="button"
              onClick={() => {
                setPlaying(!playing);
                setBeat(0);
              }}
              className={`inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full text-xs font-semibold tracking-tight transition-all duration-200 cursor-pointer shadow-md active:scale-95 ${
                playing
                  ? 'bg-[#D4AD61] text-zinc-950 hover:bg-[#c99f4f] ring-2 ring-[#D4AD61]/50'
                  : 'bg-[#171717] dark:bg-[#F5F5F4] hover:bg-[#2b2b2b] dark:hover:bg-white text-white dark:text-[#171717]'
              }`}
            >
              {playing ? (
                <>
                  <Pause size={15} weight="regular" />
                  <span>Pause Metronome</span>
                </>
              ) : (
                <>
                  <Play size={15} weight="regular" />
                  <span>Start Metronome</span>
                </>
              )}
            </button>

            {/* Tap Tempo Button with Flash Reaction */}
            <button
              type="button"
              onClick={handleTap}
              className={`inline-flex items-center gap-2 px-5 py-3.5 rounded-full text-xs font-mono font-medium transition-all cursor-pointer border active:scale-95 ${
                tapActive
                  ? 'bg-[#D4AD61] text-zinc-950 border-[#D4AD61]'
                  : 'bg-[#F7F6F3] dark:bg-[#1A1816] hover:bg-[#F1F0ED] dark:hover:bg-[#201D1A] border-[#EAE8E4] dark:border-white/10 text-[#77746F] dark:text-[#A8A29E]'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${tapActive ? 'bg-zinc-950' : 'bg-[#D4AD61]'}`} />
              <span>TAP TEMPO</span>
            </button>

            {/* Reset Button */}
            <button
              type="button"
              onClick={() => handleBpmChange(108)}
              title="Reset to 108 BPM"
              className="w-11 h-11 rounded-full flex items-center justify-center text-[#77746F] dark:text-[#A8A29E] bg-[#F7F6F3] dark:bg-[#1A1816] hover:bg-[#F1F0ED] dark:hover:bg-[#201D1A] border border-[#EAE8E4] dark:border-white/10 hover:border-[#D4AD61]/50 transition-all cursor-pointer active:scale-95"
            >
              <ArrowCounterClockwise size={14} weight="regular" />
            </button>
          </div>

        </div>
      </div>

      {/* 3. Quick Italian Tempo Presets Strip */}
      <div className="mt-8 pt-6 border-t border-[#EAE8E4] dark:border-white/10">
        <div className="flex items-center justify-between mb-3 text-[11px] font-mono text-[#77746F] dark:text-[#A8A29E]">
          <span className="font-semibold uppercase tracking-wider">Historical Tempo Presets</span>
          <span>Click to snap BPM</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {TEMPO_PRESETS.map((preset) => {
            const isCurrent = bpm === preset.bpm;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleBpmChange(preset.bpm)}
                className={`py-2 px-3 rounded-xl border text-center font-mono transition-all cursor-pointer shadow-xs ${
                  isCurrent
                    ? 'bg-[#D4AD61] text-zinc-950 border-[#D4AD61] font-bold shadow-xs'
                    : 'bg-[#F7F6F3] dark:bg-[#1A1816] border-[#EAE8E4] dark:border-white/10 hover:border-[#D4AD61]/50 text-[#171717] dark:text-[#F5F5F4]'
                }`}
              >
                <div className="text-xs font-semibold">{preset.label}</div>
                <div className={`text-[10px] ${isCurrent ? 'text-zinc-900' : 'text-[#77746F] dark:text-[#A8A29E]'}`}>
                  {preset.bpm} BPM
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
