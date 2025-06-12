const express = require('express');
const path = require('path');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const loginRouter = require('./routes/login.cjs');

const app = express();

const filePath = path.resolve(__dirname, "data", "absences.json");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

// Test-Route
app.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

// Login-Router
app.use('/login', loginRouter);

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
