"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Download, Copy, FileJson, FileText, ArrowLeft, Users, Share2, Check } from "lucide-react"
import { SummaryTags } from "@/components/summary/summary-tags"
import { JsonViewer } from "@/components/summary/json-viewer"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { motion } from "framer-motion"
import { api } from "@/lib/trpc/client"

interface ActionItem {
  assignee: string
  task: string
  dueDate: string
}

interface Summary {
  id: string
  title: string
  date: string
  duration: string
  tags: string[]
  participants?: string[]
  summary: {
    keyPoints: string[]
    decisions: string[]
  }
}

interface SummaryViewerProps {
  summary: Summary
}

export function SummaryViewer({ summary }: SummaryViewerProps) {
  const [tags, setTags] = useState<string[]>(summary.tags)
  const [copied, setCopied] = useState(false)
  const [tagLoading, setTagLoading] = useState(false)
  const utils = api.useUtils()
  const updateMeeting = api.meeting.update.useMutation({
    onSuccess: () => {
      utils.meeting.getById.invalidate(summary.id)
    },
  })

  const formattedDate = new Date(summary.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  const handleAddTag = async (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTagLoading(true)
      try {
        const newTags = [...tags, tag]
        await updateMeeting.mutateAsync({ id: summary.id, data: { tags: newTags } })
        setTags(newTags)
      } catch (e) {
        // Optionally show error
      } finally {
        setTagLoading(false)
      }
    }
  }

  const handleRemoveTag = async (tag: string) => {
    if (tags.includes(tag)) {
      setTagLoading(true)
      try {
        const newTags = tags.filter((t) => t !== tag)
        await updateMeeting.mutateAsync({ id: summary.id, data: { tags: newTags } })
        setTags(newTags)
      } catch (e) {
        // Optionally show error
      } finally {
        setTagLoading(false)
      }
    }
  }

  const handleCopyToClipboard = () => {
    const text = `
# ${summary.title}
Date: ${formattedDate}
Duration: ${summary.duration}

## Key Points
${summary.summary.keyPoints.map((point) => `- ${point}`).join("\n")}

## Decisions
${summary.summary.decisions.map((decision) => `- ${decision}`).join("\n")}
    `

    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-4">
            <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2 text-orange-500 hover:bg-orange-50">
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{summary.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="mr-1 h-4 w-4 text-orange-400" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="mr-1 h-4 w-4 text-orange-400" />
              <span>{summary.duration}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopyToClipboard} className="transition-all duration-200">
            {copied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button variant="outline" size="sm" className="transition-all duration-200">
            <FileJson className="mr-2 h-4 w-4" />
            JSON
          </Button>
          <Button variant="outline" size="sm" className="transition-all duration-200">
            <FileText className="mr-2 h-4 w-4" />
            Markdown
          </Button>
          <Button variant="outline" size="sm" className="transition-all duration-200">
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button variant="outline" size="sm" className="transition-all duration-200">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      {summary.participants && (
        <div className="mb-6">
          <h3 className="mb-2 text-sm font-medium text-gray-500 flex items-center">
            <Users className="mr-2 h-4 w-4 text-orange-400" />
            Participants
          </h3>
          <div className="flex flex-wrap gap-2">
            {summary.participants.map((participant, index) => (
              <div key={index} className="flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-gradient-to-r from-orange-500 to-amber-500 text-[10px] text-white">
                    {getInitials(participant)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{participant}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <SummaryTags tags={tags} onAddTag={handleAddTag} onRemoveTag={handleRemoveTag} />
      {tagLoading && (
        <div className="text-xs text-gray-400 mt-2">Updating tags...</div>
      )}

      <Tabs defaultValue="summary" className="mt-6">
        <TabsList className="bg-orange-50">
          <TabsTrigger value="summary" className="data-[state=active]:bg-white">
            Summary
          </TabsTrigger>
          <TabsTrigger value="json" className="data-[state=active]:bg-white">
            JSON View
          </TabsTrigger>
        </TabsList>
        <TabsContent value="summary" className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card>
              <CardHeader className="p-0 overflow-hidden">
                <div className="w-full h-10 flex items-center rounded-t-md bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400 px-4">
                  <CardTitle className="flex items-center text-white font-semibold text-lg">
                    <span className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/30 text-xs font-medium text-white">
                      1
                    </span>
                    Key Points
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-2">
                  {summary.summary.keyPoints.map((point, index) => (
                    <motion.li
                      key={index}
                      className="flex items-start"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.1 }}
                    >
                      <span className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs font-medium text-orange-600">
                        {index + 1}
                      </span>
                      <span>{point}</span>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardHeader className="p-0 overflow-hidden">
                <div className="w-full h-10 flex items-center rounded-t-md bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400 px-4">
                  <CardTitle className="flex items-center text-white font-semibold text-lg">
                    <span className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/30 text-xs font-medium text-white">
                      2
                    </span>
                    Decisions
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-2">
                  {summary.summary.decisions.map((decision, index) => (
                    <motion.li
                      key={index}
                      className="flex items-start"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.1 }}
                    >
                      <span className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs font-medium text-orange-600">
                        {index + 1}
                      </span>
                      <span>{decision}</span>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
        <TabsContent value="json">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card>
              <CardContent className="p-6">
                <JsonViewer data={summary.summary} />
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
