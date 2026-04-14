require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool, initDb } = require("./db");

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || "rideaway-dev-secret-change-in-prod";

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));
app.use(express.json());

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function formatUser(user) {
  return {
    id: user.id,
    role: user.role,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    university: user.university,
  };
}

// ── POST /api/signup ──
app.post("/api/signup", async (req, res) => {
  const { role, email, password, firstName, lastName, university, vehicle } = req.body;

  if (!role || !email || !password || !firstName || !lastName || !university) {
    return res.status(400).json({ success: false, error: "All fields are required." });
  }
  if (!["rider", "driver"].includes(role)) {
    return res.status(400).json({ success: false, error: "Invalid role." });
  }

  const client = await pool.connect();
  try {
    const existing = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [email.toLowerCase()]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, error: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await client.query("BEGIN");

    const { rows } = await client.query(
      `INSERT INTO users (role, email, password_hash, first_name, last_name, university)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [role, email.toLowerCase(), passwordHash, firstName, lastName, university]
    );
    const user = rows[0];

    if (role === "driver" && vehicle) {
      await client.query(
        `INSERT INTO vehicles (user_id, make, model, year, color, license_plate)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [user.id, vehicle.make, vehicle.model, vehicle.year, vehicle.color, vehicle.licensePlate]
      );
    }

    await client.query("COMMIT");

    return res.status(201).json({ success: true, token: signToken(user), user: formatUser(user) });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Signup error:", err);
    return res.status(500).json({ success: false, error: "Server error." });
  } finally {
    client.release();
  }
});

// ── POST /api/login ──
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: "Email and password are required." });
  }

  try {
    const { rows } = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email.toLowerCase()]
    );
    const user = rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ success: false, error: "Invalid email or password." });
    }

    let vehicle = null;
    if (user.role === "driver") {
      const vResult = await pool.query("SELECT * FROM vehicles WHERE user_id = $1", [user.id]);
      vehicle = vResult.rows[0] || null;
    }

    return res.json({ success: true, token: signToken(user), user: { ...formatUser(user), vehicle } });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, error: "Server error." });
  }
});

// ── GET /api/me ──
app.get("/api/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "No token provided." });
  }

  try {
    const payload = jwt.verify(authHeader.slice(7), JWT_SECRET);
    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [payload.id]);
    const user = rows[0];
    if (!user) return res.status(404).json({ success: false, error: "User not found." });
    return res.json({ success: true, user: formatUser(user) });
  } catch {
    return res.status(401).json({ success: false, error: "Invalid or expired token." });
  }
});

initDb()
  .then(() => app.listen(PORT, () => console.log(`RideAway API running on http://localhost:${PORT}`)))
  .catch(err => { console.error("DB init failed:", err); process.exit(1); });
