import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { writeFile, unlink, mkdir } from "fs/promises";
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

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
await mkdir(UPLOADS_DIR, { recursive: true });

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const meetingId = formData.get("meetingId") as string;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }

  if (!meetingId) {
    return NextResponse.json({ error: "No meeting ID provided." }, { status: 400 });
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

  // Generate a unique filename
  const fileExt = file.name.split('.').pop() || 'mp3';
  const fileName = `${meetingId}-${randomUUID()}.${fileExt}`;
  const filePath = path.join(UPLOADS_DIR, fileName);

  // Write to permanent storage
  await writeFile(filePath, buffer);

  // Write to a temp file for processing
  const tempFilePath = path.join("/tmp", fileName);
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

    // Clean up temp file
    await unlink(tempFilePath).catch(() => {});

    // Return the permanent URL and duration
    const audioUrl = `/uploads/${fileName}`;
    return NextResponse.json({ audioUrl, duration }, { status: 200 });
  } catch (error) {
    // Clean up both files on error
    await unlink(tempFilePath).catch(() => {});
    await unlink(filePath).catch(() => {});
    return NextResponse.json({ error: "File processing failed", details: error instanceof Error ? error.message : error }, { status: 500 });
  }
} 