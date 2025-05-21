import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { SignUpForm } from "@/components/auth/sign-up-form"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Sign Up - AI Meeting Summarizer",
  description: "Create an account to start summarizing your meetings",
}

export default async function SignUpPage() {
  const session = await getServerSession()
  if (session) {
    redirect("/dashboard")
  }
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link href="/" className="absolute left-4 top-4 md:left-8 md:top-8 text-lg font-medium">
        <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent font-bold">
          AI Meeting Summarizer
        </span>
      </Link>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
          <p className="text-sm text-gray-500">Enter your details below to create your account</p>
        </div>
        <SignUpForm />
        <p className="px-8 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/auth/login" className="underline underline-offset-4 hover:text-gray-900">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
