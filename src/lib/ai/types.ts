import { z } from 'zod';

export const transcriptionResponseSchema = z.object({
  text: z.string(),
  language: z.string().optional(),
  duration: z.number().optional(),
});

export const summaryResponseSchema = z.object({
  title: z.string(),
  keyPoints: z.array(z.string()),
  actionItems: z.array(z.string()),
  decisions: z.array(z.string()),
  tags: z.array(z.string()),
  participants: z.array(z.string()),
});

export type TranscriptionResponse = z.infer<typeof transcriptionResponseSchema>;
export type SummaryResponse = z.infer<typeof summaryResponseSchema>;

export interface AIError extends Error {
  code: 'TRANSCRIPTION_FAILED' | 'SUMMARIZATION_FAILED' | 'INVALID_AUDIO' | 'PROCESSING_TIMEOUT';
  details?: unknown;
} 