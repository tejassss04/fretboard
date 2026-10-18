'use client'

import type { ReactNode } from 'react'
import { CalendarDays, Check, Clock3, Flame, Guitar } from 'lucide-react'
import { PageHeading } from './page-heading'
import { useApp } from './app-provider'

export function Progress() {
  const { level, weeklyMinutes } = useApp()
  const displayLevel = level || 'Intermediate'
  const calendar = Array.from({ length: 35 }, (_, i) => ({
    active: [1, 2, 4, 5, 8, 9, 10, 12, 15, 16, 18, 19, 22, 23, 24, 26, 29, 30, 32].includes(i),
    current: i === 30,
    day: i - 3,
  }))

  return (
    <>
      <PageHeading eyebrow="YOUR PROGRESS" title={<>Small work. <em>Real change.</em></>}>
        <button className="secondary-button"><CalendarDays size={16} />Last 30 days</button>
      </PageHeading>
      <section className="progress-hero">
        <div className="milestone-card wood-card">
          <div>
            <span className="eyebrow">CURRENT STREAK</span>
            <strong>7 <small>days</small></strong>
            <p>Two more sessions to beat your monthly best.</p>
          </div>
          <div className="flame-orb"><Flame size={38} /></div>
        </div>
        <div className="skill-card panel">
          <span className="eyebrow">PLAYER PROFILE</span>
          <h3>{displayLevel} · building momentum</h3>
          <div className="skill-bars">
            <SkillBar label="Chord fluency" value={72} />
            <SkillBar label="Rhythm & timing" value={61} />
            <SkillBar label="Fretboard knowledge" value={44} />
          </div>
        </div>
      </section>
      <section className="progress-grid">
        <div className="panel calendar-panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">PRACTICE RHYTHM</span>
              <h3>September 2026</h3>
            </div>
            <span className="legend"><i />Practiced</span>
          </div>
          <div className="weekday-row">{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => <span key={`${day}${i}`}>{day}</span>)}</div>
          <div className="calendar-grid">
            {calendar.map((cell, i) => (
              <span className={`${cell.active ? 'active' : ''} ${cell.current ? 'current' : ''}`} key={i}>
                {cell.day > 0 && cell.day <= 30 ? cell.day : ''}
              </span>
            ))}
          </div>
          <p className="calendar-note"><Flame size={16} />You practiced 16 days this month—your most consistent month yet.</p>
        </div>
        <div className="panel minutes-panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">TIME ON THE INSTRUMENT</span>
              <h3>Weekly practice</h3>
            </div>
            <strong>{weeklyMinutes}<small> min</small></strong>
          </div>
          <div className="bar-chart">
            {([['M', 24], ['T', 18], ['W', 32], ['T', 0], ['F', 28], ['S', 17], ['S', 24]] as [string, number][]).map(([day, amount], i) => (
              <div key={`${day}${i}`}>
                <i style={{ height: `${amount / 35 * 100}%` }} className={i === 6 ? 'today' : ''} />
                <span>{day}</span>
              </div>
            ))}
          </div>
          <p>You are <b>23 minutes</b> ahead of last week.</p>
        </div>
      </section>
      <section className="milestones panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">MILESTONES</span>
            <h3>The story so far</h3>
          </div>
        </div>
        <div className="milestone-list">
          <Milestone icon={<Flame />} title="Seven days in a row" detail="Consistency is becoming a habit." complete />
          <Milestone icon={<Clock3 />} title="10 hours practiced" detail="8h 42m logged so far" />
          <Milestone icon={<Guitar />} title="25 chords learned" detail="18 shapes saved to your collection" />
        </div>
      </section>
    </>
  )
}

function SkillBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="skill-bar">
      <div>
        <span>{label}</span>
        <b>{value}%</b>
      </div>
      <i><em style={{ width: `${value}%` }} /></i>
    </div>
  )
}

function Milestone({ icon, title, detail, complete }: { icon: ReactNode; title: string; detail: string; complete?: boolean }) {
  return (
    <div className={`milestone ${complete ? 'complete' : ''}`}>
      <div>{icon}</div>
      <span>
        <b>{title}</b>
        <small>{detail}</small>
      </span>
      {complete && <Check size={18} />}
    </div>
  )
}
