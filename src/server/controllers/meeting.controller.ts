import { BaseController } from './base.controller';
import { type Context } from '../api/trpc';
import { TRPCError } from '@trpc/server';
import { meetingSchema, updateMeetingSchema, type MeetingInput, type UpdateMeetingInput, type MeetingResponse } from '@/types/api/meeting.types';
import { Prisma } from '@prisma/client';

export class MeetingController extends BaseController {
  constructor(context: Context) {
    super(context);
  }

  async createMeeting(input: unknown): Promise<MeetingResponse> {
    try {
      const user = this.requireAuth();
      const meetingData = this.validateInput(meetingSchema, input) as MeetingInput;

      const meeting = await this.context.prisma.meeting.create({
        data: {
          title: meetingData.title,
          audioUrl: meetingData.audioUrl,
          duration: meetingData.duration,
          fileSize: meetingData.fileSize,
          status: meetingData.status,
          date: meetingData.date,
          user: {
            connect: {
              id: user.id,
            },
          },
          tags: meetingData.tags ? {
            connectOrCreate: meetingData.tags.map((tag: string) => ({
              where: { name: tag },
              create: { name: tag },
            })),
          } : undefined,
          participants: meetingData.participants ? {
            connectOrCreate: meetingData.participants.map((name: string) => ({
              where: { name },
              create: { name },
            })),
          } : undefined,
        },
        include: {
          summary: true,
          tags: true,
          participants: true,
        },
      });

      return this.mapToResponse(meeting);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getMeeting(id: string): Promise<MeetingResponse> {
    try {
      const user = this.requireAuth();
      const meeting = await this.context.prisma.meeting.findFirst({
        where: {
          id,
          userId: user.id,
        },
        include: {
          summary: true,
          tags: true,
          participants: true,
        },
      });

      if (!meeting) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Meeting not found',
        });
      }

      return this.mapToResponse(meeting);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateMeeting(id: string, input: unknown): Promise<MeetingResponse> {
    try {
      const user = this.requireAuth();
      const updateData = this.validateInput(updateMeetingSchema, input) as UpdateMeetingInput;

      const meeting = await this.context.prisma.meeting.update({
        where: {
          id,
          userId: user.id,
        },
        data: {
          title: updateData.title,
          audioUrl: updateData.audioUrl,
          duration: updateData.duration,
          fileSize: updateData.fileSize,
          status: updateData.status,
          date: updateData.date,
          tags: updateData.tags ? {
            set: [],
            connectOrCreate: updateData.tags.map((tag: string) => ({
              where: { name: tag },
              create: { name: tag },
            })),
          } : undefined,
          participants: updateData.participants ? {
            set: [],
            connectOrCreate: updateData.participants.map((name: string) => ({
              where: { name },
              create: { name },
            })),
          } : undefined,
        },
        include: {
          summary: true,
          tags: true,
          participants: true,
        },
      });

      return this.mapToResponse(meeting);
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteMeeting(id: string): Promise<void> {
    try {
      const user = this.requireAuth();
      await this.context.prisma.meeting.delete({
        where: {
          id,
          userId: user.id,
        },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async listMeetings(): Promise<MeetingResponse[]> {
    try {
      const user = this.requireAuth();
      const meetings = await this.context.prisma.meeting.findMany({
        where: {
          userId: user.id,
        },
        include: {
          summary: true,
          tags: true,
          participants: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return meetings.map(meeting => this.mapToResponse(meeting));
    } catch (error) {
      this.handleError(error);
    }
  }

  async generateSummary(id: string): Promise<MeetingResponse> {
    try {
      const user = this.requireAuth();
      const meeting = await this.context.prisma.meeting.findFirst({
        where: {
          id,
          userId: user.id,
        },
        include: {
          summary: true,
          tags: true,
          participants: true,
        },
      });

      if (!meeting) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Meeting not found',
        });
      }

      if (meeting.summary) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Summary already exists for this meeting',
        });
      }

      // Here you would typically call your AI service to generate the summary
      // For now, we'll just throw an error
      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: 'Summary generation not implemented yet',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  private mapToResponse(meeting: any): MeetingResponse {
    return {
      id: meeting.id,
      title: meeting.title,
      audioUrl: meeting.audioUrl,
      duration: meeting.duration,
      fileSize: meeting.fileSize,
      status: meeting.status,
      date: meeting.date,
      userId: meeting.userId,
      createdAt: meeting.createdAt,
      updatedAt: meeting.updatedAt,
      tags: meeting.tags?.map((tag: any) => ({
        id: tag.id,
        name: tag.name,
      })),
      participants: meeting.participants?.map((participant: any) => ({
        id: participant.id,
        name: participant.name,
      })),
      summary: meeting.summary ? {
        id: meeting.summary.id,
        transcript: meeting.summary.transcript,
        keyPoints: meeting.summary.keyPoints,
        decisions: meeting.summary.decisions,
        createdAt: meeting.summary.createdAt,
        updatedAt: meeting.summary.updatedAt,
      } : undefined,
    };
  }
} 