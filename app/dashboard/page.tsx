"use client"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { SummaryList } from "@/components/dashboard/summary-list"
import { EmptyState } from "@/components/dashboard/empty-state"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, FileAudio, Clock, Users } from "lucide-react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { api } from "@/lib/trpc/client"
import { useSession } from "next-auth/react"

export default function DashboardPage() {
  const { data: session } = useSession()
  const username = session?.user?.name || "User"
  const { data, isLoading, isError } = api.meeting.getForCurrentUser.useQuery()

  // Transform data for SummaryList
  const summaries = (data || []).map((meeting) => ({
    id: meeting.id,
    title: meeting.title,
    date: typeof meeting.createdAt === 'string' ? meeting.createdAt : meeting.createdAt.toISOString(),
    duration: meeting.duration ? `${Math.round(meeting.duration / 60)} minutes` : "",
    tags: meeting.tags?.map((tag) => tag.name) || [],
    participants: meeting.participants?.map((p) => p.name) || [],
  }))

  return (
    <ProtectedRoute>
      <div className="container py-8 space-y-8">
        <DashboardHeader username={username} />
        {isLoading ? (
          <div className="flex justify-center py-12 text-lg text-gray-500">Loading...</div>
        ) : isError ? (
          <div className="flex justify-center py-12 text-lg text-red-500">Failed to load meetings.</div>
        ) : summaries.length === 0 ? (
          <EmptyState />
        ) : (
          <SummaryList summaries={summaries} />
        )}
      </div>
    </ProtectedRoute>
  )
}
