import { openai } from '@ai-sdk/openai';
import { experimental_transcribe as transcribe } from 'ai';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

/**
 * Transcribes an audio file using the Vercel AI SDK (OpenAI Whisper).
 * Handles temp file creation and cleanup.
 * @param file - The uploaded File object
 * @returns The transcript as a string
 */
export async function transcribeAudio(file: File): Promise<string> {
  // Convert file to Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Write to a temp file (required for Node.js file streams)
  const tempFileName = `${randomUUID()}.${file.name.split('.').pop() || 'mp3'}`;
  const tempFilePath = path.join('/tmp', tempFileName);
  await writeFile(tempFilePath, buffer);

  try {
    // Transcribe with Vercel AI SDK
    const result = await transcribe({
      model: openai.transcription('gpt-4o-transcribe'),
      audio: buffer,
      providerOptions: { openai: { language: 'en' } },
    });
    await unlink(tempFilePath);
    return result.text;
  } catch (error) {
    await unlink(tempFilePath).catch(() => {});
    throw error;
  }
} 