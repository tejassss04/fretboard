import React, { Suspense } from 'react';
import SplitSignupForm from '@/components/auth/SplitSignupForm';

export const metadata = {
  title: 'Sign up for Fretboard',
  description: 'Create your Fretboard studio account to sync your chords, progress, and practice session repertoire.',
};

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex bg-[#07050A] items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-[#D4AD61] animate-spin" />
        </div>
      }
    >
      <SplitSignupForm />
    </Suspense>
  );
}
