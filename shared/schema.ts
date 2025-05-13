import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(), // "student" or "teacher"
  name: text("name").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  name: true,
});

export const absences = pgTable("absences", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  studentName: text("student_name").notNull(),
  studentClass: text("student_class").notNull(),
  profession: text("profession").notNull(),
  teacherId: integer("teacher_id").notNull(),
  teacherName: text("teacher_name").notNull(),
  absenceType: text("absence_type").notNull(),
  dateStart: text("date_start").notNull(),
  dateEnd: text("date_end").notNull(),
  reason: text("reason").notNull(),
  submissionDate: text("submission_date").notNull(),
  status: text("status").notNull().default("pending"), // "pending", "approved", "rejected", "awaiting_docs", "under_review", "expired"
  processedDate: text("processed_date"),
});

export const insertAbsenceSchema = createInsertSchema(absences).omit({
  id: true,
  status: true,
  processedDate: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Absence = typeof absences.$inferSelect;
export type InsertAbsence = z.infer<typeof insertAbsenceSchema>;

// Schemas for API requests
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  role: z.enum(["student", "teacher"]),
});

export const absenceStatusSchema = z.object({
  id: z.number(),
  status: z.enum([
    "pending", 
    "approved", 
    "rejected", 
    "awaiting_docs", 
    "under_review", 
    "expired"
  ]),
  processedDate: z.string(),
});
