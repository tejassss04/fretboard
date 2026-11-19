'use client';

import React, { useMemo, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { Trophy, CalendarBlank, Check, Flame, TrendUp, Guitar, Timer, ArrowRight, Sparkle } from '@phosphor-icons/react';
import { useStoredState } from '@/lib/use-stored-state';
import type { PracticeSessionRecord } from '@/lib/types';
import {
  calculateActiveStreak,
  calculateWeeklyMinutes,
  calculateTotalMinutes,
  generateRhythmCalendar,
  generateWeeklyVolume,
} from '@/lib/practice-analytics';

const subscribeNoop = () => () => {};

export default function ProgressTelemetry() {
  const [sessions] = useStoredState<PracticeSessionRecord[]>('practice-sessions', []);
  const [skillLevel] = useStoredState('skill-level', 'Intermediate');
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);

  const streakDays = useMemo(() => (mounted ? calculateActiveStreak(sessions) : 0), [mounted, sessions]);
  const weeklyMinutes = useMemo(() => (mounted ? calculateWeeklyMinutes(sessions) : 0), [mounted, sessions]);
  const totalMinutes = useMemo(() => (mounted ? calculateTotalMinutes(sessions) : 0), [mounted, sessions]);
  const calendar = useMemo(() => (mounted ? generateRhythmCalendar(sessions) : []), [mounted, sessions]);
  const weeklyData = useMemo(() => (mounted ? generateWeeklyVolume(sessions) : []), [mounted, sessions]);

  const maxWeeklyMins = Math.max(...weeklyData.map((d) => d.mins), 30);
  const activeDaysCount = calendar.filter((c) => c.active).length;
  const consistencyRate = Math.round((activeDaysCount / 35) * 100);
  const weeklyGoalTarget = 140; // 20m/day x 7
  const weeklyGoalPercent = Math.min(100, Math.round((weeklyMinutes / weeklyGoalTarget) * 100));

  const hasSessions = sessions.length > 0;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider bg-[#F5EEDF] dark:bg-[#201D1A] text-[#9E7A32] dark:text-[#D4AD61] border border-[#E9D8B7] dark:border-white/10 mb-2">
            <TrendUp size={12} weight="regular" />
            <span>Practice Telemetry</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-normal text-[#171717] dark:text-[#F5F5F4] tracking-[-0.025em] leading-[1.15]">
            Small work. <span className="font-serif italic text-[#D4AD61]">Real change.</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#77746F] dark:text-[#A8A29E] mt-1">
            Real-time consistency telemetry, weekly volume metrics, and milestone achievements.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono font-medium border border-[#EAE8E4] dark:border-white/10 bg-white dark:bg-[#121110] text-[#77746F] dark:text-[#A8A29E] shadow-xs">
          <CalendarBlank size={13} weight="regular" className="text-[#D4AD61]" />
          <span>Last 35 Days</span>
        </div>
      </div>

      {/* Empty State Banner when 0 sessions logged */}
      {(!hasSessions || !mounted) && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-[#F5EEDF]/60 via-white to-[#F5EEDF]/40 dark:from-[#201D1A]/80 dark:via-[#161412] dark:to-[#201D1A]/60 border border-[#E9D8B7] dark:border-white/10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AD61]/20 text-[#D4AD61] flex items-center justify-center shrink-0 mt-0.5">
              <Sparkle size={20} weight="regular" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#171717] dark:text-[#F5F5F4] tracking-tight">
                No practice sessions recorded yet
              </h3>
              <p className="text-xs text-[#77746F] dark:text-[#A8A29E] mt-0.5 max-w-xl leading-relaxed">
                Start a session in Guided Routine to light up your 35-day rhythm calendar, track daily minutes, and earn consistency badges.
              </p>
            </div>
          </div>

          <Link
            href="/practice"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-[#171717] dark:bg-[#F5F5F4] hover:bg-[#2b2b2b] dark:hover:bg-white text-white dark:text-[#171717] shadow-sm transition-all shrink-0 active:scale-95"
          >
            <Timer size={14} weight="regular" />
            <span>Launch Routine</span>
            <ArrowRight size={12} weight="bold" />
          </Link>
        </div>
      )}

      {/* Hero Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#FCFBF9] dark:bg-[#12100E] border border-[#EAE8E4] dark:border-white/10 rounded-2xl p-5 shadow-xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#77746F] dark:text-[#A8A29E] block mb-1">
            Active Streak
          </span>
          <div className="text-3xl font-serif font-normal tracking-tight leading-[1.2] text-[#D4AD61]">
            {streakDays} <span className="text-sm font-sans font-normal text-[#77746F] dark:text-[#A8A29E]">days</span>
          </div>
          <p className="text-[11px] text-[#77746F] dark:text-[#A8A29E] mt-1">
            {streakDays > 0 ? 'Consecutive daily guitar practice' : 'Start today to begin your streak'}
          </p>
        </div>

        <div className="bg-[#FCFBF9] dark:bg-[#12100E] border border-[#EAE8E4] dark:border-white/10 rounded-2xl p-5 shadow-xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#77746F] dark:text-[#A8A29E] block mb-1">
            Weekly Practice Volume
          </span>
          <div className="text-3xl font-serif font-normal tracking-tight leading-[1.2] text-[#171717] dark:text-[#F5F5F4]">
            {weeklyMinutes} <span className="text-sm font-sans font-normal text-[#77746F] dark:text-[#A8A29E]">min</span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
            {weeklyMinutes > 0 ? `${weeklyGoalPercent}% of 140m weekly target` : 'Goal: 20m/day (140m/wk)'}
          </p>
        </div>

        <div className="bg-[#FCFBF9] dark:bg-[#12100E] border border-[#EAE8E4] dark:border-white/10 rounded-2xl p-5 shadow-xs">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#77746F] dark:text-[#A8A29E] block mb-1">
            Total Time Logged
          </span>
          <div className="text-3xl font-serif font-normal tracking-tight leading-[1.2] text-[#171717] dark:text-[#F5F5F4]">
            {totalMinutes} <span className="text-sm font-sans font-normal text-[#77746F] dark:text-[#A8A29E]">min</span>
          </div>
          <p className="text-[11px] text-[#77746F] dark:text-[#A8A29E] mt-1 capitalize">
            {skillLevel} focus • {sessions.length} logged sessions
          </p>
        </div>
      </div>

      {/* Main Grid: Heatmap Calendar & Weekly Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Practice Rhythm Calendar */}
        <div className="lg:col-span-7 bg-[#FCFBF9] dark:bg-[#12100E] border border-[#EAE8E4] dark:border-white/10 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#EAE8E4] dark:border-white/10 pb-3">
            <span className="text-xs font-mono font-semibold tracking-wider text-[#171717] dark:text-[#F5F5F4] inline-flex items-center gap-2">
              <CalendarBlank size={13} weight="regular" className="text-[#D4AD61]" />
              PRACTICE RHYTHM · 35-DAY LOG
            </span>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#77746F] dark:text-[#A8A29E]">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#D4AD61]" />
              <span>Logged Session</span>
            </div>
          </div>

          <div className="pt-2">
            <div className="grid grid-cols-7 gap-2 mb-2 text-center font-mono text-[11px] text-[#77746F] dark:text-[#A8A29E]">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                <span key={`${day}-${i}`}>{day}</span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {calendar.length > 0 ? (
                calendar.map((cell, i) => (
                  <div
                    key={`${cell.dateStr}-${i}`}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center font-mono text-xs transition-all relative group ${
                      cell.active
                        ? 'bg-[#D4AD61] text-zinc-950 font-bold shadow-xs'
                        : cell.isToday
                        ? 'bg-transparent border-2 border-[#D4AD61] text-[#D4AD61] font-bold'
                        : 'bg-[#F7F6F3] dark:bg-[#1A1816] text-[#77746F]/50 dark:text-[#A8A29E]/50 border border-[#EAE8E4] dark:border-white/5'
                    }`}
                    title={
                      cell.active
                        ? `${cell.dateStr}: ${cell.minutes}m practice logged`
                        : cell.isToday
                        ? `${cell.dateStr} (Today)`
                        : cell.dateStr
                    }
                  >
                    <span>{cell.dayOfMonth}</span>
                    {cell.active && (
                      <span className="text-[9px] font-mono leading-none opacity-80 mt-0.5">
                        {cell.minutes}m
                      </span>
                    )}
                  </div>
                ))
              ) : (
                Array.from({ length: 35 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-xl flex items-center justify-center font-mono text-xs bg-[#F7F6F3] dark:bg-[#1A1816] text-[#77746F]/30 dark:text-[#A8A29E]/30 border border-[#EAE8E4] dark:border-white/5"
                  >
                    {i + 1}
                  </div>
                ))
              )}
            </div>

            <div className="bg-[#F5EEDF]/40 dark:bg-[#1C1814] border border-[#E9D8B7] dark:border-white/10 rounded-2xl p-3.5 flex items-center gap-2.5 mt-5">
              <Flame size={16} weight="regular" className="text-[#D4AD61] shrink-0" />
              <span className="text-xs text-[#171717] dark:text-[#F5F5F4]">
                {hasSessions ? (
                  <>You logged <strong>{activeDaysCount}</strong> sessions in the past 35 days—a <strong>{consistencyRate}%</strong> rhythm rate.</>
                ) : (
                  <>Rhythm tracking is live. Finish a session in Guided Routine to turn these calendar nodes gold.</>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Weekly Minutes Bar Chart */}
        <div className="lg:col-span-5 bg-[#FCFBF9] dark:bg-[#12100E] border border-[#EAE8E4] dark:border-white/10 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#EAE8E4] dark:border-white/10 pb-3">
            <span className="text-xs font-mono font-semibold tracking-wider text-[#171717] dark:text-[#F5F5F4]">
              WEEKLY MINUTES
            </span>
            <span className="text-[11px] font-mono text-[#D4AD61]">Target: 20m/day</span>
          </div>

          {/* Bars */}
          <div className="flex items-end justify-between gap-2.5 h-48 py-4">
            {weeklyData.length > 0 ? (
              weeklyData.map((d) => {
                const heightPercent = d.mins > 0 ? Math.max(8, Math.round((d.mins / maxWeeklyMins) * 100)) : 0;
                return (
                  <div key={d.dateStr} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-[10px] font-mono text-[#77746F] dark:text-[#A8A29E]">
                      {d.mins > 0 ? `${d.mins}m` : '-'}
                    </span>
                    <div className="w-full bg-[#F1F0ED] dark:bg-[#1F1C19] rounded-lg h-full flex items-end overflow-hidden p-1">
                      {heightPercent > 0 ? (
                        <div
                          className={`w-full rounded-md transition-all duration-500 ${
                            d.isToday ? 'bg-[#D4AD61] shadow-xs' : 'bg-[#D4AD61]/60'
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        />
                      ) : (
                        <div className="w-full h-1 rounded-sm bg-transparent" />
                      )}
                    </div>
                    <span className={`text-[11px] font-mono ${d.isToday ? 'font-bold text-[#D4AD61]' : 'text-[#77746F] dark:text-[#A8A29E]'}`}>
                      {d.day}
                    </span>
                  </div>
                );
              })
            ) : (
              ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[10px] font-mono text-[#77746F] dark:text-[#A8A29E]">-</span>
                  <div className="w-full bg-[#F1F0ED] dark:bg-[#1F1C19] rounded-lg h-full flex items-end overflow-hidden p-1" />
                  <span className="text-[11px] font-mono text-[#77746F] dark:text-[#A8A29E]">{day}</span>
                </div>
              ))
            )}
          </div>

          {/* Goal pill */}
          <div className="bg-[#F7F6F3] dark:bg-[#1A1816] border border-[#EAE8E4] dark:border-white/10 rounded-2xl p-3 flex items-center justify-between text-xs">
            <span className="text-[#77746F] dark:text-[#A8A29E]">Weekly Target (140m)</span>
            <span className={`font-mono font-bold inline-flex items-center gap-1 ${
              weeklyGoalPercent >= 100 ? 'text-emerald-500' : 'text-[#D4AD61]'
            }`}>
              {weeklyGoalPercent >= 100 && <Check size={12} weight="regular" />}
              {weeklyGoalPercent}% Reached
            </span>
          </div>
        </div>
      </div>

      {/* Deliberate Practice Milestones */}
      <div className="bg-white dark:bg-[#121110] border border-[#EAE8E4] dark:border-white/10 rounded-3xl p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={16} weight="regular" className="text-[#D4AD61]" />
          <h3 className="text-lg font-serif font-normal tracking-tight leading-[1.2] text-[#171717] dark:text-[#F5F5F4]">
            Milestones &amp; Practice Badges
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Badge 1: 7-Day Habit */}
          <div className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
            streakDays >= 7
              ? 'bg-[#F5EEDF]/40 dark:bg-[#201D1A]/50 border-[#E9D8B7] dark:border-white/15'
              : 'bg-[#F7F6F3] dark:bg-[#1A1816] border-[#EAE8E4] dark:border-white/10'
          }`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              streakDays >= 7 ? 'bg-[#D4AD61] text-zinc-950 font-bold' : 'bg-[#D4AD61]/20 text-[#D4AD61]'
            }`}>
              <Flame size={18} weight={streakDays >= 7 ? 'fill' : 'regular'} />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#171717] dark:text-[#F5F5F4] flex items-center gap-1.5">
                <span>7-Day Habit</span>
                {streakDays >= 7 && (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
                    Earned
                  </span>
                )}
              </div>
              <div className="text-[10px] text-[#77746F] dark:text-[#A8A29E] mt-0.5">
                {streakDays >= 7
                  ? 'Maintained unbroken 7-day streak'
                  : `${streakDays}/7 days toward habit`}
              </div>
            </div>
          </div>

          {/* Badge 2: Volume Explorer */}
          <div className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
            totalMinutes >= 60
              ? 'bg-[#F5EEDF]/40 dark:bg-[#201D1A]/50 border-[#E9D8B7] dark:border-white/15'
              : 'bg-[#F7F6F3] dark:bg-[#1A1816] border-[#EAE8E4] dark:border-white/10'
          }`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              totalMinutes >= 60 ? 'bg-[#D4AD61] text-zinc-950 font-bold' : 'bg-[#D4AD61]/20 text-[#D4AD61]'
            }`}>
              <Guitar size={18} weight={totalMinutes >= 60 ? 'fill' : 'regular'} />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#171717] dark:text-[#F5F5F4] flex items-center gap-1.5">
                <span>60m Fret Master</span>
                {totalMinutes >= 60 && (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
                    Earned
                  </span>
                )}
              </div>
              <div className="text-[10px] text-[#77746F] dark:text-[#A8A29E] mt-0.5">
                {totalMinutes >= 60
                  ? `${totalMinutes} total practice minutes logged`
                  : `${totalMinutes}/60 minutes towards milestone`}
              </div>
            </div>
          </div>

          {/* Badge 3: Deliberate Dedication */}
          <div className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
            sessions.length >= 3
              ? 'bg-[#F5EEDF]/40 dark:bg-[#201D1A]/50 border-[#E9D8B7] dark:border-white/15'
              : 'bg-[#F7F6F3] dark:bg-[#1A1816] border-[#EAE8E4] dark:border-white/10'
          }`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              sessions.length >= 3 ? 'bg-[#D4AD61] text-zinc-950 font-bold' : 'bg-[#D4AD61]/20 text-[#D4AD61]'
            }`}>
              <Sparkle size={18} weight={sessions.length >= 3 ? 'fill' : 'regular'} />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#171717] dark:text-[#F5F5F4] flex items-center gap-1.5">
                <span>Dedicated Practitioner</span>
                {sessions.length >= 3 && (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
                    Earned
                  </span>
                )}
              </div>
              <div className="text-[10px] text-[#77746F] dark:text-[#A8A29E] mt-0.5">
                {sessions.length >= 3
                  ? `${sessions.length} deliberate routines completed`
                  : `${sessions.length}/3 routines to unlock`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}