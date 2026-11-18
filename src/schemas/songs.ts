import { z } from 'zod';

export const songCreateSchema = z.object({
  title: z.string().trim().min(1, 'Song title is required').max(120),
  artist: z.string().trim().max(120).default('Traditional / Unknown'),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).default('Beginner'),
  progress: z.number().int().min(0).max(100).default(0),
  chords: z.string().trim().min(1, 'At least one chord is required').max(255),
  tuning: z.string().trim().default('standard'),
  tempo: z.number().int().min(30).max(300).default(108),
  notes: z.string().trim().max(500).optional().nullable(),
  isFavorite: z.boolean().default(false),
});

export const songUpdateSchema = songCreateSchema.partial();

export const songCollectionCreateSchema = z.object({
  name: z.string().trim().min(1, 'Collection name is required').max(80),
  description: z.string().trim().max(300).optional().nullable(),
  isPinned: z.boolean().default(false),
  songIds: z.array(z.string()).default([]),
});

export type SongCreateInput = z.infer<typeof songCreateSchema>;
export type SongUpdateInput = z.infer<typeof songUpdateSchema>;
export type SongCollectionCreateInput = z.infer<typeof songCollectionCreateSchema>;
