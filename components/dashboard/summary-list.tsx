"use client"

import { useState } from "react"
import { SummaryCard } from "@/components/dashboard/summary-card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, X, Filter, Grid3X3, List } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

interface Summary {
  id: string
  title: string
  date: string
  duration: string
  tags: string[]
}

interface SummaryListProps {
  summaries: Summary[]
}

export function SummaryList({ summaries }: SummaryListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Get all unique tags
  const allTags = Array.from(new Set(summaries.flatMap((summary) => summary.tags)))

  // Filter summaries based on search term and selected tags
  const filteredSummaries = summaries.filter((summary) => {
    const matchesSearch = summary.title.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTags = selectedTags.length === 0 || selectedTags.every((tag) => summary.tags.includes(tag))

    return matchesSearch && matchesTags
  })

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search summaries..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className={`${viewMode === "grid" ? "bg-orange-50 text-orange-500" : ""}`}
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="h-4 w-4" />
            <span className="sr-only">Grid View</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`${viewMode === "list" ? "bg-orange-50 text-orange-500" : ""}`}
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
            <span className="sr-only">List View</span>
          </Button>
          <div className="relative">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
              {selectedTags.length > 0 && (
                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] text-white">
                  {selectedTags.length}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {allTags.map((tag) => (
            <motion.div
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Badge
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className={
                  selectedTags.includes(tag)
                    ? "bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400 hover:from-orange-500 hover:to-amber-500 cursor-pointer transition-all duration-200 text-white"
                    : "cursor-pointer hover:bg-orange-50 transition-all duration-200"
                }
                onClick={() => toggleTag(tag)}
              >
                {tag}
                {selectedTags.includes(tag) && <X className="ml-1 h-3 w-3" />}
              </Badge>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={viewMode === "grid" ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-4"}
        >
          {filteredSummaries.map((summary) => (
            <motion.div
              key={summary.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <SummaryCard key={summary.id} summary={summary} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
