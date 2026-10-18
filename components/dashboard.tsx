'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { ChevronRight, Clock3, Flame, Guitar, MoreHorizontal, Play, Target } from 'lucide-react'
import { recentActivity } from '@/lib/data'
import { PageHeading } from './page-heading'
import { useApp } from './app-provider'

export function Dashboard() {
  const router = useRouter()
  const { level, weeklyMinutes } = useApp()
  const displayLevel = level || 'Intermediate'
  const weekPercent = Math.min(100, Math.round(weeklyMinutes / 210 * 100))

  return (
    <>
      <PageHeading eyebrow="SUNDAY, SEPTEMBER 27" title={<>Good morning, <em>Tejas.</em></>}>
        <button className="primary-button" onClick={() => router.push('/practice')}><Play size={16} fill="currentColor" />Start today’s session</button>
      </PageHeading>
      <section className="dashboard-hero wood-card">
        <div className="hero-copy">
          <div className="hero-kicker"><span className="status-dot" />TODAY’S FOCUS · 30 MIN</div>
          <h2>Clean changes.<br /><em>Better feel.</em></h2>
          <p>Build ease between your core open chords, then put it to work in a song.</p>
          <div className="hero-steps">
            <span>01 <b>Warm up</b></span><i />
            <span>02 <b>Chord flow</b></span><i />
            <span>03 <b>Play a song</b></span>
          </div>
          <button className="ghost-light" onClick={() => router.push('/practice')}>View practice plan <ChevronRight size={16} /></button>
        </div>
        <div className="hero-fretboard" aria-hidden="true">
          <div className="floating-note n1">G</div>
          <div className="floating-note n2">C</div>
          <div className="floating-note n3">D</div>
          {['one', 'two', 'three', 'four', 'five'].map((n) => <div className={`fret-wire ${n}`} key={n} />)}
          <div className="fret-strings">{[1, 2, 3, 4, 5, 6].map((n) => <i key={n} />)}</div>
        </div>
      </section>
      <section className="stat-grid">
        <StatCard icon={<Flame />} label="CURRENT STREAK" value="7" suffix="days" detail="Your best is 14" accent="amber" spark="▁▂▄▃▆▇▅" />
        <StatCard icon={<Clock3 />} label="THIS WEEK" value={weeklyMinutes} suffix="min" detail={`${weekPercent}% of your 210 min goal`} accent="cream" progress={weekPercent} />
        <StatCard icon={<Target />} label="YOUR LEVEL" value={displayLevel} detail="Path: Confident foundations" accent="green" />
      </section>
      <section className="dashboard-grid">
        <div className="panel next-panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">PICK UP HERE</span>
              <h3>What to practice next</h3>
            </div>
            <button className="text-button" onClick={() => router.push('/practice')}>Open plan <ChevronRight size={16} /></button>
          </div>
          <div className="recommendation">
            <div className="recommendation-icon"><Guitar size={23} /></div>
            <div>
              <span>CHORD TRANSITIONS</span>
              <h4>G → C without the pause</h4>
              <p>Your timing slips in this move after 4 bars. Slow it down and build back up.</p>
              <div className="tag-row"><b>8 min</b><b>76 BPM</b><b>Beginner-friendly</b></div>
            </div>
            <button className="round-play" onClick={() => router.push('/practice')} aria-label="Start chord transition practice"><Play size={18} fill="currentColor" /></button>
          </div>
        </div>
        <div className="panel activity-panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">LAST 7 DAYS</span>
              <h3>Recent activity</h3>
            </div>
            <button className="icon-button"><MoreHorizontal size={20} /></button>
          </div>
          <div className="activity-list">
            {recentActivity.map((item) => (
              <div className="activity" key={item.title}>
                <span className={`activity-dot ${item.color}`} />
                <div>
                  <h4>{item.title}</h4>
                  <p>{item.detail}</p>
                </div>
                <div className="activity-meta">
                  <small>{item.time}</small>
                  <strong>{item.minutes}</strong>
                </div>
              </div>
            ))}
          </div>
          <Link className="wide-text-button" href="/progress">See full progress <ChevronRight size={16} /></Link>
        </div>
      </section>
    </>
  )
}

function StatCard({
  icon,
  label,
  value,
  suffix,
  detail,
  accent,
  spark,
  progress,
}: {
  icon: ReactNode
  label: string
  value: string | number
  suffix?: string
  detail: string
  accent: string
  spark?: string
  progress?: number
}) {
  return (
    <article className={`stat-card ${accent}`}>
      <div className="stat-icon">{icon}</div>
      <span className="eyebrow">{label}</span>
      <div className="stat-value">{value} {suffix && <small>{suffix}</small>}</div>
      <p>{detail}</p>
      {spark && <div className="spark">{spark}</div>}
      {progress !== undefined && <div className="progress-line"><i style={{ width: `${progress}%` }} /></div>}
    </article>
  )
}
