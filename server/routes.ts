import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ZodError } from "zod";
import session from "express-session";
import MemoryStore from "memorystore";
import path from "path";
import { fileURLToPath } from "url";
import { promises as fs } from "fs";
import { 
  loginSchema, 
  insertAbsenceSchema, 
  absenceStatusSchema,
  type Absence,
  type InsertAbsence
} from "@shared/schema";
import { Router } from "express";

// Add at the top of the file
declare module "express-session" {
  interface SessionData {
    user?: {
      id: number;
      username: string;
      name: string;
      role: string;
    };
  }
}

// Ermittle den aktuellen Verzeichnispfad
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MemoryStoreSession = MemoryStore(session);

const absencesFilePath = path.resolve(__dirname, "data", "absences.json");

export class MemStorage {
  private absences: Absence[] = [];

  constructor() {
    this.loadAbsences();
  }

  private async loadAbsences() {
    try {
      const data = await fs.readFile(absencesFilePath, "utf-8");
      this.absences = JSON.parse(data);
    } catch (error) {
      console.error("Failed to load absences:", error);
      this.absences = [];
    }
  }

  private async saveAbsences() {
    try {
      await fs.writeFile(absencesFilePath, JSON.stringify(this.absences, null, 2));
      console.log("Absences saved successfully.");
    } catch (error) {
      console.error("Failed to save absences:", error);
    }
  }

  async createAbsence(absence: InsertAbsence): Promise<Absence> {
    const id = this.absences.length + 1;
    const teachers = Array.isArray(absence.teachers) ? absence.teachers : [];
    const teacherName = teachers.join(", "); // Join multiple teachers with comma

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
      teachers: JSON.stringify(teachers), // Store teachers as JSON string
      absenceType: absence.absenceType || "Krankheit",
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
    this.absences.push(newAbsence);
    await this.saveAbsences();
    return newAbsence;
  }

  // Weitere Methoden bleiben unverändert...
}

// Authentication middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.user) {
    return res.status(401).json({ message: "Nicht angemeldet" });
  }
  next();
}

function requireRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.user || req.session.user.role !== role) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    next();
  };
}

// Create API router
const apiRouter = Router();

export async function registerRoutes(app: Express): Promise<Server> {

  // Auth routes
  apiRouter.post("/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password, role } = loginSchema.parse(req.body);
      
      // Demo-Modus: Akzeptiere alle Anmeldedaten
      const user = {
        id: Math.floor(Math.random() * 1000) + 1,
        username: username,
        name: username,
        role: role
      };

      // Speichere Benutzer in der Session
      req.session.user = user;
      
      // Warte auf das Session-Speichern
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) {
            console.error("Session save error:", err);
            reject(err);
          } else {
            resolve();
          }
        });
      });

      console.log("Login successful:", { user, sessionID: req.sessionID });
      return res.status(200).json(user);
      
    } catch (error) {
      console.error("Error during login:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      return res.status(500).json({ message: "Fehler bei der Anmeldung" });
    }
  });

  apiRouter.post("/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ message: "Fehler beim Abmelden" });
      }
      res.clearCookie("connect.sid");
      res.status(200).json({ message: "Erfolgreich abgemeldet" });
    });
  });

  apiRouter.get("/auth/me", (req: Request, res: Response) => {
    console.log("Session state:", {
      sessionID: req.sessionID,
      user: req.session?.user
    });
    
    if (!req.session.user) {
      return res.status(401).json({ message: "Nicht angemeldet" });
    }
    res.json(req.session.user);
  });

  // Mount the API router
  app.use("/api", apiRouter);

  // Absence routes
  app.post("/api/absences", async (req: Request, res: Response) => {
    try {
      // Validate request body against schema
      const validatedData = insertAbsenceSchema.parse(req.body);

      // Additional validation for required fields
      if (!validatedData.lessonCount) {
        throw new Error("Anzahl der Lektionen ist erforderlich");
      }
      if (!validatedData.location) {
        throw new Error("Ort ist erforderlich");
      }
      if (!Array.isArray(validatedData.teachers) || validatedData.teachers.length === 0) {
        throw new Error("Mindestens ein Lehrer muss ausgewählt werden");
      }

      console.log("Validated absence data:", validatedData); // Debug log

      // Create the absence
      const absence = await storage.createAbsence(validatedData);
      
      console.log("Created absence:", absence); // Debug log
      
      res.status(201).json(absence);
    } catch (error) {
      console.error("Error creating absence:", error);
      
      if (error instanceof ZodError) {
        res.status(400).json({
          error: "Validation error",
          details: error.errors,
        });
      } else {
        res.status(400).json({
          error: error instanceof Error ? error.message : "Unknown error occurred",
        });
      }
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

  app.get("/api/absences/:id", requireAuth, async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid absence ID" });
    }
    
    const absence = await storage.getAbsence(id);
    
    if (!absence) {
      return res.status(404).json({ message: "Absence not found" });
    }
    
    return res.status(200).json(absence);
  });

  app.patch("/api/absences/:id/status", requireAuth, requireRole("teacher"), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid absence ID" });
      }
      
      const { status, processedDate } = absenceStatusSchema.parse({
        ...req.body,
        id
      });
      
      const updatedAbsence = await storage.updateAbsenceStatus(id, status, processedDate);
      
      if (!updatedAbsence) {
        return res.status(404).json({ message: "Absence not found" });
      }
      
      return res.status(200).json(updatedAbsence);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      throw error;
    }
  });

  // Helper routes
  app.get("/api/dropdowns", (req: Request, res: Response) => {
    // Provide dropdown options for the client
    const dropdowns = {
      classes: ["1A", "1B", "2A", "2B", "3A", "3B"],
      professions: ["Informatiker", "Kaufmann", "Elektriker", "Mechaniker"],
      teachers: ["Herr Schmidt", "Frau Müller", "Herr Weber", "Frau Fischer"],
      absenceTypes: ["Krankheit", "Arzttermin", "Familiäre Gründe", "Sonstiges"]
    };
    
    res.status(200).json(dropdowns);
  });

  const httpServer = createServer(app);

  return httpServer;
}
