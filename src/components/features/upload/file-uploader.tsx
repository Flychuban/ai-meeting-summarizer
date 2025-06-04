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
import { MeetingEditForm } from "@/components/features/summary/MeetingEditForm"
import { api } from "@/lib/trpc/client"
import type { SummaryResponse } from "@/types/api/summary.types"
import type { MeetingResponse } from "@/types/api/meeting.types"
import { transcribeAudio } from "@/lib/ai/transcription"
import { summarizeMeeting } from "@/lib/ai/summarization"

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
  const generateSummary = api.summary.generate.useMutation()
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
      // Step 1: Create initial meeting record
      const meeting = await createMeeting.mutateAsync({
        title: file.name.replace(/\.[^/.]+$/, ""),
        audioUrl: "", // Will be updated after file upload
        duration: 0, // Will be updated after processing
        fileSize: file.size,
        status: "processing",
        date: new Date().toISOString(),
      })

      // Step 2: Upload file and get permanent URL
      const formData = new FormData()
      formData.append("file", file)
      formData.append("meetingId", meeting.id)
      
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      
      if (!uploadRes.ok) {
        throw new Error("Failed to upload file")
      }
      
      const { audioUrl } = await uploadRes.json()

      // Step 3: Transcribe audio
      const transcription = await transcribeAudio(file)
      setDuration(transcription.duration || null)

      // Step 4: Generate summary
      const summary = await summarizeMeeting(transcription.text)

      // Step 5: Update meeting with all data
      const updatedMeeting = await createMeeting.mutateAsync({
        id: meeting.id,
        title: summary.title,
        audioUrl,
        duration: transcription.duration || 0,
        status: "completed",
        tags: summary.tags,
        participants: summary.participants,
      })

      // Step 6: Create summary record
      await generateSummary.mutateAsync(meeting.id)

      setAiData({
        summary: {
          keyPoints: summary.keyPoints,
          decisions: summary.decisions,
          transcript: transcription.text,
        },
        title: summary.title,
        date: new Date().toISOString().slice(0, 10),
        tags: summary.tags,
        participants: summary.participants,
        duration: transcription.duration || null,
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
      const payload = {
        title: formData.title || formData.summary?.title || file?.name.replace(/\.[^/.]+$/, "") || "Untitled Meeting",
        audioUrl: formData.audioUrl || "",
        duration: duration || 0,
        fileSize: file?.size || 0,
        status: "completed" as const,
        date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
        tags: Array.isArray(formData.tags) ? formData.tags : (typeof formData.tags === "string" ? formData.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : []),
        participants: Array.isArray(formData.participants) ? formData.participants : (typeof formData.participants === "string" ? formData.participants.split(",").map((t: string) => t.trim()).filter(Boolean) : []),
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

  return (
    <div className="mx-auto max-w-2xl">
      <Card className="border-2 border-dashed border-orange-200 bg-orange-50/50">
        <CardContent className="p-6">
          {!file ? (
            <div
              className={`flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed ${
                isDragging ? "border-orange-400 bg-orange-50" : "border-orange-200"
              } transition-colors`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <FileAudio className="mb-4 h-12 w-12 text-orange-400" />
              <p className="mb-2 text-sm text-gray-600">
                Drag and drop your audio file here, or{" "}
                <button
                  className="text-orange-500 hover:text-orange-600"
                  onClick={() => fileInputRef.current?.click()}
                >
                  browse
                </button>
              </p>
              <p className="text-xs text-gray-500">
                Supported formats: MP3, WAV, M4A (max 100MB)
              </p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".mp3,.wav,.m4a"
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileAudio className="h-5 w-5 text-orange-400" />
                  <span className="text-sm font-medium">{file.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{formatFileSize(file.size)}</span>
                  {duration && <span>{formatDuration(duration)}</span>}
                </div>
                <Progress value={uploadProgress} className="h-2" />
                {error && (
                  <div className="flex items-center text-xs text-red-500">
                    <AlertCircle className="mr-1 h-4 w-4" />
                    {error}
                  </div>
                )}
              </div>
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full bg-orange-500 text-white hover:bg-orange-600"
              >
                {isUploading ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-bounce" />
                    Uploading...
                  </>
                ) : isComplete ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Upload Complete
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AnimatePresence>
        {editMode && aiData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="mt-8"
          >
            <MeetingEditForm
              initialData={aiData}
              onSave={handleSaveMeeting}
              onCancel={() => setEditMode(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
