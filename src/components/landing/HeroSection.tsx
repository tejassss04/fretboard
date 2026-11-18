'use client';

import React from 'react';
import { motion, useReducedMotion, Variants } from 'framer-motion';
import AnnouncementBar from './AnnouncementBar';
import HeroBentoGrid from './HeroBentoGrid';
import StartPlayingButton from './StartPlayingButton';

interface HeroSectionProps {
  onStartPlaying?: () => void;
  onExploreFeatures?: () => void;
}

const CUBIC_EASE = [0.22, 1, 0.36, 1] as const;

export default function HeroSection({ onStartPlaying, onExploreFeatures }: HeroSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.09,
        delayChildren: shouldReduceMotion ? 0 : 0.06,
      },
    },
  };

  const itemVariants: Variants = shouldReduceMotion
    ? {
        hidden: { opacity: 1, y: 0 },
        visible: { opacity: 1, y: 0 },
      }
    : {
        hidden: { opacity: 0, y: 14, filter: 'blur(6px)' },
        visible: {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          transition: {
            duration: 0.6,
            ease: CUBIC_EASE,
          },
        },
      };

  return (
    <section className="relative w-full overflow-hidden pt-5 sm:pt-8 lg:pt-10 pb-12 sm:pb-16 lg:pb-20">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Editorial Messaging (~42% - 45% width) */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col items-start text-left max-w-xl"
            >
              {/* Announcement Strip */}
              <motion.div variants={itemVariants} className="mb-6">
                <AnnouncementBar onClick={onStartPlaying} />
              </motion.div>

              {/* Main Editorial Headline with Serif Accent */}
              <motion.h1
                variants={itemVariants}
                className="text-4xl sm:text-5xl lg:text-[3.75rem] font-normal text-[#171717] dark:text-[#F5F5F4] tracking-[-0.032em] leading-[1.12] mb-5 text-balance transition-colors"
              >
                Explore the fretboard.{' '}
                <span className="font-serif italic text-[1.12em] text-[#38211F] dark:text-[#E9D8B7] block sm:inline">
                  Find your sound.
                </span>
              </motion.h1>

              {/* Supporting Description */}
              <motion.p
                variants={itemVariants}
                className="text-base sm:text-lg text-[#77746F] dark:text-[#A8A29E] font-normal leading-[1.65] max-w-lg mb-8 transition-colors"
              >
                Learn scales, discover chord shapes, create beautiful tones and jam with friends — all through an interactive guitar experience that lives right in your browser.
              </motion.p>

              {/* Action Buttons */}
              <motion.div
                variants={itemVariants}
                className="flex flex-wrap items-center gap-3.5 mb-6"
              >
                {/* Primary Pill Button */}
                <StartPlayingButton onClick={onStartPlaying} />

                {/* Secondary Ghost Pill Button */}
                <button
                  onClick={onExploreFeatures}
                  className="inline-flex items-center px-4 py-3.5 rounded-full text-sm font-medium text-[#77746F] dark:text-[#A8A29E] hover:text-[#171717] dark:hover:text-[#F5F5F4] hover:bg-[#F7F6F3] dark:hover:bg-[#171513] transition-colors duration-200 cursor-pointer"
                >
                  Explore features
                </button>
              </motion.div>

              {/* Reassurance Statement */}
              <motion.p
                variants={itemVariants}
                className="text-xs text-[#77746F] dark:text-[#A8A29E] tracking-tight font-normal transition-colors"
              >
                No downloads. No plugins. Just play.
              </motion.p>
            </motion.div>
          </div>

          {/* Right Column: Asymmetric Bento Grid Overview (~55% - 58% width) */}
          <div className="lg:col-span-7 flex items-center justify-center lg:justify-end w-full">
            <HeroBentoGrid />
          </div>

        </div>
      </div>
    </section>
  );
}
