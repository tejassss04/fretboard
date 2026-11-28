'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { getProviders, signIn } from 'next-auth/react';
import {
  ArrowLeft,
  Eye,
  EyeSlash,
  CircleNotch,
  WarningCircle,
  Info,
} from '@phosphor-icons/react';
import { loginSchema } from '@/schemas';
import { getAuthErrorMessage } from './auth-errors';

type ProvidersMap = Awaited<ReturnType<typeof getProviders>>;

export default function SplitLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlError = getAuthErrorMessage(searchParams.get('error'));
  const callbackUrl = searchParams.get('callbackUrl') || '/fretboard';

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [infoNotice, setInfoNotice] = useState<string | null>(null);

  // Providers & OAuth states
  const [providers, setProviders] = useState<ProvidersMap>(null);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [pendingProvider, setPendingProvider] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getProviders()
      .then((res) => {
        if (active) setProviders(res);
      })
      .catch(() => {
        if (active) setProviders(null);
      })
      .finally(() => {
        if (active) setLoadingProviders(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleOAuthSignIn = async (providerId: 'google', providerName: string) => {
    setError(null);
    setInfoNotice(null);

    if (!providers || !providers[providerId]) {
      setInfoNotice(
        `${providerName} sign-in is not configured in this environment yet. Set AUTH_${providerId.toUpperCase()}_ID and AUTH_${providerId.toUpperCase()}_SECRET in your .env file to enable it.`,
      );
      return;
    }

    setPendingProvider(providerId);
    try {
      await signIn(providerId, { redirectTo: callbackUrl });
    } catch {
      setError(`Unable to start ${providerName} sign-in right now. Please try again.`);
      setPendingProvider(null);
    }
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setInfoNotice(
      'Password recovery: Fretboard operates with secure credentials. You can sign in via Google, or register a new studio account.',
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setInfoNotice(null);

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
        setError('Invalid email or password. Please check your credentials and try again.');
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

  const displayedError = error ?? urlError;
  const isBusy = isSubmitting || pendingProvider !== null;

  return (
    <div className="h-screen max-h-screen h-dvh max-h-dvh w-full overflow-hidden flex flex-col md:flex-row bg-[#07050A] text-[#F5F5F4] font-sans antialiased selection:bg-[#E9D8B7] selection:text-[#171717]">
      
      {/* ===================================================================== */}
      {/* LEFT SECTION (40%) — LANDING PAGE CRIMSON VIOLET HAZE ARTWORK        */}
      {/* ===================================================================== */}
      <div className="hidden md:flex md:w-[40%] h-full relative flex-col justify-between p-8 sm:p-10 lg:p-14 bg-[#07050A] overflow-hidden border-r border-black/[0.08] dark:border-white/[0.08] select-none shrink-0">
        
        {/* Continuous Amber Light Ribbons backdrop matching the landing page */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-0 pointer-events-none bg-[url(/images/bg-amber-light-ribbons.svg)] bg-cover bg-center bg-no-repeat opacity-40 dark:opacity-85 mix-blend-screen transition-opacity duration-500"
        />

        {/* Ambient depth gradients matching landing page */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-[#0E0B14]/40 via-transparent to-[#0E0B14]/85"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-20 -right-20 w-[380px] h-[380px] rounded-full pointer-events-none opacity-60 z-0"
          style={{
            background:
              'radial-gradient(circle, rgba(212, 173, 97, 0.35) 0%, rgba(196, 104, 60, 0.2) 40%, transparent 75%)',
            filter: 'blur(50px)',
          }}
        />

        {/* Top spacer (brand badge removed per user request) */}
        <div className="relative z-10 h-4" aria-hidden="true" />

        {/* Center Hero Message (Using skills.md editorial typography) */}
        <div className="relative z-10 my-auto py-6 max-w-sm">
          {/* Fretboard Hero Section Logo Badge */}
          <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#171717] dark:bg-white flex items-center justify-center text-white dark:text-[#171717] shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(212,173,97,0.3)] mb-6 shrink-0 border border-white/10 dark:border-black/10 transition-transform hover:scale-105">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="6" y1="3" x2="6" y2="21" stroke="currentColor" strokeWidth="1.4" strokeOpacity="0.4" />
              <line x1="12" y1="3" x2="12" y2="21" stroke="currentColor" strokeWidth="1.8" strokeOpacity="0.8" />
              <line x1="18" y1="3" x2="18" y2="21" stroke="currentColor" strokeWidth="2.4" strokeOpacity="1" />
              <line x1="3" y1="12" x2="21" y2="12" stroke="#D4AD61" strokeWidth="1.8" />
              <circle cx="12" cy="7.5" r="2.2" fill="#D4AD61" />
            </svg>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-normal tracking-[-0.03em] leading-[1.12] text-white text-balance">
            Explore the fretboard.{' '}
            <span className="font-serif italic text-[#E9D8B7]">
              Find your sound.
            </span>
          </h1>

          <p className="mt-3.5 text-xs sm:text-sm text-[#A8A29E] leading-relaxed font-normal">
            An interactive guitar studio and theory playground. Master scales, explore chord voicings, and jam seamlessly in your browser.
          </p>
        </div>

        {/* Bottom spacer (footer text removed per user request) */}
        <div className="relative z-10 h-4" aria-hidden="true" />
      </div>

      {/* ===================================================================== */}
      {/* RIGHT SECTION (60%) — COMPACT ZERO-SCROLL LOGIN FORM CONTAINER        */}
      {/* ===================================================================== */}
      <div className="w-full md:w-[60%] h-full flex flex-col justify-between p-6 sm:p-8 lg:p-12 overflow-hidden relative bg-[#07050A]">
        
        {/* Top Navigation Row: "← Home" on left (theme toggle removed per user request) */}
        <div className="w-full flex items-center justify-start shrink-0">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[12.6px] sm:text-[13px] font-medium text-[#77746F] dark:text-[#A8A29E] hover:text-[#171717] dark:hover:text-white transition-colors group cursor-pointer"
          >
            <ArrowLeft
              size={14}
              weight="bold"
              className="transition-transform group-hover:-translate-x-0.5"
            />
            <span>Home</span>
          </Link>
        </div>

        {/* Center Login Form Container (Fits strictly inside viewport height) */}
        <div className="w-full max-w-[400px] mx-auto my-auto py-2 sm:py-4 space-y-4">
          
          {/* Mobile-only brand badge (< 768px) */}
          <div className="md:hidden flex items-center justify-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-[#171717] dark:bg-white flex items-center justify-center text-white dark:text-[#171717] shadow-xs">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <line x1="6" y1="3" x2="6" y2="21" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.4" />
                <line x1="12" y1="3" x2="12" y2="21" stroke="currentColor" strokeWidth="1.6" strokeOpacity="0.8" />
                <line x1="18" y1="3" x2="18" y2="21" stroke="currentColor" strokeWidth="2.2" strokeOpacity="1" />
                <line x1="3" y1="12" x2="21" y2="12" stroke="#D4AD61" strokeWidth="1.5" />
                <circle cx="12" cy="7.5" r="1.8" fill="#D4AD61" />
              </svg>
            </div>
            <span className="font-semibold text-sm tracking-tight text-[#171717] dark:text-white">Fretboard</span>
          </div>

          {/* Header Title & Subtitle (per skills.md typography hierarchy) */}
          <div className="text-center space-y-1">
            <h2 className="text-2xl sm:text-[26px] font-normal tracking-[-0.025em] text-[#171717] dark:text-white">
              Log in to{' '}
              <span className="font-serif italic text-[#38211F] dark:text-[#E9D8B7]">
                Fretboard
              </span>
            </h2>
            <p className="text-xs text-[#77746F] dark:text-[#A8A29E]">
              Connect to Fretboard with:
            </p>
          </div>

          {/* OAuth Button (Google) */}
          <div>
            <button
              type="button"
              onClick={() => handleOAuthSignIn('google', 'Google')}
              disabled={isBusy || loadingProviders}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-medium bg-black/[0.02] dark:bg-[#110E17] text-[#171717] dark:text-[#F5F5F4] border border-[#EAE8E4] dark:border-white/[0.12] hover:border-[#D4AD61]/50 hover:bg-white dark:hover:bg-[#181422] transition-all cursor-pointer active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {pendingProvider === 'google' ? (
                <CircleNotch size={14} className="animate-spin text-[#D4AD61]" />
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Divider: "Or continue with" */}
          <div className="relative flex items-center justify-center py-1">
            <div className="w-full border-t border-[#EAE8E4] dark:border-white/[0.1]" />
            <span className="absolute bg-[#FCFBF9] dark:bg-[#07050A] px-2.5 text-[10px] text-[#77746F] dark:text-[#8E8A93] tracking-tight uppercase font-mono">
              Or continue with
            </span>
          </div>

          {/* Error Banner */}
          {displayedError && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-700 dark:text-rose-300 leading-relaxed"
            >
              <WarningCircle size={14} weight="regular" className="mt-0.5 shrink-0" />
              <span>{displayedError}</span>
            </div>
          )}

          {/* Info Notice Banner */}
          {infoNotice && (
            <div
              role="status"
              className="flex items-start gap-2 rounded-lg border border-[#D4AD61]/40 bg-[#F5EEDF]/60 dark:bg-[#181420] px-3 py-2 text-xs text-[#7A5C22] dark:text-[#E9D8B7] leading-relaxed"
            >
              <Info size={14} weight="regular" className="mt-0.5 shrink-0 text-[#D4AD61]" />
              <span>{infoNotice}</span>
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3" noValidate>
            
            {/* Email Field */}
            <div className="space-y-1">
              <label
                htmlFor="login-email"
                className="block text-xs font-medium text-[#77746F] dark:text-[#A8A29E]"
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
                placeholder="Enter your email address"
                className="w-full px-3 py-2 rounded-lg text-xs sm:text-sm bg-black/[0.02] dark:bg-[#110E17] border border-[#EAE8E4] dark:border-white/[0.12] text-[#171717] dark:text-white placeholder:text-[#77746F]/50 focus:outline-none focus:border-[#D4AD61] focus:ring-1 focus:ring-[#D4AD61] transition-all disabled:opacity-60"
              />
            </div>

            {/* Password Field + "Forgot Password?" */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-medium text-[#77746F] dark:text-[#A8A29E]"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs font-medium text-[#77746F] dark:text-[#A8A29E] hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
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
                  placeholder="Enter a unique password"
                  className="w-full px-3 py-2 pr-9 rounded-lg text-xs sm:text-sm bg-black/[0.02] dark:bg-[#110E17] border border-[#EAE8E4] dark:border-white/[0.12] text-[#171717] dark:text-white placeholder:text-[#77746F]/50 focus:outline-none focus:border-[#D4AD61] focus:ring-1 focus:ring-[#D4AD61] transition-all disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#77746F] dark:text-[#A8A29E] hover:text-[#171717] dark:hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeSlash size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Log in Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 mt-1 rounded-lg text-xs sm:text-sm font-semibold tracking-tight bg-[#171717] dark:bg-white text-white dark:text-[#0E0B14] hover:bg-[#2b2b2b] dark:hover:bg-white/90 transition-all shadow-xs active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <CircleNotch size={14} className="animate-spin text-[#D4AD61]" />
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Log in</span>
              )}
            </button>
          </form>

          {/* Bottom Link: "New to Fretboard? Sign up for an account" */}
          <p className="text-center text-xs text-[#77746F] dark:text-[#A8A29E] pt-1">
            New to Fretboard?{' '}
            <Link
              href="/signup"
              className="font-medium text-[#171717] dark:text-white underline underline-offset-4 hover:text-[#D4AD61] dark:hover:text-[#D4AD61] transition-colors"
            >
              Sign up for an account
            </Link>
          </p>
        </div>

        {/* Bottom spacer (copyright removed per user request) */}
        <div className="shrink-0 h-4" aria-hidden="true" />
      </div>
    </div>
  );
}
