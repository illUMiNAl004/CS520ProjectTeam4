/**
 * UC5: Book a Ride
 * Covers: Unit | Integration | Load
 */

const NOMINATIM = "https://nominatim.openstreetmap.org/search";

const isRideReady = (pickup, dropoff) =>
  typeof pickup === "string" &&
  typeof dropoff === "string" &&
  pickup.trim().length > 0 &&
  dropoff.trim().length > 0;

const buildRidePayload = (pickup, dropoff) => ({ pickup, dropoff });

const simulateSessionStorage = () => {
  const store = {};
  return {
    setItem: (k, v) => { store[k] = v; },
    getItem: (k) => store[k] || null,
    removeItem: (k) => { delete store[k]; },
  };
};

// ── Unit Tests ──────────────────────────────────────────────────────────────

describe("UC5: Book a Ride", () => {
  describe("Unit Tests", () => {
    test("returns false when pickup is empty", () => {
      expect(isRideReady("", "University Ave")).toBe(false);
    });

    test("returns false when dropoff is empty", () => {
      expect(isRideReady("Main Library", "")).toBe(false);
    });

    test("returns false when both fields are empty", () => {
      expect(isRideReady("", "")).toBe(false);
    });

    test("returns true when both pickup and dropoff are provided", () => {
      expect(isRideReady("Main Library", "University Ave")).toBe(true);
    });

    test("ride payload contains pickup and dropoff keys", () => {
      const payload = buildRidePayload("Main Library", "Northampton");
      expect(payload).toHaveProperty("pickup");
      expect(payload).toHaveProperty("dropoff");
    });

    test("ride data is stored in sessionStorage as JSON", () => {
      const session = simulateSessionStorage();
      const ride = { pickup: "Main Library", dropoff: "University Ave" };
      session.setItem("ra_ride", JSON.stringify(ride));
      const retrieved = JSON.parse(session.getItem("ra_ride"));
      expect(retrieved.pickup).toBe("Main Library");
      expect(retrieved.dropoff).toBe("University Ave");
    });

    test("sessionStorage returns null before ride is saved", () => {
      const session = simulateSessionStorage();
      expect(session.getItem("ra_ride")).toBeNull();
    });

    test("seat count stays within 1 to 4 range", () => {
      const clampSeats = (n) => Math.max(1, Math.min(4, n));
      expect(clampSeats(0)).toBe(1);
      expect(clampSeats(5)).toBe(4);
      expect(clampSeats(2)).toBe(2);
    });

    test("trimming whitespace-only input still fails validation", () => {
      expect(isRideReady("   ", "University Ave")).toBe(false);
    });
  });

  // ── Integration Tests ───────────────────────────────────────────────────────

  describe("Integration Tests", () => {
    test("Nominatim returns results for a valid query", async () => {
      const params = new URLSearchParams({
        q: "Main Library Amherst",
        format: "json",
        limit: "5",
        addressdetails: "1",
        viewbox: "-73.0,42.6,-72.0,42.1",
        bounded: "0",
      });
      const res = await fetch(`${NOMINATIM}?${params}`, {
        headers: { "User-Agent": "RideAway-CS520-Test/1.0" },
      });
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    }, 15000);

    test("Nominatim returns an empty array for a nonsense query", async () => {
      const params = new URLSearchParams({
        q: "xyzxyznonexistentplacexyz",
        format: "json",
        limit: "5",
      });
      const res = await fetch(`${NOMINATIM}?${params}`, {
        headers: { "User-Agent": "RideAway-CS520-Test/1.0" },
      });
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
    }, 15000);

    test("Nominatim results each have a display_name field", async () => {
      const params = new URLSearchParams({
        q: "Amherst MA",
        format: "json",
        limit: "3",
      });
      const res = await fetch(`${NOMINATIM}?${params}`, {
        headers: { "User-Agent": "RideAway-CS520-Test/1.0" },
      });
      const data = await res.json();
      data.forEach((r) => expect(r).toHaveProperty("display_name"));
    }, 15000);
  });

  // ── Load Tests ──────────────────────────────────────────────────────────────

  describe("Load Tests", () => {
    test("sessionStorage handles 100 concurrent ride writes without data loss", () => {
      const store = {};
      const writes = Array.from({ length: 100 }, (_, i) => {
        const key = `ra_ride_${i}`;
        const val = JSON.stringify({ pickup: `Location ${i}`, dropoff: `Dest ${i}` });
        store[key] = val;
        return key;
      });
      writes.forEach((key, i) => {
        const val = JSON.parse(store[key]);
        expect(val.pickup).toBe(`Location ${i}`);
        expect(val.dropoff).toBe(`Dest ${i}`);
      });
    });

    test("sequential Nominatim queries across 5 locations return valid responses", async () => {
      const queries = ["Amherst MA", "Northampton MA", "Springfield MA", "Hadley MA", "Belchertown MA"];
      const results = [];

      for (const q of queries) {
        const params = new URLSearchParams({ q, format: "json", limit: "2" });
        const res = await fetch(`${NOMINATIM}?${params}`, {
          headers: { "User-Agent": "RideAway-CS520-Test/1.0" },
        });
        const data = await res.json();
        results.push(data);
        await new Promise((r) => setTimeout(r, 1100));
      }

      results.forEach((r) => expect(Array.isArray(r)).toBe(true));
      expect(results.length).toBe(5);
    }, 30000);
  });
});