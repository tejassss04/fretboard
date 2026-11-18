'use client';

import React, { useEffect, useState } from 'react';
import { getProviders, signIn } from 'next-auth/react';
import { CircleNotch, WarningCircle } from '@phosphor-icons/react';

interface OAuthButtonsProps {
  disabled?: boolean;
  redirectTo?: string;
}

type ProvidersMap = Awaited<ReturnType<typeof getProviders>>;

export default function OAuthButtons({
  disabled = false,
  redirectTo = '/fretboard',
}: OAuthButtonsProps) {
  const [providers, setProviders] = useState<ProvidersMap>(null);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [pendingProvider, setPendingProvider] = useState<'google' | 'apple' | null>(null);
  const [unavailableNotice, setUnavailableNotice] = useState<string | null>(null);

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

  const handleOAuthSignIn = async (providerId: 'google' | 'apple') => {
    setUnavailableNotice(null);

    if (!providers || !providers[providerId]) {
      const label = providerId === 'google' ? 'Google OAuth' : 'Apple Sign-In';
      const envHint =
        providerId === 'google'
          ? 'AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET'
          : 'AUTH_APPLE_ID and AUTH_APPLE_SECRET';
      setUnavailableNotice(
        `${label} is not configured in this environment yet. Set ${envHint} in .env to enable it.`,
      );
      return;
    }

    setPendingProvider(providerId);
    try {
      await signIn(providerId, { redirectTo });
    } catch {
      setUnavailableNotice('Unable to start OAuth sign-in right now. Please try again.');
      setPendingProvider(null);
    }
  };

  const isBusy = disabled || pendingProvider !== null;

  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Continue with Google */}
        <button
          type="button"
          onClick={() => handleOAuthSignIn('google')}
          disabled={isBusy || loadingProviders}
          className="inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-[#F7F6F3] dark:bg-[#1A1816] text-[#171717] dark:text-[#F5F5F4] border border-[#EAE8E4] dark:border-white/10 hover:border-[#D4AD61]/50 hover:bg-white dark:hover:bg-[#221F26] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer active:scale-[0.99]"
        >
          {pendingProvider === 'google' ? (
            <CircleNotch size={15} weight="regular" className="animate-spin text-[#D4AD61]" />
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
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

        {/* Continue with Apple */}
        <button
          type="button"
          onClick={() => handleOAuthSignIn('apple')}
          disabled={isBusy || loadingProviders}
          className="inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-[#F7F6F3] dark:bg-[#1A1816] text-[#171717] dark:text-[#F5F5F4] border border-[#EAE8E4] dark:border-white/10 hover:border-[#D4AD61]/50 hover:bg-white dark:hover:bg-[#221F26] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer active:scale-[0.99]"
        >
          {pendingProvider === 'apple' ? (
            <CircleNotch size={15} weight="regular" className="animate-spin text-[#D4AD61]" />
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
          )}
          <span>Apple</span>
        </button>
      </div>

      {unavailableNotice && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-xl border border-[#D4AD61]/40 bg-[#F5EEDF]/60 dark:bg-[#201B16]/80 px-3 py-2 text-[11px] leading-relaxed text-[#7A5C22] dark:text-[#E9D8B7]"
        >
          <WarningCircle size={13} weight="regular" className="mt-0.5 shrink-0 text-[#D4AD61]" />
          <span>{unavailableNotice}</span>
        </div>
      )}
    </div>
  );
}
