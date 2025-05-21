import { createTRPCRouter } from "@/server/api/trpc";
import { meetingRouter } from "./routers/meeting";
import { authRouter } from "./routers/auth";

export const appRouter = createTRPCRouter({
  meeting: meetingRouter,
  auth: authRouter,
});

export type AppRouter = typeof appRouter; 