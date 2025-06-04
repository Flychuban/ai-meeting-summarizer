import { type Context } from '@/server/api/trpc';

export interface IBaseController {
  context: Context;
  handleError(error: unknown): never;
  requireAuth(): any;
  validateInput<T>(schema: any, input: unknown): T;
}

export interface IControllerResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
} 