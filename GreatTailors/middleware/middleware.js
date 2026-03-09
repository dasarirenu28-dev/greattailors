// middleware/auth.js
import { verify } from "jsonwebtoken";

function adminAuth(req, res, next) {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = verify(token, "secretkey123"); // ⚠️ use env variable
    if (decoded.role !== "admin") return res.status(403).json({ error: "Access denied" });

    req.admin = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
}

export default adminAuth;
