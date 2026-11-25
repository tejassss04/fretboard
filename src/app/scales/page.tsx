import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import ScaleExplorer from '@/components/tools/ScaleExplorer';
import StudioMiniDock from '@/components/tools/StudioMiniDock';
import StudioPageHeader from '@/components/tools/StudioPageHeader';

export default function ScalesPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0C0A09] via-[#110F0D] to-[#0C0A09] text-[#F5F5F4] flex flex-col font-sans selection:bg-[#E9D8B7] selection:text-[#171717]">
      <Navbar />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-10 space-y-6">
        <StudioPageHeader
          eyebrow="Studio · Harmony"
          titleLeading="Scale &amp; Mode"
          titleAccent="Matrix"
          description="Map tonal centers, interval degrees, and modal colors across the full 24-fret neck."
        />

        <ScaleExplorer />

        <StudioMiniDock />
      </main>

      <Footer />
    </div>
  );
}
