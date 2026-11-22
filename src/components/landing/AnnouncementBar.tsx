'use client';

import React from 'react';

export default function AnnouncementBar() {
  return (
    <div
      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F7F6F3] dark:bg-[#171513] border border-[#EAE8E4] dark:border-white/10 text-[#77746F] dark:text-[#A8A29E] text-xs font-normal tracking-tight cursor-default select-none shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#D4AD61]" />
      <span>A complete guitar studio, right in your browser</span>
      <span className="text-[#171717]/60 dark:text-white/60">→</span>
    </div>
  );
}

