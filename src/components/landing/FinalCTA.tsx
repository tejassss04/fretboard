'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { MusicNotes } from '@phosphor-icons/react';
import BlurReveal from '@/components/ui/BlurReveal';
import StartPlayingButton from './StartPlayingButton';

const CUBIC_EASE = [0.22, 1, 0.36, 1] as const;

interface FinalCTAProps {
  onStartPlaying?: () => void;
}

export default function FinalCTA({ onStartPlaying }: FinalCTAProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative w-full py-12 sm:py-16 lg:py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative text-center z-10">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          
          {/* Headline */}
          <BlurReveal
            as="h2"
            delay={0.08}
            className="text-4xl sm:text-5xl lg:text-6xl font-normal text-[#171717] dark:text-[#F5F5F4] tracking-[-0.032em] leading-[1.12] mb-6 text-balance"
          >
            Your next note is{' '}
            <span className="font-serif italic text-[1.1em] text-[#38211F] dark:text-[#E9D8B7]">
              waiting.
            </span>
          </BlurReveal>

          {/* Description */}
          <BlurReveal
            as="p"
            delay={0.14}
            className="text-base sm:text-lg text-[#77746F] dark:text-[#A8A29E] font-normal leading-[1.65] max-w-xl text-balance mb-10"
          >
            Explore the fretboard, discover your sound and start playing.
          </BlurReveal>

          {/* Action CTA */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.2, ease: CUBIC_EASE }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <StartPlayingButton onClick={onStartPlaying} />
          </motion.div>

          {/* Restrained Calm Divider */}
          <div className="mt-14 w-64 flex items-center justify-center gap-3 opacity-60">
            <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#D4AD61]/70" />
            <MusicNotes size={13} weight="regular" className="text-[#D4AD61]" />
            <span className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#D4AD61]/70" />
          </div>

        </div>
      </div>
    </section>
  );
}
