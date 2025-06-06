import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import session from "express-session";
import MemoryStore from "memorystore";
import loginRouter from "./routes/login";
import { registerRoutes } from "./storage";
import { setupVite, serveStatic, log } from "./vite";
import fs from "fs/promises";
import path from "path";

const app = express();
const MemoryStoreSession = MemoryStore(session);

// CORS-Konfiguration für Zugriff von Netlify
const allowedOrigins = [
  "https://entschuldigungsformular.netlify.app"
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Session-Konfiguration
app.use(
  session({
    store: new MemoryStoreSession({
      checkPeriod: 86400000, // 24h
    }),
    name: "session-id",
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      httpOnly: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// Body-Parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routen
app.use("/login", loginRouter);

// Absenzen-API bereitstellen
app.get("/api/absences", async (req, res) => {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Nicht eingeloggt" });
  }

  try {
    const filePath = path.resolve("server", "data", "absences.json");
    const rawData = await fs.readFile(filePath, "utf-8");
    const absences = JSON.parse(rawData);
    res.json(absences);
  } catch (err) {
    res.status(500).json({ message: "Fehler beim Laden der Absenzen" });
  }
});

// Session-Debug-Logging
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    console.log("Session Debug:", {
      path: req.path,
      sessionID: req.sessionID,
      hasSession: !!req.session,
      user: req.session?.user,
    });
  }
  next();
});

// Request-Logger
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

// Weitere API-Routen registrieren
(async () => {
  const server = await registerRoutes(app);

  // Error-Handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  // Vite nur in Entwicklung einbinden
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Server starten
  const port = 3000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
