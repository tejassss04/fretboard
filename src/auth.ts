import NextAuth from 'next-auth';
import type { Adapter } from 'next-auth/adapters';
import type { Provider } from 'next-auth/providers';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { loginSchema, normalizeEmail } from '@/schemas';

export const isGoogleAuthConfigured = Boolean(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
);

const providers: Provider[] = [
  Credentials({
    name: 'Email and Password',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(rawCredentials) {
      const parsed = loginSchema.safeParse(rawCredentials);
      if (!parsed.success) {
        return null;
      }

      const email = normalizeEmail(parsed.data.email);
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          passwordHash: true,
          role: true,
        },
      });

      // Return null cleanly without leaking whether an account exists or uses OAuth only
      if (!user || !user.passwordHash) {
        return null;
      }

      const passwordMatches = await bcrypt.compare(
        parsed.data.password,
        user.passwordHash,
      );

      if (!passwordMatches) {
        return null;
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
      };
    },
  }),
];

if (isGoogleAuthConfigured) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  trustHost: true,
  session: {
    // JWT strategy is required for the Credentials provider alongside PrismaAdapter
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers,
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? 'USER';
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }

      if (trigger === 'update' && session?.name) {
        token.name = session.name;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id ?? token.sub ?? '') as string;
        session.user.role = (token.role ?? 'USER') as string;
        if (token.name !== undefined) session.user.name = token.name;
        if (token.email) session.user.email = token.email;
        if (token.picture !== undefined) session.user.image = token.picture;
      }
      return session;
    },
  },
});
