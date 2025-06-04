import { initTRPC, TRPCError } from '@trpc/server';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { AuthController } from '../controllers/auth.controller';
import { MeetingController } from '../controllers/meeting.controller';
import { SummaryController } from '../controllers/summary.controller';
import { type Session } from 'next-auth';

export type Context = {
  prisma: typeof db;
  session: Session | null;
  auth: AuthController;
  meeting: MeetingController;
  summaryController: SummaryController;
};

export const createTRPCContext = async (opts: CreateNextContextOptions): Promise<Context> => {
  const session = await auth();

  const context: Context = {
    prisma: db,
    session,
    auth: null as any, // Will be set after initialization
    meeting: null as any, // Will be set after initialization
    summaryController: null as any, // Will be set after initialization
  };

  // Initialize controllers with the full context
  context.auth = new AuthController(context);
  context.meeting = new MeetingController(context);
  context.summaryController = new SummaryController(context);

  return context;
};

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed); 