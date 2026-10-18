'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Mic, MicOff } from 'lucide-react'
import { autoCorrelate, noteFromFrequency } from '@/lib/music'
import { PageHeading } from './page-heading'

type AudioRefs = {
  stream: MediaStream
  context: AudioContext
  analyser: AnalyserNode
}

type Target = { note: string; hz: number }

export function Tuner() {
  const [isListening, setIsListening] = useState(false)
  const [note, setNote] = useState('—')
  const [frequency, setFrequency] = useState(0)
  const [message, setMessage] = useState('Tap to use your microphone')
  const audioRef = useRef<AudioRefs | null>(null)
  const frameRef = useRef(0)

  const stop = useCallback(() => {
    cancelAnimationFrame(frameRef.current)
    audioRef.current?.stream.getTracks().forEach((track) => track.stop())
    if (audioRef.current?.context.state !== 'closed') audioRef.current?.context.close()
    audioRef.current = null
    setIsListening(false)
  }, [])

  useEffect(() => () => stop(), [stop])

  const start = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMessage('Microphone input is not available in this browser.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const context = new AudioContext()
      const analyser = context.createAnalyser()
      analyser.fftSize = 2048
      context.createMediaStreamSource(stream).connect(analyser)
      audioRef.current = { stream, context, analyser }
      setIsListening(true)
      setMessage('Listening for a steady note…')
      const buffer = new Float32Array(analyser.fftSize)
      const detect = () => {
        analyser.getFloatTimeDomainData(buffer)
        const hz = autoCorrelate(buffer, context.sampleRate)
        if (hz > 70 && hz < 450) {
          setFrequency(hz)
          setNote(noteFromFrequency(hz))
        }
        frameRef.current = requestAnimationFrame(detect)
      }
      detect()
    } catch {
      setMessage('Microphone access was not granted. Check your browser permission and try again.')
    }
  }

  const targets: Target[] = [
    { note: 'E', hz: 82.41 },
    { note: 'A', hz: 110 },
    { note: 'D', hz: 146.83 },
    { note: 'G', hz: 196 },
    { note: 'B', hz: 246.94 },
    { note: 'e', hz: 329.63 },
  ]
  const closest = frequency
    ? targets.reduce((current, item) => Math.abs(item.hz - frequency) < Math.abs(current.hz - frequency) ? item : current, targets[0])
    : null
  const cents = closest ? Math.round(1200 * Math.log2(frequency / closest.hz)) : 0

  return (
    <>
      <PageHeading eyebrow="TUNER" title={<>Get in <em>tune.</em></>}>
        <span className="tuning-chip">STANDARD · E A D G B E</span>
      </PageHeading>
      <section className="tuner-layout">
        <div className="tuner-display wood-card">
          <span className="eyebrow">CHROMATIC TUNER</span>
          <div className="tuner-note">
            <small>{frequency ? `${Math.round(frequency)} Hz` : '— Hz'}</small>
            <strong>{note}</strong>
            <span>{closest ? `${cents > 0 ? '+' : ''}${cents} cents` : 'play one string'}</span>
          </div>
          <div className="tuner-meter">
            <i className="flat">flat</i>
            <div className="meter-track"><b style={{ left: `${50 + Math.max(-45, Math.min(45, cents))}%` }} /></div>
            <i className="sharp">sharp</i>
          </div>
          <p>{message}</p>
          <button className={`timer-main ${isListening ? 'stop' : ''}`} onClick={isListening ? stop : start}>
            {isListening ? <><MicOff size={18} />Stop listening</> : <><Mic size={18} />Start tuner</>}
          </button>
        </div>
        <div className="string-panel panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">STANDARD TUNING</span>
              <h3>Six strings, one clear sound.</h3>
            </div>
          </div>
          <div className="string-targets">
            {targets.map((target, i) => (
              <div className={`string-target ${closest?.note === target.note ? 'current' : ''}`} key={`${target.note}-${i}`}>
                <span>{6 - i}</span>
                <b>{target.note}</b>
                <small>{target.hz} Hz</small>
                <i>{closest?.note === target.note ? (Math.abs(cents) <= 5 ? 'IN TUNE' : cents < 0 ? 'TUNE UP' : 'TUNE DOWN') : ''}</i>
              </div>
            ))}
          </div>
          <div className="mic-note">
            <Mic size={17} />
            <p>For best results, tune in a quiet room and pluck one string at a time.</p>
          </div>
        </div>
      </section>
    </>
  )
}
