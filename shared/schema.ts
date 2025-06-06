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
  phonePrivate: text("phone_private"),
  phoneWork: text("phone_work"),
  educationType: text("education_type", { enum: ["BS", "BM"] }).notNull(),
  signature: text("signature"),
  teacherId: integer("teacher_id").notNull(),
  teacherName: text("teacher_name").notNull(),
  teachers: text("teachers").notNull(), // Array als JSON-String
  absenceType: text("absence_type").notNull(),
  dateStart: text("date_start").notNull(),
  dateEnd: text("date_end").notNull(),
  reason: text("reason").notNull(),
  lessonCount: text("lesson_count").notNull(),
  location: text("location").notNull(),
  submissionDate: text("submission_date").notNull(),
  parentSignature: boolean("parent_signature").notNull().default(false),
  supervisorSignature: boolean("supervisor_signature").notNull().default(false),
  status: text("status").notNull().default("pending"),
  processedDate: text("processed_date"),
});

export const insertAbsenceSchema = z.object({
  studentId: z.number(),
  studentName: z.string().min(1, "Name ist erforderlich"),
  studentClass: z.string().min(1, "Klasse ist erforderlich"),
  profession: z.string().min(1, "Beruf ist erforderlich"),
  phonePrivate: z.string().optional().nullable(),
  phoneWork: z.string().optional().nullable(),
  educationType: z.enum(["BS", "BM"]).optional().nullable(),
  signature: z.string().optional().nullable(),
  teacherId: z.number(),
  teacherName: z.string().min(1, "Lehrer ist erforderlich"),
  teachers: z.array(z.string()).min(1, "Mindestens ein Lehrer muss ausgewählt werden"),
  absenceDate: z.string().min(1, "Datum ist erforderlich"),
  absenceType: z.string().default("Krankheit"),
  reason: z.string().min(1, "Grund ist erforderlich"),
  dateStart: z.string(),
  dateEnd: z.string(),
  lessonCount: z.string().min(1, "Anzahl der Lektionen ist erforderlich"),
  location: z.string().min(1, "Ort ist erforderlich"),
  parentSignature: z.boolean().default(false),
  supervisorSignature: z.boolean().default(false)
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export interface Absence {
  id: number;
  studentId: number;
  studentName: string;
  studentClass: string;
  profession: string;
  phonePrivate: string | null;
  phoneWork: string | null;
  educationType: "BS" | "BM" | null;
  signature: string | null;
  teacherId: number;
  teacherName: string;
  teachers: string; // JSON string of teacher array
  absenceType: string;
  dateStart: string;
  dateEnd: string;
  reason: string;
  lessonCount: string;
  location: string;
  submissionDate: string;
  parentSignature: boolean;
  supervisorSignature: boolean;
  status: string;
  processedDate: string | null;
}

export type InsertAbsence = z.infer<typeof insertAbsenceSchema>;

// Schemas for API requests
export const loginSchema = z.object({
  username: z.string().min(1, "Benutzername ist erforderlich"),
  password: z.string().regex(/^[a-zA-Z]{5,}$/, "Passwort muss mindestens 5 Buchstaben enthalten und darf nur Groß- und Kleinbuchstaben enthalten"),
  role: z.enum(["student", "teacher"], {
    required_error: "Bitte wählen Sie eine Rolle (Schüler oder Lehrer)"
  }),
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
