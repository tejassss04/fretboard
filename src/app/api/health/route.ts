import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const start = performance.now();
  try {
    // Ping Neon PostgreSQL database
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Math.round(performance.now() - start);

    return NextResponse.json(
      {
        status: 'healthy',
        database: 'connected',
        provider: 'Neon Lakebase Postgres',
        latencyMs,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    const latencyMs = Math.round(performance.now() - start);
    return NextResponse.json(
      {
        status: 'degraded',
        database: 'unreachable',
        error: error instanceof Error ? error.message : 'Unknown database error',
        latencyMs,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
