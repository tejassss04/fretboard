import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { normalizeEmail, registerSchema } from '@/schemas';

const BCRYPT_SALT_ROUNDS = 12;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON request body.' },
      { status: 400 },
    );
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return NextResponse.json(
      {
        error: firstIssue?.message ?? 'Invalid registration details.',
      },
      { status: 400 },
    );
  }

  const email = normalizeEmail(parsed.data.email);
  const name = parsed.data.name?.trim() || email.split('@')[0] || 'Player';
  const password = parsed.data.password;

  try {
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const createdUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'USER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user: createdUser }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: 'Unable to complete registration right now. Please try again.' },
      { status: 500 },
    );
  }
}

