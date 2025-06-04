import { BaseController } from './base.controller';
import { type Context } from '../api/trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export class AuthController extends BaseController {
  constructor(context: Context) {
    super(context);
  }

  async login(input: unknown) {
    try {
      const { email, password } = this.validateInput(loginSchema, input);
      
      // Here you would typically call your auth service
      // For now, we'll just throw an error
      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: 'Login not implemented yet',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async register(input: unknown) {
    try {
      const { email, password } = this.validateInput(loginSchema, input);
      
      // Here you would typically call your auth service
      // For now, we'll just throw an error
      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: 'Register not implemented yet',
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async getCurrentUser() {
    try {
      const user = this.requireAuth();
      return user;
    } catch (error) {
      this.handleError(error);
    }
  }
} 