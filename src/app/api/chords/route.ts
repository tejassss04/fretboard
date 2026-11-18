import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { chords as defaultChords } from '@/lib/data';
import { chordSaveSchema } from '@/schemas';

export async function GET(_request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({
        authenticated: false,
        savedChords: [],
        defaultChordsCount: defaultChords.length,
      });
    }

    const savedChords = await prisma.savedChord.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      authenticated: true,
      savedChords,
    });
  } catch (error) {
    console.error('Failed to retrieve chords:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve saved chords from database.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required to save custom chord voicings.' },
        { status: 401 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request payload.' }, { status: 400 });
    }

    const parsed = chordSaveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid chord data.' },
        { status: 400 }
      );
    }

    const savedChord = await prisma.savedChord.create({
      data: {
        userId: session.user.id,
        name: parsed.data.name,
        shortName: parsed.data.shortName || parsed.data.name,
        voicing: parsed.data.voicing,
        difficulty: parsed.data.difficulty,
        notes: parsed.data.notes,
      },
    });

    return NextResponse.json({ chord: savedChord }, { status: 201 });
  } catch (error) {
    console.error('Failed to save chord:', error);
    return NextResponse.json(
      { error: 'Failed to save custom chord to Neon database.' },
      { status: 500 }
    );
  }
}
