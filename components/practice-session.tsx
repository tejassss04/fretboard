'use client'

import { useEffect, useState } from 'react'
import { Check, ChevronRight, Pause, Play, RotateCcw, Settings2 } from 'lucide-react'
import { initialTasks } from '@/lib/data'
import { formatTime } from '@/lib/music'
import { useStoredState } from '@/lib/use-stored-state'
import { PageHeading } from './page-heading'
import { useApp } from './app-provider'

export function PracticeSession() {
  const { finishPractice } = useApp()
  const [tasks, setTasks] = useStoredState('session-tasks', initialTasks)
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)
  const [complete, setComplete] = useState(false)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [running])

  const doneCount = tasks.filter((task) => task.done).length
  const toggleTask = (id: string) => setTasks((current) => current.map((task) => task.id === id ? { ...task, done: !task.done } : task))
  const finish = () => {
    setRunning(false)
    setComplete(true)
    finishPractice(Math.max(1, Math.round(seconds / 60) || 30))
  }

  return (
    <>
      <PageHeading eyebrow="PRACTICE SESSION" title={<>Practice with <em>intent.</em></>}>
        <button className="secondary-button"><Settings2 size={16} />Customize plan</button>
      </PageHeading>
      {complete && (
        <div className="completion-banner">
          <div><Check size={20} /></div>
          <span><b>Session saved.</b> Great work—your streak and weekly total have been updated.</span>
          <button onClick={() => { setSeconds(0); setComplete(false); setTasks(initialTasks) }}>Start fresh</button>
        </div>
      )}
      <section className="practice-layout">
        <div className="session-timer wood-card">
          <span className="eyebrow">SESSION CLOCK</span>
          <div className="timer-ring">
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" />
              <circle className="timer-progress" cx="60" cy="60" r="52" style={{ strokeDashoffset: 326 - Math.min(326, seconds / 1800 * 326) }} />
            </svg>
            <div>
              <strong>{formatTime(seconds)}</strong>
              <small>of 30:00</small>
            </div>
          </div>
          <p>{running ? 'Stay relaxed. You are building the habit.' : 'Ready when you are. No pressure—just show up.'}</p>
          <div className="timer-actions">
            <button className="timer-main" onClick={() => setRunning(!running)}>
              {running ? <><Pause size={18} fill="currentColor" />Pause</> : <><Play size={18} fill="currentColor" />Begin session</>}
            </button>
            <button className="icon-button light" onClick={() => setSeconds(0)} aria-label="Reset session"><RotateCcw size={18} /></button>
          </div>
        </div>
        <div className="session-plan panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">TODAY’S PLAN</span>
              <h3>{doneCount} of {tasks.length} complete</h3>
            </div>
            <span className="plan-minutes">30 min</span>
          </div>
          <div className="task-list">
            {tasks.map((task, index) => (
              <button className={`practice-task ${task.done ? 'done' : ''}`} key={task.id} onClick={() => toggleTask(task.id)}>
                <span className="task-number">0{index + 1}</span>
                <span className="task-check">{task.done && <Check size={15} />}</span>
                <span>
                  <b>{task.title}</b>
                  <small>{task.detail}</small>
                </span>
                <ChevronRight size={18} />
              </button>
            ))}
          </div>
          <button className="complete-session" disabled={doneCount < tasks.length} onClick={finish}>
            {doneCount < tasks.length ? `Complete ${tasks.length - doneCount} more item${tasks.length - doneCount > 1 ? 's' : ''}` : <><Check size={18} />Complete session</>}
          </button>
        </div>
      </section>
    </>
  )
}
