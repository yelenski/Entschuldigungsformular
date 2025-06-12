import { Router, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const JWT_EXPIRES_IN = "2h";

// Typ für User-Payload
interface JwtUser {
  id: number;
  username: string;
  name: string;
  role: string;
}

// Express Request um user erweitern (TypeScript)
// @ts-ignore
interface RequestWithUser extends Request {
  user?: JwtUser;
}

// JWT-Login
router.post("/", (req: Request, res: Response) => {
  const { username, password, role } = req.body;

  if (!password || !/^[a-zA-Z]{5,}$/.test(password)) {
    return res.status(401).json({ error: "Ungültiges Passwort" });
  }

  if (role !== "student" && role !== "teacher") {
    return res.status(400).json({ error: "Ungültige Rolle" });
  }

  const user: JwtUser = {
    id: Math.floor(Math.random() * 10000),
    username: username,
    name: username || (role === "student" ? "Schüler" : "Lehrer"),
    role: role
  };

  // JWT erzeugen
  const token = jwt.sign(user, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  res.json({
    token,
    user: {
      name: user.name,
      role: user.role,
    }
  });
});

// JWT-Auth-Middleware
export function requireJWT(req: RequestWithUser, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Kein Token übergeben" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtUser;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Ungültiges oder abgelaufenes Token" });
  }
}

export default router;