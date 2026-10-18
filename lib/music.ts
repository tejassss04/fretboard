export const roots = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'] as const

export type RootNote = (typeof roots)[number]
export type ScaleId = 'major' | 'minor-pentatonic' | 'dorian' | 'mixolydian'

export const scaleIntervals: Record<ScaleId, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  'minor-pentatonic': [0, 3, 5, 7, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
}

export function formatTime(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
}

export function autoCorrelate(buffer: Float32Array, sampleRate: number) {
  let rms = 0
  for (let i = 0; i < buffer.length; i++) rms += buffer[i] * buffer[i]
  rms = Math.sqrt(rms / buffer.length)
  if (rms < 0.012) return -1
  let start = 0
  let end = buffer.length - 1
  const threshold = 0.2
  while (start < buffer.length / 2 && Math.abs(buffer[start]) < threshold) start++
  while (end > buffer.length / 2 && Math.abs(buffer[end]) < threshold) end--
  const size = end - start
  const correlations = new Array(size).fill(0)
  for (let lag = 0; lag < size; lag++) {
    for (let i = 0; i < size - lag; i++) correlations[lag] += buffer[start + i] * buffer[start + i + lag]
  }
  let dip = 0
  while (dip + 1 < size && correlations[dip] > correlations[dip + 1]) dip++
  let peak = dip
  for (let i = dip; i < size; i++) if (correlations[i] > correlations[peak]) peak = i
  if (!peak || correlations[peak] < correlations[0] * 0.45) return -1
  const x1 = correlations[peak - 1] || correlations[peak]
  const x2 = correlations[peak]
  const x3 = correlations[peak + 1] || correlations[peak]
  const adjustment = (x3 - x1) / (2 * (2 * x2 - x1 - x3))
  return sampleRate / (peak + adjustment)
}

export function noteFromFrequency(frequency: number) {
  const midi = Math.round(69 + 12 * Math.log2(frequency / 440))
  return roots[((midi % 12) + 12) % 12]
}
