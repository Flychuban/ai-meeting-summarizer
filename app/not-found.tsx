import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h1 className="text-9xl font-bold text-orange-500">404</h1>
      <h2 className="mt-4 text-3xl font-bold">Page Not Found</h2>
      <p className="mt-4 max-w-md text-gray-600">The page you are looking for doesn&apos;t exist or has been moved.</p>
      <Button
        asChild
        className="mt-8 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
      >
        <Link href="/">
          <Home className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </Button>
    </div>
  )
}
