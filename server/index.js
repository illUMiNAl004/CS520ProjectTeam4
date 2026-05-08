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

function signToken(user, role) {
  return jwt.sign(
    { id: user.id, role, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function formatRider(r) {
  return {
    id: r.id, role: "rider",
    email: r.email,
    firstName: r.first_name,
    lastName: r.last_name,
    university: r.university,
  };
}

function formatDriver(d) {
  return {
    id: d.id, role: "driver",
    email: d.email,
    firstName: d.first_name,
    lastName: d.last_name,
    university: d.university,
    make: d.make, model: d.model, year: d.year,
    color: d.color, licensePlate: d.license_plate, maxSeats: d.max_seats,
    guidelines: d.guidelines,
    preferences: d.preferences,
    startingAddress: d.starting_address,
    pickupRadius: d.pickup_radius,
    isOnline: d.is_online,
  };
}

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "No token provided." });
  }
  try {
    req.user = jwt.verify(authHeader.slice(7), JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ success: false, error: "Invalid or expired token." });
  }
}

// ── POST /api/signup ── (riders only — drivers use /api/driver/register)
app.post("/api/signup", async (req, res) => {
  const { role, email, password, firstName, lastName, university, emoji } = req.body;

  if (!role || !email || !password || !firstName || !lastName || !university) {
    return res.status(400).json({ success: false, error: "All fields are required." });
  }
  if (!["rider", "driver"].includes(role)) {
    return res.status(400).json({ success: false, error: "Invalid role." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, error: "Please enter a valid email address." });
  }
  if (password.length < 8) {
    return res.status(400).json({ success: false, error: "Password must be at least 8 characters." });
  }

  const table = role === "rider" ? "rider" : "driver";

  try {
    const existing = await pool.query(`SELECT id FROM ${table} WHERE email = $1`, [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, error: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO ${table} (email, password_hash, first_name, last_name, university)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [email.toLowerCase(), passwordHash, firstName, lastName, university]
    );

    const user = rows[0];
    const formatted = role === "rider" ? formatRider(user) : formatDriver(user);
    return res.status(201).json({ success: true, token: signToken(user, role), user: formatted });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ success: false, error: "Server error." });
  }
});

// ── POST /api/login ──
app.post("/api/login", async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: "Email and password are required." });
  }

  const table = role === "driver" ? "driver" : "rider";

  try {
    const { rows } = await pool.query(`SELECT * FROM ${table} WHERE email = $1`, [email.toLowerCase()]);
    const user = rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ success: false, error: "Invalid email or password." });
    }

    const formatted = table === "rider" ? formatRider(user) : formatDriver(user);
    return res.json({ success: true, token: signToken(user, table === "rider" ? "rider" : "driver"), user: formatted });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, error: "Server error." });
  }
});

// ── GET /api/me ──
app.get("/api/me", authenticate, async (req, res) => {
  const table = req.user.role === "driver" ? "driver" : "rider";
  try {
    const { rows } = await pool.query(`SELECT * FROM ${table} WHERE id = $1`, [req.user.id]);
    if (!rows[0]) return res.status(404).json({ success: false, error: "User not found." });
    const formatted = table === "rider" ? formatRider(rows[0]) : formatDriver(rows[0]);
    return res.json({ success: true, user: formatted });
  } catch {
    return res.status(500).json({ success: false, error: "Server error." });
  }
});

// ── POST /api/driver/setup ──
app.post("/api/driver/setup", authenticate, async (req, res) => {
  const { vehicle, guidelines, preferences, location } = req.body;
  const userId = req.user.id;

  if (!vehicle || !location?.startingAddress) {
    return res.status(400).json({ success: false, error: "Vehicle and starting address are required." });
  }

  try {
    await pool.query(
      `UPDATE driver SET
         make = $1, model = $2, year = $3, color = $4,
         license_plate = $5, max_seats = $6,
         guidelines = $7, preferences = $8,
         starting_address = $9, pickup_radius = $10
       WHERE id = $11`,
      [
        vehicle.make, vehicle.model, vehicle.year, vehicle.color,
        vehicle.licensePlate, vehicle.maxSeats || 4,
        JSON.stringify(guidelines), JSON.stringify(preferences),
        location.startingAddress, location.pickupRadius || 5,
        userId,
      ]
    );
    return res.json({ success: true });
  } catch (err) {
    console.error("Driver setup error:", err);
    return res.status(500).json({ success: false, error: "Server error." });
  }
});

// ── POST /api/driver/register ── (full driver signup in one shot)
app.post("/api/driver/register", async (req, res) => {
  const { email, password, firstName, lastName, university, emoji, vehicle, guidelines, preferences, location } = req.body;

  if (!email || !password || !firstName || !lastName || !university) {
    return res.status(400).json({ success: false, error: "All fields are required." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, error: "Please enter a valid email address." });
  }
  if (password.length < 8) {
    return res.status(400).json({ success: false, error: "Password must be at least 8 characters." });
  }

  const client = await pool.connect();
  try {
    const existing = await client.query("SELECT id FROM driver WHERE email = $1", [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, error: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await client.query("BEGIN");

    const { rows } = await client.query(
      `INSERT INTO driver (email, password_hash, first_name, last_name, university,
         make, model, year, color, license_plate, max_seats,
         guidelines, preferences, starting_address, pickup_radius)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
      [
        email.toLowerCase(), passwordHash, firstName, lastName, university,
        vehicle?.make, vehicle?.model, vehicle?.year, vehicle?.color,
        vehicle?.licensePlate, vehicle?.maxSeats || 4,
        JSON.stringify(guidelines || {}), JSON.stringify(preferences || {}),
        location?.startingAddress, location?.pickupRadius || 5,
      ]
    );

    await client.query("COMMIT");
    const user = rows[0];
    return res.status(201).json({ success: true, token: signToken(user, "driver"), user: formatDriver(user) });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Driver register error:", err);
    return res.status(500).json({ success: false, error: "Server error." });
  } finally {
    client.release();
  }
});

// ── PATCH /api/driver/online ──
app.patch("/api/driver/online", authenticate, async (req, res) => {
  const { isOnline } = req.body;
  try {
    await pool.query("UPDATE driver SET is_online = $1 WHERE id = $2", [isOnline, req.user.id]);
    return res.json({ success: true });
  } catch (err) {
    console.error("Online toggle error:", err);
    return res.status(500).json({ success: false, error: "Server error." });
  }
});

// ── PUT /api/driver/profile ── (same logic as setup, used from the profile page)
app.put("/api/driver/profile", authenticate, async (req, res) => {
  const { vehicle, guidelines, preferences, startingAddress, pickupRadius } = req.body;
  const userId = req.user.id;

  try {
    await pool.query(
      `UPDATE driver SET
         make = $1, model = $2, year = $3, color = $4,
         license_plate = $5, max_seats = $6,
         guidelines = $7, preferences = $8,
         starting_address = $9, pickup_radius = $10
       WHERE id = $11`,
      [
        vehicle.make, vehicle.model, vehicle.year, vehicle.color,
        vehicle.licensePlate, vehicle.maxSeats || 4,
        JSON.stringify(guidelines), JSON.stringify(preferences),
        startingAddress, pickupRadius || 5,
        userId,
      ]
    );
    const { rows } = await pool.query("SELECT * FROM driver WHERE id = $1", [userId]);
    return res.json({ success: true, user: formatDriver(rows[0]) });
  } catch (err) {
    console.error("Driver profile update error:", err);
    return res.status(500).json({ success: false, error: "Server error." });
  }
});

initDb()
  .then(() => app.listen(PORT, () => console.log(`RideAway API running on http://localhost:${PORT}`)))
  .catch(err => { console.error("DB init failed:", err); process.exit(1); });