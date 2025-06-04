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
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function MeetingDetailPage() {
  const params = useParams()
  const meetingId = params.id as string
  const { data: meeting, isLoading, isError } = api.meeting.getById.useQuery(meetingId)
  const [isEditing, setIsEditing] = useState(false)
  const router = useRouter()

  const utils = api.useUtils()
  const updateMeeting = api.meeting.update.useMutation({
    onSuccess: () => {
      utils.meeting.getById.invalidate(meetingId)
      setIsEditing(false)
    },
  })

  const deleteMeeting = api.meeting.delete.useMutation({
    onSuccess: () => {
      toast.success("Meeting deleted successfully!", {
        description: "Redirecting to dashboard...",
        duration: 1800,
        position: "top-center",
        className: "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg animate-in fade-in zoom-in"
      })
      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
    },
    onError: () => {
      toast.error("Failed to delete meeting.")
    }
  })

  const handleSave = async (data: any) => {
    try {
      // Ensure summary is always present and transcript is inside summary
      const payload = {
        ...data,
        summary: {
          transcript: data.summary?.transcript || "",
          keyPoints: data.summary?.keyPoints || [],
          decisions: data.summary?.decisions || [],
        },
      }
      await updateMeeting.mutateAsync({ id: meetingId, data: payload })
    } catch (error) {
      console.error("Failed to update meeting:", error)
    }
  }

  const handleDelete = () => {
    deleteMeeting.mutate(meetingId)
  }

  if (isLoading) return <div className="flex justify-center py-12 text-lg text-gray-500">Loading...</div>
  if (isError) return <div className="flex justify-center py-12 text-lg text-red-500">Failed to load meeting.</div>
  if (!meeting) return <div className="flex justify-center py-12 text-lg text-red-500">Meeting not found.</div>

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
      summary: {
        keyPoints: meeting.summary?.keyPoints || [],
        actionItems: Array.isArray((meeting.summary as any)?.actionItems) ? (meeting.summary as any).actionItems : [],
        decisions: meeting.summary?.decisions || [],
      },
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
          (() => {
            const m: any = meeting || {}
            const hydratedMeeting = {
              ...m,
              transcript: m.summary?.transcript || "",
              date: m.date || m.createdAt || new Date().toISOString(),
              tags: Array.isArray(m.tags) ? m.tags.map((tag: any) => tag.name) : [],
              participants: Array.isArray(m.participants) ? m.participants.map((p: any) => p.name) : [],
              summary: {
                keyPoints: m.summary?.keyPoints || [],
                decisions: m.summary?.decisions || [],
                actionItems: Array.isArray(m.summary?.actionItems) ? m.summary.actionItems : [],
                transcript: m.summary?.transcript || "",
              },
              duration: typeof m.duration === "number" ? `${Math.round(m.duration / 60)} minutes` : m.duration || "",
            }
            return (
              <MeetingEditForm
                initialData={hydratedMeeting as any}
                onSave={handleSave}
                onCancel={() => setIsEditing(false)}
              />
            )
          })()
        ) : (
          (() => {
            const m: any = meeting || {}
            const hydratedMeeting = {
              ...m,
              transcript: m.summary?.transcript || "",
              date: m.date || m.createdAt || new Date().toISOString(),
              tags: Array.isArray(m.tags) ? m.tags.map((tag: any) => tag.name) : [],
              participants: Array.isArray(m.participants) ? m.participants.map((p: any) => p.name) : [],
              summary: {
                keyPoints: m.summary?.keyPoints || [],
                decisions: m.summary?.decisions || [],
                actionItems: Array.isArray(m.summary?.actionItems) ? m.summary.actionItems : [],
                transcript: m.summary?.transcript || "",
              },
              duration: typeof m.duration === "number" ? `${Math.round(m.duration / 60)} minutes` : m.duration || "",
            }
            return (
              <div className="space-y-6">
                <SummaryViewer
                  summary={hydratedMeeting as any}
                  onEdit={() => setIsEditing(true)}
                  onExport={handleExport}
                  isAuthenticated={true}
                  onDelete={handleDelete}
                />
              </div>
            )
          })()
        )}
      </div>
    </ProtectedRoute>
  )
}
