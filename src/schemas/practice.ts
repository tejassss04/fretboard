import { z } from 'zod';

export const practiceSessionCreateSchema = z.object({
  durationMinutes: z.number().int().min(1, 'Duration must be at least 1 minute').max(600),
  tasksCompleted: z.number().int().min(0).default(0),
  totalTasks: z.number().int().min(0).default(0),
  routineType: z.string().trim().max(60).default('General Routine'),
  targetBpm: z.number().int().min(30).max(300).default(108),
  completedTasks: z.string().optional().nullable(),
  reflectionNotes: z.string().trim().max(1000).optional().nullable(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD')
    .optional(),
});

export type PracticeSessionCreateInput = z.infer<typeof practiceSessionCreateSchema>;
