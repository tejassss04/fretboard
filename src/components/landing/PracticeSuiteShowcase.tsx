'use client';

import React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Microphone,
  Metronome,
  BookOpen,
  Stack,
  MusicNotes,
  TrendUp,
  ArrowRight,
  Sparkle,
} from '@phosphor-icons/react';
import BlurReveal from '@/components/ui/BlurReveal';

const CUBIC_EASE = [0.22, 1, 0.36, 1] as const;

interface ToolCard {
  title: string;
  tag: string;
  description: string;
  href: string;
  icon: React.ElementType;
  previewNote: string;
  badge: string;
}

const TOOLS: ToolCard[] = [
  {
    title: 'Chromatic Tuner',
    tag: 'AUDIO ENGINE',
    description: 'Real-time microphone auto-correlation pitch detection with precision cent needle and 6-string reference tones.',
    href: '/tuner',
    icon: Microphone,
    previewNote: '±4¢ Accuracy',
    badge: 'Standard E-A-D-G-B-e',
  },
  {
    title: 'Tap Metronome',
    tag: 'RHYTHM ENGINE',
    description: 'Adaptive tap tempo averaging with variable time signatures (2/4, 3/4, 4/4, 6/8) and synthesized clicks.',
    href: '/metronome',
    icon: Metronome,
    previewNote: '30–260 BPM',
    badge: '4 Time Signatures',
  },
  {
    title: 'Chord Voicings',
    tag: 'HARMONY',
    description: 'Explore open and barre chord shapes with interactive neck diagrams, finger placements, and audio strums.',
    href: '/chords',
    icon: BookOpen,
    previewNote: 'Open & Barre',
    badge: 'Finger Mechanics',
  },
  {
    title: 'Scale & Mode Matrix',
    tag: 'THEORY ENGINE',
    description: 'Visualize modal formulas across 12 root keys with degree intervals, ascending playback, and fretboard highlighting.',
    href: '/scales',
    icon: Stack,
    previewNote: '12 Keys • 5 Boxes',
    badge: 'Modal Intervals',
  },
  {
    title: 'Song Repertoire Vault',
    tag: 'PRACTICE LIBRARY',
    description: 'Organize chord progressions, track mastery percentage across pieces, and preview strums with Web Audio.',
    href: '/songs',
    icon: MusicNotes,
    previewNote: 'Active Rotation',
    badge: 'Local-First Vault',
  },
  {
    title: 'Practice Telemetry',
    tag: 'CONSISTENCY LOG',
    description: '30-day rhythm calendar heatmap, weekly practice volume tracking, and streak achievement badges.',
    href: '/progress',
    icon: TrendUp,
    previewNote: 'Daily Streak',
    badge: 'Session Heatmap',
  },
];

export default function PracticeSuiteShowcase() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="tools" className="relative w-full py-10 sm:py-14 lg:py-16 overflow-hidden scroll-mt-14">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-8 sm:mb-10">
          <BlurReveal
            delay={0}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F7F6F3] dark:bg-[#1A1816] border border-[#EAE8E4] dark:border-white/10 text-[11px] font-mono font-medium text-[#77746F] dark:text-[#A8A29E] mb-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
          >
            <Sparkle size={12} weight="regular" className="text-[#D4AD61]" />
            <span>PRACTICE COMPANION SUITE</span>
          </BlurReveal>

          <BlurReveal
            as="h2"
            delay={0.08}
            className="text-3xl sm:text-4xl lg:text-5xl font-normal text-[#171717] dark:text-[#F5F5F4] tracking-[-0.03em] leading-[1.14] mb-3 text-balance"
          >
            Tools built for{' '}
            <span className="font-serif italic text-[1.1em] text-[#38211F] dark:text-[#E9D8B7]">
              deliberate progress.
            </span>
          </BlurReveal>

          <BlurReveal
            as="p"
            delay={0.14}
            className="text-sm sm:text-base text-[#77746F] dark:text-[#A8A29E] leading-relaxed max-w-2xl"
          >
            All features run locally in your browser with zero latency Web Audio synthesis and local-first persistence.
          </BlurReveal>
        </div>

        {/* 6-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOOLS.map((tool, idx) => {
            const Icon = tool.icon;
            return (
              <motion.div
                key={tool.title}
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: idx * 0.05, ease: CUBIC_EASE }}
              >
                <Link
                  href={tool.href}
                  className="group flex flex-col justify-between h-full p-5 rounded-2xl bg-white/80 dark:bg-[#15111B]/75 backdrop-blur-md border border-[#EAE8E4]/70 dark:border-white/[0.06] hover:border-[#D4AD61]/45 dark:hover:border-[#D4AD61]/35 shadow-[0_10px_30px_rgba(23,23,23,0.03)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_20px_45px_rgba(0,0,0,0.3)] hover:shadow-[0_14px_34px_rgba(23,23,23,0.06)] dark:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_22px_50px_rgba(0,0,0,0.45)] transition-all duration-250"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="w-8 h-8 rounded-xl bg-[#F7F6F3] dark:bg-[#1A1816] border border-[#EAE8E4] dark:border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] flex items-center justify-center text-[#171717] dark:text-[#F5F5F4] group-hover:text-[#D4AD61] transition-colors">
                        <Icon size={16} weight="regular" />
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#77746F] dark:text-[#A8A29E]">
                        {tool.tag}
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-[#171717] dark:text-[#F5F5F4] tracking-tight leading-[1.2] group-hover:text-[#D4AD61] transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-xs text-[#77746F] dark:text-[#A8A29E] leading-relaxed mt-1 mb-4">
                      {tool.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#EAE8E4]/60 dark:border-white/5 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#77746F] dark:text-[#A8A29E]">
                      {tool.previewNote}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#171717] dark:text-[#F5F5F4] group-hover:translate-x-0.5 transition-transform">
                      <span>Open</span>
                      <ArrowRight size={13} className="text-[#D4AD61]" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
