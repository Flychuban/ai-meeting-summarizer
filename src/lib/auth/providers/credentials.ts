import { compare } from "bcryptjs"
import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { db } from "@/lib/db"
import { loginSchema } from "@/lib/validations/auth"

export const credentialsProvider = {
  id: "credentials",
  name: "Credentials",
  type: "credentials",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials) {
    const parsedCredentials = loginSchema.safeParse(credentials)

    if (!parsedCredentials.success) {
      return null
    }

    const { email, password } = parsedCredentials.data

    const user = await db.user.findUnique({
      where: { email },
    })

    if (!user || !user.password) {
      return null
    }

    const passwordsMatch = await compare(password, user.password)

    if (!passwordsMatch) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
    }
  },
} satisfies NextAuthConfig["providers"][0] 