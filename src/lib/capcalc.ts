/**
 * CapCalc — Capo Chord Calculation & Music Theory Engine
 * Supports single chords and multi-chord progressions,
 * numeric extensions (e.g. Dmaj7, G7, Cadd9, Asus4, C6, Em7b5, E5),
 * slash chords, and enharmonic transposition.
 */

export const PITCH_NAMES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
export const PITCH_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const;

// Guitar-friendly harmonic pitch defaults for natural root origins
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

export interface TransposedChordToken {
  originalChord: string;
  soundingChord: string;
  soundingRoot: string;
  soundingBass?: string;
  quality: string;
  capoFret: number;
  isValid: boolean;
}

export interface SoundingResult {
  chords: TransposedChordToken[];
  soundingString: string;
  capoFret: number;
  allValid: boolean;
  hasInput: boolean;
  explanation: string;
}

/**
 * Split an input string containing one or more chords into individual chord tokens.
 * Handles spaces, commas, dashes, and arrows (preserving slash chords like G/B).
 * Also handles continuous chords without spaces (e.g. "CAmFG").
 */
export function tokenizeChords(input: string): string[] {
  // Normalize slash chords that have spaces: e.g. "G / B" -> "G/B"
  const normalized = input.replace(/([A-Ga-g][#b♯♭]?)\s*\/\s*([A-Ga-g][#b♯♭]?)/g, '$1/$2');

  // If user used standard delimiters (spaces, commas, hyphens, arrows, pipes)
  if (/[\s,\-\–\—\>\|]/.test(normalized)) {
    return normalized
      .split(/[\s,\-\–\—\>\|]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
  }

  // If user typed continuous chords without delimiters (e.g. "CAmFG" or "Cmaj7Am7")
  const continuousMatches = normalized.match(
    /([A-G][#b♯♭]?(?:\/[A-G][#b♯♭]?)?(?:maj[0-9]*|min[0-9]*|m[0-9]*|dim[0-9]*|aug[0-9]*|sus[0-9]*|add[0-9]*|[0-9]+)?)/gi
  );
  if (continuousMatches && continuousMatches.length > 1) {
    return continuousMatches.map((t) => t.trim()).filter((t) => t.length > 0);
  }

  return [normalized.trim()];
}

/**
 * Transpose a single pitch name by semitones.
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

/**
 * Transpose a single chord token (e.g. "C", "Dmaj7", "G7", "F#m", "G/B", "Cadd9").
 * Preserves all numeric extensions and chord qualities.
 */
export function transposeSingleChord(chordStr: string, capoFret: number): TransposedChordToken {
  const clean = chordStr.trim();
  if (!clean) {
    return {
      originalChord: clean,
      soundingChord: '',
      soundingRoot: '',
      quality: '',
      capoFret,
      isValid: false,
    };
  }

  // Split optional slash bass note
  const slashParts = clean.split('/');
  const mainPart = slashParts[0].trim();
  const bassPart = slashParts[1] ? slashParts[1].trim() : undefined;

  // Extract root note (letter A-G + optional accidental #/b)
  const rootMatch = mainPart.match(/^([A-Ga-g])([#b♯♭]?)/);
  if (!rootMatch) {
    return {
      originalChord: clean,
      soundingChord: clean,
      soundingRoot: '',
      quality: '',
      capoFret,
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

  if (SEMITONE_MAP[root] === undefined) {
    return {
      originalChord: clean,
      soundingChord: clean,
      soundingRoot: root,
      quality: '',
      capoFret,
      isValid: false,
    };
  }

  // The remainder after root is the quality (including any numbers like maj7, 7, m7, add9, 5, etc.)
  const quality = mainPart.slice(rootMatch[0].length);

  // When No Capo (capoFret === 0), return clean normalized input
  if (capoFret === 0) {
    const bassStr = bassPart ? `/${bassPart.toUpperCase()}` : '';
    return {
      originalChord: clean,
      soundingChord: `${root}${quality}${bassStr}`,
      soundingRoot: root,
      soundingBass: bassPart,
      quality,
      capoFret: 0,
      isValid: true,
    };
  }

  // Transpose root pitch
  const soundingRoot = transposePitch(root, capoFret);

  // Transpose optional bass pitch
  let soundingBass: string | undefined;
  if (bassPart) {
    const bMatch = bassPart.match(/^([A-Ga-g])([#b♯♭]?)/);
    if (bMatch) {
      const bLetter = bMatch[1].toUpperCase();
      const bAcc = bMatch[2]
        ? bMatch[2] === '♯'
          ? '#'
          : bMatch[2] === '♭'
          ? 'b'
          : bMatch[2]
        : '';
      soundingBass = transposePitch(`${bLetter}${bAcc}`, capoFret);
    } else {
      soundingBass = bassPart;
    }
  }

  const bassSuffix = soundingBass ? `/${soundingBass}` : '';
  const soundingChord = `${soundingRoot}${quality}${bassSuffix}`;

  return {
    originalChord: clean,
    soundingChord,
    soundingRoot,
    soundingBass,
    quality,
    capoFret,
    isValid: true,
  };
}

/**
 * Transpose user input (supports single chords or multi-chord progressions).
 */
export function calculateSoundingChord(inputStr: string, capoFret: number): SoundingResult {
  const clean = inputStr.trim();
  if (!clean) {
    return {
      chords: [],
      soundingString: '',
      capoFret,
      allValid: false,
      hasInput: false,
      explanation: 'Type a chord to see its transposed sound.',
    };
  }

  const tokens = tokenizeChords(clean);
  const chords = tokens.map((token) => transposeSingleChord(token, capoFret));
  const allValid = chords.length > 0 && chords.every((c) => c.isValid);
  const soundingString = chords.map((c) => c.soundingChord).join('   ');

  let explanation = '';
  if (capoFret === 0) {
    explanation = 'No capo applied • Concert pitch';
  } else {
    explanation = `Transposed +${capoFret} semitone${capoFret === 1 ? '' : 's'}`;
  }

  return {
    chords,
    soundingString,
    capoFret,
    allValid,
    hasInput: true,
    explanation,
  };
}
