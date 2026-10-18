'use client'

import { useEffect, useState } from 'react'
import { load, save } from './storage'

export function useStoredState<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setValue(load(key, fallback))
    setHydrated(true)
  }, [key])

  useEffect(() => {
    if (hydrated) save(key, value)
  }, [hydrated, key, value])

  return [value, setValue] as const
}
