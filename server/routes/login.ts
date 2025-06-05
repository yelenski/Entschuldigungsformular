import { Router } from "express";

const router = Router();

router.post("/", (req, res) => {
  const { username, password, role } = req.body;

  if (!password || !/^[a-zA-Z0-9]{5,}$/.test(password)) {
    return res.status(401).json({ error: "Ungültiges Passwort" });
  }

  if (role !== "student" && role !== "teacher") {
    return res.status(400).json({ error: "Ungültige Rolle" });
  }

  res.json({
    name: username || role === "student" ? "Schüler" : "Lehrer",
    role,
  });
});

export default router;