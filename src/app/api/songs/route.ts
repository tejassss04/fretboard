import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { songCreateSchema } from '@/schemas';
import { songs as initialSongs } from '@/lib/data';

export async function GET(_request: Request) {
  try {
    const session = await auth();

    // If guest/unauthenticated, return initial preset songs
    if (!session?.user?.id) {
      return NextResponse.json({
        authenticated: false,
        songs: initialSongs,
      });
    }

    let userSongs = await prisma.song.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' },
    });

    // Seed default repertoire for newly registered users
    if (userSongs.length === 0) {
      const seeded = await prisma.$transaction(
        initialSongs.map((s) =>
          prisma.song.create({
            data: {
              userId: session.user.id,
              title: s.title,
              artist: s.artist,
              difficulty: s.difficulty,
              progress: s.progress,
              chords: s.chords,
              tuning: 'standard',
              tempo: 108,
              notes: 'Studio starter repertoire piece',
            },
          })
        )
      );
      userSongs = seeded;
    }

    return NextResponse.json({
      authenticated: true,
      songs: userSongs,
    });
  } catch (error) {
    console.error('Failed to fetch songs:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve song repertoire from Neon database.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to save songs.' },
        { status: 401 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request payload.' }, { status: 400 });
    }

    const parsed = songCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid song data.' },
        { status: 400 }
      );
    }

    const song = await prisma.song.create({
      data: {
        userId: session.user.id,
        title: parsed.data.title,
        artist: parsed.data.artist,
        difficulty: parsed.data.difficulty,
        progress: parsed.data.progress,
        chords: parsed.data.chords,
        tuning: parsed.data.tuning,
        tempo: parsed.data.tempo,
        notes: parsed.data.notes,
        isFavorite: parsed.data.isFavorite,
      },
    });

    return NextResponse.json({ song }, { status: 201 });
  } catch (error) {
    console.error('Failed to create song:', error);
    return NextResponse.json(
      { error: 'Failed to save song to Neon database.' },
      { status: 500 }
    );
  }
}
