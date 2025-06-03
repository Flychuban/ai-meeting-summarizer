import { Meeting } from "@prisma/client"
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"

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
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595.28, 841.89]) // A4 size in points
  const { width } = page.getSize()

  // Fonts
  const fontTitle = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const fontBody = await pdfDoc.embedFont(StandardFonts.Helvetica)

  let y = 800
  const left = 50
  const lineHeight = 22

  // Title
  page.drawText(meeting.title || "Meeting Summary", {
    x: left,
    y,
    size: 22,
    font: fontTitle,
    color: rgb(1, 0.4, 0), // orange
  })
  y -= lineHeight * 1.5

  // Date & Duration
  if (meeting.date) {
    page.drawText(`Date: ${new Date(meeting.date).toLocaleDateString()}`, {
      x: left,
      y,
      size: 12,
      font: fontBody,
      color: rgb(0.2, 0.2, 0.2),
    })
    y -= lineHeight
  }
  if (meeting.duration) {
    const formattedDuration = typeof meeting.duration === "number"
      ? `${Math.round(meeting.duration / 60)} minutes`
      : meeting.duration
    page.drawText(`Duration: ${formattedDuration}`, {
      x: left,
      y,
      size: 12,
      font: fontBody,
      color: rgb(0.2, 0.2, 0.2),
    })
    y -= lineHeight
  }
  y -= lineHeight / 2

  // Key Points
  page.drawText("Key Points:", {
    x: left,
    y,
    size: 15,
    font: fontTitle,
    color: rgb(1, 0.4, 0),
  })
  y -= lineHeight
  if (meeting.summary?.keyPoints?.length) {
    for (const [i, point] of meeting.summary.keyPoints.entries()) {
      page.drawText(`${i + 1}. ${point}`, {
        x: left + 16,
        y,
        size: 12,
        font: fontBody,
        color: rgb(0, 0, 0),
      })
      y -= lineHeight
    }
  } else {
    page.drawText("(None)", { x: left + 16, y, size: 12, font: fontBody, color: rgb(0.5, 0.5, 0.5) })
    y -= lineHeight
  }
  y -= lineHeight / 2

  // Decisions
  page.drawText("Decisions:", {
    x: left,
    y,
    size: 15,
    font: fontTitle,
    color: rgb(1, 0.4, 0),
  })
  y -= lineHeight
  if (meeting.summary?.decisions?.length) {
    for (const [i, decision] of meeting.summary.decisions.entries()) {
      page.drawText(`${i + 1}. ${decision}`, {
        x: left + 16,
        y,
        size: 12,
        font: fontBody,
        color: rgb(0, 0, 0),
      })
      y -= lineHeight
    }
  } else {
    page.drawText("(None)", { x: left + 16, y, size: 12, font: fontBody, color: rgb(0.5, 0.5, 0.5) })
    y -= lineHeight
  }

  // Optionally, add more sections (e.g., transcript) if needed

  const pdfBytes = await pdfDoc.save()
  return new Blob([pdfBytes], { type: "application/pdf" })
} 