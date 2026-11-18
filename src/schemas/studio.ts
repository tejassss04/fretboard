import { z } from 'zod';

export const studioSettingsSchema = z.object({
  defaultTuning: z.string().trim().max(30).optional(),
  fretCount: z.number().int().min(12).max(24).optional(),
  tonePreset: z.string().trim().max(30).optional(),
  displayMode: z.string().trim().max(30).optional(),
  masterVolume: z.number().min(0).max(1).optional(),
  metronomeBpm: z.number().int().min(30).max(300).optional(),
  timeSignature: z.string().trim().max(10).optional(),
});

export type StudioSettingsInput = z.infer<typeof studioSettingsSchema>;
