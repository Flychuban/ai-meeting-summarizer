import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TRPCProvider } from "@/lib/trpc/provider"
import { AuthProvider } from "@/components/providers/session-provider"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "AI Meeting Summarizer | Transcribe & Summarize Meetings with AI",
    template: "%s | AI Meeting Summarizer"
  },
  description: "Transform your meeting recordings into concise summaries with AI. Upload MP3/WAV files, get automated transcriptions, key points, decisions, and action items. Save time and never miss important details.",
  keywords: ["meeting summarizer", "AI transcription", "meeting notes", "audio to text", "meeting summary", "AI assistant", "productivity tool"],
  authors: [{ name: "AI Meeting Summarizer Team" }],
  creator: "AI Meeting Summarizer",
  publisher: "AI Meeting Summarizer",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://ai-meeting-summarizer.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ai-meeting-summarizer.vercel.app",
    title: "AI Meeting Summarizer | Transcribe & Summarize Meetings with AI",
    description: "Transform your meeting recordings into concise summaries with AI. Upload MP3/WAV files, get automated transcriptions, key points, decisions, and action items.",
    siteName: "AI Meeting Summarizer",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI Meeting Summarizer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Meeting Summarizer | Transcribe & Summarize Meetings with AI",
    description: "Transform your meeting recordings into concise summaries with AI. Upload MP3/WAV files, get automated transcriptions, key points, decisions, and action items.",
    images: ["/og-image.png"],
    creator: "@ai_meeting_summarizer",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-site-verification",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TRPCProvider>
          <AuthProvider>
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
              <div className="min-h-screen bg-white bg-[radial-gradient(#f0f0f0_1px,transparent_1px)] [background-size:20px_20px]">
                {children}
              </div>
            </ThemeProvider>
            <Toaster />
          </AuthProvider>
        </TRPCProvider>
      </body>
    </html>
  )
}
