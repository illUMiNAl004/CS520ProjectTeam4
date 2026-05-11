const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function initDb() {
  await pool.query(`
    DROP TABLE IF EXISTS driver_settings CASCADE;
    DROP TABLE IF EXISTS vehicles CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS rider (
      id            SERIAL PRIMARY KEY,
      email         TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      first_name    TEXT NOT NULL,
      last_name     TEXT NOT NULL,
      university    TEXT NOT NULL,
      phone         TEXT,
      created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS driver (
      id               SERIAL PRIMARY KEY,
      email            TEXT NOT NULL UNIQUE,
      password_hash    TEXT NOT NULL,
      first_name       TEXT NOT NULL,
      last_name        TEXT NOT NULL,
      university       TEXT NOT NULL,
      phone            TEXT,
      make             TEXT,
      model            TEXT,
      year             TEXT,
      color            TEXT,
      license_plate    TEXT,
      max_seats        INTEGER DEFAULT 4,
      guidelines       JSONB,
      preferences      JSONB,
      starting_address TEXT,
      pickup_radius    INTEGER DEFAULT 5,
      is_online        BOOLEAN DEFAULT false,
      created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    ALTER TABLE driver ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;
    ALTER TABLE rider  ADD COLUMN IF NOT EXISTS phone TEXT;
    ALTER TABLE driver ADD COLUMN IF NOT EXISTS phone TEXT;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS matches (
      id         SERIAL PRIMARY KEY,
      rider_id   INTEGER NOT NULL REFERENCES rider(id) ON DELETE CASCADE,
      driver_id  INTEGER NOT NULL REFERENCES driver(id) ON DELETE CASCADE,
      pickup     TEXT,
      dropoff    TEXT,
      status     TEXT DEFAULT 'active' CHECK(status IN ('active','cancelled','completed')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

module.exports = { pool, initDb };