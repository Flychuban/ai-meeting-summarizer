import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

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
    // Transcribe with OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: (await import("fs")).createReadStream(tempFilePath),
      model: "gpt-4o-transcribe",
      // Optionally: language: "en"
    });

    // Clean up temp file
    await unlink(tempFilePath);

    // Return the transcript
    return NextResponse.json({ transcript: transcription.text }, { status: 200 });
  } catch (error) {
    // Clean up temp file on error
    await unlink(tempFilePath).catch(() => {});
    return NextResponse.json({ error: "Transcription failed", details: error instanceof Error ? error.message : error }, { status: 500 });
  }
} 