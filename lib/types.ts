import type { ScaleId } from './music'

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced'

export type Chord = {
  id: string
  name: string
  short: string
  type: string
  difficulty: string
  notes: string[]
  fingers: [number, number | 'x'][]
  tip: string
  next: string
}

export type Scale = {
  id: ScaleId
  name: string
  intervals: string
  mood: string
  positions: number
  blurb: string
  suggestion: string
}

export type Song = {
  id: number
  title: string
  artist: string
  difficulty: string
  progress: number
  chords: string
  last: string
}

export type PracticeTask = {
  id: string
  title: string
  detail: string
  done: boolean
}

export type Activity = {
  title: string
  detail: string
  time: string
  minutes: string
  color: string
}

export type NavItem = {
  name: string
  href: string
}
