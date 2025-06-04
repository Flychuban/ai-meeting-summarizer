"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { motion } from "framer-motion"

interface JsonViewerProps {
  data: unknown
}

export function JsonViewer({ data }: JsonViewerProps) {
  const [copied, setCopied] = useState(false)

  const jsonString = JSON.stringify(data, null, 2)

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="absolute right-2 top-2 transition-all duration-200 hover:bg-orange-50"
        onClick={handleCopy}
      >
        {copied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
        {copied ? "Copied!" : "Copy"}
      </Button>
      <motion.pre
        className="max-h-[600px] overflow-auto rounded-lg bg-gray-50 p-4 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <code className="text-gray-800 font-mono">{jsonString}</code>
      </motion.pre>
    </div>
  )
}
