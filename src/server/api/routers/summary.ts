import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { summarySchema } from '@/types/api/summary.types';

export const summaryRouter = router({
  create: protectedProcedure
    .input(summarySchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.summaryController.createSummary(input);
    }),

  get: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.summaryController.getSummary(input);
    }),

  update: protectedProcedure
    .input(z.object({
      meetingId: z.string(),
      data: summarySchema,
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.summaryController.updateSummary(input.meetingId, input.data);
    }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return ctx.summaryController.deleteSummary(input);
    }),

  generate: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return ctx.summaryController.generateSummary(input);
    }),
}); 