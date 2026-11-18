import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { practiceSessionCreateSchema } from '@/schemas';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({
        authenticated: false,
        sessions: [],
      });
    }

    const sessions = await prisma.practiceSession.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({
      authenticated: true,
      sessions,
    });
  } catch (error) {
    console.error('Failed to fetch practice telemetry:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve practice telemetry from database.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required. Sign in to log practice routines.' },
        { status: 401 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request payload.' }, { status: 400 });
    }

    const parsed = practiceSessionCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid practice session data.' },
        { status: 400 }
      );
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const date = parsed.data.date || todayStr;

    const createdSession = await prisma.practiceSession.create({
      data: {
        userId: session.user.id,
        durationMinutes: parsed.data.durationMinutes,
        tasksCompleted: parsed.data.tasksCompleted,
        totalTasks: parsed.data.totalTasks,
        routineType: parsed.data.routineType,
        targetBpm: parsed.data.targetBpm,
        completedTasks: parsed.data.completedTasks,
        reflectionNotes: parsed.data.reflectionNotes,
        date,
      },
    });

    return NextResponse.json({ session: createdSession }, { status: 201 });
  } catch (error) {
    console.error('Failed to record practice session:', error);
    return NextResponse.json(
      { error: 'Failed to record practice session in Neon database.' },
      { status: 500 }
    );
  }
}
