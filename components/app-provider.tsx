'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { load } from '@/lib/storage'
import { supabase } from '@/lib/supabase'
import { useStoredState } from '@/lib/use-stored-state'

type AppContextValue = {
  level: string
  showOnboarding: boolean
  showAuth: boolean
  user: User | null
  weeklyMinutes: number
  setShowOnboarding: (open: boolean) => void
  setShowAuth: (open: boolean) => void
  chooseLevel: (choice: string) => void
  finishPractice: (minutes: number) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [level, setLevel] = useStoredState('level', '')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [weeklyMinutes, setWeeklyMinutes] = useStoredState('weekly-minutes', 143)

  useEffect(() => {
    if (!load('level', '')) setShowOnboarding(true)
  }, [])

  useEffect(() => {
    if (!supabase) return undefined
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const chooseLevel = (choice: string) => {
    setLevel(choice)
    setShowOnboarding(false)
  }

  const finishPractice = (minutes: number) => {
    setWeeklyMinutes((current) => current + minutes)
  }

  return (
    <AppContext.Provider
      value={{
        level,
        showOnboarding,
        showAuth,
        user,
        weeklyMinutes,
        setShowOnboarding,
        setShowAuth,
        chooseLevel,
        finishPractice,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}
