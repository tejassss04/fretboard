'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { WarningCircle, Eye, EyeSlash, CircleNotch } from '@phosphor-icons/react';
import { loginSchema } from '@/schemas';
import { getAuthErrorMessage } from './auth-errors';
import OAuthButtons from './OAuthButtons';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlError = getAuthErrorMessage(searchParams.get('error'));
  const callbackUrl = searchParams.get('callbackUrl') || '/fretboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const displayedError = error ?? urlError;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Please enter valid credentials.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signIn('credentials', {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      });

      if (!result || result.error) {
        setError(
          'Invalid email or password. Please check your credentials and try again.',
        );
        setIsSubmitting(false);
        return;
      }

      router.push(callbackUrl.startsWith('/') ? callbackUrl : '/fretboard');
      router.refresh();
    } catch {
      setError('Unable to sign in right now. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <OAuthButtons disabled={isSubmitting} redirectTo={callbackUrl} />

      <div className="relative flex items-center py-1">
        <div className="flex-1 border-t border-[#EAE8E4] dark:border-white/10" />
        <span className="px-3 text-[11px] font-medium uppercase tracking-wider text-[#77746F] dark:text-[#A8A29E]">
          or with email
        </span>
        <div className="flex-1 border-t border-[#EAE8E4] dark:border-white/10" />
      </div>

      {displayedError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-xs leading-relaxed text-rose-700 dark:text-rose-300"
        >
          <WarningCircle size={14} weight="regular" className="mt-0.5 shrink-0" />
          <span>{displayedError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label
            htmlFor="login-email"
            className="block text-[11px] font-medium uppercase tracking-wider text-[#77746F] dark:text-[#A8A29E] mb-1.5"
          >
            Email
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={isSubmitting}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-[#F7F6F3] dark:bg-[#1A1816] border border-[#EAE8E4] dark:border-white/10 text-[#171717] dark:text-[#F5F5F4] placeholder:text-[#77746F]/60 focus:outline-none focus:border-[#D4AD61] transition-colors disabled:opacity-60"
          />
        </div>

        <div>
          <label
            htmlFor="login-password"
            className="block text-[11px] font-medium uppercase tracking-wider text-[#77746F] dark:text-[#A8A29E] mb-1.5"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              disabled={isSubmitting}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-3.5 py-2.5 pr-10 rounded-xl text-sm bg-[#F7F6F3] dark:bg-[#1A1816] border border-[#EAE8E4] dark:border-white/10 text-[#171717] dark:text-[#F5F5F4] placeholder:text-[#77746F]/60 focus:outline-none focus:border-[#D4AD61] transition-colors disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-[#77746F] dark:text-[#A8A29E] hover:text-[#171717] dark:hover:text-[#F5F5F4] transition-colors cursor-pointer"
            >
              {showPassword ? <EyeSlash size={15} weight="regular" /> : <Eye size={15} weight="regular" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full bg-[#171717] dark:bg-[#F5F5F4] hover:bg-[#2b2b2b] dark:hover:bg-white text-white dark:text-[#171717] text-xs sm:text-sm font-semibold tracking-tight transition-all duration-200 shadow-xs active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <CircleNotch size={15} weight="regular" className="animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Sign in</span>
              <span>→</span>
            </>
          )}
        </button>
      </form>

      <p className="text-center text-xs text-[#77746F] dark:text-[#A8A29E] pt-1">
        New to Fretboard?{' '}
        <Link
          href="/signup"
          className="font-semibold text-[#171717] dark:text-[#F5F5F4] hover:text-[#D4AD61] transition-colors"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
