'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, type ComponentType, type ReactNode } from 'react'
import { BarChart3, CircleUserRound, Clock, Gauge, Guitar, LayoutDashboard, ListMusic, LogIn, Menu, Music2, Settings2, Sparkles, TimerReset, X } from 'lucide-react'
import { Logo } from './logo'
import { useApp } from './app-provider'
import { Onboarding } from './onboarding'
import { AuthModal } from './auth-modal'

const nav: [string, ComponentType<{ size?: number }>, string][] = [
  ['Dashboard', LayoutDashboard, '/'],
  ['Chord Explorer', Guitar, '/chords'],
  ['Scale Explorer', Music2, '/scales'],
  ['Practice', TimerReset, '/practice'],
  ['Songs', ListMusic, '/songs'],
  ['Tuner', Gauge, '/tuner'],
  ['Metronome', Clock, '/metronome'],
  ['Progress', BarChart3, '/progress'],
]

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const { level, user, showOnboarding, showAuth, setShowOnboarding, setShowAuth } = useApp()

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="sidebar-top">
          <Logo />
          <button className="icon-button close-menu" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X size={20} /></button>
        </div>
        <nav aria-label="Main navigation">
          {nav.map(([name, Icon, href]) => (
            <Link
              key={name}
              href={href}
              className={`nav-item ${pathname === href ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <Icon size={18} />
              <span>{name}</span>
              {name === 'Practice' && <b>01</b>}
            </Link>
          ))}
        </nav>
        <div className="studio-card">
          <span className="eyebrow">YOUR STUDIO</span>
          <strong>Make it count.</strong>
          <p>One focused session is enough to move forward.</p>
          <div className="studio-lines"><i /><i /><i /><i /><i /><i /></div>
        </div>
        <div className="sidebar-profile">
          <div className="avatar">{user?.email?.[0]?.toUpperCase() || 'T'}</div>
          <div>
            <strong>{user?.email?.split('@')[0] || 'Tejas'}</strong>
            <small>{level || 'Choose your level'}</small>
          </div>
          <button className="icon-button" onClick={() => setShowAuth(true)} aria-label="Account settings"><Settings2 size={17} /></button>
        </div>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <button className="icon-button menu-button" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu size={22} /></button>
          <div className="mobile-logo"><Logo /></div>
          <div className="topbar-actions">
            <button className="level-button" onClick={() => setShowOnboarding(true)}><Sparkles size={15} />{level || 'Set your level'}</button>
            <button className="account-button" onClick={() => setShowAuth(true)}>
              {user ? <><CircleUserRound size={18} />{user.email?.split('@')[0]}</> : <><LogIn size={17} />Sign in</>}
            </button>
          </div>
        </header>
        <main className="page-content">{children}</main>
      </div>
      {showOnboarding && <Onboarding />}
      {showAuth && <AuthModal />}
    </div>
  )
}
