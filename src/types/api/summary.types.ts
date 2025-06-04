import { z } from 'zod';

export const summarySchema = z.object({
  meetingId: z.string(),
  transcript: z.string(),
  keyPoints: z.array(z.string()),
  decisions: z.array(z.string()),
});

export type SummaryInput = z.infer<typeof summarySchema>;

export interface SummaryResponse {
  id: string;
  meetingId: string;
  transcript: string;
  keyPoints: string[];
  decisions: string[];
  createdAt: Date;
  updatedAt: Date;
  meeting: {
    id: string;
    title: string;
    audioUrl: string;
    duration: number;
    fileSize: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    date: Date;
  };
} 