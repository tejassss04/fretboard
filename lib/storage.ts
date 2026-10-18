const prefix = 'fretboard:'

export function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const saved = localStorage.getItem(prefix + key)
    return saved ? (JSON.parse(saved) as T) : fallback
  } catch {
    return fallback
  }
}

export function save<T>(key: string, value: T) {
  if (typeof window === 'undefined') return
  localStorage.setItem(prefix + key, JSON.stringify(value))
}
