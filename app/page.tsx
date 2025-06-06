"use client"

import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, FileAudio, Clock, CheckCircle } from "lucide-react"
import Image from "next/image"
import { useSession, signOut } from "next-auth/react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { LogOut } from "lucide-react"

export const metadata: Metadata = {
  title: "Home",
  description: "Transform your meeting recordings into concise summaries with AI. Upload MP3/WAV files, get automated transcriptions, key points, decisions, and action items.",
  openGraph: {
    title: "AI Meeting Summarizer | Home",
    description: "Transform your meeting recordings into concise summaries with AI. Upload MP3/WAV files, get automated transcriptions, key points, decisions, and action items.",
  },
}

export default function Home() {
  const { data: session, status } = useSession()
  const user = session?.user
  const initials = (user?.name || user?.email || "U").split(" ").map((n) => n[0]).join("").toUpperCase()

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Link href="/" className="flex items-center gap-2">
            <FileAudio className="h-6 w-6 text-orange-500" />
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-xl font-bold text-transparent">
              AI Meeting Summarizer
            </span>
          </Link>
          <div className="flex items-center gap-4 ml-auto">
            {status === "authenticated" && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-10 w-10 border-2 border-orange-100 cursor-pointer">
                    <AvatarImage src={user.image || undefined} alt={user.name || user.email || "User"} />
                    <AvatarFallback className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{user.name || user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-500" onClick={() => signOut({ callbackUrl: "/" })}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                >
                  <Link href="/auth/sign-up">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto grid items-center gap-6 px-4 py-12 md:grid-cols-2 md:py-24">
        <div className="flex flex-col gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              AI Meeting{" "}
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                Summarizer
              </span>
            </h1>
            <p className="text-lg text-gray-600 sm:text-xl">
              Automatically transcribe and summarize your meetings with AI. Save time and never miss important details
              again.
            </p>
          </div>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            {status === "authenticated" && user ? (
              <Button
                asChild
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition-all duration-300 transform hover:scale-105"
              >
                <Link href="/dashboard">
                  Get Started
                </Link>
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition-all duration-300 transform hover:scale-105"
                >
                  <Link href="/auth/sign-up">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="transition-all duration-300 hover:bg-orange-50">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="hidden md:flex justify-center">
          <div className="relative h-[400px] w-[400px] rounded-lg overflow-hidden shadow-xl transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
            <Image
              src="/demo_img.png"
              alt="AI Meeting Summarizer"
              width={400}
              height={400}
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-tr to-white/30 from-gray-200/60"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gradient-to-b from-white to-orange-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">How It Works</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="group rounded-lg border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-500 transition-all duration-300 group-hover:bg-orange-500 group-hover:text-white">
                <FileAudio className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Upload Audio</h3>
              <p className="text-gray-600">
                Upload your meeting recordings in MP3 or WAV format. Our system supports files up to 100MB.
              </p>
            </div>
            <div className="group rounded-lg border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-500 transition-all duration-300 group-hover:bg-orange-500 group-hover:text-white">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">AI Processing</h3>
              <p className="text-gray-600">
                Our AI transcribes and analyzes your meeting, identifying key points, action items, and decisions.
              </p>
            </div>
            <div className="group rounded-lg border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-500 transition-all duration-300 group-hover:bg-orange-500 group-hover:text-white">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Get Summaries</h3>
              <p className="text-gray-600">
                Review concise summaries of your meetings, export them in various formats, and share with your team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-500">85%</div>
              <p className="mt-2 text-gray-600">Time Saved on Meeting Notes</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-500">98%</div>
              <p className="mt-2 text-gray-600">Accuracy in Transcription</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-500">10K+</div>
              <p className="mt-2 text-gray-600">Meetings Summarized</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-orange-500 to-amber-500 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to Save Time on Meeting Notes?</h2>
          <p className="mb-8 text-lg">Join thousands of professionals who use AI Meeting Summarizer</p>
          <Button
            asChild
            size="lg"
            className="bg-white text-orange-500 hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
          >
            <Link href="/auth/sign-up">
              Start Your Free Trial <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <FileAudio className="h-5 w-5 text-orange-500" />
              <span className="text-lg font-semibold">AI Meeting Summarizer</span>
            </div>
            <div className="text-sm text-gray-500">© 2025 AI Meeting Summarizer. All rights reserved.</div>
            <div className="flex gap-4">
              <Link href="#" className="text-gray-500 hover:text-orange-500">
                Terms
              </Link>
              <Link href="#" className="text-gray-500 hover:text-orange-500">
                Privacy
              </Link>
              <Link href="#" className="text-gray-500 hover:text-orange-500">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
