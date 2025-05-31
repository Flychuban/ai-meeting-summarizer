import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { safeDbOperation } from "@/lib/db";
import { authConfig } from "@/lib/auth/config"

const summarySchema = z.object({
  transcript: z.string(),
  keyPoints: z.array(z.string()),
  decisions: z.array(z.string()),
  actionItems: z.array(z.string()),
});

const meetingSchema = z.object({
  title: z.string().min(1),
  audioUrl: z.string().url(),
  duration: z.number().int().positive(),
  fileSize: z.number().int().positive(),
  status: z.enum(["pending", "processing", "completed", "failed"]),
  date: z.string().or(z.date()),
  participants: z.array(z.string()),
  tags: z.array(z.string()),
  summary: summarySchema,
});

export const meetingRouter = createTRPCRouter({
  create: publicProcedure
    .input(meetingSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new Error("Not authenticated");
      return safeDbOperation(
        async () => {
          // Upsert tags
          const tagConnectOrCreate = input.tags.map((name) => ({
            where: { name },
            create: { name },
          }));
          // Upsert participants
          const participantConnectOrCreate = input.participants.map((name) => ({
            where: { name },
            create: { name },
          }));
          // Create meeting with nested summary, tags, participants
          return ctx.prisma.meeting.create({
            data: {
              title: input.title,
              audioUrl: input.audioUrl,
              duration: input.duration,
              fileSize: input.fileSize,
              status: input.status,
              date: new Date(input.date),
              userId,
              tags: { connectOrCreate: tagConnectOrCreate },
              participants: { connectOrCreate: participantConnectOrCreate },
              summary: {
                create: {
                  transcript: input.summary.transcript,
                  keyPoints: input.summary.keyPoints,
                  decisions: input.summary.decisions,
                  actionItems: input.summary.actionItems,
                },
              },
            },
            include: {
              summary: true,
              tags: true,
              participants: true,
            },
          });
        },
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
            participants: true,
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
              participants: true,
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
        async () => {
          // Update meeting fields
          const updateData: any = { ...input.data };
          if (updateData.date) updateData.date = new Date(updateData.date);
          // Handle tags
          if (updateData.tags) {
            updateData.tags = {
              set: [],
              connectOrCreate: updateData.tags.map((name: string) => ({
                where: { name },
                create: { name },
              })),
            };
          }
          // Handle participants
          if (updateData.participants) {
            updateData.participants = {
              set: [],
              connectOrCreate: updateData.participants.map((name: string) => ({
                where: { name },
                create: { name },
              })),
            };
          }
          // Handle summary
          if (updateData.summary) {
            await ctx.prisma.summary.upsert({
              where: { meetingId: input.id },
              update: updateData.summary,
              create: {
                meetingId: input.id,
                ...updateData.summary,
              },
            });
            delete updateData.summary;
          }
          return ctx.prisma.meeting.update({
            where: { id: input.id },
            data: updateData,
            include: {
              summary: true,
              tags: true,
              participants: true,
            },
          });
        },
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
    const userId = ctx.session?.user?.id;
    if (!userId) {
      throw new Error("Not authenticated");
    }
    return safeDbOperation(
      () =>
        ctx.prisma.meeting.findMany({
          where: { userId },
          include: {
            summary: true,
            tags: true,
            participants: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        }),
      "Failed to fetch user meetings"
    );
  }),
}); 