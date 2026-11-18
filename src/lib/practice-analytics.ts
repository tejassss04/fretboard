import type { PracticeSessionRecord } from './types';

export function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getDateStringForOffset(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().slice(0, 10);
}

export function calculateTotalMinutes(sessions: PracticeSessionRecord[]): number {
  return sessions.reduce((acc, s) => acc + (s.minutes || 0), 0);
}

export function calculateWeeklyMinutes(sessions: PracticeSessionRecord[]): number {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return sessions
    .filter((s) => s.timestamp >= sevenDaysAgo)
    .reduce((acc, s) => acc + (s.minutes || 0), 0);
}

export function calculateActiveStreak(sessions: PracticeSessionRecord[]): number {
  if (!sessions || sessions.length === 0) return 0;

  // Extract unique sorted date strings (YYYY-MM-DD) in descending order
  const uniqueDates = Array.from(new Set(sessions.map((s) => s.date))).sort().reverse();
  if (uniqueDates.length === 0) return 0;

  const todayStr = getTodayDateString();
  const yesterdayStr = getDateStringForOffset(-1);

  // If latest session is neither today nor yesterday, streak is broken
  const latestDate = uniqueDates[0];
  if (latestDate !== todayStr && latestDate !== yesterdayStr) {
    return 0;
  }

  let streak = 0;
  const expectedDate = latestDate === todayStr ? new Date() : new Date(Date.now() - 86400000);

  for (const dateStr of uniqueDates) {
    const curExpectedStr = expectedDate.toISOString().slice(0, 10);
    if (dateStr === curExpectedStr) {
      streak += 1;
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export interface HeatmapDay {
  dateStr: string;
  dayOfMonth: number;
  dayOfWeek: number; // 0=Sun..6=Sat
  active: boolean;
  minutes: number;
  isToday: boolean;
}

export function generateRhythmCalendar(sessions: PracticeSessionRecord[]): HeatmapDay[] {
  const todayStr = getTodayDateString();
  const minutesByDate: Record<string, number> = {};

  sessions.forEach((s) => {
    minutesByDate[s.date] = (minutesByDate[s.date] || 0) + (s.minutes || 0);
  });

  // 35 days: from 34 days ago to today
  const result: HeatmapDay[] = [];
  for (let offset = -34; offset <= 0; offset++) {
    const dateObj = new Date();
    dateObj.setDate(dateObj.getDate() + offset);
    const dateStr = dateObj.toISOString().slice(0, 10);
    const mins = minutesByDate[dateStr] || 0;

    result.push({
      dateStr,
      dayOfMonth: dateObj.getDate(),
      dayOfWeek: dateObj.getDay(),
      active: mins > 0,
      minutes: mins,
      isToday: dateStr === todayStr,
    });
  }

  return result;
}

export interface DayVolume {
  day: string; // Mon, Tue, etc.
  dateStr: string;
  mins: number;
  isToday: boolean;
}

export function generateWeeklyVolume(sessions: PracticeSessionRecord[]): DayVolume[] {
  const minutesByDate: Record<string, number> = {};
  sessions.forEach((s) => {
    minutesByDate[s.date] = (minutesByDate[s.date] || 0) + (s.minutes || 0);
  });

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  // Generate 7 days ending today
  const result: DayVolume[] = [];
  for (let offset = -6; offset <= 0; offset++) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const dateStr = d.toISOString().slice(0, 10);
    const dayName = dayNames[d.getDay()];

    result.push({
      day: dayName,
      dateStr,
      mins: minutesByDate[dateStr] || 0,
      isToday: dateStr === todayStr,
    });
  }

  return result;
}

