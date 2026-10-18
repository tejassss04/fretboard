'use client'

import { useState } from 'react'
import { BookOpen, ChevronRight, Play, Search, SlidersHorizontal, Sparkles, Star } from 'lucide-react'
import { chords } from '@/lib/data'
import type { Chord } from '@/lib/types'
import { PageHeading } from './page-heading'

export function ChordExplorer() {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(chords[0])
  const filtered = chords.filter((chord) => `${chord.name} ${chord.type} ${chord.difficulty}`.toLowerCase().includes(query.toLowerCase()))

  return (
    <>
      <PageHeading eyebrow="CHORD LIBRARY" title={<>Find your next <em>shape.</em></>}>
        <button className="secondary-button"><BookOpen size={16} />My chord collection</button>
      </PageHeading>
      <div className="explorer-layout">
        <section className="library-panel panel">
          <label className="search-box">
            <Search size={18} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search chords, notes, moods…" aria-label="Search chords" />
            <kbd>⌘ K</kbd>
          </label>
          <div className="filter-row">
            <button className="filter active">All chords</button>
            <button className="filter">Open</button>
            <button className="filter">Barre</button>
            <button className="filter"><SlidersHorizontal size={14} />Filter</button>
          </div>
          <div className="chord-list">
            {filtered.map((chord) => (
              <button className={`chord-list-item ${selected.id === chord.id ? 'selected' : ''}`} onClick={() => setSelected(chord)} key={chord.id}>
                <span className="chord-name">{chord.short}</span>
                <span>
                  <strong>{chord.name}</strong>
                  <small>{chord.type} · {chord.difficulty}</small>
                </span>
                <ChevronRight size={17} />
              </button>
            ))}
            {!filtered.length && <div className="empty-state"><Search /><p>No chords match that search.</p></div>}
          </div>
        </section>
        <section className="chord-detail panel">
          <div className="detail-top">
            <div>
              <span className="eyebrow">{selected.type.toUpperCase()} · {selected.difficulty.toUpperCase()}</span>
              <h2>{selected.name}</h2>
              <p className="note-pills">{selected.notes.map((note) => <b key={note}>{note}</b>)}</p>
            </div>
            <button className="save-button"><Star size={17} />Save</button>
          </div>
          <div className="diagram-and-info">
            <ChordDiagram chord={selected} />
            <div className="fingering-copy">
              <span className="eyebrow">FINGERING</span>
              <h3>Let it ring.</h3>
              <p>Play each string one at a time, then strum slowly. Listen for a clear, even chord.</p>
              <div className="finger-legend">
                <span><i className="finger one">1</i>Index</span>
                <span><i className="finger two">2</i>Middle</span>
                <span><i className="finger three">3</i>Ring</span>
              </div>
            </div>
          </div>
          <div className="chord-tip">
            <Sparkles size={18} />
            <div>
              <b>Coach’s note</b>
              <p>{selected.tip}</p>
            </div>
          </div>
          <div className="next-up">
            <div>
              <span className="eyebrow">NEXT, TRY THIS</span>
              <h4>{selected.next}</h4>
            </div>
            <button className="round-play"><Play size={18} fill="currentColor" /></button>
          </div>
        </section>
      </div>
    </>
  )
}

function ChordDiagram({ chord }: { chord: Chord }) {
  return (
    <div className="chord-diagram" aria-label={`${chord.name} chord diagram`}>
      <div className="diagram-open-row">
        {chord.fingers.map(([, fret], index) => <span key={index}>{fret === 'x' ? '×' : fret === 0 ? '○' : ''}</span>)}
      </div>
      <div className="diagram-grid">
        <div className="diagram-nut" />
        {[1, 2, 3, 4, 5].map((fret) => <div className="diagram-fret" key={fret} />)}
        {[0, 1, 2, 3, 4, 5].map((string) => <div className="diagram-string" key={string} />)}
        {chord.fingers.map(([string, fret], index) => typeof fret === 'number' && fret > 0 && (
          <span className={`diagram-dot finger-${Math.min(index + 1, 4)}`} style={{ left: `${string * 20}%`, top: `${(fret - 0.5) * 20}%` }} key={`${string}-${fret}`}>
            {Math.min(index + 1, 4)}
          </span>
        ))}
      </div>
      <div className="diagram-string-names">{['E', 'A', 'D', 'G', 'B', 'e'].map((n) => <span key={n}>{n}</span>)}</div>
    </div>
  )
}
