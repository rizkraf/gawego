import { mysqlTable, varchar, int, boolean, mysqlEnum, timestamp } from "drizzle-orm/mysql-core";
import { user } from "./auth";

export const application = mysqlTable("application", {
  id: int("id").primaryKey().autoincrement(),
  userId: varchar("user_id", { length: 36 }).references(() => user.id, { onDelete: "cascade" }),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  position_title: varchar("position_title", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["applied", "interviewing", "offering", "accepted", "rejected", "withdrawn"]).default("applied"),
  appliedDate: varchar("applied_date", { length: 50 }).notNull(),
  jobPostUrl: varchar("job_post_url", { length: 255 }),
  position: int("position").notNull().default(0),
  isArchived: boolean("is_archived").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  notes: varchar("notes", { length: 500 }).default(""),
});
