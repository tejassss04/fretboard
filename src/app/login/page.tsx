import React, { Suspense } from 'react';
import SplitLoginForm from '@/components/auth/SplitLoginForm';

export const metadata = {
  title: 'Log in to Fretboard',
  description: 'Connect to Fretboard with your studio account or OAuth provider.',
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex bg-[#07050A] items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-[#D4AD61] animate-spin" />
        </div>
      }
    >
      <SplitLoginForm />
    </Suspense>
  );
}
