import { router } from './trpc';
import { authRouter } from './routers/auth';
import { meetingRouter } from './routers/meeting';
import { summaryRouter } from './routers/summary';

export const appRouter = router({
  auth: authRouter,
  meeting: meetingRouter,
  summary: summaryRouter,
});

export type AppRouter = typeof appRouter; 