import { createTRPCRouter } from "./trpc";
import { meetingRouter } from "./routers/meeting";

export const appRouter = createTRPCRouter({
  meeting: meetingRouter,
});

export type AppRouter = typeof appRouter; 