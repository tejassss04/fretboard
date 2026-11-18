import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { songUpdateSchema } from '@/schemas';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const song = await prisma.song.findUnique({
      where: { id },
    });

    if (!song || song.userId !== session.user.id) {
      return NextResponse.json({ error: 'Song not found.' }, { status: 404 });
    }

    return NextResponse.json({ song });
  } catch (error) {
    console.error('Failed to retrieve song:', error);
    return NextResponse.json({ error: 'Failed to retrieve song from database.' }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request payload.' }, { status: 400 });
    }

    const parsed = songUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid song update data.' },
        { status: 400 }
      );
    }

    // Verify ownership
    const existing = await prisma.song.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Song not found or unauthorized.' }, { status: 404 });
    }

    const updated = await prisma.song.update({
      where: { id },
      data: {
        ...(parsed.data.title !== undefined ? { title: parsed.data.title } : {}),
        ...(parsed.data.artist !== undefined ? { artist: parsed.data.artist } : {}),
        ...(parsed.data.difficulty !== undefined ? { difficulty: parsed.data.difficulty } : {}),
        ...(parsed.data.progress !== undefined ? { progress: parsed.data.progress } : {}),
        ...(parsed.data.chords !== undefined ? { chords: parsed.data.chords } : {}),
        ...(parsed.data.tuning !== undefined ? { tuning: parsed.data.tuning } : {}),
        ...(parsed.data.tempo !== undefined ? { tempo: parsed.data.tempo } : {}),
        ...(parsed.data.notes !== undefined ? { notes: parsed.data.notes } : {}),
        ...(parsed.data.isFavorite !== undefined ? { isFavorite: parsed.data.isFavorite } : {}),
        lastPracticedAt: new Date(),
      },
    });

    return NextResponse.json({ song: updated });
  } catch (error) {
    console.error('Failed to update song:', error);
    return NextResponse.json({ error: 'Failed to update song in database.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const existing = await prisma.song.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Song not found or unauthorized.' }, { status: 404 });
    }

    await prisma.song.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Song deleted successfully.' });
  } catch (error) {
    console.error('Failed to delete song:', error);
    return NextResponse.json({ error: 'Failed to delete song from database.' }, { status: 500 });
  }
}
