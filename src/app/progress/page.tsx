import React, { Suspense } from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import ProgressTelemetry from '@/components/tools/ProgressTelemetry';
import StudioMiniDock from '@/components/tools/StudioMiniDock';
import StudioPageHeader from '@/components/tools/StudioPageHeader';

export default function ProgressPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0C0A09] via-[#110F0D] to-[#0C0A09] text-[#F5F5F4] flex flex-col font-sans selection:bg-[#E9D8B7] selection:text-[#171717]">
      <Navbar />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-10 space-y-6">
        <StudioPageHeader
          eyebrow="Analytics · Telemetry"
          titleLeading="Small work."
          titleAccent="Real change."
          description="Cumulative sessions, focused minutes, streak continuity, and 35-day activity heatmap."
        />

        <Suspense
          fallback={
            <div className="min-h-[400px] flex items-center justify-center animate-pulse text-xs font-mono text-[#77746F]">
              Loading Practice Telemetry...
            </div>
          }
        >
          <ProgressTelemetry />
        </Suspense>

        <StudioMiniDock />
      </main>

      <Footer />
    </div>
  );
}
