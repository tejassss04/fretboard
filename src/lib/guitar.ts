export interface GuitarString {
  name: string;
  openNote: string;
  octave: number;
  frequency: number;
  gauge: number; // For visual thickness
}

export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
export type NoteName = typeof NOTES[number];

export const NOTE_SEMITONES: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
  'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
};

export interface Tuning {
  id: string;
  name: string;
  strings: { note: NoteName; octave: number; gauge: number }[];
}

export const TUNINGS: Record<string, Tuning> = {
  standard: {
    id: 'standard',
    name: 'Standard (E A D G B E)',
    strings: [
      { note: 'E', octave: 4, gauge: 1.0 }, // String 1 (High E)
      { note: 'B', octave: 3, gauge: 1.3 }, // String 2 (B)
      { note: 'G', octave: 3, gauge: 1.7 }, // String 3 (G)
      { note: 'D', octave: 3, gauge: 2.2 }, // String 4 (D)
      { note: 'A', octave: 2, gauge: 2.8 }, // String 5 (A)
      { note: 'E', octave: 2, gauge: 3.5 }, // String 6 (Low E)
    ]
  },
  dropD: {
    id: 'dropD',
    name: 'Drop D (D A D G B E)',
    strings: [
      { note: 'E', octave: 4, gauge: 1.0 },
      { note: 'B', octave: 3, gauge: 1.3 },
      { note: 'G', octave: 3, gauge: 1.7 },
      { note: 'D', octave: 3, gauge: 2.2 },
      { note: 'A', octave: 2, gauge: 2.8 },
      { note: 'D', octave: 2, gauge: 3.5 },
    ]
  },
  dadgad: {
    id: 'dadgad',
    name: 'DADGAD (Celtic / Folk)',
    strings: [
      { note: 'D', octave: 4, gauge: 1.0 },
      { note: 'A', octave: 3, gauge: 1.3 },
      { note: 'G', octave: 3, gauge: 1.7 },
      { note: 'D', octave: 3, gauge: 2.2 },
      { note: 'A', octave: 2, gauge: 2.8 },
      { note: 'D', octave: 2, gauge: 3.5 },
    ]
  },
  openD: {
    id: 'openD',
    name: 'Open D (D A D F# A D)',
    strings: [
      { note: 'D', octave: 4, gauge: 1.0 },
      { note: 'A', octave: 3, gauge: 1.3 },
      { note: 'F#', octave: 3, gauge: 1.7 },
      { note: 'D', octave: 3, gauge: 2.2 },
      { note: 'A', octave: 2, gauge: 2.8 },
      { note: 'D', octave: 2, gauge: 3.5 },
    ]
  }
};

export const SCALES: { id: string; name: string; intervals: number[] }[] = [
  { id: 'none', name: 'No Scale (Free Play)', intervals: [] },
  { id: 'minor-pentatonic', name: 'Minor Pentatonic', intervals: [0, 3, 5, 7, 10] },
  { id: 'major-pentatonic', name: 'Major Pentatonic', intervals: [0, 2, 4, 7, 9] },
  { id: 'blues', name: 'Blues Scale', intervals: [0, 3, 5, 6, 7, 10] },
  { id: 'major', name: 'Major (Ionian)', intervals: [0, 2, 4, 5, 7, 9, 11] },
  { id: 'natural-minor', name: 'Natural Minor (Aeolian)', intervals: [0, 2, 3, 5, 7, 8, 10] },
  { id: 'dorian', name: 'Dorian (Funk/Jazz)', intervals: [0, 2, 3, 5, 7, 9, 10] },
  { id: 'mixolydian', name: 'Mixolydian (Rock/Blues)', intervals: [0, 2, 4, 5, 7, 9, 10] },
];

export const FRET_MARKERS = [3, 5, 7, 9, 15, 17, 19, 21];
export const DOUBLE_FRET_MARKERS = [12, 24];

/**
 * Calculates MIDI note number given a note name and octave.
 */
export function getMidiNote(note: NoteName, octave: number): number {
  return NOTE_SEMITONES[note] + (octave + 1) * 12;
}

/**
 * Converts MIDI note number to frequency in Hz (A4 = 440Hz = MIDI 69).
 */
export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Computes the note name, octave, frequency, and interval for any string and fret.
 */
export function getFretInfo(
  openNote: NoteName,
  openOctave: number,
  fret: number,
  rootNote?: NoteName
) {
  const openMidi = getMidiNote(openNote, openOctave);
  const currentMidi = openMidi + fret;
  const noteIndex = currentMidi % 12;
  const noteName = NOTES[noteIndex];
  const octave = Math.floor(currentMidi / 12) - 1;
  const frequency = midiToFrequency(currentMidi);

  let interval: number | null = null;
  let intervalName = '';

  if (rootNote) {
    const rootIndex = NOTE_SEMITONES[rootNote];
    const semitonesFromRoot = (noteIndex - rootIndex + 12) % 12;
    interval = semitonesFromRoot;
    
    const intervalNames: Record<number, string> = {
      0: 'R',
      1: 'b2',
      2: '2',
      3: 'b3',
      4: '3',
      5: '4',
      6: 'b5',
      7: '5',
      8: 'b6',
      9: '6',
      10: 'b7',
      11: '7',
    };
    intervalName = intervalNames[semitonesFromRoot] || '';
  }

  return {
    midi: currentMidi,
    note: noteName,
    octave,
    frequency,
    interval,
    intervalName
  };
}

