'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Music2, Pause, Play } from 'lucide-react'
import { useStoredState } from '@/lib/use-stored-state'
import { PageHeading } from './page-heading'

export function Metronome() {
  const [bpm, setBpm] = useStoredState('metronome-bpm', 76)
  const [signature, setSignature] = useStoredState('metronome-signature', 4)
  const [playing, setPlaying] = useState(false)
  const [beat, setBeat] = useState(0)
  const audioContext = useRef<AudioContext | null>(null)

  const sound = useCallback((downbeat: boolean) => {
    const context = audioContext.current || new AudioContext()
    audioContext.current = context
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.frequency.value = downbeat ? 1100 : 760
    gain.gain.setValueAtTime(0.0001, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(downbeat ? 0.22 : 0.13, context.currentTime + 0.004)
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.065)
    oscillator.connect(gain).connect(context.destination)
    oscillator.start()
    oscillator.stop(context.currentTime + 0.07)
  }, [])

  useEffect(() => {
    if (!playing) return
    sound(beat === 0)
    const id = setInterval(() => setBeat((old) => {
      const next = (old + 1) % signature
      sound(next === 0)
      return next
    }), 60000 / bpm)
    return () => clearInterval(id)
  }, [playing, bpm, signature, sound])

  useEffect(() => () => { audioContext.current?.close() }, [])

  return (
    <>
      <PageHeading eyebrow="METRONOME" title={<>Find your <em>pocket.</em></>}>
        <div className="tempo-display">{bpm} BPM</div>
      </PageHeading>
      <section className="metronome-panel wood-card">
        <div className="metro-top">
          <div>
            <span className="eyebrow">TEMPO</span>
            <div className="bpm-control">
              <button onClick={() => setBpm(Math.max(30, bpm - 1))}>−</button>
              <strong>{bpm}</strong>
              <button onClick={() => setBpm(Math.min(240, bpm + 1))}>+</button>
            </div>
            <input className="tempo-range" aria-label="Tempo" type="range" min="30" max="240" value={bpm} onChange={(e) => setBpm(Number(e.target.value))} />
            <div className="tempo-presets">
              {[60, 76, 90, 120].map((n) => (
                <button onClick={() => setBpm(n)} className={bpm === n ? 'active' : ''} key={n}>{n}</button>
              ))}
            </div>
          </div>
          <div className="beat-visual">
            {Array.from({ length: signature }, (_, index) => (
              <i className={`${playing && beat === index ? 'pulse' : ''} ${index === 0 ? 'downbeat' : ''}`} key={index}>{index + 1}</i>
            ))}
          </div>
        </div>
        <div className="metro-bottom">
          <div>
            <span className="eyebrow">TIME SIGNATURE</span>
            <div className="signature-buttons">
              {[3, 4, 6].map((n) => (
                <button className={signature === n ? 'active' : ''} onClick={() => { setSignature(n); setBeat(0) }} key={n}>{n}/4</button>
              ))}
            </div>
          </div>
          <button
            className={`metro-play ${playing ? 'playing' : ''}`}
            onClick={() => {
              if (!playing) {
                void audioContext.current?.resume()
                setBeat(0)
              }
              setPlaying(!playing)
            }}
          >
            {playing ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
          </button>
          <div className="metro-hint">
            <Music2 size={19} />
            <span>{playing ? 'Keep your motion relaxed.' : 'Press play and count along.'}</span>
          </div>
        </div>
      </section>
      <section className="metronome-tips panel">
        <div>
          <span className="eyebrow">PRACTICE BETTER</span>
          <h3>The click is your friend.</h3>
        </div>
        <p>Start at the tempo where every note is easy, not the tempo where it is barely possible. Add 4 BPM only after three clean repetitions.</p>
      </section>
    </>
  )
}
