import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

export const meetingSummarySchema = z.object({
  title: z.string(),
  keyPoints: z.array(z.string()),
  decisions: z.array(z.string()),
  tags: z.array(z.string()).min(1).max(8),
  participants: z.array(z.string()).min(1),
});

export type MeetingSummary = z.infer<typeof meetingSummarySchema>;

const prompt = `You are an expert meeting assistant. Analyze the following meeting transcript and extract the following:
- title: A concise, descriptive title for the meeting (do not use the filename; infer from the content, e.g., 'Q2 Marketing Strategy Standup', 'Product Launch Planning', etc.)
- keyPoints: The most important discussion points (as an array of strings)
- actionItems: Actionable tasks (as an array of strings)
- decisions: Any decisions made (as an array of strings)
- tags: 2 to 6 relevant, concise tags (as an array of strings) that best describe the main topics, themes, or domains of the meeting. Tags should be single words or short phrases, lowercase, and not duplicates of the title. Do not return an empty array.
- participants: A list of unique participant names (as an array of strings) who are active speakers or are mentioned as present in the meeting. Use only names that appear in the transcript, and do not include generic roles (like 'Speaker 1' or 'Unknown'). If no names are present, return an empty array.
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