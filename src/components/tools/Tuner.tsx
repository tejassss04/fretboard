'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Microphone, MicrophoneSlash, SpeakerHigh, Waveform, CheckCircle } from '@phosphor-icons/react';
import { autoCorrelate, noteFromFrequency } from '@/lib/music';
import { getAudioEngine } from '@/lib/audio';

type AudioRefs = {
  stream: MediaStream;
  context: AudioContext;
  analyser: AnalyserNode;
};

type Target = { stringNum: number; note: string; octave: number; hz: number; gauge: string };

const STANDARD_STRINGS: Target[] = [
  { stringNum: 6, note: 'E', octave: 2, hz: 82.41, gauge: '0.046"' },
  { stringNum: 5, note: 'A', octave: 2, hz: 110.0, gauge: '0.036"' },
  { stringNum: 4, note: 'D', octave: 3, hz: 146.83, gauge: '0.026"' },
  { stringNum: 3, note: 'G', octave: 3, hz: 196.0, gauge: '0.017"' },
  { stringNum: 2, note: 'B', octave: 3, hz: 246.94, gauge: '0.013"' },
  { stringNum: 1, note: 'E', octave: 4, hz: 329.63, gauge: '0.010"' },
];

export default function Tuner() {
  const [isListening, setIsListening] = useState(false);
  const [detectedNote, setDetectedNote] = useState('—');
  const [frequency, setFrequency] = useState(0);
  const [cents, setCents] = useState(0);
  const [message, setMessage] = useState('Click "Start Tuner" to enable microphone or pick reference strings below.');
  const [activeRefString, setActiveRefString] = useState<number | null>(null);

  const shouldReduceMotion = useReducedMotion();
  const audioRef = useRef<AudioRefs | null>(null);
  const frameRef = useRef(0);

  const stop = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    audioRef.current?.stream.getTracks().forEach((track) => track.stop());
    if (audioRef.current?.context.state !== 'closed') {
      audioRef.current?.context.close();
    }
    audioRef.current = null;
    setIsListening(false);
    setDetectedNote('—');
    setFrequency(0);
    setCents(0);
    setMessage('Tuner in standby. Tap start to resume detection.');
  }, []);

  useEffect(() => () => stop(), [stop]);

  const start = async () => {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setMessage('Microphone input is not available in this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const context = new AudioCtx();
      const analyser = context.createAnalyser();
      analyser.fftSize = 2048;

      const source = context.createMediaStreamSource(stream);
      source.connect(analyser);

      audioRef.current = { stream, context, analyser };
      setIsListening(true);
      setMessage('Listening for guitar strings... Pluck any string clearly.');

      const buffer = new Float32Array(analyser.fftSize);

      const update = () => {
        analyser.getFloatTimeDomainData(buffer);
        const pitch = autoCorrelate(buffer, context.sampleRate);

        if (pitch !== -1 && pitch > 60 && pitch < 1200) {
          const info = noteFromFrequency(pitch);
          setFrequency(Math.round(pitch * 10) / 10);
          setDetectedNote(info.note);
          setCents(info.cents);

          if (Math.abs(info.cents) <= 3) {
            setMessage(`In Tune • Pitch exact for ${info.note}`);
          } else if (info.cents < 0) {
            setMessage(`Flat (${info.cents}¢) • Tighten tuning peg`);
          } else {
            setMessage(`Sharp (+${info.cents}¢) • Loosen tuning peg`);
          }
        }

        frameRef.current = requestAnimationFrame(update);
      };

      update();
    } catch {
      setMessage('Microphone permission denied. Grant access to use chromatic tuner.');
      setIsListening(false);
    }
  };

  const playReferenceTone = (target: Target) => {
    try {
      const audio = getAudioEngine();
      audio.playNote(target.hz, 0.85);
      setActiveRefString(target.stringNum);
      setTimeout(() => setActiveRefString(null), 850);
    } catch {
      // Audio fallback
    }
  };

  const isInTune = Math.abs(cents) <= 3 && frequency > 0;
  const needleDeg = Math.max(-45, Math.min(45, (cents / 50) * 45));

  return (
    <div className="w-full rounded-3xl bg-[#FCFBF9] dark:bg-[#12100E] border border-[#EAE8E4] dark:border-white/10 p-6 sm:p-8 lg:p-10 shadow-[0_20px_50px_rgba(23,23,23,0.04)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.5)] select-none transition-colors">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-5 border-b border-[#EAE8E4] dark:border-white/10">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D4AD61] shadow-[0_0_8px_rgba(212,173,97,0.7)]" />
          <div>
            <div className="text-[11px] font-mono font-bold tracking-[0.14em] uppercase text-[#171717] dark:text-[#F5F5F4]">
              Studio Chromatic Tuner
            </div>
            <div className="text-[10px] font-mono text-[#77746F] dark:text-[#A8A29E]">
              Autocorrelation pitch detection • ±0.1 Hz accuracy
            </div>
          </div>
        </div>

        {/* Live Status Chip */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F7F6F3] dark:bg-[#1A1816] border border-[#EAE8E4] dark:border-white/10 text-xs font-mono">
            <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`} />
            <span className="text-[#171717] dark:text-[#E8E6E3] font-medium">
              {isListening ? 'Microphone Active' : 'Standby'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Pitch Dial & Dial Center */}
      <div className="flex flex-col items-center justify-center py-4 text-center">
        
        {/* Semi-circular Tuning Meter Dial */}
        <div className="relative w-[260px] sm:w-72 h-[130px] sm:h-36 flex items-end justify-center mb-4 overflow-hidden max-w-full">
          {/* Dial Arc Track */}
          <div className="absolute inset-0 rounded-t-full border-[12px] border-[#F1F0ED] dark:border-[#201D1A] border-b-0" />
          
          {/* Center Sweet Spot Target Bracket */}
          <div className="absolute bottom-0 w-12 h-12 rounded-full border-t-4 border-[#D4AD61] -translate-y-1/2" />
          <div className={`absolute bottom-0 w-2 h-2 rounded-full -translate-y-6 ${isInTune ? 'bg-emerald-500 shadow-[0_0_12px_#10B981]' : 'bg-[#D4AD61]'}`} />

          {/* Radial Tick Lines */}
          <div className="absolute inset-x-6 sm:inset-x-8 top-2 sm:top-3 flex justify-between text-[8px] sm:text-[9px] font-mono text-[#77746F] dark:text-[#A8A29E] pointer-events-none">
            <span>-50¢</span>
            <span>-25¢</span>
            <span className="text-[#D4AD61] font-bold">0¢</span>
            <span>+25¢</span>
            <span>+50¢</span>
          </div>

          {/* Animated Needle */}
          <motion.div
            animate={{ rotate: shouldReduceMotion ? 0 : (isListening && frequency > 0 ? needleDeg : 0) }}
            transition={{ type: 'spring', stiffness: 220, damping: 20 }}
            className="absolute bottom-0 left-1/2 w-1.5 h-28 sm:h-32 -translate-x-1/2 origin-bottom rounded-full shadow-md z-10 transition-colors"
            style={{
              background: isInTune
                ? '#10B981'
                : 'linear-gradient(to top, #271A19, #D4AD61, #FFE082)',
            }}
          >
            <div className={`w-3.5 h-3.5 rounded-full -translate-x-[3px] -translate-y-1 ${isInTune ? 'bg-emerald-500 shadow-[0_0_10px_#10B981]' : 'bg-[#D4AD61] shadow-[0_0_8px_rgba(212,173,97,0.8)]'}`} />
          </motion.div>

          {/* Heavy Brass Pivot Base */}
          <div className="absolute bottom-0 w-8 h-8 rounded-full bg-[#271A19] border border-[#D4AD61]/60 -translate-y-2 z-20 shadow-md flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-[#D4AD61]" />
          </div>
        </div>

        {/* Pitch Reading & Big Note Display */}
        <div className="flex flex-col items-center mb-4">
          <div className={`relative z-10 inline-flex items-center justify-center text-6xl sm:text-7xl md:text-8xl font-mono font-bold tracking-tight transition-all duration-300 tabular-nums ${
            isInTune ? 'text-emerald-500 scale-[1.03]' : 'text-[#171717] dark:text-[#F5F5F4]'
          }`}>
            {isInTune && !shouldReduceMotion && (
              <span
                aria-hidden
                className="pointer-events-none absolute -inset-4 rounded-full border border-emerald-500/30 animate-ping"
                style={{ animationDuration: '2.2s' }}
              />
            )}
            {detectedNote}
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[#77746F] dark:text-[#A8A29E] mt-1">
            <span>{frequency > 0 ? `${frequency} Hz` : '— Hz'}</span>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <span className={`font-semibold ${isInTune ? 'text-emerald-500' : cents !== 0 ? 'text-[#D4AD61]' : ''}`}>
              {frequency > 0 ? (cents > 0 ? `+${cents} cents` : `${cents} cents`) : '0 cents'}
            </span>
          </div>
        </div>

        {/* Status Message Pill */}
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium border mb-7 transition-all ${
          isInTune
            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
            : 'bg-[#F7F6F3] dark:bg-[#1A1816] border-[#EAE8E4] dark:border-white/10 text-[#77746F] dark:text-[#A8A29E]'
        }`}>
          {isInTune ? <CheckCircle size={13} weight="fill" /> : <Waveform size={13} weight="regular" />}
          <span>{message}</span>
        </div>

        {/* Primary Toggle Button */}
        <button
          type="button"
          onClick={isListening ? stop : start}
          className={`inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full text-xs font-semibold tracking-tight transition-all duration-200 cursor-pointer shadow-md active:scale-95 ${
            isListening
              ? 'bg-[#271A19] text-[#E8DFD3] border border-[#D4AD61]/50 hover:bg-[#38211F]'
              : 'bg-[#171717] dark:bg-[#F5F5F4] hover:bg-[#2b2b2b] dark:hover:bg-white text-white dark:text-[#171717]'
          }`}
        >
          {isListening ? (
            <>
              <MicrophoneSlash size={15} weight="regular" />
              <span>Stop Tuner</span>
            </>
          ) : (
            <>
              <Microphone size={15} weight="regular" />
              <span>Start Microphone Tuner</span>
            </>
          )}
        </button>
      </div>

      {/* 3. Reference String Generator Pegboard */}
      <div className="mt-8 pt-6 border-t border-[#EAE8E4] dark:border-white/10">
        <div className="flex items-center justify-between mb-3 text-[11px] font-mono text-[#77746F] dark:text-[#A8A29E]">
          <span className="inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider">
            <SpeakerHigh size={13} weight="regular" className="text-[#D4AD61]" />
            Reference Tone Generator (Standard EADGBE)
          </span>
          <span>Click to audition tone</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
          {STANDARD_STRINGS.map((target) => {
            const isPlaying = activeRefString === target.stringNum;
            return (
              <button
                key={target.stringNum}
                type="button"
                onClick={() => playReferenceTone(target)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all cursor-pointer shadow-xs ${
                  isPlaying
                    ? 'bg-[#E9D8B7]/30 dark:bg-[#D4AD61]/25 border-[#D4AD61] text-[#D4AD61] ring-2 ring-[#D4AD61]/60'
                    : 'bg-[#F7F6F3] dark:bg-[#1A1816] hover:bg-white dark:hover:bg-[#24201D] border-[#EAE8E4] dark:border-white/10 hover:border-[#D4AD61]/50'
                }`}
              >
                <span className="text-[11px] font-mono text-[#77746F] dark:text-[#A8A29E]">
                  String {target.stringNum} • {target.gauge}
                </span>
                <span className="text-lg font-sans font-bold tracking-tight text-[#171717] dark:text-[#F5F5F4] my-0.5 tabular-nums">
                  {target.note}{target.octave}
                </span>
                <span className="text-[10px] font-mono text-[#D4AD61]">
                  {target.hz} Hz
                </span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
