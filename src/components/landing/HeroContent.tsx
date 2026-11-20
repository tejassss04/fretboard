'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import AnnouncementBar from './AnnouncementBar';
import StartPlayingButton from './StartPlayingButton';

interface HeroContentProps {
  onStartPlaying?: () => void;
  onExploreFeatures?: () => void;
}

const CUBIC_EASE = [0.22, 1, 0.36, 1] as const;

export default function HeroContent({ onStartPlaying, onExploreFeatures }: HeroContentProps) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.65,
        ease: CUBIC_EASE,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-start text-left max-w-[560px]"
    >
      {/* Announcement Strip (Still, non-interactive badge) */}
      <div className="mb-6">
        <AnnouncementBar />
      </div>

      {/* Main Editorial Headline with Serif Italic Pairing */}
      <motion.h1
        variants={itemVariants}
        className="text-4xl sm:text-5xl lg:text-[3.75rem] font-normal text-[#171717] dark:text-[#F5F5F4] tracking-tight leading-[1.2] mb-5 text-balance transition-colors"
      >
        Explore the fretboard.{' '}
        <span className="font-serif italic text-[1.12em] text-[#38211F] dark:text-[#E9D8B7] block sm:inline">
          Find your sound.
        </span>
      </motion.h1>

      {/* Supporting Description */}
      <motion.p
        variants={itemVariants}
        className="text-base sm:text-lg text-[#77746F] dark:text-[#A8A29E] font-normal leading-[1.65] max-w-[490px] mb-8 transition-colors"
      >
        Learn scales, discover chord shapes, create beautiful tones and jam with friends — all through an interactive guitar experience that lives right in your browser.
      </motion.p>

      {/* Action Buttons */}
      <motion.div
        variants={itemVariants}
        className="flex flex-wrap items-center gap-4 mb-6"
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
        Pick up where curiosity takes you. No downloads. No plugins. Just play.
      </motion.p>
    </motion.div>
  );
}
