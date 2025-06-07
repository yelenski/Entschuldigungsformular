import { Router } from "express";

const router = Router();

router.post("/", (req, res) => {
  const { username, password, role } = req.body;

  if (!password || !/^[a-zA-Z]{5,}$/.test(password)) {
    return res.status(401).json({ error: "Ungültiges Passwort" });
  }

  if (role !== "student" && role !== "teacher") {
    return res.status(400).json({ error: "Ungültige Rolle" });
  }

  // Session setzen
  req.session.user = {
    id: Math.floor(Math.random() * 10000),
    username: username,
    name: username || (role === "student" ? "Schüler" : "Lehrer"),
    role: role
  };

  // Test-Cookie setzen
  res.cookie('testcookie', 'test', { secure: true, httpOnly: true, sameSite: 'none' });

  res.json({
    name: req.session.user.name,
    role: req.session.user.role,
  });
});

export default router;