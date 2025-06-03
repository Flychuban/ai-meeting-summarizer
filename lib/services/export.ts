import { Meeting } from "@prisma/client"

type ExportableMeeting = {
  title: string
  date?: string | Date
  duration?: string | number
  summary?: {
    keyPoints?: string[]
    decisions?: string[]
    transcript?: string
  }
}

export const exportMeetingAsJson = (meeting: ExportableMeeting): string => {
  return JSON.stringify(meeting, null, 2)
}

export const exportMeetingAsMarkdown = (meeting: ExportableMeeting): string => {
  const formattedDuration = typeof meeting.duration === "number"
    ? `${Math.round(meeting.duration / 60)} minutes`
    : meeting.duration;

  return `
# ${meeting.title}
Date: ${meeting.date ? new Date(meeting.date).toLocaleDateString() : ""}
Duration: ${formattedDuration}

## Key Points
${meeting.summary?.keyPoints?.map((point) => `- ${point}`).join("\n") || ""}

## Decisions
${meeting.summary?.decisions?.map((decision) => `- ${decision}`).join("\n") || ""}
  `.trim()
}

export const exportMeetingAsPdf = async (meeting: ExportableMeeting): Promise<Blob> => {
  // TODO: Implement PDF export using pdf-lib or html2pdf
  throw new Error("PDF export not implemented yet")
} 