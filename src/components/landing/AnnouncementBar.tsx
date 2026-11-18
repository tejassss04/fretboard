'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AnnouncementBarProps {
  onClick?: () => void;
}

export default function AnnouncementBar({ onClick }: AnnouncementBarProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] as const }}
      className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F7F6F3] dark:bg-[#171513] border border-[#EAE8E4] dark:border-white/10 hover:border-[#D4AD61]/30 dark:hover:border-[#D4AD61]/30 hover:bg-[#F1F0ED] dark:hover:bg-[#201D1A] text-[#77746F] dark:text-[#A8A29E] hover:text-[#171717] dark:hover:text-[#F5F5F4] text-xs font-normal tracking-tight transition-all duration-200 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#D4AD61]" />
      <span>A complete guitar studio, right in your browser</span>
      <span className="text-[#171717]/60 dark:text-white/60 group-hover:text-[#171717] dark:group-hover:text-white transition-transform duration-200 group-hover:translate-x-1">
        →
      </span>
    </motion.button>
  );
}
