'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from '@phosphor-icons/react';

export default function AnnouncementBar() {
  return (
    <Link
      href="/fretboard"
      className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F7F6F3] dark:bg-[#171513]/90 backdrop-blur-md border border-[#EAE8E4] dark:border-white/[0.08] hover:border-[#D4AD61]/45 text-[#77746F] dark:text-[#A8A29E] hover:text-[#171717] dark:hover:text-[#F5F5F4] text-xs font-medium tracking-tight transition-colors select-none shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#D4AD61] animate-pulse shrink-0" />
      <span>A complete guitar studio, right in your browser</span>
      <ArrowRight
        size={12}
        weight="bold"
        className="text-[#D4AD61] transition-transform duration-200 group-hover:translate-x-0.5"
      />
    </Link>
  );
}
