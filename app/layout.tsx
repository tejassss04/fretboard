import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { AppProvider } from '@/components/app-provider'
import { AppShell } from '@/components/app-shell'
import './globals.css'

export const metadata: Metadata = {
  title: 'Fretboard — Practice with purpose',
  description: 'Fretboard — a better way to practice guitar.',
  other: { 'theme-color': '#171311' },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          <AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  )
}
