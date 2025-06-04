import { TRPCError } from '@trpc/server';
import { type Context } from '../api/trpc';

export class BaseController {
  protected context: Context;

  constructor(context: Context) {
    this.context = context;
  }

  protected handleError(error: unknown): never {
    if (error instanceof TRPCError) {
      throw error;
    }

    if (error instanceof Error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message,
        cause: error,
      });
    }

    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      cause: error,
    });
  }

  protected requireAuth() {
    if (!this.context.session?.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be logged in to perform this action',
      });
    }
    return this.context.session.user;
  }

  protected validateInput<T>(schema: any, input: unknown): T {
    try {
      return schema.parse(input);
    } catch (error) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Invalid input',
        cause: error,
      });
    }
  }
} 