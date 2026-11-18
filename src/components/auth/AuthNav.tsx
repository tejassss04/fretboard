'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { CaretDown, Guitar, CircleNotch, SignOut } from '@phosphor-icons/react';

interface AuthNavProps {
  variant?: 'desktop' | 'mobile';
  onNavigate?: () => void;
}

export default function AuthNav({
  variant = 'desktop',
  onNavigate,
}: AuthNavProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    setSigningOut(true);
    setMenuOpen(false);
    onNavigate?.();
    await signOut({ redirectTo: '/' });
  };

  if (variant === 'mobile') {
    if (status === 'loading') {
      return (
        <div className="pt-2 mt-1 border-t border-[#EAE8E4] dark:border-white/10">
          <div className="h-9 rounded-xl bg-[#F7F6F3] dark:bg-[#1A1816] animate-pulse" />
        </div>
      );
    }

    if (status === 'authenticated' && session?.user) {
      const displayName = session.user.name || session.user.email || 'Studio User';
      const initial = displayName.charAt(0).toUpperCase();

      return (
        <div className="pt-2.5 mt-1.5 border-t border-[#EAE8E4] dark:border-white/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {session.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt={displayName}
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full object-cover border border-[#EAE8E4] dark:border-white/10 shrink-0"
              />
            ) : (
              <span className="w-7 h-7 rounded-full bg-[#171717] dark:bg-white text-white dark:text-[#171717] text-xs font-semibold flex items-center justify-center shrink-0">
                {initial}
              </span>
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#171717] dark:text-[#F5F5F4] truncate">
                {displayName}
              </p>
              {session.user.email && session.user.name && (
                <p className="text-[11px] text-[#77746F] dark:text-[#A8A29E] truncate">
                  {session.user.email}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={signingOut}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#F7F6F3] dark:bg-[#1C1917] text-[#171717] dark:text-[#F5F5F4] border border-[#EAE8E4] dark:border-white/10 hover:border-[#D4AD61]/50 transition-all cursor-pointer shrink-0 disabled:opacity-60"
          >
            {signingOut ? <CircleNotch size={12} weight="regular" className="animate-spin" /> : <SignOut size={12} weight="regular" />}
            <span>Log out</span>
          </button>
        </div>
      );
    }

    return (
      <div className="pt-2 mt-1.5 border-t border-[#EAE8E4] dark:border-white/10 flex items-center gap-2">
        <Link
          href="/login"
          onClick={onNavigate}
          className="flex-1 flex items-center justify-center py-2 rounded-lg text-xs font-medium text-[#77746F] dark:text-[#A8A29E] hover:text-[#171717] dark:hover:text-[#F5F5F4] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors"
        >
          Log in
        </Link>
        <Link
          href="/signup"
          onClick={onNavigate}
          className="flex-1 flex items-center justify-center py-2 rounded-lg text-xs font-semibold bg-[#171717] dark:bg-[#F5F5F4] text-white dark:text-[#171717] hover:bg-[#2b2b2b] dark:hover:bg-white transition-all shadow-xs active:scale-[0.98]"
        >
          Sign up
        </Link>
      </div>
    );
  }

  // Desktop variant
  if (status === 'loading') {
    return (
      <div
        aria-hidden="true"
        className="hidden sm:block w-[124px] h-7 rounded-lg bg-[#F7F6F3]/70 dark:bg-white/5 border border-[#EAE8E4]/50 dark:border-white/5 animate-pulse"
      />
    );
  }

  if (status === 'authenticated' && session?.user) {
    const displayName = session.user.name || session.user.email || 'Account';
    const initial = displayName.charAt(0).toUpperCase();

    return (
      <div ref={dropdownRef} className="relative hidden sm:block">
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          className="inline-flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-lg text-xs font-medium bg-[#F7F6F3] dark:bg-[#1C1917] text-[#171717] dark:text-[#F5F5F4] border border-[#EAE8E4] dark:border-white/10 hover:border-[#D4AD61]/50 hover:bg-white dark:hover:bg-[#24201D] transition-all duration-200 shadow-xs cursor-pointer"
        >
          {session.user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.user.image}
              alt={displayName}
              referrerPolicy="no-referrer"
              className="w-5 h-5 rounded-full object-cover"
            />
          ) : (
            <span className="w-5 h-5 rounded-full bg-[#171717] dark:bg-white text-white dark:text-[#171717] text-[10px] font-semibold flex items-center justify-center">
              {initial}
            </span>
          )}
          <span className="max-w-[110px] truncate">{displayName}</span>
          <CaretDown
            size={12}
            weight="regular"
            className={`text-[#77746F] dark:text-[#A8A29E] transition-transform duration-150 ${
              menuOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#15111B] border border-[#EAE8E4] dark:border-white/10 p-2 shadow-[0_20px_50px_rgba(23,23,23,0.08)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.5)] z-50"
          >
            <div className="px-2.5 py-2 border-b border-[#EAE8E4]/70 dark:border-white/10 mb-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-[#171717] dark:text-[#F5F5F4] truncate">
                  {session.user.name || 'Fretboard Player'}
                </p>
                <span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#F7F6F3] dark:bg-[#1C1917] text-[#D4AD61] border border-[#EAE8E4] dark:border-white/10">
                  {session.user.role || 'USER'}
                </span>
              </div>
              {session.user.email && (
                <p className="text-[11px] text-[#77746F] dark:text-[#A8A29E] truncate mt-0.5">
                  {session.user.email}
                </p>
              )}
            </div>

            <Link
              href="/fretboard"
              role="menuitem"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium text-[#171717] dark:text-[#F5F5F4] hover:bg-[#F7F6F3] dark:hover:bg-[#1C1917] transition-colors"
            >
              <Guitar size={13} weight="regular" className="text-[#D4AD61]" />
              <span>Fretboard Studio</span>
            </Link>

            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              disabled={signingOut}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium text-[#77746F] dark:text-[#A8A29E] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-[#F7F6F3] dark:hover:bg-[#1C1917] transition-colors cursor-pointer disabled:opacity-60"
            >
              {signingOut ? (
                <CircleNotch size={13} weight="regular" className="animate-spin" />
              ) : (
                <SignOut size={13} weight="regular" />
              )}
              <span>{signingOut ? 'Signing out...' : 'Log out'}</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="hidden sm:flex items-center gap-1.5">
      {pathname !== '/login' && (
        <Link
          href="/login"
          className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#77746F] dark:text-[#A8A29E] hover:text-[#171717] dark:hover:text-[#F5F5F4] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors whitespace-nowrap"
        >
          Log in
        </Link>
      )}
      {pathname !== '/signup' && (
        <Link
          href="/signup"
          className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-tight bg-[#171717] dark:bg-[#F5F5F4] text-white dark:text-[#171717] hover:bg-[#2b2b2b] dark:hover:bg-white transition-all shadow-xs active:scale-[0.98] whitespace-nowrap"
        >
          Sign up
        </Link>
      )}
    </div>
  );
}
