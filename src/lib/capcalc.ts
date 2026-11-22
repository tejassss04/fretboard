/**
 * CapCalc — Capo Chord Calculation & Music Theory Engine
 * Chromatic pitch-class transposition, enharmonic resolution,
 * slash chord bass handling, and validation.
 */

export const PITCH_NAMES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
export const PITCH_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const;

// Natural root preferred transpositions in guitar harmony:
// 0: C, 1: C#, 2: D, 3: Eb, 4: E, 5: F, 6: F#, 7: G, 8: Ab, 9: A, 10: Bb, 11: B
export const NATURAL_PREF = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'] as const;

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

export interface ParsedChord {
  root: string;
  quality: string;
  bass?: string;
  fullString: string;
  semitoneIndex: number;
  isValid: boolean;
}

/**
 * Parses user-typed chord strings into root, quality, and optional bass note.
 * Handles inputs like: C, D, G, Am, F#m, Bb, Cmaj7, Dm7, G7, G/B, D/F#, etc.
 */
export function parseChord(chordStr: string): ParsedChord {
  const clean = chordStr.trim();
  if (!clean) {
    return {
      root: '',
      quality: '',
      fullString: '',
      semitoneIndex: -1,
      isValid: false,
    };
  }

  const slashParts = clean.split('/');
  const mainPart = slashParts[0].trim();
  const bassPart = slashParts[1] ? slashParts[1].trim() : undefined;

  // Extract root note (letter A-G + optional sharp or flat)
  const rootMatch = mainPart.match(/^([A-Ga-g])([#b♯♭]?)/);
  if (!rootMatch) {
    return {
      root: '',
      quality: '',
      fullString: clean,
      semitoneIndex: -1,
      isValid: false,
    };
  }

  const letter = rootMatch[1].toUpperCase();
  const accidental = rootMatch[2]
    ? rootMatch[2] === '♯'
      ? '#'
      : rootMatch[2] === '♭'
      ? 'b'
      : rootMatch[2]
    : '';
  const root = `${letter}${accidental}`;
  const semitoneIndex = SEMITONE_MAP[root];

  if (semitoneIndex === undefined) {
    return {
      root,
      quality: '',
      fullString: clean,
      semitoneIndex: -1,
      isValid: false,
    };
  }

  // Remainder after root is the quality and extensions
  const quality = mainPart.slice(rootMatch[0].length).trim();

  // Parse optional bass note for slash chords
  let normalizedBass: string | undefined;
  if (bassPart) {
    const bassMatch = bassPart.match(/^([A-Ga-g])([#b♯♭]?)/);
    if (bassMatch) {
      const bLetter = bassMatch[1].toUpperCase();
      const bAcc = bassMatch[2]
        ? bassMatch[2] === '♯'
          ? '#'
          : bassMatch[2] === '♭'
          ? 'b'
          : bassMatch[2]
        : '';
      normalizedBass = `${bLetter}${bAcc}`;
    }
  }

  return {
    root,
    quality,
    bass: normalizedBass,
    fullString: clean,
    semitoneIndex,
    isValid: true,
  };
}

/**
 * Transpose a chord root by a given number of semitones.
 * Preserves sharp/flat conventions naturally:
 * - If root has flat (e.g. Bb, Eb), transposed pitch uses flat.
 * - If root has sharp (e.g. F#, C#), transposed pitch uses sharp.
 * - If root is natural, uses guitar-friendly harmonic defaults (e.g. G + 3 = Bb, C + 3 = Eb).
 */
export function transposePitch(root: string, semitones: number): string {
  const baseIndex = SEMITONE_MAP[root];
  if (baseIndex === undefined) return root;

  const targetIndex = ((baseIndex + semitones) % 12 + 12) % 12;

  if (root.includes('b') || root.includes('♭')) {
    return PITCH_NAMES_FLAT[targetIndex];
  }
  if (root.includes('#') || root.includes('♯')) {
    return PITCH_NAMES_SHARP[targetIndex];
  }

  return NATURAL_PREF[targetIndex];
}

export interface SoundingChordResult {
  soundingChord: string;
  soundingRoot: string;
  soundingBass?: string;
  quality: string;
  capoFret: number;
  explanation: string;
  isValid: boolean;
}

/**
 * Calculate the resulting sounding chord given an input chord and capo fret (0–12).
 */
export function calculateSoundingChord(
  inputChordStr: string,
  capoFret: number
): SoundingChordResult {
  const parsed = parseChord(inputChordStr);

  if (!parsed.isValid) {
    return {
      soundingChord: '',
      soundingRoot: '',
      quality: '',
      capoFret,
      explanation: 'Please enter a valid chord (e.g., C, G, Am, F#m, Bb, Cmaj7)',
      isValid: false,
    };
  }

  if (capoFret === 0) {
    const bassStr = parsed.bass ? `/${parsed.bass}` : '';
    return {
      soundingChord: `${parsed.root}${parsed.quality}${bassStr}`,
      soundingRoot: parsed.root,
      soundingBass: parsed.bass,
      quality: parsed.quality,
      capoFret: 0,
      explanation: 'No capo placed. The chord sounds at standard concert pitch.',
      isValid: true,
    };
  }

  const soundingRoot = transposePitch(parsed.root, capoFret);
  const soundingBass = parsed.bass ? transposePitch(parsed.bass, capoFret) : undefined;
  const soundingChord = `${soundingRoot}${parsed.quality}${soundingBass ? `/${soundingBass}` : ''}`;

  return {
    soundingChord,
    soundingRoot,
    soundingBass,
    quality: parsed.quality,
    capoFret,
    explanation: `Capo on Fret ${capoFret} raises pitch by ${capoFret} semitone${capoFret === 1 ? '' : 's'}.`,
    isValid: true,
  };
}
