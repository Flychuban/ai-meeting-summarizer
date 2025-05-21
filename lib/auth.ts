import { hash, compare } from "bcryptjs"
import { db } from "@/lib/db"

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword)
}

export async function validateUser(email: string, password: string) {
  const user = await db.user.findUnique({
    where: {
      email,
    },
  })

  if (!user || !user.password) {
    return null
  }

  const isValid = await verifyPassword(password, user.password)

  if (!isValid) {
    return null
  }

  return user
}

export async function createUser(email: string, password: string, name: string) {
  const hashedPassword = await hashPassword(password)

  return db.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  })
} 