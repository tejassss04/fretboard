'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion, Variants } from 'framer-motion';
import AnnouncementBar from './AnnouncementBar';
import HeroBentoGrid from './HeroBentoGrid';
import StartPlayingButton from './StartPlayingButton';

interface HeroSectionProps {
  onStartPlaying?: () => void;
  onExploreFeatures?: () => void;
}

const CUBIC_EASE = [0.22, 1, 0.36, 1] as const;
const ROTATING_WORDS = ['fretboard', 'chords', 'scales', 'harmony', 'groove'] as const;

export default function HeroSection({ onStartPlaying, onExploreFeatures }: HeroSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const [wordIndex, setWordIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const currentWord = ROTATING_WORDS[wordIndex % ROTATING_WORDS.length];

  // Auto-cycle through words every 2.4 seconds unless hovered
  useEffect(() => {
    if (isHovered || shouldReduceMotion) return;

    const timer = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
    }, 2000);

    return () => clearInterval(timer);
  }, [isHovered, shouldReduceMotion]);

  const handleNextWord = () => {
    setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
  };

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
              {/* Announcement Strip (Still, non-interactive badge) */}
              <motion.div variants={itemVariants} className="mb-6">
                <AnnouncementBar />
              </motion.div>

              {/* Main Editorial Headline with Kinetic Highlight Pill & Serif Accent */}
              <motion.h1
                variants={itemVariants}
                className="text-4xl sm:text-5xl lg:text-[3.75rem] font-normal text-[#171717] dark:text-[#F5F5F4] tracking-[-0.032em] leading-[1.12] mb-5 text-left transition-colors"
              >
                <span className="block">Explore the</span>

                {/* Line 2: Stageshow Kinetic Pill strictly flush-aligned to the left */}
                <span className="block mt-0.5 sm:mt-1">
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={handleNextWord}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleNextWord();
                      }
                    }}
                    title="Click to cycle topic"
                    aria-label={`Cycle topic. Current focus: ${currentWord}`}
                    className="relative inline-block align-baseline whitespace-nowrap cursor-pointer select-none group focus:outline-hidden"
                  >
                    {/* Compact, subtle backdrop gradient pill with hairline border & micro-pixel grid */}
                    <motion.span
                      layout
                      transition={{
                        type: 'spring',
                        stiffness: 480,
                        damping: 36,
                        mass: 0.6,
                      }}
                      className="absolute inset-y-[0.08em] inset-x-0 rounded-md sm:rounded-[7px] bg-gradient-to-r from-[#D4AD61]/12 via-[#E5A836]/08 to-[#241734]/35 border-[0.5px] border-white/10 dark:border-[#D4AD61]/15 group-hover:border-[#D4AD61]/30 pointer-events-none transition-colors duration-200 overflow-hidden"
                      aria-hidden="true"
                    >
                      {/* Micro-pixel grid texture matching the ambient background pixelation */}
                      <span
                        className="absolute inset-0 pointer-events-none opacity-30"
                        style={{
                          backgroundImage: `
                            linear-gradient(to right, rgba(0, 0, 0, 0.4) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(0, 0, 0, 0.4) 1px, transparent 1px)
                          `,
                          backgroundSize: '2.5px 2.5px',
                        }}
                      />
                    </motion.span>

                    {/* Masked vertical word roll with subtle motion blur */}
                    <span className="relative z-10 inline-block overflow-hidden align-baseline px-2 sm:px-2.5 py-0">
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                          key={currentWord}
                          layout="position"
                          initial={
                            shouldReduceMotion
                              ? { opacity: 0 }
                              : { y: '100%', opacity: 0, filter: 'blur(3px)' }
                          }
                          animate={
                            shouldReduceMotion
                              ? { opacity: 1 }
                              : { y: '0%', opacity: 1, filter: 'blur(0px)' }
                          }
                          exit={
                            shouldReduceMotion
                              ? { opacity: 0 }
                              : { y: '-100%', opacity: 0, filter: 'blur(3px)' }
                          }
                          transition={{
                            y: { duration: 0.38, ease: CUBIC_EASE },
                            opacity: { duration: 0.25 },
                            filter: { duration: 0.25 },
                            layout: { type: 'spring', stiffness: 480, damping: 36 },
                          }}
                          className="inline-block font-medium text-[#F5E8D0] tracking-tight transition-transform duration-150 group-active:scale-[0.98]"
                        >
                          {currentWord}
                        </motion.span>
                      </AnimatePresence>
                    </span>
                  </span>

                  {/* Layout-reactive punctuation resting cleanly on baseline */}
                  <motion.span
                    layout
                    transition={{ type: 'spring', stiffness: 480, damping: 36 }}
                    className="inline-block ml-0.5 sm:ml-1 align-baseline"
                  >
                    ,
                  </motion.span>
                </span>

                {/* Line 3: Editorial serif accent flush-aligned on the left */}
                <span className="block font-serif italic text-[1.12em] text-[#38211F] dark:text-[#E9D8B7] mt-0.5 sm:mt-1">
                  Find your sound.
                </span>
              </motion.h1>

              {/* Supporting Description */}
              <motion.p
                variants={itemVariants}
                className="text-base sm:text-lg text-[#77746F] dark:text-[#A8A29E] font-normal leading-[1.65] max-w-lg mb-8 transition-colors"
              >
                Learn scales, discover chord shapes, create beautiful tones and jam with friends, all through an interactive guitar experience that lives right in your browser.
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