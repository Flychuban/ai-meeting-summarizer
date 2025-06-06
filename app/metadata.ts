import type { Metadata } from "next"

export const homeMetadata: Metadata = {
  title: "Home",
  description: "Transform your meeting recordings into concise summaries with AI. Upload MP3/WAV files, get automated transcriptions, key points, decisions, and action items.",
  openGraph: {
    title: "AI Meeting Summarizer | Home",
    description: "Transform your meeting recordings into concise summaries with AI. Upload MP3/WAV files, get automated transcriptions, key points, decisions, and action items.",
  },
}

export const dashboardMetadata: Metadata = {
  title: "Dashboard",
  description: "Manage your meeting summaries, view analytics, and track your productivity. Access all your transcribed and summarized meetings in one place.",
  openGraph: {
    title: "Dashboard | AI Meeting Summarizer",
    description: "Manage your meeting summaries, view analytics, and track your productivity. Access all your transcribed and summarized meetings in one place.",
  },
  robots: {
    index: false,
    follow: true,
  },
}

export const uploadMetadata: Metadata = {
  title: "Upload Meeting",
  description: "Upload your meeting recordings in MP3 or WAV format. Our AI will transcribe and summarize your meetings, extracting key points, decisions, and action items.",
  openGraph: {
    title: "Upload Meeting | AI Meeting Summarizer",
    description: "Upload your meeting recordings in MP3 or WAV format. Our AI will transcribe and summarize your meetings, extracting key points, decisions, and action items.",
  },
  robots: {
    index: false,
    follow: true,
  },
}

export const summaryMetadata: Metadata = {
  title: "Meeting Summary",
  description: "View and manage your meeting summaries. Access key points, decisions, and action items from your transcribed meetings.",
  openGraph: {
    title: "Meeting Summary | AI Meeting Summarizer",
    description: "View and manage your meeting summaries. Access key points, decisions, and action items from your transcribed meetings.",
  },
  robots: {
    index: false,
    follow: true,
  },
} 