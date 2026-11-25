'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Play,
  Pause,
  ArrowCounterClockwise,
  Check,
  Flame,
  ArrowRight,
} from '@phosphor-icons/react';
import { initialTasks } from '@/lib/data';
import { formatTime } from '@/lib/music';
import { useStoredState } from '@/lib/use-stored-state';
import type { PracticeSessionRecord } from '@/lib/types';
import { calculateActiveStreak, calculateTotalMinutes } from '@/lib/practice-analytics';
import { getAudioEngine } from '@/lib/audio';

export default function PracticeSession() {
  const [tasks, setTasks] = useStoredState('session-tasks', initialTasks);
  const [sessions, setSessions] = useStoredState<PracticeSessionRecord[]>('practice-sessions', []);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [complete, setComplete] = useState(false);

  const shouldReduceMotion = useReducedMotion();
  const streakDays = calculateActiveStreak(sessions);
  const totalMinutes = calculateTotalMinutes(sessions);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const doneCount = tasks.filter((task) => task.done).length;

  const toggleTask = (id: string) => {
    setTasks((current) =>
      current.map((task) => {
        if (task.id === id) {
          const willBeDone = !task.done;
          if (willBeDone) {
            try {
              getAudioEngine().playClick(true);
            } catch {
              // Audio fallback
            }
          }
          return { ...task, done: willBeDone };
        }
        return task;
      })
    );
  };

  const finish = () => {
    setRunning(false);
    setComplete(true);
    const addedMins = Math.max(1, Math.round(seconds / 60));
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const newSession: PracticeSessionRecord = {
      id: `session-${Date.now()}`,
      timestamp: Date.now(),
      date: todayStr,
      minutes: addedMins,
      tasksCompleted: doneCount,
      totalTasks: tasks.length,
    };
    setSessions((prev) => [newSession, ...prev]);
  };

  const reset = () => {
    setRunning(false);
    setSeconds(0);
    setComplete(false);
    setTasks(initialTasks);
  };

  const progressPercent = Math.min(100, Math.round((seconds / 1800) * 100)); // 30 min target

  return (
    <div className="w-full rounded-3xl bg-[#FCFBF9] dark:bg-[#12100E] border border-[#EAE8E4] dark:border-white/10 p-6 sm:p-8 lg:p-10 shadow-[0_20px_50px_rgba(23,23,23,0.03)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.5)] select-none transition-colors">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-5 border-b border-[#EAE8E4] dark:border-white/10">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D4AD61] shadow-[0_0_8px_rgba(212,173,97,0.7)]" />
          <div>
            <div className="text-[11px] font-mono font-bold tracking-[0.14em] uppercase text-[#171717] dark:text-[#F5F5F4]">
              Studio Practice Routine
            </div>
            <div className="text-[10px] font-mono text-[#77746F] dark:text-[#A8A29E]">
              30-minute target • {totalMinutes}m logged all-time
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Active Streak Chip */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5EEDF] dark:bg-[#201D1A] border border-[#E9D8B7] dark:border-white/10 text-xs font-mono font-semibold text-[#9E7A32] dark:text-[#D4AD61]">
            <Flame size={13} weight="fill" className="text-[#D4AD61]" />
            <span>{streakDays} Day Streak</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F7F6F3] dark:bg-[#1A1816] border border-[#EAE8E4] dark:border-white/10 text-xs font-mono">
            <span className={`w-1.5 h-1.5 rounded-full ${running ? 'bg-[#D4AD61] animate-pulse' : 'bg-zinc-400'}`} />
            <span className="text-[#77746F] dark:text-[#A8A29E] font-medium">{running ? 'Timer Active' : 'Standby'}</span>
          </div>

          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-[#77746F] dark:text-[#A8A29E] hover:text-[#171717] dark:hover:text-white bg-[#F7F6F3] dark:bg-[#1A1816] border border-[#EAE8E4] dark:border-white/10 transition-colors cursor-pointer"
          >
            <ArrowCounterClockwise size={12} weight="regular" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Completion Banner */}
      {complete && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-4 flex-wrap"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-zinc-950 flex items-center justify-center font-bold shadow-sm">
              <Check size={18} weight="bold" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#171717] dark:text-[#F5F5F4]">
                Practice Session Recorded to Telemetry!
              </div>
              <div className="text-xs text-[#77746F] dark:text-[#A8A29E] mt-0.5 font-mono">
                Logged {Math.max(1, Math.round(seconds / 60))} minutes • Current streak: {streakDays} days
              </div>
            </div>
          </div>

          <Link
            href="/progress"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-mono font-semibold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all cursor-pointer"
          >
            <span>View Heatmap</span>
            <ArrowRight size={12} weight="bold" />
          </Link>
        </motion.div>
      )}

      {/* 2. Cockpit Grid: Circular Timer on Left, Tasks on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-2">
        
        {/* Left: Illuminated Circular Timekeeper */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-[#F7F6F3] dark:bg-[#181614] border border-[#EAE8E4] dark:border-white/10">
          <div className="relative w-52 h-52 flex items-center justify-center mb-6">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="52"
                stroke="currentColor"
                strokeWidth="5"
                className="text-[#EAE8E4] dark:text-[#25221F]"
                fill="none"
              />
              <motion.circle
                cx="60"
                cy="60"
                r="52"
                stroke="#D4AD61"
                strokeWidth="5"
                strokeDasharray="326"
                animate={{ strokeDashoffset: 326 - (326 * progressPercent) / 100 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            <div className="absolute flex flex-col items-center">
              <span className="text-4xl sm:text-5xl font-mono font-bold text-[#171717] dark:text-[#F5F5F4] tracking-tight tabular-nums">
                {formatTime(seconds)}
              </span>
              <span className="text-xs font-mono text-[#77746F] dark:text-[#A8A29E] mt-1 font-semibold">
                Target 30m ({progressPercent}%)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Primary Toggle Start / Pause */}
            <button
              type="button"
              onClick={() => setRunning(!running)}
              className={`inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-xs font-semibold tracking-tight transition-all cursor-pointer shadow-md active:scale-95 ${
                running
                  ? 'bg-[#D4AD61] text-zinc-950 ring-2 ring-[#D4AD61]/50'
                  : 'bg-[#171717] dark:bg-[#F5F5F4] hover:bg-[#2b2b2b] dark:hover:bg-white text-white dark:text-[#171717]'
              }`}
            >
              {running ? (
                <>
                  <Pause size={14} weight="regular" />
                  <span>Pause Timer</span>
                </>
              ) : (
                <>
                  <Play size={14} weight="regular" />
                  <span>Start Practice</span>
                </>
              )}
            </button>

            {/* Finish & Log Session */}
            <button
              type="button"
              onClick={finish}
              disabled={seconds < 10}
              className="inline-flex items-center gap-1.5 px-5 py-3 rounded-full text-xs font-semibold text-[#171717] dark:text-[#F5F5F4] bg-white dark:bg-[#201D1A] hover:bg-[#F1F0ED] dark:hover:bg-[#262320] border border-[#EAE8E4] dark:border-white/10 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs active:scale-95"
            >
              <Check size={14} weight="regular" />
              <span>Finish Session</span>
            </button>
          </div>
        </div>

        {/* Right: Daily Practice Checklist */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-eyebrow text-[#77746F] dark:text-[#A8A29E]">
              Daily Practice Checklist ({doneCount}/{tasks.length})
            </span>
            <span className="text-xs font-mono font-semibold text-[#D4AD61] tabular-nums">
              {doneCount === tasks.length ? 'Routine Complete' : `${tasks.length - doneCount} Remaining`}
            </span>
          </div>

          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 active:scale-[0.99] ${
                task.done
                  ? 'bg-[#F7F6F3]/50 dark:bg-[#181614]/50 border-[#EAE8E4] dark:border-white/[0.06] opacity-75'
                  : 'bg-white dark:bg-[#181614] border-[#EAE8E4] dark:border-white/10 hover:border-[#D4AD61]/50 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all duration-200 ${
                    task.done
                      ? 'bg-[#D4AD61] border-[#8C6B24] text-zinc-950 scale-105'
                      : 'border-[#EAE8E4] dark:border-white/20 bg-[#F7F6F3] dark:bg-[#201D1A]'
                  }`}
                >
                  {task.done && (
                    <motion.span
                      initial={shouldReduceMotion ? false : { scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 520, damping: 28 }}
                      className="inline-flex items-center justify-center"
                    >
                      <Check size={12} weight="bold" />
                    </motion.span>
                  )}
                </div>
                <div>
                  <div
                    className={`text-xs font-semibold transition-all ${
                      task.done
                        ? 'line-through text-[#77746F] dark:text-[#A8A29E]'
                        : 'text-[#171717] dark:text-[#F5F5F4]'
                    }`}
                  >
                    {task.title}
                  </div>
                  <div className="text-[11px] font-mono text-[#77746F] dark:text-[#A8A29E] mt-0.5">
                    {task.detail}
                  </div>
                </div>
              </div>

              <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded ${
                task.done
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                  : 'bg-[#F1F0ED] dark:bg-[#201D1A] text-[#77746F] dark:text-[#A8A29E]'
              }`}>
                {task.done ? 'Done' : 'Pending'}
              </span>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
