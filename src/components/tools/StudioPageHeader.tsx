'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft } from '@phosphor-icons/react';

export interface StudioPageHeaderProps {
  titleLeading: React.ReactNode;
  titleAccent: React.ReactNode;
  description: string;
  eyebrow?: string;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
  showQuickNav?: boolean;
  align?: 'left' | 'center';
}

const STUDIO_ROUTES = [
  { href: '/fretboard', label: 'Fretboard' },
  { href: '/chords', label: 'Chords' },
  { href: '/scales', label: 'Scales' },
  { href: '/tuner', label: 'Tuner' },
  { href: '/metronome', label: 'Metronome' },
  { href: '/practice', label: 'Routine' },
  { href: '/songs', label: 'Songs' },
  { href: '/capcalc', label: 'CapCalc' },
  { href: '/progress', label: 'Progress' },
  { href: '/jam', label: 'Jamroom' },
] as const;

export default function StudioPageHeader({
  titleLeading,
  titleAccent,
  description,
  eyebrow,
  backHref = '/',
  backLabel = 'Overview',
  actions,
  showQuickNav = true,
  align = 'left',
}: StudioPageHeaderProps) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const isCentered = align === 'center';

  return (
    <header className="mb-8 sm:mb-10">
      <div
        className={`flex flex-wrap items-center gap-3 mb-5 ${
          isCentered ? 'justify-center' : 'justify-between'
        }`}
      >
        <Link
          href={backHref}
          className="group inline-flex items-center gap-1.5 text-xs font-medium text-[#A8A29E] hover:text-[#F5F5F4] transition-colors"
        >
          <ArrowLeft
            size={14}
            weight="bold"
            className="transition-transform duration-200 group-hover:-translate-x-0.5"
          />
          <span>{backLabel}</span>
        </Link>

        {showQuickNav && (
          <nav
            aria-label="Studio navigation"
            className="flex items-center gap-1 overflow-x-auto max-w-full no-scrollbar py-0.5"
          >
            {STUDIO_ROUTES.map((route) => {
              const active = pathname === route.href;
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  className={`relative px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
                    active
                      ? 'text-[#0C0A09]'
                      : 'text-[#A8A29E] hover:text-[#F5F5F4] hover:bg-white/[0.04]'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="studioQuickNavActive"
                      transition={
                        shouldReduceMotion
                          ? { duration: 0 }
                          : { type: 'spring', stiffness: 460, damping: 34 }
                      }
                      className="absolute inset-0 rounded-full bg-[#D4AD61] shadow-[0_1px_10px_rgba(212,173,97,0.28)]"
                    />
                  )}
                  <span className="relative z-10">{route.label}</span>
                </Link>
              );
            })}
          </nav>
        )}
      </div>

      <div
        className={`flex flex-col gap-4 ${
          isCentered
            ? 'items-center text-center'
            : 'sm:flex-row sm:items-end justify-between'
        }`}
      >
        <div className={isCentered ? 'max-w-xl mx-auto' : 'max-w-2xl'}>
          {eyebrow && (
            <div className="inline-flex items-center gap-1.5 text-eyebrow text-[#D4AD61] mb-2">
              {eyebrow}
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl lg:text-[42px] text-display-h1 text-[#171717] dark:text-[#F5F5F4]">
            {titleLeading}{' '}
            <span className="font-serif italic text-[#E9D8B7]">
              {titleAccent}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[#77746F] dark:text-[#A8A29E] mt-2 leading-relaxed">
            {description}
          </p>
        </div>

        {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
