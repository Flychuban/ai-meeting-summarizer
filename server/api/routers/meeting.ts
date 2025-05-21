import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { safeDbOperation } from "@/lib/db";
import { authConfig } from "@/lib/auth/config"

const meetingSchema = z.object({
  title: z.string().min(1),
  audioUrl: z.string().url(),
  duration: z.number().int().positive(),
  fileSize: z.number().int().positive(),
  status: z.enum(["pending", "processing", "completed", "failed"]),
});

export const meetingRouter = createTRPCRouter({
  create: publicProcedure
    .input(meetingSchema)
    .mutation(async ({ ctx, input }) => {
      return safeDbOperation(
        () =>
          ctx.prisma.meeting.create({
            data: {
              ...input,
              userId: "user-id", // TODO: Replace with actual user ID from session
            },
          }),
        "Failed to create meeting"
      );
    }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    return safeDbOperation(
      () =>
        ctx.prisma.meeting.findMany({
          include: {
            summary: true,
            tags: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        }),
      "Failed to fetch meetings"
    );
  }),

  getById: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return safeDbOperation(
        () =>
          ctx.prisma.meeting.findUnique({
            where: { id: input },
            include: {
              summary: true,
              tags: true,
            },
          }),
        "Failed to fetch meeting"
      );
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        data: meetingSchema.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return safeDbOperation(
        () =>
          ctx.prisma.meeting.update({
            where: { id: input.id },
            data: input.data,
          }),
        "Failed to update meeting"
      );
    }),

  delete: publicProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return safeDbOperation(
        () =>
          ctx.prisma.meeting.delete({
            where: { id: input },
          }),
        "Failed to delete meeting"
      );
    }),

  getForCurrentUser: publicProcedure.query(async ({ ctx }) => {
    // Get user from session (NextAuth v5, App Router)
    const userId = ctx.req?.auth?.user?.id
    if (!userId) {
      throw new Error("Not authenticated")
    }
    return safeDbOperation(
      () =>
        ctx.prisma.meeting.findMany({
          where: { userId },
          include: {
            summary: true,
            tags: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        }),
      "Failed to fetch user meetings"
    )
  }),
}); 