const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const fs = require('fs/promises');
const path = require('path');
const loginRouter = require('./routes/login').default || require('./routes/login');

const app = express();





// CORS-Konfiguration
app.use(cors({
  origin: ["https://entschuldigungsformular.netlify.app"],
  credentials: true,
}));

// Session-Konfiguration
app.use(
  session({
    store: new MemoryStore({ checkPeriod: 86400000 }),
    name: "session-id",
    secret: process.env.SESSION_SECRET || "keyboard cat",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Login-Router
app.use("/login", loginRouter);

// Auth-Middleware
function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ message: "Nicht angemeldet" });
  }
  next();
}
function requireRole(role) {
  return (req, res, next) => {
    if (!req.session.user || req.session.user.role !== role) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }
    next();
  };
}

// Absenzen-API (GET alle Absenzen)
app.get("/absences", requireAuth, requireRole("teacher"), async (req, res) => {
  try {
    const filePath = path.resolve(__dirname, "data", "absences.json");
    const rawData = await fs.readFile(filePath, "utf-8");
    const absences = JSON.parse(rawData);
    res.json(absences);
  } catch (err) {
    res.status(500).json({ message: "Fehler beim Laden der Absenzen" });
  }
});

// Absenzen-API (POST neue Absenz)
app.post("/absences", requireAuth, requireRole("student"), async (req, res) => {
  try {
    const filePath = path.resolve(__dirname, "data", "absences.json");
    const rawData = await fs.readFile(filePath, "utf-8");
    const absences = JSON.parse(rawData);
    const newAbsence = { id: absences.length + 1, ...req.body, status: "pending", submissionDate: new Date().toISOString() };
    absences.push(newAbsence);
    await fs.writeFile(filePath, JSON.stringify(absences, null, 2));
    res.status(201).json(newAbsence);
  } catch (err) {
    res.status(500).json({ message: "Fehler beim Speichern der Absenz" });
  }
});

// Absenzen-API (GET einzelne Absenz)
app.get("/absences/:id", requireAuth, async (req, res) => {
  try {
    const filePath = path.resolve(__dirname, "data", "absences.json");
    const rawData = await fs.readFile(filePath, "utf-8");
    const absences = JSON.parse(rawData);
    const absence = absences.find(a => a.id === parseInt(req.params.id, 10));
    if (!absence) return res.status(404).json({ message: "Absenz nicht gefunden" });
    res.json(absence);
  } catch (err) {
    res.status(500).json({ message: "Fehler beim Laden der Absenz" });
  }
});

// Absenzen-API (PATCH Status)
app.patch("/absences/:id/status", requireAuth, requireRole("teacher"), async (req, res) => {
  try {
    const filePath = path.resolve(__dirname, "data", "absences.json");
    const rawData = await fs.readFile(filePath, "utf-8");
    const absences = JSON.parse(rawData);
    const id = parseInt(req.params.id, 10);
    const absence = absences.find(a => a.id === id);
    if (!absence) return res.status(404).json({ message: "Absenz nicht gefunden" });
    absence.status = req.body.status || absence.status;
    absence.processedDate = req.body.processedDate || absence.processedDate;
    await fs.writeFile(filePath, JSON.stringify(absences, null, 2));
    res.json(absence);
  } catch (err) {
    res.status(500).json({ message: "Fehler beim Aktualisieren der Absenz" });
  }
});

// Dropdown-Hilfsroute
app.get("/dropdowns", (req, res) => {
  const dropdowns = {
    classes: ["1A", "1B", "2A", "2B", "3A", "3B"],
    professions: ["Informatiker", "Kaufmann", "Elektriker", "Mechaniker"],
    teachers: ["Herr Schmidt", "Frau Müller", "Herr Weber", "Frau Fischer"],
    absenceTypes: ["Krankheit", "Arzttermin", "Familiäre Gründe", "Sonstiges"]
  };
  res.status(200).json(dropdowns);
});

// Auth-API
app.post("/auth/login", (req, res) => {
  const { username, password, role } = req.body;
  if (!password || !/^[a-zA-Z]{5,}$/.test(password)) {
    return res.status(401).json({ error: "Ungültiges Passwort" });
  }
  if (role !== "student" && role !== "teacher") {
    return res.status(400).json({ error: "Ungültige Rolle" });
  }
  req.session.user = {
    id: Math.floor(Math.random() * 10000),
    username: username,
    name: username || (role === "student" ? "Schüler" : "Lehrer"),
    role: role
  };
  res.json({ name: req.session.user.name, role: req.session.user.role });
});

app.post("/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Fehler beim Abmelden" });
    }
    res.clearCookie("session-id");
    res.status(200).json({ message: "Erfolgreich abgemeldet" });
  });
});

app.get("/auth/me", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Nicht angemeldet" });
  }
  res.json(req.session.user);
});

module.exports = app;
