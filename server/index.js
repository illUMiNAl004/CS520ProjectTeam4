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
    phone: r.phone,
  };
}

function formatDriver(d) {
  return {
    id: d.id, role: "driver",
    email: d.email,
    firstName: d.first_name,
    lastName: d.last_name,
    university: d.university,
    phone: d.phone,
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
  const { role, email, password, firstName, lastName, university, phone, emoji } = req.body;

  if (!role || !email || !password || !firstName || !lastName || !university || !phone) {
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
      `INSERT INTO ${table} (email, password_hash, first_name, last_name, university, phone)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [email.toLowerCase(), passwordHash, firstName, lastName, university, phone]
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
  const { email, password, firstName, lastName, university, phone, emoji, vehicle, guidelines, preferences, location } = req.body;

  if (!email || !password || !firstName || !lastName || !university || !phone) {
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
      `INSERT INTO driver (email, password_hash, first_name, last_name, university, phone,
         make, model, year, color, license_plate, max_seats,
         guidelines, preferences, starting_address, pickup_radius)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *`,
      [
        email.toLowerCase(), passwordHash, firstName, lastName, university, phone,
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

// ── POST /api/match ──
app.post("/api/match", authenticate, async (req, res) => {
  const { pickup, dropoff } = req.body;
  const riderId = req.user.id;
  if (!pickup) return res.status(400).json({ success: false, error: "Pickup location required." });

  try {
    const { rows: drivers } = await pool.query("SELECT * FROM driver WHERE is_online = true");
    if (drivers.length === 0)
      return res.json({ success: false, error: "No drivers available right now." });

    const pickupWords = pickup.toLowerCase().split(/[\s,]+/).filter(w => w.length > 3);
    let matched = drivers.find(d => {
      if (!d.starting_address) return false;
      const addr = d.starting_address.toLowerCase();
      return pickupWords.some(w => addr.includes(w));
    }) || drivers[0];

    await pool.query(
      "UPDATE matches SET status = 'cancelled' WHERE rider_id = $1 AND status = 'active'",
      [riderId]
    );
    const { rows } = await pool.query(
      `INSERT INTO matches (rider_id, driver_id, pickup, dropoff) VALUES ($1,$2,$3,$4) RETURNING *`,
      [riderId, matched.id, pickup, dropoff || ""]
    );
    return res.json({ success: true, matchId: rows[0].id, driver: formatDriver(matched) });
  } catch (err) {
    console.error("Match error:", err);
    return res.status(500).json({ success: false, error: "Server error." });
  }
});

// ── GET /api/driver/riders ──
app.get("/api/driver/riders", authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT m.id, m.pickup, m.dropoff, m.created_at,
              r.first_name, r.last_name, r.phone, r.email
       FROM matches m
       JOIN rider r ON r.id = m.rider_id
       WHERE m.driver_id = $1 AND m.status = 'active'
       ORDER BY m.created_at DESC`,
      [req.user.id]
    );
    return res.json({ success: true, riders: rows });
  } catch (err) {
    console.error("Get riders error:", err);
    return res.status(500).json({ success: false, error: "Server error." });
  }
});

// ── PATCH /api/match/:id/cancel ── (rider or driver can cancel)
app.patch("/api/match/:id/cancel", authenticate, async (req, res) => {
  try {
    const col = req.user.role === "driver" ? "driver_id" : "rider_id";
    const result = await pool.query(
      `UPDATE matches SET status = 'cancelled' WHERE id = $1 AND ${col} = $2`,
      [req.params.id, req.user.id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ success: false, error: "Match not found." });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Server error." });
  }
});

// ── GET /api/match/active ── (rider polls this to detect driver cancellation)
app.get("/api/match/active", authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, status FROM matches WHERE rider_id = $1 ORDER BY created_at DESC LIMIT 1",
      [req.user.id]
    );
    return res.json({ success: true, match: rows[0] || null });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Server error." });
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