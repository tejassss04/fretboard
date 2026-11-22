'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Microphone, Metronome as MetronomeIcon, X, SlidersHorizontal } from '@phosphor-icons/react';
import Tuner from './Tuner';
import Metronome from './Metronome';

interface StudioMiniDockProps {
  initialOpenTool?: 'tuner' | 'metronome' | null;
  className?: string;
  showInlineTriggers?: boolean;
}

export default function StudioMiniDock({
  initialOpenTool = null,
  className = '',
  showInlineTriggers = false,
}: StudioMiniDockProps) {
  const [activeModal, setActiveModal] = useState<'tuner' | 'metronome' | null>(initialOpenTool);
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);

  return (
    <>
      {/* Optional Inline Quick Trigger Buttons (e.g. for header bars) */}
      {showInlineTriggers && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveModal('tuner')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-medium bg-white dark:bg-[#181614] border border-[#EAE8E4] dark:border-white/10 hover:border-[#D4AD61]/50 text-[#171717] dark:text-[#F5F5F4] transition-all shadow-xs cursor-pointer active:scale-95"
            title="Open Tuner in studio modal"
          >
            <Microphone size={13} weight="regular" className="text-[#D4AD61]" />
            <span>Tuner</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveModal('metronome')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-medium bg-white dark:bg-[#181614] border border-[#EAE8E4] dark:border-white/10 hover:border-[#D4AD61]/50 text-[#171717] dark:text-[#F5F5F4] transition-all shadow-xs cursor-pointer active:scale-95"
            title="Open Metronome in studio modal"
          >
            <MetronomeIcon size={13} weight="regular" className="text-[#D4AD61]" />
            <span>Metronome</span>
          </button>
        </div>
      )}

      {/* Floating Bottom Quick-Launcher Mini-Dock */}
      <div className={`fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] right-4 sm:right-6 z-40 select-none ${className}`}>
        {isDockCollapsed ? (
          <button
            type="button"
            onClick={() => setIsDockCollapsed(false)}
            className="w-10 h-10 rounded-full bg-[#171717] dark:bg-[#F5F5F4] text-white dark:text-[#171717] flex items-center justify-center shadow-[0_10px_25px_rgba(0,0,0,0.3)] hover:scale-105 transition-transform cursor-pointer border border-white/10 dark:border-black/10"
            title="Open In-Studio Quick Utilities (Tuner & Metronome)"
          >
            <SlidersHorizontal size={16} weight="bold" />
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="flex items-center gap-1.5 p-1.5 rounded-full bg-white/95 dark:bg-[#1A1816]/95 backdrop-blur-md border border-[#EAE8E4] dark:border-white/15 shadow-[0_12px_36px_rgba(0,0,0,0.22)]"
          >
            <button
              type="button"
              onClick={() => setActiveModal('tuner')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-medium text-[#171717] dark:text-[#F5F5F4] hover:bg-[#F7F6F3] dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="Open In-Studio Tuner"
            >
              <Microphone size={14} weight="regular" className="text-[#D4AD61]" />
              <span>Tuner</span>
            </button>

            <div className="w-[1px] h-4 bg-[#EAE8E4] dark:bg-white/10" />

            <button
              type="button"
              onClick={() => setActiveModal('metronome')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-medium text-[#171717] dark:text-[#F5F5F4] hover:bg-[#F7F6F3] dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="Open In-Studio Metronome"
            >
              <MetronomeIcon size={14} weight="regular" className="text-[#D4AD61]" />
              <span>Metronome</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDockCollapsed(true)}
              className="w-6 h-6 rounded-full text-[#77746F] hover:text-[#171717] dark:hover:text-white flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-colors ml-0.5 cursor-pointer"
              title="Collapse dock"
            >
              <X size={12} weight="bold" />
            </button>
          </motion.div>
        )}
      </div>

      {/* In-Studio Modal Dialog Overlay (Preserves parent page timer & state) */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-2xl bg-[#FCFBF9] dark:bg-[#0C0A09] border border-[#EAE8E4] dark:border-white/15 rounded-2xl sm:rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.5)] overflow-hidden my-auto max-h-[90vh] flex flex-col"
            >
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#EAE8E4] dark:border-white/10 bg-white/60 dark:bg-[#151311]/60 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-[#F5EEDF] dark:bg-[#201D1A] text-[#D4AD61] flex items-center justify-center">
                    {activeModal === 'tuner' ? (
                      <Microphone size={15} weight="regular" />
                    ) : (
                      <MetronomeIcon size={15} weight="regular" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#171717] dark:text-[#F5F5F4] tracking-tight">
                      {activeModal === 'tuner' ? 'In-Studio Chromatic Tuner' : 'In-Studio Tap Metronome'}
                    </h3>
                    <p className="text-[10px] text-[#77746F] dark:text-[#A8A29E] font-mono">
                      Stay in your current practice session without losing progress
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="p-1.5 rounded-full text-[#77746F] hover:text-[#171717] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-pointer"
                    title="Close utility"
                  >
                    <X size={16} weight="regular" />
                  </button>
                </div>
              </div>

              {/* Utility Component Container */}
              <div className="p-6 overflow-y-auto">
                {activeModal === 'tuner' ? <Tuner /> : <Metronome />}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

