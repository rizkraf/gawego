
import z from "zod";
import { protectedProcedure, router } from "../lib/trpc";
import { eq, and, asc } from "drizzle-orm";
import { db } from "../db";
import { application } from "@/db/schema/application";

export const applicationRouter = router({
  getListByUser: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      return await db.select().from(application)
        .where(eq(application.userId, userId))
        .orderBy(asc(application.position));
    }),

  create: protectedProcedure
    .input(z.object({
      companyName: z.string().min(1),
      positionTitle: z.string().min(1),
      status: z.enum(["applied", "interviewing", "offering", "accepted", "rejected", "withdrawn"]),
      appliedDate: z.string().min(1),
      jobPostUrl: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Get the highest position for the status
      const maxPositionResult = await db.select({ maxPos: application.position })
        .from(application)
        .where(and(
          eq(application.userId, ctx.session.user.id),
          eq(application.status, input.status)
        ))
        .orderBy(application.position);

      const maxPosition = maxPositionResult.length > 0
        ? Math.max(...maxPositionResult.map(r => r.maxPos || 0))
        : 0;

      return await db.insert(application).values({
        userId: ctx.session.user.id,
        companyName: input.companyName,
        position_title: input.positionTitle,
        status: input.status,
        appliedDate: input.appliedDate,
        jobPostUrl: input.jobPostUrl,
        notes: input.notes || "",
        position: maxPosition + 1,
      });
    }),


  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      companyName: z.string().min(1).optional(),
      positionTitle: z.string().min(1).optional(),
      status: z.enum(["applied", "interviewing", "offering", "accepted", "rejected", "withdrawn"]).optional(),
      appliedDate: z.string().min(1).optional(),
      jobPostUrl: z.string().optional(),
      notes: z.string().optional(),
      position: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const updateData: any = {};
      if (input.companyName !== undefined) updateData.companyName = input.companyName;
      if (input.positionTitle !== undefined) updateData.position_title = input.positionTitle;
      if (input.status !== undefined) updateData.status = input.status;
      if (input.appliedDate !== undefined) updateData.appliedDate = input.appliedDate;
      if (input.jobPostUrl !== undefined) updateData.jobPostUrl = input.jobPostUrl;
      if (input.notes !== undefined) updateData.notes = input.notes;
      if (input.position !== undefined) updateData.position = input.position;

      return await db
        .update(application)
        .set(updateData)
        .where(eq(application.id, input.id));
    }),

  updatePositions: protectedProcedure
    .input(z.array(z.object({
      id: z.number(),
      position: z.number(),
      status: z.enum(["applied", "interviewing", "offering", "accepted", "rejected", "withdrawn"]).optional(),
    })))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;

      for (const item of input) {
        const updateData: any = { position: item.position };
        if (item.status !== undefined) updateData.status = item.status;

        await db
          .update(application)
          .set(updateData)
          .where(and(
            eq(application.id, item.id),
            eq(application.userId, userId)
          ));
      }

      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await db.delete(application).where(eq(application.id, input.id));
    }),
});
