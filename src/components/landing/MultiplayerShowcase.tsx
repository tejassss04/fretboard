'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import BlurReveal from '@/components/ui/BlurReveal';
import MacBookShowcase from './MacBookShowcase';

const CUBIC_EASE = [0.22, 1, 0.36, 1] as const;

export default function MultiplayerShowcase() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="jam" className="relative w-full py-10 sm:py-14 lg:py-20 overflow-hidden scroll-mt-14">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-10 sm:mb-12">
          <BlurReveal
            as="h2"
            delay={0.08}
            className="text-3xl sm:text-4xl lg:text-5xl font-normal text-[#171717] dark:text-[#F5F5F4] tracking-[-0.03em] leading-[1.14] mb-4 text-balance"
          >
            Music is better{' '}
            <span className="font-serif italic text-[1.1em] text-[#38211F] dark:text-[#E9D8B7]">
              together.
            </span>
          </BlurReveal>

          <BlurReveal
            as="p"
            delay={0.14}
            className="text-base sm:text-lg text-[#77746F] dark:text-[#A8A29E] font-normal leading-[1.65]"
          >
            Create a jam room, invite your friends and explore musical ideas together. Whether practicing a lick or exchanging chord progressions, Fretboard brings musicians into the same space.
          </BlurReveal>
        </div>

        {/* MacBook Showcase Centerpiece */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: CUBIC_EASE }}
          className="w-full flex justify-center"
        >
          <MacBookShowcase />
        </motion.div>

      </div>
    </section>
  );
}
