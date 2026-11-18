import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { studioSettingsSchema } from '@/schemas';

export const dynamic = 'force-dynamic';

const DEFAULT_SETTINGS = {
  defaultTuning: 'standard',
  fretCount: 15,
  tonePreset: 'acoustic',
  displayMode: 'notes',
  masterVolume: 0.8,
  metronomeBpm: 108,
  timeSignature: '4/4',
};

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({
        authenticated: false,
        settings: DEFAULT_SETTINGS,
      });
    }

    let settings = await prisma.studioSettings.findUnique({
      where: { userId: session.user.id },
    });

    if (!settings) {
      settings = await prisma.studioSettings.create({
        data: {
          userId: session.user.id,
          ...DEFAULT_SETTINGS,
        },
      });
    }

    return NextResponse.json({
      authenticated: true,
      settings,
    });
  } catch (error) {
    console.error('Failed to retrieve studio settings:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve studio preferences.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required to save studio settings.' },
        { status: 401 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request payload.' }, { status: 400 });
    }

    const parsed = studioSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid settings data.' },
        { status: 400 }
      );
    }

    const updated = await prisma.studioSettings.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        defaultTuning: parsed.data.defaultTuning || DEFAULT_SETTINGS.defaultTuning,
        fretCount: parsed.data.fretCount || DEFAULT_SETTINGS.fretCount,
        tonePreset: parsed.data.tonePreset || DEFAULT_SETTINGS.tonePreset,
        displayMode: parsed.data.displayMode || DEFAULT_SETTINGS.displayMode,
        masterVolume: parsed.data.masterVolume !== undefined ? parsed.data.masterVolume : DEFAULT_SETTINGS.masterVolume,
        metronomeBpm: parsed.data.metronomeBpm || DEFAULT_SETTINGS.metronomeBpm,
        timeSignature: parsed.data.timeSignature || DEFAULT_SETTINGS.timeSignature,
      },
      update: {
        ...(parsed.data.defaultTuning ? { defaultTuning: parsed.data.defaultTuning } : {}),
        ...(parsed.data.fretCount ? { fretCount: parsed.data.fretCount } : {}),
        ...(parsed.data.tonePreset ? { tonePreset: parsed.data.tonePreset } : {}),
        ...(parsed.data.displayMode ? { displayMode: parsed.data.displayMode } : {}),
        ...(parsed.data.masterVolume !== undefined ? { masterVolume: parsed.data.masterVolume } : {}),
        ...(parsed.data.metronomeBpm ? { metronomeBpm: parsed.data.metronomeBpm } : {}),
        ...(parsed.data.timeSignature ? { timeSignature: parsed.data.timeSignature } : {}),
      },
    });

    return NextResponse.json({ settings: updated });
  } catch (error) {
    console.error('Failed to update studio settings:', error);
    return NextResponse.json(
      { error: 'Failed to update studio preferences in database.' },
      { status: 500 }
    );
  }
}
