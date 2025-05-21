import type { Metadata } from "next"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { SummaryList } from "@/components/dashboard/summary-list"
import { EmptyState } from "@/components/dashboard/empty-state"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, FileAudio, Clock, Users } from "lucide-react"
import { ProtectedRoute } from "@/components/auth/protected-route"

export const metadata: Metadata = {
  title: "Dashboard - AI Meeting Summarizer",
  description: "View and manage your meeting summaries",
}

// This would be fetched from your backend in a real app
const mockSummaries = [
  {
    id: "1",
    title: "Weekly Team Standup",
    date: "2025-05-15T10:00:00Z",
    duration: "30 minutes",
    tags: ["Team", "Weekly"],
  },
  {
    id: "2",
    title: "Product Planning",
    date: "2025-05-14T14:00:00Z",
    duration: "45 minutes",
    tags: ["Product", "Planning"],
  },
  {
    id: "3",
    title: "Client Onboarding",
    date: "2025-05-13T09:00:00Z",
    duration: "60 minutes",
    tags: ["Client", "Onboarding"],
  },
]

export default function DashboardPage() {
  const hasSummaries = mockSummaries.length > 0

  return (
    <ProtectedRoute>
      <div className="container py-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome to your dashboard!</p>
      </div>
    </ProtectedRoute>
  )
}
