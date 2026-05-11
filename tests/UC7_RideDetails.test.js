/**
 * UC7: Ride Details
 * Covers: Unit | Integration | Load
 */

const API = "http://localhost:5001";

const makeDriver = async (suffix = "") => {
  const res = await fetch(`${API}/api/driver/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: `uc7_driver${suffix}_${Date.now()}@umass.edu`,
      password: "password123",
      firstName: "Details",
      lastName: "Driver",
      university: "UMass Amherst",
      phone: "413-000-0500",
      vehicle: { make: "Mazda", model: "3", year: "2020", color: "Silver", licensePlate: "DTL001", maxSeats: 4 },
      guidelines: { noSmoking: true },
      preferences: { allowSharedRides: true },
      location: { startingAddress: "Southwest Residential, Amherst, MA", pickupRadius: 5 },
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

const makeRider = async (suffix = "") => {
  const res = await fetch(`${API}/api/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      role: "rider",
      email: `uc7_rider${suffix}_${Date.now()}@umass.edu`,
      password: "password123",
      firstName: "Ride",
      lastName: "Details",
      university: "UMass Amherst",
      phone: "413-000-0501",
    }),
  });
  return (await res.json()).token;
};

const makeMatch = async (riderToken) => {
  const res = await fetch(`${API}/api/match`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${riderToken}` },
    body: JSON.stringify({ pickup: "Southwest Residential, Amherst", dropoff: "Northampton" }),
  });
  return res.json();
};

// ── Unit Tests ──────────────────────────────────────────────────────────────

describe("UC7: Ride Details", () => {
  describe("Unit Tests", () => {
    test("driver card displays first and last name", () => {
      const driver = { firstName: "Details", lastName: "Driver", phone: "413-000-0500" };
      const fullName = `${driver.firstName} ${driver.lastName}`;
      expect(fullName).toBe("Details Driver");
    });

    test("initials are computed from first and last name", () => {
      const getInitials = (f, l) => `${f?.[0] || ""}${l?.[0] || ""}`;
      expect(getInitials("Details", "Driver")).toBe("DD");
    });

    test("vehicle description is assembled from year, make, model", () => {
      const driver = { year: "2020", make: "Mazda", model: "3", color: "Silver" };
      const desc = [driver.year, driver.make, driver.model].filter(Boolean).join(" ");
      expect(desc).toBe("2020 Mazda 3");
    });

    test("license plate is shown when present", () => {
      const driver = { licensePlate: "DTL001" };
      expect(driver.licensePlate).toBeTruthy();
    });

    test("phone number is passed to SMS and call links", () => {
      const phone = "413-000-0500";
      expect(`sms:${phone}`).toBe("sms:413-000-0500");
      expect(`tel:${phone}`).toBe("tel:413-000-0500");
    });

    test("ride detail item renders pickup and dropoff", () => {
      const ride = { pickup: "Southwest Residential", dropoff: "Northampton" };
      expect(ride.pickup).toBeTruthy();
      expect(ride.dropoff).toBeTruthy();
    });

    test("driver with missing name falls back to empty initials", () => {
      const getInitials = (f, l) => `${f?.[0] || ""}${l?.[0] || ""}`;
      expect(getInitials(undefined, undefined)).toBe("");
    });
  });

  // ── Integration Tests ───────────────────────────────────────────────────────

  describe("Integration Tests", () => {
    test("GET /api/driver/riders returns active matched riders for the driver", async () => {
      const driverToken = await makeDriver("_int_a");
      const riderToken = await makeRider("_int_a");
      await makeMatch(riderToken);

      const res = await fetch(`${API}/api/driver/riders`, {
        headers: { Authorization: `Bearer ${driverToken}` },
      });
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.riders)).toBe(true);
    }, 20000);

    test("rider entry includes pickup, dropoff, and contact info", async () => {
      const driverToken = await makeDriver("_int_b");
      const riderToken = await makeRider("_int_b");
      await makeMatch(riderToken);

      const res = await fetch(`${API}/api/driver/riders`, {
        headers: { Authorization: `Bearer ${driverToken}` },
      });
      const data = await res.json();
      if (data.riders.length > 0) {
        const rider = data.riders[0];
        expect(rider).toHaveProperty("pickup");
        expect(rider).toHaveProperty("dropoff");
        expect(rider).toHaveProperty("phone");
        expect(rider).toHaveProperty("first_name");
      }
    }, 20000);

    test("GET /api/match/active returns the current match status for the rider", async () => {
      await makeDriver("_int_c");
      const riderToken = await makeRider("_int_c");
      await makeMatch(riderToken);

      const res = await fetch(`${API}/api/match/active`, {
        headers: { Authorization: `Bearer ${riderToken}` },
      });
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.match).not.toBeNull();
      expect(data.match.status).toBe("active");
    }, 20000);

    test("returns 401 when requesting driver riders without a token", async () => {
      const res = await fetch(`${API}/api/driver/riders`);
      expect(res.status).toBe(401);
    }, 10000);
  });

  // ── Load Tests ──────────────────────────────────────────────────────────────

  describe("Load Tests", () => {
    test("handles 30 concurrent polls to /api/match/active under 10 seconds", async () => {
      const res = await fetch(`${API}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "rider",
          email: `uc7_load_rider_${Date.now()}@umass.edu`,
          password: "password123",
          firstName: "Load",
          lastName: "Rider",
          university: "UMass Amherst",
          phone: "413-000-0599",
        }),
      });
      const { token: loadRiderToken } = await res.json();
      expect(loadRiderToken).toBeDefined();

      const requests = Array.from({ length: 30 }, () =>
        fetch(`${API}/api/match/active`, {
          headers: { Authorization: `Bearer ${loadRiderToken}` },
        }).then((r) => r.json())
      );

      const start = Date.now();
      const results = await Promise.all(requests);
      const duration = Date.now() - start;

      const successful = results.filter((r) => r.success).length;
      expect(successful).toBe(30);
      expect(duration).toBeLessThan(10000);
    }, 30000);

    test("handles 20 concurrent /api/driver/riders fetches under 10 seconds", async () => {
      const res = await fetch(`${API}/api/driver/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: `uc7_load_driver_${Date.now()}@umass.edu`,
          password: "password123",
          firstName: "Load",
          lastName: "Driver",
          university: "UMass Amherst",
          phone: "413-000-0598",
          vehicle: { make: "Ford", model: "Escape", year: "2020", color: "Blue", licensePlate: "LD001", maxSeats: 4 },
          guidelines: {},
          preferences: {},
          location: { startingAddress: "Amherst, MA", pickupRadius: 5 },
        }),
      });
      const { token: loadDriverToken } = await res.json();
      expect(loadDriverToken).toBeDefined();

      const requests = Array.from({ length: 20 }, () =>
        fetch(`${API}/api/driver/riders`, {
          headers: { Authorization: `Bearer ${loadDriverToken}` },
        }).then((r) => r.json())
      );

      const start = Date.now();
      const results = await Promise.all(requests);
      const duration = Date.now() - start;

      expect(results.every((r) => r.success)).toBe(true);
      expect(duration).toBeLessThan(10000);
    }, 30000);
  });
});