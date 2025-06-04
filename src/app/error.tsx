"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
        <AlertTriangle className="h-12 w-12 text-red-600" />
      </div>
      <h1 className="mt-6 text-3xl font-bold">Something went wrong</h1>
      <p className="mt-4 max-w-md text-gray-600">
        We apologize for the inconvenience. An error occurred while processing your request.
      </p>
      <Button
        onClick={reset}
        className="mt-8 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Try again
      </Button>
    </div>
  )
}
