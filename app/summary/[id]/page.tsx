"use client"

import { useParams } from "next/navigation"
import { api } from "@/lib/trpc/client"
import { SummaryViewer } from "@/components/summary/summary-viewer"
import { MeetingEditForm } from "@/components/MeetingEditForm"
import { Button } from "@/components/ui/button"
import { Download, FileJson, FileText } from "lucide-react"
import { useState } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { exportMeetingAsJson, exportMeetingAsMarkdown, exportMeetingAsPdf } from "@/lib/services/export"
import { Meeting } from "@prisma/client"

export default function MeetingDetailPage() {
  const params = useParams()
  const meetingId = params.id as string
  const { data: meeting, isLoading, isError } = api.meeting.getById.useQuery(meetingId)
  const [isEditing, setIsEditing] = useState(false)

  const utils = api.useUtils()
  const updateMeeting = api.meeting.update.useMutation({
    onSuccess: () => {
      utils.meeting.getById.invalidate(meetingId)
      setIsEditing(false)
    },
  })

  const handleSave = async (data: any) => {
    try {
      await updateMeeting.mutateAsync({ id: meetingId, data })
    } catch (error) {
      console.error("Failed to update meeting:", error)
    }
  }

  if (isLoading) return <div className="flex justify-center py-12 text-lg text-gray-500">Loading...</div>
  if (isError) return <div className="flex justify-center py-12 text-lg text-red-500">Failed to load meeting.</div>
  if (!meeting) return <div className="flex justify-center py-12 text-lg text-red-500">Meeting not found.</div>

  // Shape meeting data for UI components
  const hydratedMeeting = {
    ...meeting,
    date: (meeting as any).date || meeting.createdAt,
    tags: Array.isArray((meeting as any).tags) ? (meeting as any).tags.map((tag: any) => tag.name) : [],
    participants: Array.isArray((meeting as any).participants) ? (meeting as any).participants.map((p: any) => p.name) : [],
    summary: (meeting as any).summary || { keyPoints: [], actionItems: [], decisions: [], transcript: "" },
    transcript: (meeting as any).summary?.transcript || "",
    duration: typeof meeting.duration === "number" ? `${Math.round(meeting.duration / 60)} minutes` : meeting.duration,
  } as any

  const handleExport = async (format: "json" | "markdown" | "pdf") => {
    if (!meeting) return
    const exportData: Meeting & {
      date: Date
      transcript: string
      summary: { keyPoints: string[]; actionItems: string[]; decisions: string[] }
      tags: string[]
    } = {
      ...meeting,
      date: meeting.date || meeting.createdAt,
      transcript: meeting.summary?.transcript || "",
      summary: meeting.summary || { keyPoints: [], actionItems: [], decisions: [] },
      tags: meeting.tags?.map((tag: { name: string }) => tag.name) || [],
    }
    let content: string | Blob
    let filename: string
    let mimeType: string

    switch (format) {
      case "json":
        content = exportMeetingAsJson(exportData)
        filename = `${meeting.title}.json`
        mimeType = "application/json"
        break
      case "markdown":
        content = exportMeetingAsMarkdown(exportData)
        filename = `${meeting.title}.md`
        mimeType = "text/markdown"
        break
      case "pdf":
        content = await exportMeetingAsPdf(exportData)
        filename = `${meeting.title}.pdf`
        mimeType = "application/pdf"
        break
      default:
        return
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <ProtectedRoute>
      <div className="container py-8">
        {isEditing ? (
          <MeetingEditForm
            initialData={hydratedMeeting}
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">{hydratedMeeting.title}</h1>
              <div className="flex gap-2">
                <Button onClick={() => setIsEditing(true)}>Edit</Button>
                <Button onClick={() => handleExport("json")}>
                  <FileJson className="mr-2 h-4 w-4" />
                  JSON
                </Button>
                <Button onClick={() => handleExport("markdown")}>
                  <FileText className="mr-2 h-4 w-4" />
                  Markdown
                </Button>
                <Button onClick={() => handleExport("pdf")}>
                  <Download className="mr-2 h-4 w-4" />
                  PDF
                </Button>
              </div>
            </div>
            <SummaryViewer summary={hydratedMeeting} />
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
