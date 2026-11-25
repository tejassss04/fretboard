import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import CapCalc from '@/components/tools/CapCalc';
import StudioMiniDock from '@/components/tools/StudioMiniDock';
import StudioPageHeader from '@/components/tools/StudioPageHeader';

export default function CapCalcPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0C0A09] via-[#110F0D] to-[#0C0A09] text-[#F5F5F4] flex flex-col font-sans selection:bg-[#E9D8B7] selection:text-[#171717]">
      <Navbar />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-10 space-y-6">
        <StudioPageHeader
          eyebrow="Resources · Music Theory"
          titleLeading="CapCalc"
          titleAccent="Capo Calculator"
          description="Type any chord or progression, pick your capo fret, and instantly see what it sounds like."
          align="center"
        />

        <CapCalc />

        <StudioMiniDock />
      </main>

      <Footer />
    </div>
  );
}
