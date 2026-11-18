'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getProviders, signIn } from 'next-auth/react';
import {
  ArrowLeft,
  Eye,
  EyeSlash,
  CircleNotch,
  WarningCircle,
  Info,
} from '@phosphor-icons/react';
import { registerSchema } from '@/schemas';

type ProvidersMap = Awaited<ReturnType<typeof getProviders>>;

export default function SplitSignupForm() {
  const router = useRouter();

  // Form states matching Neon signup: email + password + optional name
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

  const handleOAuthSignIn = async (providerId: 'google' | 'apple', providerName: string) => {
    setError(null);
    setInfoNotice(null);

    if (!providers || !providers[providerId]) {
      setInfoNotice(
        `${providerName} sign-up is not configured in this environment yet. Set AUTH_${providerId.toUpperCase()}_ID and AUTH_${providerId.toUpperCase()}_SECRET in your .env file to enable it.`,
      );
      return;
    }

    setPendingProvider(providerId);
    try {
      await signIn(providerId, { redirectTo: '/fretboard' });
    } catch {
      setError(`Unable to start ${providerName} sign-up right now. Please try again.`);
      setPendingProvider(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setInfoNotice(null);

    const parsed = registerSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Please check your registration details.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: parsed.data.email,
          password: parsed.data.password,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? 'Unable to create your account. Please try again.');
        setIsSubmitting(false);
        return;
      }

      const signInResult = await signIn('credentials', {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      });

      if (!signInResult || signInResult.error) {
        router.push('/login');
        return;
      }

      router.push('/fretboard');
      router.refresh();
    } catch {
      setError('Unable to reach the registration service. Please try again.');
      setIsSubmitting(false);
    }
  };

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
            Build your musical instincts on{' '}
            <span className="font-serif italic text-[#E9D8B7]">
              Fretboard.
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
      {/* RIGHT SECTION (60%) — SIGNUP FORM MATCHING NEON REFERENCE            */}
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

        {/* Center Signup Form Container (Exact layout of reference image) */}
        <div className="w-full max-w-[400px] mx-auto my-auto py-2 sm:py-4 space-y-3.5">
          
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

          {/* Header Title & Subtitle matching reference */}
          <div className="text-center space-y-1">
            <h2 className="text-2xl sm:text-[26px] font-normal tracking-[-0.025em] text-[#171717] dark:text-white">
              Create your free{' '}
              <span className="font-serif italic text-[#38211F] dark:text-[#E9D8B7]">
                account
              </span>
            </h2>
            <p className="text-xs text-[#77746F] dark:text-[#A8A29E]">
              Connect to Fretboard with:
            </p>
          </div>

          {/* Vertical Stack of Full-Width OAuth Buttons (Google & Apple) */}
          <div className="space-y-2">
            
            {/* 1. Google Button */}
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
              <span>Google</span>
            </button>

            {/* 2. Apple Button */}
            <button
              type="button"
              onClick={() => handleOAuthSignIn('apple', 'Apple')}
              disabled={isBusy || loadingProviders}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-medium bg-black/[0.02] dark:bg-[#110E17] text-[#171717] dark:text-[#F5F5F4] border border-[#EAE8E4] dark:border-white/[0.12] hover:border-[#D4AD61]/50 hover:bg-white dark:hover:bg-[#181422] transition-all cursor-pointer active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {pendingProvider === 'apple' ? (
                <CircleNotch size={14} className="animate-spin text-[#D4AD61]" />
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
              )}
              <span>Apple</span>
            </button>
          </div>

          {/* Divider: "Or continue with Email" matching reference */}
          <div className="relative flex items-center justify-center py-1">
            <div className="w-full border-t border-[#EAE8E4] dark:border-white/[0.1]" />
            <span className="absolute bg-[#FCFBF9] dark:bg-[#07050A] px-2.5 text-[10px] text-[#77746F] dark:text-[#8E8A93] tracking-tight">
              Or continue with Email
            </span>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-700 dark:text-rose-300 leading-relaxed"
            >
              <WarningCircle size={14} weight="regular" className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Info Notice Banner */}
          {infoNotice && (
            <div
              role="status"
              className="flex items-start gap-2 rounded-lg border border-[#D4AD61]/40 bg-[#F5EEDF]/60 dark:bg-[#181420] px-3 py-1.5 text-xs text-[#7A5C22] dark:text-[#E9D8B7] leading-relaxed"
            >
              <Info size={14} weight="regular" className="mt-0.5 shrink-0 text-[#D4AD61]" />
              <span>{infoNotice}</span>
            </div>
          )}

          {/* Email / Password Form matching reference */}
          <form onSubmit={handleSubmit} className="space-y-3" noValidate>
            
            {/* Email Field */}
            <div className="space-y-1">
              <label
                htmlFor="signup-email"
                className="block text-xs font-medium text-[#77746F] dark:text-[#A8A29E]"
              >
                Email
              </label>
              <input
                id="signup-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={isSubmitting}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="youremail@email.com"
                className="w-full px-3 py-2 rounded-lg text-xs sm:text-sm bg-black/[0.02] dark:bg-[#110E17] border border-[#EAE8E4] dark:border-white/[0.12] text-[#171717] dark:text-white placeholder:text-[#77746F]/50 focus:outline-none focus:border-[#D4AD61] focus:ring-1 focus:ring-[#D4AD61] transition-all disabled:opacity-60"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label
                htmlFor="signup-password"
                className="block text-xs font-medium text-[#77746F] dark:text-[#A8A29E]"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  minLength={8}
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

            {/* Continue Submit Button matching reference */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 mt-1 rounded-lg text-xs sm:text-sm font-semibold tracking-tight bg-[#171717] dark:bg-white text-white dark:text-[#0E0B14] hover:bg-[#2b2b2b] dark:hover:bg-white/90 transition-all shadow-xs active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <CircleNotch size={14} className="animate-spin text-[#D4AD61]" />
                  <span>Creating account...</span>
                </>
              ) : (
                <span>Continue</span>
              )}
            </button>
          </form>

          {/* Terms Disclaimer matching reference screenshot */}
          <p className="text-[11px] leading-relaxed text-[#77746F]/80 dark:text-[#A8A29E]/70 text-left pt-0.5">
            By creating an account you agree to the{' '}
            <span className="text-[#171717] dark:text-white underline underline-offset-2">Terms of Service</span>{' '}
            and our{' '}
            <span className="text-[#171717] dark:text-white underline underline-offset-2">Privacy Policy</span>.
            We&apos;ll occasionally send you updates about practice tools; you can opt-out anytime.
          </p>

          {/* Bottom Link: "Already have an account? Log in" */}
          <p className="text-center text-xs text-[#77746F] dark:text-[#A8A29E] pt-1">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-[#171717] dark:text-white underline underline-offset-4 hover:text-[#D4AD61] dark:hover:text-[#D4AD61] transition-colors"
            >
              Log in
            </Link>
          </p>
        </div>

        {/* Bottom spacer (copyright removed per user request) */}
        <div className="shrink-0 h-4" aria-hidden="true" />
      </div>
    </div>
  );
}
