import type { Metadata } from "next"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { SummaryList } from "@/components/dashboard/summary-list"
import { EmptyState } from "@/components/dashboard/empty-state"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, FileAudio, Clock, Users } from "lucide-react"

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
    <div className="container mx-auto py-10">
      <DashboardHeader username="John" />

      {hasSummaries && (
        <div className="mt-8 grid gap-6 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-orange-50 to-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Meetings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="mr-4 rounded-full bg-orange-100 p-2 text-orange-500">
                  <FileAudio className="h-5 w-5" />
                </div>
                <div className="text-2xl font-bold">24</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-50 to-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="mr-4 rounded-full bg-orange-100 p-2 text-orange-500">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="text-2xl font-bold">42.5</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-50 to-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Participants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="mr-4 rounded-full bg-orange-100 p-2 text-orange-500">
                  <Users className="h-5 w-5" />
                </div>
                <div className="text-2xl font-bold">18</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-50 to-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Action Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="mr-4 rounded-full bg-orange-100 p-2 text-orange-500">
                  <BarChart className="h-5 w-5" />
                </div>
                <div className="text-2xl font-bold">36</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mt-8">{hasSummaries ? <SummaryList summaries={mockSummaries} /> : <EmptyState />}</div>
    </div>
  )
}
