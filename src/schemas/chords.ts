import { z } from 'zod';

export const chordSaveSchema = z.object({
  name: z.string().trim().min(1, 'Chord name is required').max(60),
  shortName: z.string().trim().max(30).optional().nullable(),
  voicing: z.string().trim().min(1, 'Voicing string is required').max(50),
  difficulty: z.string().trim().default('Intermediate'),
  notes: z.string().trim().max(100).optional().nullable(),
});

export type ChordSaveInput = z.infer<typeof chordSaveSchema>;
