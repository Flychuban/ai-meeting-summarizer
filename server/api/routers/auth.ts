import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc"
import { createUser, validateUser } from "@/lib/auth"
import { TRPCError } from "@trpc/server"
import { db } from "@/lib/db"

export const authRouter = createTRPCRouter({
  signUp: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().min(2),
      }),
    )
    .mutation(async ({ input }) => {
      const existingUser = await db.user.findUnique({
        where: {
          email: input.email,
        },
      })

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already exists",
        })
      }

      const user = await createUser(input.email, input.password, input.name)

      return {
        id: user.id,
        email: user.email,
        name: user.name,
      }
    }),

  signIn: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const user = await validateUser(input.email, input.password)

      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        })
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
      }
    }),
}) 