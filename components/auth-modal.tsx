'use client'

import { useState, type FormEvent } from 'react'
import { CircleUserRound, LockKeyhole, Mail, X } from 'lucide-react'
import { hasSupabase, supabase } from '@/lib/supabase'
import { Logo } from './logo'
import { useApp } from './app-provider'

export function AuthModal() {
  const { user, setShowAuth } = useApp()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('')

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!hasSupabase || !supabase) {
      setStatus('Connect Supabase to activate real accounts. The app is ready for your project keys.')
      return
    }
    setStatus('Working…')
    const result = mode === 'signin'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })
    setStatus(result.error ? result.error.message : mode === 'signin' ? 'You are signed in.' : 'Check your email to confirm your account.')
  }

  const google = async () => {
    if (!hasSupabase || !supabase) {
      setStatus('Connect Supabase to activate Google sign-in.')
      return
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) setStatus(error.message)
  }

  const signOut = async () => {
    await supabase?.auth.signOut()
    setShowAuth(false)
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="auth-title">
      <section className="auth-modal">
        <button className="icon-button close-auth" onClick={() => setShowAuth(false)} aria-label="Close"><X size={20} /></button>
        <Logo />
        {user ? (
          <div className="signed-in">
            <CircleUserRound size={38} />
            <h2 id="auth-title">You’re signed in.</h2>
            <p>{user.email}</p>
            <button className="primary-button" onClick={signOut}>Sign out</button>
          </div>
        ) : (
          <>
            <span className="eyebrow">YOUR FRETBOARD ACCOUNT</span>
            <h2 id="auth-title">Keep your progress <em>in sync.</em></h2>
            <p className="auth-intro">Sign in to save your practice across devices.</p>
            <button className="google-button" onClick={google}><span className="google-g">G</span>Continue with Google</button>
            <div className="divider"><i />or continue with email<i /></div>
            <form onSubmit={submit}>
              <label>Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></label>
              <label>Password<input required minLength={6} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" /></label>
              <button className="primary-button form-button" type="submit"><Mail size={17} />{mode === 'signin' ? 'Sign in' : 'Create account'}</button>
            </form>
            <p className="auth-switch">
              {mode === 'signin' ? 'New here?' : 'Already have an account?'}{' '}
              <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setStatus('') }}>
                {mode === 'signin' ? 'Create an account' : 'Sign in'}
              </button>
            </p>
            {status && <p className={`auth-status ${status.includes('ready') ? 'info' : ''}`}>{status}</p>}
            {!hasSupabase && <p className="auth-config"><LockKeyhole size={14} />Account UI is ready; add Supabase keys to turn it on.</p>}
          </>
        )}
      </section>
    </div>
  )
}
