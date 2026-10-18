'use client'

import { Music2, Play, Plus } from 'lucide-react'
import { songs } from '@/lib/data'
import { useStoredState } from '@/lib/use-stored-state'
import { PageHeading } from './page-heading'

export function SongLibrary() {
  const [songList, setSongList] = useStoredState('songs', songs)
  const resume = (id: number) => setSongList((list) => list.map((song) => song.id === id ? { ...song, progress: Math.min(100, song.progress + 8), last: 'Just now' } : song))

  return (
    <>
      <PageHeading eyebrow="YOUR SONGS" title={<>Play the music you <em>love.</em></>}>
        <button className="primary-button"><Plus size={17} />Add a song</button>
      </PageHeading>
      <section className="song-summary">
        <div>
          <span className="eyebrow">IN YOUR LIBRARY</span>
          <strong>{songList.length}</strong>
          <small>songs saved</small>
        </div>
        <div>
          <span className="eyebrow">IN PROGRESS</span>
          <strong>{songList.filter((s) => s.progress > 0 && s.progress < 100).length}</strong>
          <small>songs underway</small>
        </div>
        <div>
          <span className="eyebrow">MASTERED</span>
          <strong>{songList.filter((s) => s.progress === 100).length}</strong>
          <small>songs to revisit</small>
        </div>
      </section>
      <section className="song-grid">
        {songList.map((song) => (
          <article className="song-card panel" key={song.id}>
            <div className="song-art">
              <Music2 size={26} />
              <span>{song.title.split(' ').map((word) => word[0]).slice(0, 2).join('')}</span>
            </div>
            <div className="song-card-main">
              <div>
                <span className={`difficulty ${song.difficulty.toLowerCase()}`}>{song.difficulty}</span>
                <h3>{song.title}</h3>
                <p>{song.artist}</p>
              </div>
              <button className="round-play" onClick={() => resume(song.id)} aria-label={`Practice ${song.title}`}><Play size={17} fill="currentColor" /></button>
            </div>
            <p className="chord-line">{song.chords}</p>
            <div className="song-progress">
              <div>
                <span>Practice progress</span>
                <b>{song.progress}%</b>
              </div>
              <i><em style={{ width: `${song.progress}%` }} /></i>
              <small>Last practiced {song.last}</small>
            </div>
          </article>
        ))}
      </section>
    </>
  )
}
