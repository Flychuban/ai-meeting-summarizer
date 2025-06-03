"use client"

import type React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { FileAudio, Upload, Check, Trash2, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { MeetingEditForm } from "@/components/MeetingEditForm"
import { api } from "@/lib/trpc/client"

export function FileUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [aiData, setAiData] = useState<any | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [duration, setDuration] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const createMeeting = api.meeting.create.useMutation()
  const progressTarget = isUploading ? (isComplete ? 100 : 90) : 0;

  // Smooth progress animation effect (non-linear, slower, ease-out)
  useEffect(() => {
    let frame: number;
    let startTime: number | null = null;
    const duration = 10000; // 10 seconds to reach 90%
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 2); // Quadratic ease-out

    if (isUploading && !isComplete) {
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const t = Math.min(elapsed / duration, 1);
        const eased = easeOut(t);
        const target = 90 * eased;
        setUploadProgress((prev) => (prev < target ? target : prev));
        if (t < 1 && !isComplete) {
          frame = requestAnimationFrame(animate);
        }
      };
      frame = requestAnimationFrame(animate);
    }
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [isUploading, isComplete]);

  // Jump to 100% when complete
  useEffect(() => {
    if (isComplete) {
      setUploadProgress(100);
    }
  }, [isComplete]);

  // Reset progress on error or cancel
  useEffect(() => {
    if (!isUploading && !isComplete) {
      setUploadProgress(0);
    }
  }, [isUploading, isComplete]);

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

  const handleUpload = async () => {
    if (!file) return
    setIsUploading(true)
    setError(null)
    setUploadProgress(0)
    try {
      const formData = new FormData()
      formData.append("audioFile", file)
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      if (!res.ok) {
        const err = await res.json()
        setError(err.error || "Upload failed")
        setIsUploading(false)
        return
      }
      const data = await res.json()
      setDuration(data.duration || null)
      setAiData({
        summary: {
          ...data.summary,
          transcript: data.transcript || "",
        },
        title: data.summary?.title || file.name.replace(/\.[^/.]+$/, ""),
        date: new Date().toISOString().slice(0, 10),
        tags: data.summary?.tags || [],
        participants: data.summary?.participants || [],
        duration: data.duration || null,
      })
      setEditMode(true)
      setIsUploading(false)
      setIsComplete(true)
    } catch (err: any) {
      setError(err.message || "Upload failed")
      setIsUploading(false)
    }
  }

  const handleSaveMeeting = async (formData: any) => {
    try {
      // Ensure audioUrl is a valid absolute URL
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
      const audioUrl = file ? `${baseUrl}/uploads/${file.name}` : `${baseUrl}/uploads/placeholder.mp3`;
      const payload = {
        title: formData.title || formData.summary?.title || file?.name.replace(/\.[^/.]+$/, "") || "Untitled Meeting",
        audioUrl: audioUrl,
        duration: duration || 0,
        fileSize: file?.size || 0,
        status: "completed" as const,
        date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
        tags: Array.isArray(formData.tags) ? formData.tags.map(String) : (typeof formData.tags === "string" ? formData.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : []),
        participants: Array.isArray(formData.participants) ? formData.participants.map(String) : (typeof formData.participants === "string" ? formData.participants.split(",").map((t: string) => t.trim()).filter(Boolean) : []),
        summary: {
          keyPoints: Array.isArray(formData.summary?.keyPoints) ? formData.summary.keyPoints.map(String) : [],
          decisions: Array.isArray(formData.summary?.decisions) ? formData.summary.decisions.map(String) : [],
          transcript: formData.summary?.transcript || "",
        },
      }
      await createMeeting.mutateAsync(payload)
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Failed to save meeting")
    }
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

  if (aiData && editMode) {
    return (
      <div className="mt-8">
        <MeetingEditForm
          initialData={aiData}
          onSave={handleSaveMeeting}
          onCancel={() => {
            setAiData(null)
            setEditMode(false)
            setFile(null)
            setIsComplete(false)
          }}
        />
      </div>
    )
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
                        {formatFileSize(file.size)} • {duration !== null ? formatDuration(duration) : "..."}
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
                      <span>{isComplete ? "Upload complete" : `Uploading... ${Math.round(uploadProgress)}%`}</span>
                      {isComplete && <Check className="h-4 w-4 text-green-500" />}
                    </div>
                    <Progress
                      value={uploadProgress}
                      className="h-2 bg-primary/20 relative w-full overflow-hidden rounded-full"
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
                      <Link href="/summary/new">View Summary</Link>
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
