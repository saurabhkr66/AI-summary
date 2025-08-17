import { z } from 'zod';

export const summarizeSchema = z.object({
  transcript: z.string().min(10, 'Transcript is too short'),
  instruction: z.string().min(3),
});

const emailRegex = /^(?:[^\s@]+@[^\s@]+\.[^\s@]+)$/;

export const emailSchema = z.object({
  to: z.array(z.string().regex(emailRegex, 'Invalid email')).min(1, 'At least one recipient'),
  subject: z.string().min(1),
  body: z.string().min(1),
});
