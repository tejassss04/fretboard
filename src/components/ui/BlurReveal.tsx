'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export const EDITORIAL_EASE = [0.22, 1, 0.36, 1] as const;

interface BlurRevealProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  className?: string;
  as?: 'div' | 'h1' | 'h2' | 'h3' | 'p' | 'span';
  /** Set true for above-the-fold hero elements that animate on mount instead of scroll */
  immediate?: boolean;
}

/**
 * Editorial blur-to-reveal transition wrapper using Motion.
 * Transitions smoothly from subtle blur + offset into sharp focus while
 * honoring `prefers-reduced-motion`.
 */
export default function BlurReveal({
  children,
  delay = 0,
  duration = 0.55,
  y = 12,
  className = '',
  as = 'div',
  immediate = false,
}: BlurRevealProps) {
  const shouldReduceMotion = useReducedMotion();
  const Component = motion[as];

  if (shouldReduceMotion) {
    const PlainTag = as;
    return <PlainTag className={className}>{children}</PlainTag>;
  }

  if (immediate) {
    return (
      <Component
        initial={{ opacity: 0, y, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration, delay, ease: EDITORIAL_EASE }}
        className={className}
      >
        {children}
      </Component>
    );
  }

  return (
    <Component
      initial={{ opacity: 0, y, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-48px' }}
      transition={{ duration, delay, ease: EDITORIAL_EASE }}
      className={className}
    >
      {children}
    </Component>
  );
}

