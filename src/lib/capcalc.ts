/**
 * CapCalc — Capo Chord Calculation & Music Theory Engine
 * Handles chromatic pitch-class transposition, enharmonic spellings,
 * slash chord notation, CAGED open chord detection, and audio frequency mapping.
 */

export const PITCH_NAMES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
export const PITCH_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const;

export type PitchNameSharp = typeof PITCH_NAMES_SHARP[number];
export type PitchNameFlat = typeof PITCH_NAMES_FLAT[number];
export type PitchName = PitchNameSharp | PitchNameFlat;

export const SEMITONE_MAP: Record<string, number> = {
  'C': 0, 'B#': 0,
  'C#': 1, 'Db': 1, 'C♯': 1, 'D♭': 1,
  'D': 2,
  'D#': 3, 'Eb': 3, 'D♯': 3, 'E♭': 3,
  'E': 4, 'Fb': 4,
  'F': 5, 'E#': 5,
  'F#': 6, 'Gb': 6, 'F♯': 6, 'G♭': 6,
  'G': 7,
  'G#': 8, 'Ab': 8, 'G♯': 8, 'A♭': 8,
  'A': 9,
  'A#': 10, 'Bb': 10, 'A♯': 10, 'B♭': 10,
  'B': 11, 'Cb': 11,
};

// Interval semitone count descriptions
export const INTERVAL_NAMES: Record<number, string> = {
  0: 'unison (no shift)',
  1: '+1 semitone (half step)',
  2: '+2 semitones (1 whole step)',
  3: '+3 semitones (minor 3rd)',
  4: '+4 semitones (major 3rd)',
  5: '+5 semitones (perfect 4th)',
  6: '+6 semitones (tritone)',
  7: '+7 semitones (perfect 5th)',
  8: '+8 semitones (minor 6th)',
  9: '+9 semitones (major 6th)',
  10: '+10 semitones (minor 7th)',
  11: '+11 semitones (major 7th)',
  12: '+12 semitones (1 full octave)',
};

// Common chord qualities and their display names
export interface ChordQualityDef {
  id: string;
  symbol: string;
  name: string;
  category: 'major' | 'minor' | 'seventh' | 'suspended' | 'extended';
}

export const CHORD_QUALITIES: ChordQualityDef[] = [
  { id: 'major', symbol: '', name: 'Major', category: 'major' },
  { id: 'minor', symbol: 'm', name: 'Minor', category: 'minor' },
  { id: '7', symbol: '7', name: 'Dominant 7th', category: 'seventh' },
  { id: 'maj7', symbol: 'maj7', name: 'Major 7th', category: 'seventh' },
  { id: 'm7', symbol: 'm7', name: 'Minor 7th', category: 'seventh' },
  { id: 'sus2', symbol: 'sus2', name: 'Suspended 2nd', category: 'suspended' },
  { id: 'sus4', symbol: 'sus4', name: 'Suspended 4th', category: 'suspended' },
  { id: '7sus4', symbol: '7sus4', name: '7th Suspended 4th', category: 'suspended' },
  { id: 'add9', symbol: 'add9', name: 'Add 9', category: 'extended' },
  { id: 'dim', symbol: 'dim', name: 'Diminished', category: 'extended' },
  { id: 'aug', symbol: 'aug', name: 'Augmented', category: 'extended' },
  { id: '5', symbol: '5', name: 'Power Chord (5th)', category: 'extended' },
];

export interface ParsedChord {
  root: string;
  quality: string;
  qualityName: string;
  bass?: string;
  fullString: string;
  semitoneIndex: number;
}

/**
 * Standard open chord shapes available to guitarists.
 * These are the shapes guitarists love to play when using a capo.
 */
export interface OpenChordShape {
  id: string;
  name: string;
  short: string;
  root: string;
  quality: string;
  fingers: [number, number | 'x'][]; // [stringIdx 0..5, fret 0..n | 'x'] (0 = Low E, 5 = High e)
  difficulty: 'Beginner' | 'Intermediate';
  tip: string;
}

export const COMMON_OPEN_SHAPES: OpenChordShape[] = [
  {
    id: 'c-major',
    name: 'C major',
    short: 'C',
    root: 'C',
    quality: '',
    fingers: [[0, 'x'], [1, 3], [2, 2], [3, 0], [4, 1], [5, 0]],
    difficulty: 'Beginner',
    tip: 'Classic open C shape with rich ringing high E.',
  },
  {
    id: 'a-major',
    name: 'A major',
    short: 'A',
    root: 'A',
    quality: '',
    fingers: [[0, 'x'], [1, 0], [2, 2], [3, 2], [4, 2], [5, 0]],
    difficulty: 'Beginner',
    tip: 'Finger cluster on fret 2 across strings D, G, B.',
  },
  {
    id: 'g-major',
    name: 'G major',
    short: 'G',
    root: 'G',
    quality: '',
    fingers: [[0, 3], [1, 2], [2, 0], [3, 0], [4, 0], [5, 3]],
    difficulty: 'Beginner',
    tip: 'Big open resonant cowboy chord across all 6 strings.',
  },
  {
    id: 'e-major',
    name: 'E major',
    short: 'E',
    root: 'E',
    quality: '',
    fingers: [[0, 0], [1, 2], [2, 2], [3, 1], [4, 0], [5, 0]],
    difficulty: 'Beginner',
    tip: 'The fullest sounding open chord on the guitar.',
  },
  {
    id: 'd-major',
    name: 'D major',
    short: 'D',
    root: 'D',
    quality: '',
    fingers: [[0, 'x'], [1, 'x'], [2, 0], [3, 2], [4, 3], [5, 2]],
    difficulty: 'Beginner',
    tip: 'Compact triangular voicing on strings 4, 3, 2, 1.',
  },
  {
    id: 'a-minor',
    name: 'A minor',
    short: 'Am',
    root: 'A',
    quality: 'm',
    fingers: [[0, 'x'], [1, 0], [2, 2], [3, 2], [4, 1], [5, 0]],
    difficulty: 'Beginner',
    tip: 'Mellow minor shape, same fingering layout as E major shifted down 1 string.',
  },
  {
    id: 'e-minor',
    name: 'E minor',
    short: 'Em',
    root: 'E',
    quality: 'm',
    fingers: [[0, 0], [1, 2], [2, 2], [3, 0], [4, 0], [5, 0]],
    difficulty: 'Beginner',
    tip: 'Two fingers on strings 5 and 4; 4 strings ring open.',
  },
  {
    id: 'd-minor',
    name: 'D minor',
    short: 'Dm',
    root: 'D',
    quality: 'm',
    fingers: [[0, 'x'], [1, 'x'], [2, 0], [3, 2], [4, 3], [5, 1]],
    difficulty: 'Beginner',
    tip: 'Delicate open minor shape.',
  },
  {
    id: 'f-major',
    name: 'F major (Easy)',
    short: 'F',
    root: 'F',
    quality: '',
    fingers: [[0, 'x'], [1, 'x'], [2, 3], [3, 2], [4, 1], [5, 1]],
    difficulty: 'Intermediate',
    tip: 'Mini-barre across the high two strings.',
  },
  {
    id: 'c7',
    name: 'C dominant 7',
    short: 'C7',
    root: 'C',
    quality: '7',
    fingers: [[0, 'x'], [1, 3], [2, 2], [3, 3], [4, 1], [5, 0]],
    difficulty: 'Beginner',
    tip: 'Standard C shape with pinky added on string 3, fret 3.',
  },
  {
    id: 'g7',
    name: 'G dominant 7',
    short: 'G7',
    root: 'G',
    quality: '7',
    fingers: [[0, 3], [1, 2], [2, 0], [3, 0], [4, 0], [5, 1]],
    difficulty: 'Beginner',
    tip: 'First finger on string 1, fret 1 creates the bluesy dominant 7th.',
  },
  {
    id: 'd7',
    name: 'D dominant 7',
    short: 'D7',
    root: 'D',
    quality: '7',
    fingers: [[0, 'x'], [1, 'x'], [2, 0], [3, 2], [4, 1], [5, 2]],
    difficulty: 'Beginner',
    tip: 'Inverted triangle shape pointing back toward the nut.',
  },
  {
    id: 'a7',
    name: 'A dominant 7',
    short: 'A7',
    root: 'A',
    quality: '7',
    fingers: [[0, 'x'], [1, 0], [2, 2], [3, 0], [4, 2], [5, 0]],
    difficulty: 'Beginner',
    tip: 'Open G string rings inside the chord.',
  },
  {
    id: 'e7',
    name: 'E dominant 7',
    short: 'E7',
    root: 'E',
    quality: '7',
    fingers: [[0, 0], [1, 2], [2, 0], [3, 1], [4, 0], [5, 0]],
    difficulty: 'Beginner',
    tip: 'Open D string adds natural blues tension.',
  },
];

/**
 * Standard guitar tuning base string frequencies (Low E2 to High E4).
 */
export const GUITAR_BASE_FREQS = [82.41, 110.0, 146.83, 196.0, 246.94, 329.63];

/**
 * Parse any chord string into root, quality, and bass note.
 */
export function parseChord(chordStr: string): ParsedChord {
  const clean = chordStr.trim();
  const slashParts = clean.split('/');
  const mainPart = slashParts[0].trim();
  const bassPart = slashParts[1] ? slashParts[1].trim() : undefined;

  // Extract root note (match letter + optional sharp/flat)
  const rootMatch = mainPart.match(/^([A-Ga-g][#b♯♭]?)/);
  if (!rootMatch) {
    return {
      root: 'C',
      quality: '',
      qualityName: 'Major',
      bass: undefined,
      fullString: clean,
      semitoneIndex: 0,
    };
  }

  // Normalize root letter to uppercase
  let rawRoot = rootMatch[1];
  rawRoot = rawRoot.charAt(0).toUpperCase() + rawRoot.slice(1);
  const semitoneIndex = SEMITONE_MAP[rawRoot] ?? 0;

  // Remainder is the chord quality
  const rawQuality = mainPart.slice(rootMatch[1].length).trim();
  const matchedQualityDef = CHORD_QUALITIES.find(
    (q) => q.symbol.toLowerCase() === rawQuality.toLowerCase() || q.id.toLowerCase() === rawQuality.toLowerCase()
  );

  return {
    root: rawRoot,
    quality: rawQuality,
    qualityName: matchedQualityDef ? matchedQualityDef.name : rawQuality ? rawQuality : 'Major',
    bass: bassPart ? bassPart.charAt(0).toUpperCase() + bassPart.slice(1) : undefined,
    fullString: clean,
    semitoneIndex,
  };
}

/**
 * Transpose a pitch index by a semitone delta and format with preferred enharmonic spelling.
 */
export function transposePitch(root: string, semitones: number, preferFlats: boolean = false): string {
  const baseIndex = SEMITONE_MAP[root];
  if (baseIndex === undefined) return root;

  const targetIndex = ((baseIndex + semitones) % 12 + 12) % 12;
  return preferFlats ? PITCH_NAMES_FLAT[targetIndex] : PITCH_NAMES_SHARP[targetIndex];
}

/**
 * Mode 1: Given a fingered chord shape and a capo fret, calculate the actual sounding chord.
 */
export function calculateSoundingChord(
  shapeChordStr: string,
  capoFret: number,
  preferFlats: boolean = false
): {
  soundingChord: string;
  soundingRoot: string;
  soundingBass?: string;
  quality: string;
  qualityName: string;
  capoFret: number;
  explanation: string;
  semitoneShift: number;
} {
  const parsed = parseChord(shapeChordStr);
  const soundingRoot = transposePitch(parsed.root, capoFret, preferFlats);
  const soundingBass = parsed.bass ? transposePitch(parsed.bass, capoFret, preferFlats) : undefined;
  const soundingChord = `${soundingRoot}${parsed.quality}${soundingBass ? `/${soundingBass}` : ''}`;

  const intervalLabel = INTERVAL_NAMES[capoFret] || `+${capoFret} semitones`;

  const explanation =
    capoFret === 0
      ? `Without a capo, playing a ${parsed.fullString} shape sounds as ${parsed.fullString} at standard concert pitch.`
      : `Placing the capo on Fret ${capoFret} raises every string by ${capoFret} semitones (${intervalLabel}). Fingering a ${parsed.fullString} shape sounds as a ${soundingChord} chord.`;

  return {
    soundingChord,
    soundingRoot,
    soundingBass,
    quality: parsed.quality,
    qualityName: parsed.qualityName,
    capoFret,
    explanation,
    semitoneShift: capoFret,
  };
}

/**
 * Mode 2: Given a desired sounding chord and a capo fret, calculate the chord shape to finger.
 */
export function calculateShapeToPlay(
  targetSoundingChordStr: string,
  capoFret: number,
  preferFlats: boolean = false
): {
  shapeChord: string;
  shapeRoot: string;
  shapeBass?: string;
  quality: string;
  qualityName: string;
  capoFret: number;
  isOpenShape: boolean;
  matchedOpenShape?: OpenChordShape;
  explanation: string;
} {
  const parsed = parseChord(targetSoundingChordStr);
  // To find the shape to finger, we shift backwards by capoFret semitones
  const shapeRoot = transposePitch(parsed.root, -capoFret, preferFlats);
  const shapeBass = parsed.bass ? transposePitch(parsed.bass, -capoFret, preferFlats) : undefined;
  const shapeChord = `${shapeRoot}${parsed.quality}${shapeBass ? `/${shapeBass}` : ''}`;

  // Check if the shape matches an authentic open guitar shape
  const matchedOpenShape = COMMON_OPEN_SHAPES.find(
    (s) => s.root === shapeRoot && s.quality === parsed.quality
  );

  const explanation =
    capoFret === 0
      ? `To sound ${parsed.fullString} without a capo, play a ${shapeChord} shape at standard open position.`
      : `With your capo clamped on Fret ${capoFret}, playing a ${shapeChord} shape will transpose up ${capoFret} semitones to sound as ${parsed.fullString}.`;

  return {
    shapeChord,
    shapeRoot,
    shapeBass,
    quality: parsed.quality,
    qualityName: parsed.qualityName,
    capoFret,
    isOpenShape: Boolean(matchedOpenShape),
    matchedOpenShape,
    explanation,
  };
}

/**
 * Finds all capo frets (1..12) where a target sounding chord can be played with a comfortable open shape.
 */
export function findBestCapoPositionsForTarget(
  targetSoundingChordStr: string
): { capoFret: number; shape: OpenChordShape; soundingChord: string }[] {
  const parsed = parseChord(targetSoundingChordStr);
  const results: { capoFret: number; shape: OpenChordShape; soundingChord: string }[] = [];

  for (let fret = 1; fret <= 12; fret++) {
    const shapeRoot = transposePitch(parsed.root, -fret, false);
    const shapeRootFlat = transposePitch(parsed.root, -fret, true);

    const match = COMMON_OPEN_SHAPES.find(
      (s) =>
        (s.root === shapeRoot || s.root === shapeRootFlat) &&
        s.quality === parsed.quality
    );

    if (match) {
      results.push({
        capoFret: fret,
        shape: match,
        soundingChord: `${parsed.root}${parsed.quality}`,
      });
    }
  }

  return results;
}

/**
 * Calculate actual sounding audio frequencies for a given chord shape + capo position.
 */
export function getCapoChordFrequencies(
  fingers: [number, number | 'x'][],
  capoFret: number
): number[] {
  return fingers.map(([stringIndex, fret]) => {
    if (fret === 'x') return 0;
    const baseFreq = GUITAR_BASE_FREQS[stringIndex];
    // Open string with capo = capoFret; fretted string = fret + capoFret
    const totalFrets = (fret as number) + capoFret;
    return baseFreq * Math.pow(2, totalFrets / 12);
  });
}
