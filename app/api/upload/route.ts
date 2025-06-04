import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { summarizeMeeting } from "@/lib/services/meetingSummarizer";
import { transcribeAudio } from "@/lib/services/transcription";
import { parseBuffer } from "music-metadata";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Disable Next.js body parser for this route
export const config = {
  api: {
    bodyParser: false,
  },
};

const ALLOWED_TYPES = [
  "audio/mpeg",
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
  "audio/x-m4a",
  "audio/mp3",
  "audio/mp4",
  "audio/m4a",
];
const MAX_SIZE = 100 * 1024 * 1024; // 100MB

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("audioFile") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large." }, { status: 400 });
  }

  // Convert file to Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Write to a temp file (required for OpenAI SDK)
  const tempFileName = `${randomUUID()}.${file.name.split('.').pop() || 'mp3'}`;
  const tempFilePath = path.join("/tmp", tempFileName);
  await writeFile(tempFilePath, buffer);

  try {
    // Extract duration using music-metadata
    let duration = 0;
    try {
      const metadata = await parseBuffer(buffer, file.type);
      duration = Math.round(metadata.format.duration || 0);
    } catch (err) {
      // If duration extraction fails, fallback to 0
      duration = 0;
    }

    // Transcribe using the service
    const transcript = await transcribeAudio(file);

    // Summarize the transcript using Vercel AI SDK
    const summary = await summarizeMeeting(transcript);

    // Return the transcript, summary, and duration
    return NextResponse.json({ transcript, summary, duration }, { status: 200 });
  } catch (error) {
    // Clean up temp file on error
    await unlink(tempFilePath).catch(() => {});
    return NextResponse.json({ error: "Transcription or summarization failed", details: error instanceof Error ? error.message : error }, { status: 500 });
  }
} 