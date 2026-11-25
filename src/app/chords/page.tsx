import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import ChordExplorer from '@/components/tools/ChordExplorer';
import StudioMiniDock from '@/components/tools/StudioMiniDock';
import StudioPageHeader from '@/components/tools/StudioPageHeader';

export default function ChordsPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0C0A09] via-[#110F0D] to-[#0C0A09] text-[#F5F5F4] flex flex-col font-sans selection:bg-[#E9D8B7] selection:text-[#171717]">
      <Navbar />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-10 space-y-6">
        <StudioPageHeader
          eyebrow="Studio · Voicings"
          titleLeading="Chord"
          titleAccent="Voicings & Shapes"
          description="Explore fingerings across open, barre, and extended voicings with live Web Audio strumming."
        />

        <ChordExplorer />

        <StudioMiniDock />
      </main>

      <Footer />
    </div>
  );
}
