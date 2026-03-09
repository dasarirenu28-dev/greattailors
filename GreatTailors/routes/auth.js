// routes/auth.js

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../module/admin"); // ⚠️ add .js

const router = express.Router();

/* ==========================================================
   🔹 TEST ROUTE
   ========================================================== */
router.get("/", (req, res) => {
  res.send("Auth route working");
});

/* ==========================================================
   🔹 REGISTER ADMIN
   ========================================================== */
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const existing = await Admin.findOne({ username });
    if (existing) {
      return res.status(400).json({ error: "Admin already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const admin = new Admin({ username, password: hashed });
    await admin.save();

    res.status(201).json({ message: "Admin registered successfully" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error during registration" });
  }
});

/* ==========================================================
   🔹 LOGIN ADMIN
   ========================================================== */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});

/* ==========================================================
   🔹 RESET PASSWORD
   ========================================================== */
router.post("/reset-password", async (req, res) => {
  try {
    const { username, password, newPassword, confirmPassword } = req.body;

    const nextPassword = (newPassword ?? password)?.toString() || "";
    const confirm = (confirmPassword ?? nextPassword)?.toString();

    if (!username || !nextPassword) {
      return res.status(400).json({ error: "Username and new password are required" });
    }

    if (confirm && confirm !== nextPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    if (nextPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const rx = new RegExp(`^${esc(username.trim())}$`, "i");
    const admin = await Admin.findOne({ username: rx });

    if (!admin) {
      return res.status(404).json({ error: "Not found" });
    }

    const hashedPassword = await bcrypt.hash(nextPassword, 10);
    admin.password = hashedPassword;
    await admin.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Server error during password reset" });
  }
});

module.exports = router;