import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ZodError } from "zod";
import session from "express-session";
import MemoryStore from "memorystore";
import { z } from "zod";
import { 
  loginSchema, 
  insertAbsenceSchema, 
  absenceStatusSchema
} from "@shared/schema";

const MemoryStoreSession = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session middleware
  app.use(
    session({
      secret: "school-absence-system-secret",
      resave: false,
      saveUninitialized: false,
      store: new MemoryStoreSession({
        checkPeriod: 86400000 // Prune expired entries every 24h
      }),
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        secure: process.env.NODE_ENV === "production",
        httpOnly: true
      }
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

  // Auth routes
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password, role } = loginSchema.parse(req.body);
      
      let user = await storage.getUserByUsername(username);
      
      // Create user if they don't exist (for easy testing)
      if (!user) {
        const newUser = {
          username,
          password,
          role,
          name: role === "student" ? `Schüler ${username}` : `Lehrer ${username}`
        };
        
        user = await storage.createUser(newUser);
        console.log(`Created new user: ${username} with role: ${role}`);
      }
      
      // Set user in session (no password check for easy testing)
      req.session.user = {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      };

      return res.status(200).json({
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      throw error;
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Error during logout" });
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", (req: Request, res: Response) => {
    if (!req.session.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    return res.status(200).json(req.session.user);
  });

  // Absence routes
  app.post("/api/absences", requireAuth, requireRole("student"), async (req: Request, res: Response) => {
    try {
      const absenceData = insertAbsenceSchema.parse(req.body);
      const absence = await storage.createAbsence(absenceData);
      
      return res.status(201).json(absence);
    } catch (error) {
      if (error instanceof ZodError) {
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
