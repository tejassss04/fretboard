export const roots = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'] as const;

export type RootNote = (typeof roots)[number];
export type ScaleId = 'major' | 'minor-pentatonic' | 'dorian' | 'mixolydian';

export const scaleIntervals: Record<ScaleId, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  'minor-pentatonic': [0, 3, 5, 7, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
};

const NOTE_OFFSETS: Record<string, number> = {
  'C': -9, 'B#': -9,
  'C#': -8, 'Db': -8, 'C♯': -8, 'D♭': -8,
  'D': -7,
  'D#': -6, 'Eb': -6, 'D♯': -6, 'E♭': -6,
  'E': -5, 'Fb': -5,
  'F': -4, 'E#': -4,
  'F#': -3, 'Gb': -3, 'F♯': -3, 'G♭': -3,
  'G': -2,
  'G#': -1, 'Ab': -1, 'G♯': -1, 'A♭': -1,
  'A': 0,
  'A#': 1, 'Bb': 1, 'A♯': 1, 'B♭': 1,
  'B': 2, 'Cb': 2
};

export function noteToFrequency(note: string, octave: number = 4): number {
  const clean = note.trim();
  const offset = NOTE_OFFSETS[clean] ?? 0;
  const semitonesFromA4 = offset + (octave - 4) * 12;
  return 440 * Math.pow(2, semitonesFromA4 / 12);
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Autocorrelation algorithm for robust pitch detection from microphone audio stream.
 * Returns fundamental frequency (Hz) or -1 if no clear pitch is detected.
 */
export function autoCorrelate(buffer: Float32Array, sampleRate: number): number {
  let rms = 0;
  for (let i = 0; i < buffer.length; i++) {
    rms += buffer[i] * buffer[i];
  }
  rms = Math.sqrt(rms / buffer.length);

  // Signal too quiet (noise floor threshold)
  if (rms < 0.012) return -1;

  let start = 0;
  let end = buffer.length - 1;
  const threshold = 0.2;

  while (start < buffer.length / 2 && Math.abs(buffer[start]) < threshold) start++;
  while (end > buffer.length / 2 && Math.abs(buffer[end]) < threshold) end--;

  const size = end - start;
  const correlations = new Array(size).fill(0);

  for (let lag = 0; lag < size; lag++) {
    for (let i = 0; i < size - lag; i++) {
      correlations[lag] += buffer[start + i] * buffer[start + i + lag];
    }
  }

  let dip = 0;
  while (dip + 1 < size && correlations[dip] > correlations[dip + 1]) dip++;

  let peak = dip;
  for (let i = dip; i < size; i++) {
    if (correlations[i] > correlations[peak]) peak = i;
  }

  if (!peak || correlations[peak] < correlations[0] * 0.45) return -1;

  // Parabolic interpolation around peak
  const x1 = correlations[peak - 1] || correlations[peak];
  const x2 = correlations[peak];
  const x3 = correlations[peak + 1] || correlations[peak];
  const adjustment = (x3 - x1) / (2 * (2 * x2 - x1 - x3));

  return sampleRate / (peak + adjustment);
}

/**
 * Derives musical note name and deviation in cents from frequency in Hz.
 */
export function noteFromFrequency(frequency: number): { note: string; cents: number; octave: number } {
  const midi = 69 + 12 * Math.log2(frequency / 440);
  const roundedMidi = Math.round(midi);
  const cents = Math.round((midi - roundedMidi) * 100);
  const noteIndex = ((roundedMidi % 12) + 12) % 12;
  const octave = Math.floor(roundedMidi / 12) - 1;

  return {
    note: roots[noteIndex],
    cents,
    octave,
  };
}
