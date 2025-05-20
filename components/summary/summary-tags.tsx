"use client"

import type React from "react"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, X, Tag } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface SummaryTagsProps {
  tags: string[]
  onAddTag: (tag: string) => void
  onRemoveTag: (tag: string) => void
}

export function SummaryTags({ tags, onAddTag, onRemoveTag }: SummaryTagsProps) {
  const [newTag, setNewTag] = useState("")

  const handleAddTag = () => {
    if (newTag.trim()) {
      onAddTag(newTag.trim())
      setNewTag("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddTag()
    }
  }

  return (
    <div className="mt-6 rounded-lg border p-4 bg-white shadow-sm">
      <h3 className="mb-3 text-sm font-medium text-gray-500 flex items-center">
        <Tag className="mr-2 h-4 w-4 text-orange-400" />
        Tags
      </h3>
      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {tags.map((tag) => (
            <motion.div
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300 hover:from-orange-600 hover:to-amber-600">
                {tag}
                <button
                  className="ml-1 rounded-full hover:bg-orange-600 transition-colors duration-200"
                  onClick={() => onRemoveTag(tag)}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove {tag} tag</span>
                </button>
              </Badge>
            </motion.div>
          ))}
        </AnimatePresence>
        <div className="flex">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add tag..."
            className="h-7 w-32 rounded-r-none border-orange-200 focus-visible:ring-orange-500"
          />
          <Button
            onClick={handleAddTag}
            variant="default"
            size="sm"
            className="h-7 rounded-l-none bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition-all duration-300"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
