'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';

interface StartPlayingButtonProps {
  onClick?: () => void;
  href?: string;
  label?: string;
  size?: 'default' | 'compact';
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<StartPlayingButtonProps['size']>, string> = {
  default: 'gap-2.5 px-7 py-3.5 sm:px-8 sm:py-4 text-sm',
  compact: 'gap-1.5 px-3.5 py-1.5 text-xs',
};

/**
 * Primary CTA pill styled with the Hero Bento Grid's SpotlightCard surface:
 * frosted backdrop, subtle resting border that blends with the Amber Light Ribbons background,
 * and hover-only amber-gold border + cursor-tracking spotlight glow.
 */
export default function StartPlayingButton({
  onClick,
  href,
  label = 'Start playing',
  size = 'default',
  className = '',
}: StartPlayingButtonProps) {
  const elementRef = useRef<HTMLElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!elementRef.current) return;
    const rect = elementRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const sharedClasses = `group relative inline-flex items-center overflow-hidden rounded-full border border-[#EAE8E4]/50 dark:border-white/[0.04] bg-white/75 dark:bg-[#15111B]/65 backdrop-blur-md text-[#171717] dark:text-[#F5F5F4] font-semibold tracking-tight shadow-[0_12px_30px_rgba(23,23,23,0.04)] dark:shadow-[0_12px_30px_rgba(0,0,0,0.28)] hover:border-[#D4AD61]/35 dark:hover:border-[#D4AD61]/35 hover:shadow-[0_8px_24px_rgba(212,173,97,0.08)] dark:hover:shadow-[0_0_16px_rgba(212,173,97,0.14),0_12px_30px_rgba(0,0,0,0.4)] transition-all duration-300 active:scale-[0.98] cursor-pointer ${SIZE_CLASSES[size]} ${className}`;

  const spotlightSize = size === 'compact' ? 95 : 160;

  const content = (
    <>
      {/* Dynamic Cursor Spotlight Layer (contained strictly inside the pill) */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px rounded-full transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(${spotlightSize}px circle at ${position.x}px ${position.y}px, rgba(212, 173, 97, 0.12), rgba(245, 158, 11, 0.06), transparent 70%)`,
        }}
      />
      <span className="relative z-10">{label}</span>
      <span
        className={`relative z-10 transition-transform duration-200 ${
          size === 'compact' ? 'group-hover:translate-x-0.5' : 'group-hover:translate-x-1'
        } text-[#171717]/75 dark:text-[#E9D8B7]`}
      >
        →
      </span>
    </>
  );

  if (href) {
    return (
      <Link
        ref={elementRef as React.RefObject<HTMLAnchorElement>}
        href={href}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setOpacity(1)}
        onMouseLeave={() => setOpacity(0)}
        className={sharedClasses}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      ref={elementRef as React.RefObject<HTMLButtonElement>}
      type="button"
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={sharedClasses}
    >
      {content}
    </button>
  );
}
