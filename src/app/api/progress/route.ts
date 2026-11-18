import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import {
  calculateActiveStreak,
  calculateWeeklyMinutes,
  calculateTotalMinutes,
  generateRhythmCalendar,
  generateWeeklyVolume,
} from '@/lib/practice-analytics';
import type { PracticeSessionRecord } from '@/lib/types';

export async function GET(_request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({
        authenticated: false,
        streak: 0,
        weeklyMinutes: 0,
        totalMinutes: 0,
        totalSessions: 0,
        consistencyRate: 0,
        calendar: generateRhythmCalendar([]),
        weeklyVolume: generateWeeklyVolume([]),
      });
    }

    const rawSessions = await prisma.practiceSession.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        durationMinutes: true,
        tasksCompleted: true,
        totalTasks: true,
        date: true,
        createdAt: true,
      },
    });

    const records: PracticeSessionRecord[] = rawSessions.map((s) => ({
      id: s.id,
      timestamp: s.createdAt.getTime(),
      date: s.date,
      minutes: s.durationMinutes,
      tasksCompleted: s.tasksCompleted,
      totalTasks: s.totalTasks,
    }));

    const streak = calculateActiveStreak(records);
    const weeklyMinutes = calculateWeeklyMinutes(records);
    const totalMinutes = calculateTotalMinutes(records);
    const calendar = generateRhythmCalendar(records);
    const weeklyVolume = generateWeeklyVolume(records);

    const activeDaysCount = calendar.filter((c) => c.active).length;
    const consistencyRate = Math.round((activeDaysCount / 35) * 100);

    return NextResponse.json({
      authenticated: true,
      streak,
      weeklyMinutes,
      totalMinutes,
      totalSessions: records.length,
      consistencyRate,
      calendar,
      weeklyVolume,
      recentSessions: records.slice(0, 10),
    });
  } catch (error) {
    console.error('Failed to compute progress metrics:', error);
    return NextResponse.json(
      { error: 'Failed to compute practice progress telemetry.' },
      { status: 500 }
    );
  }
}
