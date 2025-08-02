
import z from "zod";
import { protectedProcedure, router } from "../lib/trpc";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { application } from "@/db/schema/application";

export const applicationRouter = router({
  getListByUser: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      return await db.select().from(application).where(eq(application.userId, userId));
    }),

  create: protectedProcedure
    .input(z.object({
      companyName: z.string().min(1),
      positionTitle: z.string().min(1),
      status: z.enum(["applied", "interviewing", "offering", "rejected", "withdrawn"]),
      appliedDate: z.string().min(1),
      jobPostUrl: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return await db.insert(application).values({
        userId: ctx.session.user.id,
        companyName: input.companyName,
        position_title: input.positionTitle,
        status: input.status,
        appliedDate: input.appliedDate,
        jobPostUrl: input.jobPostUrl,
        notes: input.notes || "",
      });
    }),


  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      companyName: z.string().min(1).optional(),
      positionTitle: z.string().min(1).optional(),
      status: z.enum(["applied", "interviewing", "offering", "rejected", "withdrawn"]).optional(),
      appliedDate: z.string().min(1).optional(),
      jobPostUrl: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const updateData: any = {};
      if (input.companyName !== undefined) updateData.companyName = input.companyName;
      if (input.positionTitle !== undefined) updateData.position_title = input.positionTitle;
      if (input.status !== undefined) updateData.status = input.status;
      if (input.appliedDate !== undefined) updateData.appliedDate = input.appliedDate;
      if (input.jobPostUrl !== undefined) updateData.jobPostUrl = input.jobPostUrl;
      if (input.notes !== undefined) updateData.notes = input.notes;

      return await db
        .update(application)
        .set(updateData)
        .where(eq(application.id, input.id));
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await db.delete(application).where(eq(application.id, input.id));
    }),
});
