import { z } from 'zod';

export const meetingSchema = z.object({
  title: z.string().min(1).max(100),
  audioUrl: z.string().url(),
  duration: z.number().positive(),
  fileSize: z.number().positive(),
  date: z.date(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']).default('pending'),
  tags: z.array(z.string()).optional(),
  participants: z.array(z.string()).optional(),
});

export const updateMeetingSchema = meetingSchema.partial();

export type MeetingInput = z.infer<typeof meetingSchema>;
export type UpdateMeetingInput = z.infer<typeof updateMeetingSchema>;

export interface MeetingResponse {
  id: string;
  title: string;
  audioUrl: string;
  duration: number;
  fileSize: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  date: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: { id: string; name: string }[];
  participants?: { id: string; name: string }[];
  summary?: {
    id: string;
    transcript: string;
    keyPoints: string[];
    decisions: string[];
    createdAt: Date;
    updatedAt: Date;
  };
} 