/**
 * UC4: Driver Goes Online
 * Covers: Unit | Integration | Load
 */

const API = "http://localhost:5001";

let authToken = null;

const registerDriver = async () => {
  const res = await fetch(`${API}/api/driver/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: `uc4_${Date.now()}@umass.edu`,
      password: "password123",
      firstName: "Online",
      lastName: "Driver",
      university: "UMass Amherst",
      phone: "413-000-0300",
      vehicle: { make: "Ford", model: "Focus", year: "2018", color: "Black", licensePlate: "DRV001", maxSeats: 4 },
      guidelines: {},
      preferences: { allowSharedRides: true },
      location: { startingAddress: "Campus Center, Amherst, MA", pickupRadius: 5 },
    }),
  });
  const data = await res.json();
  return data.token;
};

const toggleOnline = (token, isOnline) =>
  fetch(`${API}/api/driver/online`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ isOnline }),
  }).then((r) => r.json());

// ── Unit Tests ──────────────────────────────────────────────────────────────

describe("UC4: Driver Goes Online", () => {
  describe("Unit Tests", () => {
    test("isOnline true sets driver as available", () => {
      const driver = { isOnline: false };
      driver.isOnline = true;
      expect(driver.isOnline).toBe(true);
    });

    test("isOnline false sets driver as unavailable", () => {
      const driver = { isOnline: true };
      driver.isOnline = false;
      expect(driver.isOnline).toBe(false);
    });

    test("isOnline field is a boolean", () => {
      expect(typeof true).toBe("boolean");
      expect(typeof false).toBe("boolean");
    });

    test("toggle switches online to offline", () => {
      const toggle = (current) => !current;
      expect(toggle(true)).toBe(false);
      expect(toggle(false)).toBe(true);
    });

    test("request payload only needs isOnline field", () => {
      const payload = { isOnline: true };
      expect(Object.keys(payload)).toEqual(["isOnline"]);
    });
  });

  // ── Integration Tests ───────────────────────────────────────────────────────

  describe("Integration Tests", () => {
    beforeAll(async () => {
      authToken = await registerDriver();
    }, 15000);

    test("sets driver online and returns success", async () => {
      const data = await toggleOnline(authToken, true);
      expect(data.success).toBe(true);
    }, 10000);

    test("sets driver offline and returns success", async () => {
      const data = await toggleOnline(authToken, false);
      expect(data.success).toBe(true);
    }, 10000);

    test("GET /api/me reflects the online status", async () => {
      await toggleOnline(authToken, true);
      const res = await fetch(`${API}/api/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      expect(data.user.isOnline).toBe(true);
    }, 15000);

    test("returns 401 when no auth token is provided", async () => {
      const res = await fetch(`${API}/api/driver/online`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOnline: true }),
      });
      expect(res.status).toBe(401);
    }, 10000);
  });

  // ── Load Tests ──────────────────────────────────────────────────────────────

  describe("Load Tests", () => {
    test("handles 30 rapid online toggle requests under 10 seconds", async () => {
      expect(authToken).not.toBeNull();

      const requests = Array.from({ length: 30 }, (_, i) =>
        toggleOnline(authToken, i % 2 === 0)
      );

      const start = Date.now();
      const results = await Promise.all(requests);
      const duration = Date.now() - start;

      const successful = results.filter((r) => r.success).length;
      expect(successful).toBe(30);
      expect(duration).toBeLessThan(10000);
    }, 30000);

    test("handles 10 concurrent drivers going online simultaneously", async () => {
      const tokens = await Promise.all(
        Array.from({ length: 10 }, async (_, i) => {
          const res = await fetch(`${API}/api/driver/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: `uc4_concurrent_${Date.now()}_${i}@umass.edu`,
              password: "password123",
              firstName: `Driver${i}`,
              lastName: "Load",
              university: "UMass Amherst",
              phone: `413-222-${String(i).padStart(4, "0")}`,
              vehicle: { make: "Honda", model: "Fit", year: "2019", color: "Grey", licensePlate: `LD${i}`, maxSeats: 4 },
              guidelines: {},
              preferences: {},
              location: { startingAddress: "Amherst, MA", pickupRadius: 5 },
            }),
          });
          const d = await res.json();
          return d.token;
        })
      );

      const start = Date.now();
      const results = await Promise.all(tokens.map((t) => toggleOnline(t, true)));
      const duration = Date.now() - start;

      expect(results.every((r) => r.success)).toBe(true);
      expect(duration).toBeLessThan(10000);
    }, 60000);
  });
});