import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

export const meetingSummarySchema = z.object({
  title: z.string(),
  keyPoints: z.array(z.string()),
  decisions: z.array(z.string()),
});

export type MeetingSummary = z.infer<typeof meetingSummarySchema>;

const prompt = `You are an expert meeting assistant. Analyze the following meeting transcript and extract the following:
- title: A concise, descriptive title for the meeting (do not use the filename; infer from the content, e.g., 'Q2 Marketing Strategy Standup', 'Product Launch Planning', etc.)
- keyPoints: The most important discussion points (as an array of strings)
- actionItems: Actionable tasks (as an array of strings)
- decisions: Any decisions made (as an array of strings)
Return your answer as a JSON object with these fields only.

Transcript:
"""
{transcript}
"""`;

export async function summarizeMeeting(transcript: string): Promise<MeetingSummary> {
  const { object } = await generateObject({
    model: openai('gpt-4o-2024-08-06', { structuredOutputs: true }),
    schema: meetingSummarySchema,
    prompt: prompt.replace('{transcript}', transcript),
  });
  return object;
} 