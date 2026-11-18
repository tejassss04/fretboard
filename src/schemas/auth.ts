import { z } from 'zod';

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ message: 'Please enter a valid email address.' }));

export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, { message: 'Password is required.' })
    .max(128, { message: 'Password is too long.' }),
});

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .max(80, { message: 'Name must be 80 characters or fewer.' })
    .optional(),
  email: emailSchema,
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long.' })
    .max(128, { message: 'Password must be 128 characters or fewer.' }),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
