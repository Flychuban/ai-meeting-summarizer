"use client"

import Link from "next/link"
import { FileUploader } from "@/components/upload/file-uploader"
import { Button } from "@/components/ui/button"
import { ArrowLeft, HelpCircle, FileAudio, Clock, Volume2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function UploadPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center">
          <Button asChild variant="ghost" size="sm" className="mr-4">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Upload Meeting Audio</h1>
            <p className="mt-1 text-gray-500">Upload your meeting audio file to generate a summary</p>
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader className="p-0 overflow-hidden">
              <div className="w-full h-10 flex items-center rounded-t-md bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400 px-4">
                <CardTitle className="flex items-center text-white font-semibold text-lg">
                  <FileAudio className="mr-2 h-5 w-5 text-white" />
                  Supported Formats
                </CardTitle>
              </div>
              <CardDescription className="mt-2 px-4">Our system supports the following audio formats and specifications</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex flex-col items-center rounded-lg border p-4 text-center">
                  <FileAudio className="mb-2 h-8 w-8 text-orange-500" />
                  <h3 className="font-medium">File Formats</h3>
                  <p className="text-sm text-gray-500">MP3, WAV, M4A</p>
                </div>
                <div className="flex flex-col items-center rounded-lg border p-4 text-center">
                  <Clock className="mb-2 h-8 w-8 text-orange-500" />
                  <h3 className="font-medium">Duration</h3>
                  <p className="text-sm text-gray-500">Up to 3 hours</p>
                </div>
                <div className="flex flex-col items-center rounded-lg border p-4 text-center">
                  <Volume2 className="mb-2 h-8 w-8 text-orange-500" />
                  <h3 className="font-medium">Quality</h3>
                  <p className="text-sm text-gray-500">Min 128kbps recommended</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <FileUploader />

          <Card>
            <CardHeader className="p-0 overflow-hidden">
              <div className="w-full h-10 flex items-center rounded-t-md bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400 px-4">
                <CardTitle className="flex items-center text-white font-semibold text-lg">
                  <HelpCircle className="mr-2 h-5 w-5 text-white" />
                  Tips for Better Results
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 text-xs font-medium text-orange-600">
                    1
                  </span>
                  <span>Use a high-quality microphone for clearer audio</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 text-xs font-medium text-orange-600">
                    2
                  </span>
                  <span>Reduce background noise during recording</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 text-xs font-medium text-orange-600">
                    3
                  </span>
                  <span>Ask participants to speak clearly and one at a time</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 text-xs font-medium text-orange-600">
                    4
                  </span>
                  <span>Start the recording with introductions of all participants</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
