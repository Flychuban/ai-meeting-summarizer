import type { Metadata } from "next"
import { SummaryViewer } from "@/components/summary/summary-viewer"

export const metadata: Metadata = {
  title: "Meeting Summary - AI Meeting Summarizer",
  description: "View your AI-generated meeting summary",
}

// This would be fetched from your backend in a real app
const mockSummary = {
  id: "1",
  title: "Weekly Team Standup",
  date: "2025-05-15T10:00:00Z",
  duration: "30 minutes",
  tags: ["Team", "Weekly"],
  participants: ["John Doe", "Sarah Smith", "Mike Johnson", "Emily Brown", "David Wilson"],
  summary: {
    keyPoints: [
      "Discussed Q2 roadmap and prioritized features",
      "Marketing team reported 15% increase in user acquisition",
      "Engineering team completed the authentication refactoring",
      "Customer support reported positive feedback on new UI",
    ],
    actionItems: [
      { assignee: "John", task: "Finalize Q2 roadmap document", dueDate: "2025-05-20" },
      { assignee: "Sarah", task: "Create marketing assets for new feature launch", dueDate: "2025-05-25" },
      { assignee: "Mike", task: "Fix reported bugs in dashboard", dueDate: "2025-05-18" },
    ],
    decisions: [
      "Approved budget for new marketing campaign",
      "Decided to postpone the API migration to Q3",
      "Agreed to hire two more frontend developers",
    ],
  },
}

export default function SummaryPage() {
  // In a real app, you would fetch the summary based on the ID
  const summary = mockSummary

  return (
    <div className="container mx-auto py-10">
      <SummaryViewer summary={summary} />
    </div>
  )
}
