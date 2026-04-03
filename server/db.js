const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            SERIAL PRIMARY KEY,
      role          TEXT NOT NULL CHECK(role IN ('rider', 'driver')),
      email         TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      first_name    TEXT NOT NULL,
      last_name     TEXT NOT NULL,
      university    TEXT NOT NULL,
      created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS vehicles (
      id            SERIAL PRIMARY KEY,
      user_id       INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      make          TEXT NOT NULL,
      model         TEXT NOT NULL,
      year          TEXT,
      color         TEXT,
      license_plate TEXT
    );
  `);
}

module.exports = { pool, initDb };
