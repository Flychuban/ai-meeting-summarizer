import type { NextAuthConfig } from "next-auth"
import { credentialsProvider } from "./providers/credentials"
import { githubProvider } from "./providers/github"

export const authConfig = {
  debug: process.env.NODE_ENV === "development",
  trustHost: true,
  providers: [credentialsProvider, githubProvider],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
} satisfies NextAuthConfig 