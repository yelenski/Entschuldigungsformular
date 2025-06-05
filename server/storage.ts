import { 
  users, 
  absences, 
  type User, 
  type InsertUser, 
  type Absence, 
  type InsertAbsence,
  insertAbsenceSchema
} from "@shared/schema";
import fs from "fs/promises";
import path from "path";
import { z } from "zod";
import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { ZodError } from "zod";
import session from "express-session";
import MemoryStore from "memorystore";
import { loginSchema, absenceStatusSchema } from "@shared/schema";
import { fileURLToPath } from "url";

// Ermittle den aktuellen Verzeichnispfad
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MemoryStoreSession = MemoryStore(session);

const absencesFilePath = path.resolve(__dirname, "data", "absences.json");

export interface IStorage {
  // User related methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Absence related methods
  getAbsence(id: number): Promise<Absence | undefined>;
  getAbsencesByStatus(status: string): Promise<Absence[]>;
  getAllAbsences(): Promise<Absence[]>;
  createAbsence(absence: InsertAbsence): Promise<Absence>;
  updateAbsenceStatus(id: number, status: string, processedDate: string): Promise<Absence | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private absences: Absence[];
  private userCurrentId: number;

  constructor() {
    this.users = new Map();
    this.absences = [];
    this.userCurrentId = 1;
    
    // Add some initial users for testing
    this.seedUsers();
    this.loadAbsences();
  }

  private seedUsers() {
    const sampleUsers: InsertUser[] = [
      {
        username: "student",
        password: "password",
        role: "student",
        name: "Max Mustermann"
      },
      {
        username: "teacher",
        password: "password",
        role: "teacher",
        name: "Frau Müller"
      }
    ];

    sampleUsers.forEach(user => this.createUser(user));
  }

  private async loadAbsences() {
    try {
      // Create directory if it doesn't exist
      const dir = path.dirname(absencesFilePath);
      await fs.mkdir(dir, { recursive: true });

      // Try to read the file
      try {
        const data = await fs.readFile(absencesFilePath, "utf-8");
        this.absences = JSON.parse(data);
      } catch (error: any) {
        if (error.code === 'ENOENT') {
          // File doesn't exist, create it with empty array
          await fs.writeFile(absencesFilePath, '[]');
          this.absences = [];
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error("Failed to load absences:", error);
      this.absences = [];
    }
  }

  private async saveAbsences() {
    try {
      await fs.writeFile(absencesFilePath, JSON.stringify(this.absences, null, 2));
      console.log("Absences saved successfully."); // Debugging
    } catch (error) {
      console.error("Failed to save absences:", error);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAbsence(id: number): Promise<Absence | undefined> {
    return this.absences.find(absence => absence.id === id);
  }

  async getAbsencesByStatus(status: string): Promise<Absence[]> {
    return this.absences.filter(absence => absence.status === status);
  }
  
  async getAllAbsences(): Promise<Absence[]> {
    return this.absences;
  }

  async createAbsence(absence: InsertAbsence): Promise<Absence> {
    // Finde die höchste existierende ID und erhöhe sie um 1
    const maxId = this.absences.reduce((max, a) => a.id > max ? a.id : max, 0);
    const id = maxId + 1;
    
    console.log("Creating absence with data:", absence); // Debug log

    // Handle teachers array
    const teachers = Array.isArray(absence.teachers) ? absence.teachers : [];
    const teacherName = teachers.length > 0 ? teachers[0] : "Nicht angegeben";

    const newAbsence: Absence = {
      id,
      studentId: absence.studentId,
      studentName: absence.studentName,
      studentClass: absence.studentClass,
      profession: absence.profession,
      phonePrivate: absence.phonePrivate || null,
      phoneWork: absence.phoneWork || null,
      educationType: absence.educationType || null,
      signature: absence.signature || null,
      teacherId: absence.teacherId,
      teacherName: teacherName,
      teachers: JSON.stringify(teachers),
      absenceType: "Krankheit",
      dateStart: absence.absenceDate,
      dateEnd: absence.absenceDate,
      reason: absence.reason,
      lessonCount: absence.lessonCount || "0",
      location: absence.location || "",
      submissionDate: new Date().toISOString(),
      parentSignature: absence.parentSignature || false,
      supervisorSignature: absence.supervisorSignature || false,
      status: "pending",
      processedDate: null
    };

    console.log("Created new absence object:", newAbsence); // Debug log

    this.absences.push(newAbsence);
    await this.saveAbsences();
    
    return newAbsence;
  }

  async updateAbsenceStatus(id: number, status: string, processedDate: string): Promise<Absence | undefined> {
    const absence = await this.getAbsence(id);
    
    if (!absence) {
      return undefined;
    }
    
    const updatedAbsence: Absence = {
      ...absence,
      status,
      processedDate
    };
    
    const index = this.absences.findIndex(abs => abs.id === id);
    if (index !== -1) {
      this.absences[index] = updatedAbsence;
      await this.saveAbsences();
    }
    return updatedAbsence;
  }
}

export const storage = new MemStorage();

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session middleware
  app.use(
    session({
      secret: "school-absence-system-secret",
      resave: false,
      saveUninitialized: false,
      store: new MemoryStoreSession({
        checkPeriod: 86400000, // Prune expired entries every 24h
      }),
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
      },
    })
  );

  // Authentication middleware
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  const requireRole = (role: string) => {
    return (req: Request, res: Response, next: Function) => {
      if (!req.session.user || req.session.user.role !== role) {
        return res.status(403).json({ message: "Forbidden" });
      }
      next();
    };
  };

  // Absence routes
  app.post("/api/absences", requireAuth, requireRole("student"), async (req: Request, res: Response) => {
    try {
      console.log("Received data:", req.body); // Debugging
      const absenceData = insertAbsenceSchema.parse(req.body);
      const absence = await storage.createAbsence(absenceData);
      return res.status(201).json(absence);
    } catch (error) {
      if (error instanceof ZodError) {
        console.error("Validation error:", error.errors); // Debugging
        return res.status(400).json({ message: error.errors[0].message });
      }
      throw error;
    }
  });

  app.get("/api/absences", requireAuth, requireRole("teacher"), async (req: Request, res: Response) => {
    const status = req.query.status as string | undefined;

    let absences;
    if (status) {
      absences = await storage.getAbsencesByStatus(status);
    } else {
      absences = await storage.getAllAbsences();
    }

    console.log("Returning absences:", absences);
    return res.status(200).json(absences);
  });

  const httpServer = createServer(app);
  return httpServer;
}
