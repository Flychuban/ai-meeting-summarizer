"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { FileAudio, Upload, Check, Trash2, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function FileUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    setError(null)

    const droppedFile = e.dataTransfer.files[0]
    if (
      droppedFile &&
      (droppedFile.type === "audio/mpeg" || droppedFile.type === "audio/wav" || droppedFile.type === "audio/x-m4a")
    ) {
      if (droppedFile.size > 100 * 1024 * 1024) {
        setError("File size exceeds 100MB limit")
        return
      }
      setFile(droppedFile)
    } else {
      setError("Please upload an MP3, WAV, or M4A file")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.size > 100 * 1024 * 1024) {
        setError("File size exceeds 100MB limit")
        return
      }
      setFile(selectedFile)
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    setUploadProgress(0)
    setIsUploading(false)
    setIsComplete(false)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleUpload = () => {
    if (!file) return

    setIsUploading(true)
    setError(null)

    // Simulate upload progress
    let progress = 0
    const interval = setInterval(() => {
      progress += 5
      setUploadProgress(progress)

      if (progress >= 100) {
        clearInterval(interval)
        setIsUploading(false)
        setIsComplete(true)
      }
    }, 200)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-lg bg-red-50 p-4 text-red-600 flex items-center"
          >
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <p>{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center transition-all duration-300 ${
          isDragging ? "border-orange-500 bg-orange-50" : "border-gray-300 hover:border-orange-500 hover:bg-orange-50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: isDragging ? 1.1 : 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100"
        >
          <FileAudio className="h-8 w-8 text-orange-500" />
        </motion.div>
        <h3 className="mt-4 text-lg font-semibold">
          {isDragging ? "Drop your file here" : "Drag and drop your audio file"}
        </h3>
        <p className="mt-2 text-sm text-gray-500">Supports MP3, WAV, and M4A files up to 100MB</p>
        <div className="mt-6">
          <input
            id="file-upload"
            type="file"
            accept=".mp3,.wav,.m4a"
            className="hidden"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById("file-upload")?.click()}
            className="transition-all duration-300 hover:bg-orange-100 hover:text-orange-600"
          >
            Select File
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {file && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <Card className="overflow-hidden border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                      <FileAudio className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.size)} • {formatDuration(300)} {/* Assuming 5 min duration */}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveFile}
                    disabled={isUploading}
                    className="text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove file</span>
                  </Button>
                </div>

                {(isUploading || isComplete) && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{isComplete ? "Upload complete" : `Uploading... ${uploadProgress}%`}</span>
                      {isComplete && <Check className="h-4 w-4 text-green-500" />}
                    </div>
                    <Progress
                      value={uploadProgress}
                      className="h-2"
                      indicatorClassName="bg-gradient-to-r from-orange-500 to-amber-500"
                    />
                  </div>
                )}

                {!isUploading && !isComplete && (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      className="mt-4 w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition-all duration-300"
                      onClick={handleUpload}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload and Process
                    </Button>
                  </motion.div>
                )}

                {isComplete && (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      className="mt-4 w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition-all duration-300"
                      asChild
                    >
                      <a href="/summary/new">View Summary</a>
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
