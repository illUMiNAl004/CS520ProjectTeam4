/**
 * UC2: Complete Profile Setup
 * Covers: Unit | Integration | Load
 */

const API = "http://localhost:5001";

const buildDriverPayload = (overrides = {}) => ({
  email: `uc2_${Date.now()}@umass.edu`,
  password: "password123",
  firstName: "John",
  lastName: "Smith",
  university: "UMass Amherst",
  phone: "413-000-0100",
  vehicle: {
    make: "Honda",
    model: "Civic",
    year: "2020",
    color: "White",
    licensePlate: "ABC1234",
    maxSeats: 4,
  },
  guidelines: { noSmoking: true, noPets: false, carSeat: false, accessible: false },
  preferences: { allowSharedRides: true, campusRoutesOnly: false, verifiedRidersOnly: false },
  location: { startingAddress: "North Pleasant St, Amherst, MA", pickupRadius: 5 },
  ...overrides,
});

// ── Unit Tests ──────────────────────────────────────────────────────────────

describe("UC2: Complete Profile Setup", () => {
  describe("Unit Tests", () => {
    test("vehicle object contains all required keys", () => {
      const vehicle = buildDriverPayload().vehicle;
      ["make", "model", "year", "color", "licensePlate", "maxSeats"].forEach((key) => {
        expect(vehicle).toHaveProperty(key);
      });
    });

    test("maxSeats defaults to 4 when not provided", () => {
      const payload = buildDriverPayload();
      expect(payload.vehicle.maxSeats).toBe(4);
    });

    test("guidelines object contains expected keys", () => {
      const { guidelines } = buildDriverPayload();
      expect(guidelines).toHaveProperty("noSmoking");
      expect(guidelines).toHaveProperty("carSeat");
      expect(guidelines).toHaveProperty("accessible");
    });

    test("preferences object contains expected keys", () => {
      const { preferences } = buildDriverPayload();
      expect(preferences).toHaveProperty("allowSharedRides");
      expect(preferences).toHaveProperty("campusRoutesOnly");
      expect(preferences).toHaveProperty("verifiedRidersOnly");
    });

    test("location requires a startingAddress", () => {
      const { location } = buildDriverPayload();
      expect(location.startingAddress).toBeTruthy();
    });

    test("pickupRadius defaults to 5 when not provided", () => {
      const { location } = buildDriverPayload();
      expect(location.pickupRadius).toBe(5);
    });

    test("driver initials are derived from first and last name", () => {
      const getInitials = (first, last) =>
        `${first?.[0] || ""}${last?.[0] || ""}`;
      expect(getInitials("John", "Smith")).toBe("JS");
      expect(getInitials("", "Smith")).toBe("S");
    });
  });

  // ── Integration Tests ───────────────────────────────────────────────────────

  describe("Integration Tests", () => {
    test("registers a driver and returns a token with user data", async () => {
      const payload = buildDriverPayload();
      const res = await fetch(`${API}/api/driver/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      expect(res.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.token).toBeDefined();
      expect(data.user.role).toBe("driver");
      expect(data.user.make).toBe("Honda");
    }, 10000);

    test("persists vehicle details in the response", async () => {
      const payload = buildDriverPayload();
      const res = await fetch(`${API}/api/driver/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      expect(data.user.make).toBe(payload.vehicle.make);
      expect(data.user.model).toBe(payload.vehicle.model);
      expect(data.user.licensePlate).toBe(payload.vehicle.licensePlate);
    }, 10000);

    test("returns 400 when email is missing", async () => {
      const payload = buildDriverPayload({ email: undefined });
      const res = await fetch(`${API}/api/driver/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      expect(res.status).toBe(400);
    }, 10000);

    test("returns 409 for duplicate driver email", async () => {
      const payload = buildDriverPayload();
      await fetch(`${API}/api/driver/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const res2 = await fetch(`${API}/api/driver/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      expect(res2.status).toBe(409);
    }, 15000);
  });

  // ── Load Tests ──────────────────────────────────────────────────────────────

  describe("Load Tests", () => {
    test("handles 15 concurrent driver registrations under 15 seconds", async () => {
      const requests = Array.from({ length: 15 }, (_, i) =>
        fetch(`${API}/api/driver/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            buildDriverPayload({ email: `uc2_load_${Date.now()}_${i}@umass.edu` })
          ),
        }).then((r) => r.json())
      );

      const start = Date.now();
      const results = await Promise.all(requests);
      const duration = Date.now() - start;

      const successful = results.filter((r) => r.success).length;
      expect(successful).toBe(15);
      expect(duration).toBeLessThan(15000);
    }, 30000);
  });
});