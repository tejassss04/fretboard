'use client'

import { ChevronRight } from 'lucide-react'
import { Logo } from './logo'
import { useApp } from './app-provider'

const options = [
  { title: 'Beginner', detail: 'I am learning core chords and how to keep time.', icon: '01' },
  { title: 'Intermediate', detail: 'I play songs and want smoother technique and theory.', icon: '02' },
  { title: 'Advanced', detail: 'I want deeper fretboard fluency and intentional practice.', icon: '03' },
]

export function Onboarding() {
  const { chooseLevel } = useApp()
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <section className="onboarding-modal">
        <Logo />
        <span className="eyebrow">LET’S FIND YOUR STARTING POINT</span>
        <h2 id="onboarding-title">Where are you on your <em>guitar journey?</em></h2>
        <p>This helps Fretboard shape your daily practice—nothing is locked in, and you can change it anytime.</p>
        <div className="level-options">
          {options.map((option) => (
            <button key={option.title} onClick={() => chooseLevel(option.title)}>
              <b>{option.icon}</b>
              <span>
                <strong>{option.title}</strong>
                <small>{option.detail}</small>
              </span>
              <ChevronRight size={19} />
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
