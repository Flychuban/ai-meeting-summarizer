import { openai } from '@ai-sdk/openai';
import { experimental_transcribe as transcribe } from 'ai';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { transcriptionResponseSchema, type TranscriptionResponse, type AIError } from './types';

/**
 * Transcribes an audio file using the 4o-transcribe model.
 * Handles temp file creation and cleanup.
 * @param file - The uploaded File object
 * @returns The transcript as a string
 */
export async function transcribeAudio(file: File): Promise<TranscriptionResponse> {
  // Convert file to Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Write to a temp file (required for Node.js file streams)
  const tempFileName = `${randomUUID()}.${file.name.split('.').pop() || 'mp3'}`;
  const tempFilePath = path.join('/tmp', tempFileName);
  await writeFile(tempFilePath, buffer);

  try {
    // Transcribe with 4o-transcribe
    const result = await transcribe({
      model: openai.transcription('gpt-4o-transcribe'),
      audio: buffer,
      providerOptions: { openai: { language: 'en' } },
    });

    // Clean up temp file
    await unlink(tempFilePath);

    // Validate and return response
    return transcriptionResponseSchema.parse({
      text: result.text,
      language: result.language,
    });
  } catch (error) {
    // Clean up temp file on error
    await unlink(tempFilePath).catch(() => {});

    // Create a typed error
    const aiError = new Error('Transcription failed') as AIError;
    aiError.code = 'TRANSCRIPTION_FAILED';
    aiError.details = error;
    throw aiError;
  }
} 