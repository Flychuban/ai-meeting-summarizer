import { NextRequest, NextResponse } from "next/server";

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

  // Read file as ArrayBuffer (in-memory)
  const arrayBuffer = await file.arrayBuffer();

  // TODO: Transcription and summarization logic will go here
  const transcript = "[Stubbed transcript]";
  const summary = {
    keyPoints: ["[Stubbed key point 1]", "[Stubbed key point 2]"],
    decisions: ["[Stubbed decision]"],
    actionItems: ["[Stubbed action item]"]
  };

  return NextResponse.json({ transcript, summary }, { status: 200 });
} 