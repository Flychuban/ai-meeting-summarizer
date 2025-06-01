import { Meeting } from "@prisma/client"

type ExportableMeeting = {
  title: string
  date?: string | Date
  duration?: string | number
  summary?: {
    keyPoints?: string[]
    actionItems?: any[]
    decisions?: string[]
    transcript?: string
  }
}

export const exportMeetingAsJson = (meeting: ExportableMeeting): string => {
  return JSON.stringify(meeting, null, 2)
}

export const exportMeetingAsMarkdown = (meeting: ExportableMeeting): string => {
  return `
# ${meeting.title}
Date: ${meeting.date ? new Date(meeting.date).toLocaleDateString() : ""}
Duration: ${meeting.duration || ""}

## Key Points
${meeting.summary?.keyPoints?.map((point) => `- ${point}`).join("\n") || ""}

## Action Items
${meeting.summary?.actionItems?.map((item) => `- ${typeof item === "string" ? item : (item?.task ? `${item.assignee}: ${item.task} (Due: ${item.dueDate})` : "")}`).join("\n") || ""}

## Decisions
${meeting.summary?.decisions?.map((decision) => `- ${decision}`).join("\n") || ""}
  `.trim()
}

export const exportMeetingAsPdf = async (meeting: ExportableMeeting): Promise<Blob> => {
  // TODO: Implement PDF export using pdf-lib or html2pdf
  throw new Error("PDF export not implemented yet")
} 