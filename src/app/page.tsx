'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import FeatureShowcase from '@/components/landing/FeatureShowcase';
import MultiplayerShowcase from '@/components/landing/MultiplayerShowcase';
import PracticeSuiteShowcase from '@/components/landing/PracticeSuiteShowcase';
import FinalCTA from '@/components/landing/FinalCTA';
import Footer from '@/components/landing/Footer';

export default function Home() {
  const router = useRouter();

  const handleNavigateToFretboard = () => {
    router.push('/fretboard');
  };

  const handleExploreFeatures = () => {
    const el = document.getElementById('features');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0E0B14] text-[#F5F5F4] flex flex-col font-sans selection:bg-[#E9D8B7] selection:text-[#171717]">

      {/* Continuous Amber Light Ribbons Background across the entire landing page (Tailwind CSS) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-[url(/images/bg-amber-light-ribbons.svg)] bg-cover bg-center bg-no-repeat opacity-85"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-[#0E0B14]/[0.45] via-[#0E0B14]/[0.30] to-[#0E0B14]/[0.65]"
      />

      {/* 1. COMPACT STICKY NAVBAR */}
      <Navbar onStartPlaying={handleNavigateToFretboard} />

      {/* 2. LANDING SECTIONS OVER SHARED CONTINUOUS BACKDROP */}
      <main className="relative z-10 flex flex-1 flex-col">
        <HeroSection
          onStartPlaying={handleNavigateToFretboard}
          onExploreFeatures={handleExploreFeatures}
        />

        {/* 3. INTERACTIVE FEATURE SHOWCASE (01/Explore • 02/Understand • 03/Play) */}
        <FeatureShowcase />

        {/* 4. REAL-TIME MULTIPLAYER COLLABORATION SHOWCASE */}
        <MultiplayerShowcase />

        {/* 5. PRACTICE SUITE & TOOLS SHOWCASE */}
        <PracticeSuiteShowcase />

        {/* 6. FINAL CALL TO ACTION */}
        <FinalCTA onStartPlaying={handleNavigateToFretboard} />
      </main>

      <Footer onStartPlaying={handleNavigateToFretboard} />

    </div>
  );
}
