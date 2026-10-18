import type { Activity, Chord, PracticeTask, Scale, Song } from './types'

export const strings = ['E', 'A', 'D', 'G', 'B', 'e']

export const chords: Chord[] = [
  { id: 'c-major', name: 'C major', short: 'C', type: 'Open chord', difficulty: 'Beginner', notes: ['C', 'E', 'G'], fingers: [[0, 'x'], [1, 3], [2, 2], [3, 0], [4, 1], [5, 0]], tip: 'Keep your first finger curled so the open G string can ring clearly.', next: 'Try it with G and Am for a classic I–V–vi progression.' },
  { id: 'g-major', name: 'G major', short: 'G', type: 'Open chord', difficulty: 'Beginner', notes: ['G', 'B', 'D'], fingers: [[0, 3], [1, 2], [2, 0], [3, 0], [4, 0], [5, 3]], tip: 'Use your third and fourth fingers on the outer strings for an easy move to C.', next: 'Practice slow changes between G, C, and D.' },
  { id: 'd-major', name: 'D major', short: 'D', type: 'Open chord', difficulty: 'Beginner', notes: ['D', 'F♯', 'A'], fingers: [[0, 'x'], [1, 'x'], [2, 0], [3, 2], [4, 3], [5, 2]], tip: 'Aim for the middle of each fret and let the low strings stay muted.', next: 'Pair with A and G in a four-chord loop.' },
  { id: 'a-minor', name: 'A minor', short: 'Am', type: 'Open chord', difficulty: 'Beginner', notes: ['A', 'C', 'E'], fingers: [[0, 'x'], [1, 0], [2, 2], [3, 2], [4, 1], [5, 0]], tip: 'Place your first finger down last to avoid brushing the open B string.', next: 'Try C → Am → F → G at 68 BPM.' },
  { id: 'e-minor', name: 'E minor', short: 'Em', type: 'Open chord', difficulty: 'Beginner', notes: ['E', 'G', 'B'], fingers: [[0, 0], [1, 2], [2, 2], [3, 0], [4, 0], [5, 0]], tip: 'Your two fingers can move as one shape from A minor.', next: 'Use Em in a relaxed fingerpicking drill.' },
  { id: 'f-major', name: 'F major', short: 'F', type: 'Barre chord', difficulty: 'Intermediate', notes: ['F', 'A', 'C'], fingers: [[0, 1], [1, 3], [2, 3], [3, 2], [4, 1], [5, 1]], tip: 'Roll your first finger slightly toward its bony edge; do not squeeze harder.', next: 'Build endurance with 20-second holds, then release.' },
  { id: 'b-minor', name: 'B minor', short: 'Bm', type: 'Barre chord', difficulty: 'Intermediate', notes: ['B', 'D', 'F♯'], fingers: [[0, 'x'], [1, 2], [2, 4], [3, 4], [4, 3], [5, 2]], tip: 'Anchor the mini-barre before adding the remaining fingers.', next: 'Move between Bm and G with a metronome.' },
  { id: 'e7', name: 'E dominant 7', short: 'E7', type: 'Open chord', difficulty: 'Beginner', notes: ['E', 'G♯', 'B', 'D'], fingers: [[0, 0], [1, 2], [2, 0], [3, 1], [4, 0], [5, 0]], tip: 'A loose wrist gives the chord its bright, open sound.', next: 'Try a 12-bar blues in E.' },
  { id: 'dmaj7', name: 'D major 7', short: 'Dmaj7', type: 'Open chord', difficulty: 'Intermediate', notes: ['D', 'F♯', 'A', 'C♯'], fingers: [[0, 'x'], [1, 'x'], [2, 0], [3, 2], [4, 2], [5, 2]], tip: 'Flatten your ring finger lightly across the top three strings.', next: 'Use this colour chord in a D → Dmaj7 → D7 movement.' },
]

export const scaleLibrary: Scale[] = [
  { id: 'major', name: 'Major', intervals: '1 2 3 4 5 6 7', mood: 'Clear & resolved', positions: 5, blurb: 'The foundation for melody, harmony, and fretboard fluency.', suggestion: 'Play three notes per string, then create a 4-bar melody.' },
  { id: 'minor-pentatonic', name: 'Minor pentatonic', intervals: '1 ♭3 4 5 ♭7', mood: 'Raw & expressive', positions: 5, blurb: 'A compact, versatile voice for blues, rock, and soulful phrasing.', suggestion: 'Bend into root notes and leave space after each phrase.' },
  { id: 'dorian', name: 'Dorian', intervals: '1 2 ♭3 4 5 6 ♭7', mood: 'Minor with lift', positions: 5, blurb: 'A modern minor sound that shines over minor seventh chords.', suggestion: 'Target the natural 6th against a minor chord vamp.' },
  { id: 'mixolydian', name: 'Mixolydian', intervals: '1 2 3 4 5 6 ♭7', mood: 'Warm & bluesy', positions: 5, blurb: 'The go-to dominant sound with a laid-back, rootsy edge.', suggestion: 'Resolve phrases from the ♭7 down to the 3rd.' },
]

export const songs: Song[] = [
  { id: 1, title: 'Slow Dancing in a Burning Room', artist: 'John Mayer', difficulty: 'Intermediate', progress: 72, chords: 'C#m · A · E · B', last: 'Yesterday' },
  { id: 2, title: 'Blackbird', artist: 'The Beatles', difficulty: 'Intermediate', progress: 38, chords: 'G · Am7 · G/B · C', last: '3 days ago' },
  { id: 3, title: 'Wonderwall', artist: 'Oasis', difficulty: 'Beginner', progress: 100, chords: 'Em7 · G · Dsus4 · A7sus4', last: 'Sep 18' },
  { id: 4, title: 'Little Wing', artist: 'Jimi Hendrix', difficulty: 'Advanced', progress: 12, chords: 'Em · G · Am · C', last: 'Sep 12' },
]

export const initialTasks: PracticeTask[] = [
  { id: 'warmup', title: 'Chromatic warm-up', detail: '5 minutes · 70 BPM', done: true },
  { id: 'chords', title: 'Clean chord changes', detail: 'G → C → D · 8 minutes', done: false },
  { id: 'scale', title: 'A minor pentatonic', detail: 'Box 1 · 8 minutes', done: false },
  { id: 'song', title: 'Song focus', detail: 'Slow Dancing · 9 minutes', done: false },
]

export const recentActivity: Activity[] = [
  { title: 'Chord changes', detail: 'G · C · D at 76 BPM', time: 'Yesterday', minutes: '14 min', color: 'amber' },
  { title: 'Minor pentatonic', detail: 'A · Position 1', time: 'Friday', minutes: '11 min', color: 'red' },
  { title: 'Blackbird', detail: 'Verse & transition', time: 'Thursday', minutes: '18 min', color: 'green' },
]
