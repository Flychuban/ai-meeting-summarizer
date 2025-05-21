import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc"
import { hash } from "bcryptjs"
import { TRPCError } from "@trpc/server"
import { signUpSchema } from "@/lib/validations/auth"

export const authRouter = createTRPCRouter({
  createUser: publicProcedure
    .input(signUpSchema)
    .mutation(async ({ ctx, input }) => {
      const { email, password, name } = input

      const exists = await ctx.prisma.user.findUnique({
        where: { email },
      })

      if (exists) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already exists.",
        })
      }

      const hashedPassword = await hash(password, 10)

      const user = await ctx.prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      })

      return {
        id: user.id,
        name: user.name,
        email: user.email,
      }
    }),
}) 