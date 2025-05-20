import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI Meeting Summarizer",
  description: "Automatically transcribe and summarize your meetings",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <div className="min-h-screen bg-white bg-[radial-gradient(#f0f0f0_1px,transparent_1px)] [background-size:20px_20px]">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
