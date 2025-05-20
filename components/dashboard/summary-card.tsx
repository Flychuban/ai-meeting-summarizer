import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users } from "lucide-react"

interface SummaryCardProps {
  summary: {
    id: string
    title: string
    date: string
    duration: string
    tags: string[]
  }
}

export function SummaryCard({ summary }: SummaryCardProps) {
  const formattedDate = new Date(summary.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  return (
    <Link href={`/summary/${summary.id}`}>
      <Card className="h-full overflow-hidden transition-all hover:shadow-md hover:border-orange-200 group">
        <CardHeader className="p-0 overflow-hidden">
          <div className="w-full h-10 flex items-center rounded-t-md bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400 px-4">
            <CardTitle className="line-clamp-1 text-white font-semibold text-lg">
              {summary.title}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <Calendar className="mr-1 h-4 w-4 text-orange-400" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <Clock className="mr-1 h-4 w-4 text-orange-400" />
            <span>{summary.duration}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Users className="mr-1 h-4 w-4 text-orange-400" />
            <span>5 participants</span>
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2 border-t pt-4">
          {summary.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs group-hover:bg-orange-100 transition-colors duration-200"
            >
              {tag}
            </Badge>
          ))}
        </CardFooter>
      </Card>
    </Link>
  )
}
