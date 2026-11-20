'use client';

import React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft } from '@phosphor-icons/react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

interface AuthShellProps {
  badge?: string;
  headingPrefix: string;
  headingAccent: string;
  subtitle: string;
  children: React.ReactNode;
}

const CUBIC_EASE = [0.22, 1, 0.36, 1] as const;

export default function AuthShell({
  badge,
  headingPrefix,
  headingAccent,
  subtitle,
  children,
}: AuthShellProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative min-h-screen bg-[#FCFBF9] dark:bg-[#0E0B14] text-[#171717] dark:text-[#F5F5F4] flex flex-col font-sans selection:bg-[#E9D8B7] selection:text-[#171717] transition-colors duration-250">
      {/* Continuous Amber Light Ribbons backdrop matching the landing page */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-[url(/images/bg-amber-light-ribbons.svg)] bg-cover bg-center bg-no-repeat opacity-25 dark:opacity-85 transition-opacity duration-500"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-[#FCFBF9]/[0.70] via-[#FCFBF9]/[0.55] to-[#FCFBF9]/[0.80] dark:from-[#0E0B14]/[0.55] dark:via-[#0E0B14]/[0.45] dark:to-[#0E0B14]/[0.75]"
      />

      <Navbar />

      <main className="relative z-10 flex-1 w-full max-w-md mx-auto px-6 py-10 sm:py-16 flex flex-col justify-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#77746F] dark:text-[#A8A29E] hover:text-[#171717] dark:hover:text-[#F5F5F4] transition-colors mb-5 w-fit"
        >
          <ArrowLeft size={13} weight="regular" />
          <span>Back to overview</span>
        </Link>

        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.45, ease: CUBIC_EASE }}
          className="rounded-3xl bg-white/90 dark:bg-[#15111B]/85 backdrop-blur-md border border-[#EAE8E4]/80 dark:border-white/10 p-7 sm:p-8 shadow-[0_20px_50px_rgba(23,23,23,0.06)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_25px_60px_rgba(0,0,0,0.45)]"
        >
          <h1 className="text-3xl sm:text-4xl font-normal tracking-[-0.025em] leading-[1.15] text-[#171717] dark:text-[#F5F5F4] mb-2">
            {headingPrefix}{' '}
            <span className="font-serif italic text-[1.1em] text-[#38211F] dark:text-[#E9D8B7]">
              {headingAccent}
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-[#77746F] dark:text-[#A8A29E] leading-relaxed mb-6">
            {subtitle}
          </p>

          {children}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
