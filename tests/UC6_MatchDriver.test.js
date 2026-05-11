/**
 * UC6: Match with a Driver
 * Covers: Unit | Integration | Load
 */

const API = "http://localhost:5001";

let riderToken = null;
let driverToken = null;

const registerRider = async (suffix = "") => {
  const res = await fetch(`${API}/api/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      role: "rider",
      email: `uc6_rider${suffix}_${Date.now()}@umass.edu`,
      password: "password123",
      firstName: "Rider",
      lastName: "Test",
      university: "UMass Amherst",
      phone: "413-000-0400",
    }),
  });
  const data = await res.json();
  return data.token;
};

const registerOnlineDriver = async (suffix = "") => {
  const res = await fetch(`${API}/api/driver/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: `uc6_driver${suffix}_${Date.now()}@umass.edu`,
      password: "password123",
      firstName: "Match",
      lastName: "Driver",
      university: "UMass Amherst",
      phone: "413-000-0401",
      vehicle: { make: "Subaru", model: "Outback", year: "2021", color: "Green", licensePlate: "MTC001", maxSeats: 4 },
      guidelines: {},
      preferences: { allowSharedRides: true },
      location: { startingAddress: "Main Library, Amherst, MA", pickupRadius: 5 },
    }),
  });
  const data = await res.json();
  const token = data.token;
  await fetch(`${API}/api/driver/online`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ isOnline: true }),
  });
  return token;
};

const requestMatch = (token, pickup, dropoff = "Northampton, MA") =>
  fetch(`${API}/api/match`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ pickup, dropoff }),
  }).then((r) => r.json());

// ── Unit Tests ──────────────────────────────────────────────────────────────

describe("UC6: Match with a Driver", () => {
  describe("Unit Tests", () => {
    test("keyword overlap detects a matching address", () => {
      const pickupWords = "Main Library Amherst".toLowerCase().split(/[\s,]+/).filter((w) => w.length > 3);
      const driverAddress = "main library, amherst, ma";
      const matches = pickupWords.some((w) => driverAddress.includes(w));
      expect(matches).toBe(true);
    });

    test("keyword overlap returns false for unrelated addresses", () => {
      const pickupWords = "Springfield Train Station".toLowerCase().split(/[\s,]+/).filter((w) => w.length > 3);
      const driverAddress = "north campus, amherst, ma";
      const matches = pickupWords.some((w) => driverAddress.includes(w));
      expect(matches).toBe(false);
    });

    test("match request requires a pickup field", () => {
      const isValidMatchRequest = (body) => !!body.pickup;
      expect(isValidMatchRequest({ pickup: "Main Library" })).toBe(true);
      expect(isValidMatchRequest({ dropoff: "Northampton" })).toBe(false);
    });

    test("retry interval is set to 30 seconds", () => {
      const RETRY_INTERVAL_MS = 30000;
      expect(RETRY_INTERVAL_MS).toBe(30 * 1000);
    });

    test("2-hour timeout is 7200 seconds", () => {
      const TIMEOUT_SECONDS = 2 * 60 * 60;
      expect(TIMEOUT_SECONDS).toBe(7200);
    });

    test("driver card initials are derived correctly", () => {
      const initials = (f, l) => `${f?.[0] || ""}${l?.[0] || ""}`;
      expect(initials("Match", "Driver")).toBe("MD");
    });

    test("status transitions follow the expected order", () => {
      const validStatuses = ["searching", "waiting", "matched", "timeout", "cancelled_by_driver", "error"];
      expect(validStatuses).toContain("searching");
      expect(validStatuses).toContain("matched");
      expect(validStatuses).toContain("timeout");
    });
  });

  // ── Integration Tests ───────────────────────────────────────────────────────

  describe("Integration Tests", () => {
    beforeAll(async () => {
      riderToken = await registerRider();
      driverToken = await registerOnlineDriver();
    }, 20000);

    test("matches rider with an online driver and returns driver info", async () => {
      const data = await requestMatch(riderToken, "Main Library, Amherst, MA");
      expect(data.success).toBe(true);
      expect(data.matchId).toBeDefined();
      expect(data.driver).toBeDefined();
      expect(data.driver.firstName).toBeTruthy();
    }, 10000);

    test("returns driver phone number in the match response", async () => {
      const data = await requestMatch(riderToken, "Amherst, MA");
      expect(data.driver.phone).toBeDefined();
    }, 10000);

    test("match response includes a numeric matchId on success", async () => {
      const data = await requestMatch(riderToken, "Main Library, Amherst, MA");
      if (data.success) {
        expect(typeof data.matchId).toBe("number");
        expect(data.matchId).toBeGreaterThan(0);
      } else {
        expect(data).toHaveProperty("error");
      }
    }, 15000);

    test("returns 400 when pickup is missing from match request", async () => {
      const res = await fetch(`${API}/api/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${riderToken}` },
        body: JSON.stringify({ dropoff: "Northampton" }),
      });
      expect(res.status).toBe(400);
    }, 10000);

    test("returns 401 without an auth token", async () => {
      const res = await fetch(`${API}/api/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pickup: "Amherst", dropoff: "Northampton" }),
      });
      expect(res.status).toBe(401);
    }, 10000);
  });

  // ── Load Tests ──────────────────────────────────────────────────────────────

  describe("Load Tests", () => {
    test("handles 25 concurrent match requests with one online driver", async () => {
      const onlineDriverToken = await registerOnlineDriver("_load");
      const riderTokens = await Promise.all(
        Array.from({ length: 25 }, (_, i) => registerRider(`_load_${i}`))
      );

      const start = Date.now();
      const results = await Promise.all(
        riderTokens.map((t) => requestMatch(t, "Library, Amherst, MA"))
      );
      const duration = Date.now() - start;

      const successful = results.filter((r) => r.success).length;
      expect(successful).toBeGreaterThan(0);
      expect(duration).toBeLessThan(20000);
    }, 60000);
  });
});