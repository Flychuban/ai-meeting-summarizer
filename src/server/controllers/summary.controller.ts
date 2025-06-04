import { BaseController } from './base.controller';
import { type Context } from '../api/trpc';
import { TRPCError } from '@trpc/server';
import { summarySchema, type SummaryInput, type SummaryResponse } from '@/types/api/summary.types';
import { transcribeAudio } from '@/lib/ai/transcription';
import { summarizeMeeting } from '@/lib/ai/summarization';
import { type AIError } from '@/lib/ai/types';

export class SummaryController extends BaseController {
  constructor(context: Context) {
    super(context);
  }

  async createSummary(input: unknown): Promise<SummaryResponse> {
    try {
      const user = this.requireAuth();
      const summaryData = this.validateInput(summarySchema, input) as SummaryInput;

      // Check if meeting exists and belongs to user
      const meeting = await this.context.prisma.meeting.findFirst({
        where: {
          id: summaryData.meetingId,
          userId: user.id,
        },
      });

      if (!meeting) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Meeting not found',
        });
      }

      // Check if summary already exists
      const existingSummary = await this.context.prisma.summary.findUnique({
        where: {
          meetingId: summaryData.meetingId,
        },
      });

      if (existingSummary) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Summary already exists for this meeting',
        });
      }

      const summary = await this.context.prisma.summary.create({
        data: summaryData,
        include: {
          meeting: true,
        },
      });

      return this.mapToResponse(summary);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getSummary(meetingId: string): Promise<SummaryResponse> {
    try {
      const user = this.requireAuth();
      const summary = await this.context.prisma.summary.findFirst({
        where: {
          meetingId,
          meeting: {
            userId: user.id,
          },
        },
        include: {
          meeting: true,
        },
      });

      if (!summary) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Summary not found',
        });
      }

      return this.mapToResponse(summary);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateSummary(meetingId: string, input: unknown): Promise<SummaryResponse> {
    try {
      const user = this.requireAuth();
      const updateData = this.validateInput(summarySchema, input) as SummaryInput;

      const summary = await this.context.prisma.summary.update({
        where: {
          meetingId,
          meeting: {
            userId: user.id,
          },
        },
        data: updateData,
        include: {
          meeting: true,
        },
      });

      return this.mapToResponse(summary);
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteSummary(meetingId: string): Promise<void> {
    try {
      const user = this.requireAuth();
      await this.context.prisma.summary.delete({
        where: {
          meetingId,
          meeting: {
            userId: user.id,
          },
        },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async generateSummary(meetingId: string): Promise<SummaryResponse> {
    try {
      const user = this.requireAuth();
      const meeting = await this.context.prisma.meeting.findFirst({
        where: {
          id: meetingId,
          userId: user.id,
        },
      });

      if (!meeting) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Meeting not found',
        });
      }

      // Check if summary already exists
      const existingSummary = await this.context.prisma.summary.findUnique({
        where: {
          meetingId,
        },
      });

      if (existingSummary) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Summary already exists for this meeting',
        });
      }

      // Update meeting status to processing
      await this.context.prisma.meeting.update({
        where: { id: meetingId },
        data: { status: 'processing' },
      });

      try {
        // Update status to transcribing
        await this.context.prisma.meeting.update({
          where: { id: meetingId },
          data: { status: 'transcribing' },
        });

        // Transcribe the audio
        const transcription = await transcribeAudio(new File([], meeting.audioUrl));

        // Update status to summarizing
        await this.context.prisma.meeting.update({
          where: { id: meetingId },
          data: { status: 'summarizing' },
        });

        // Generate the summary
        const summary = await summarizeMeeting(transcription.text);

        // Create the summary in the database
        const createdSummary = await this.context.prisma.summary.create({
          data: {
            meetingId,
            transcript: transcription.text,
            keyPoints: summary.keyPoints,
            decisions: summary.decisions,
          },
          include: {
            meeting: true,
          },
        });

        // Update meeting with summary data
        await this.context.prisma.meeting.update({
          where: { id: meetingId },
          data: {
            status: 'completed',
            title: summary.title,
            tags: {
              connectOrCreate: summary.tags.map((tag) => ({
                where: { name: tag },
                create: { name: tag },
              })),
            },
            participants: {
              connectOrCreate: summary.participants.map((name) => ({
                where: { name },
                create: { name },
              })),
            },
          },
        });

        return this.mapToResponse(createdSummary);
      } catch (error: unknown) {
        // Update meeting status to failed
        await this.context.prisma.meeting.update({
          where: { id: meetingId },
          data: { status: 'failed' },
        });

        // Handle AI-specific errors
        if (error instanceof Error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `AI processing failed: ${error.message}`,
            cause: error,
          });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unknown error occurred during AI processing',
        });
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  private mapToResponse(summary: any): SummaryResponse {
    return {
      id: summary.id,
      meetingId: summary.meetingId,
      transcript: summary.transcript,
      keyPoints: summary.keyPoints,
      decisions: summary.decisions,
      createdAt: summary.createdAt,
      updatedAt: summary.updatedAt,
      meeting: {
        id: summary.meeting.id,
        title: summary.meeting.title,
        audioUrl: summary.meeting.audioUrl,
        duration: summary.meeting.duration,
        fileSize: summary.meeting.fileSize,
        status: summary.meeting.status,
        date: summary.meeting.date,
      },
    };
  }
} 