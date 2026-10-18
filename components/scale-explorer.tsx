'use client'

import { useState } from 'react'
import { Play, Plus, Sparkles } from 'lucide-react'
import { scaleLibrary } from '@/lib/data'
import { roots, scaleIntervals, type RootNote, type ScaleId } from '@/lib/music'
import type { Scale } from '@/lib/types'
import { PageHeading } from './page-heading'

export function ScaleExplorer() {
  const [root, setRoot] = useState<RootNote>('A')
  const [scaleId, setScaleId] = useState<ScaleId>('minor-pentatonic')
  const [position, setPosition] = useState(1)
  const current = scaleLibrary.find((scale) => scale.id === scaleId) ?? scaleLibrary[1]

  return (
    <>
      <PageHeading eyebrow="SCALE EXPLORER" title={<>Make the neck <em>make sense.</em></>}>
        <button className="secondary-button"><Plus size={16} />Build a routine</button>
      </PageHeading>
      <section className="scale-workspace">
        <div className="scale-controls panel">
          <div className="control-group">
            <span className="eyebrow">ROOT NOTE</span>
            <div className="root-grid">
              {roots.map((note) => (
                <button className={root === note ? 'active' : ''} key={note} onClick={() => setRoot(note)}>{note}</button>
              ))}
            </div>
          </div>
          <div className="control-group">
            <span className="eyebrow">SCALE</span>
            <div className="scale-options">
              {scaleLibrary.map((scale) => (
                <button key={scale.id} onClick={() => setScaleId(scale.id)} className={scaleId === scale.id ? 'active' : ''}>
                  <b>{scale.name}</b>
                  <small>{scale.mood}</small>
                </button>
              ))}
            </div>
          </div>
          <div className="control-group">
            <span className="eyebrow">POSITION</span>
            <div className="position-row">
              {[1, 2, 3, 4, 5].map((n) => (
                <button className={position === n ? 'active' : ''} key={n} onClick={() => setPosition(n)}>{n}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="fretboard-panel panel">
          <div className="scale-title">
            <div>
              <span className="eyebrow">{current.intervals}</span>
              <h2>{root} {current.name}</h2>
              <p>{current.blurb}</p>
            </div>
            <button className="round-play"><Play size={18} fill="currentColor" /></button>
          </div>
          <Fretboard root={root} scale={current} position={position} />
          <div className="fretboard-key">
            <span><i className="root-key" />Root note</span>
            <span><i className="scale-key" />Scale note</span>
            <span>Position {position} of {current.positions}</span>
          </div>
          <div className="scale-suggestion">
            <Sparkles size={19} />
            <div>
              <b>Practice suggestion</b>
              <p>{current.suggestion}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function Fretboard({ root, scale, position }: { root: RootNote; scale: Scale; position: number }) {
  const tuning = ['E', 'A', 'D', 'G', 'B', 'E'] as const
  const rootIndex = roots.indexOf(root)
  const start = (position - 1) * 3
  const activeFrets = Array.from({ length: 6 }, (_, string) => Array.from({ length: 13 }, (_, fret) => {
    const note = roots[(roots.indexOf(tuning[string] as RootNote) + fret) % 12]
    const offset = (roots.indexOf(note) - rootIndex + 12) % 12
    return {
      note,
      root: offset === 0,
      active: scaleIntervals[scale.id].includes(offset),
      visible: fret >= Math.max(0, start - 1) && fret <= start + 5,
    }
  }))

  return (
    <div className="fretboard" role="img" aria-label={`${root} ${scale.name} on fretboard`}>
      <div className="fret-numbers">{Array.from({ length: 13 }, (_, i) => <span key={i}>{i || ''}</span>)}</div>
      {activeFrets.map((row, string) => (
        <div className="fret-row" key={string}>
          <span className="tuning-label">{tuning[string]}</span>
          {row.map((cell, fret) => (
            <span className={`fret-cell ${cell.active && cell.visible ? 'active' : ''} ${cell.root && cell.visible ? 'root' : ''}`} key={fret}>
              {cell.active && cell.visible ? cell.note.replace('♯', '#') : ''}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}
