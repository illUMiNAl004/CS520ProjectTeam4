/**
 * UC3: Edit Driver Profile
 * Covers: Unit | Integration | Load
 */

const API = "http://localhost:5001";

let authToken = null;

const registerAndLogin = async () => {
  const res = await fetch(`${API}/api/driver/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: `uc3_${Date.now()}@umass.edu`,
      password: "password123",
      firstName: "Edit",
      lastName: "Driver",
      university: "UMass Amherst",
      phone: "413-000-0200",
      vehicle: { make: "Toyota", model: "Camry", year: "2019", color: "Blue", licensePlate: "OLD123", maxSeats: 4 },
      guidelines: { noSmoking: false },
      preferences: { allowSharedRides: true },
      location: { startingAddress: "Old Address, Amherst, MA", pickupRadius: 3 },
    }),
  });
  const data = await res.json();
  return data.token;
};

const updatedProfile = {
  vehicle: { make: "Honda", model: "Civic", year: "2021", color: "Red", licensePlate: "NEW999", maxSeats: 3 },
  guidelines: { noSmoking: true, noPets: true },
  preferences: { allowSharedRides: false },
  startingAddress: "New Address, Northampton, MA",
  pickupRadius: 8,
};

// ── Unit Tests ──────────────────────────────────────────────────────────────

describe("UC3: Edit Driver Profile", () => {
  describe("Unit Tests", () => {
    test("profile update payload contains vehicle key", () => {
      expect(updatedProfile).toHaveProperty("vehicle");
    });

    test("profile update payload contains startingAddress", () => {
      expect(updatedProfile.startingAddress).toBeTruthy();
    });

    test("pickupRadius is a positive number", () => {
      expect(updatedProfile.pickupRadius).toBeGreaterThan(0);
    });

    test("maxSeats is within allowed range of 1 to 8", () => {
      const { maxSeats } = updatedProfile.vehicle;
      expect(maxSeats).toBeGreaterThanOrEqual(1);
      expect(maxSeats).toBeLessThanOrEqual(8);
    });

    test("guidelines values are booleans", () => {
      Object.values(updatedProfile.guidelines).forEach((v) => {
        expect(typeof v).toBe("boolean");
      });
    });

    test("preferences values are booleans", () => {
      Object.values(updatedProfile.preferences).forEach((v) => {
        expect(typeof v).toBe("boolean");
      });
    });

    test("vehicle year is a non-empty string", () => {
      expect(typeof updatedProfile.vehicle.year).toBe("string");
      expect(updatedProfile.vehicle.year.length).toBeGreaterThan(0);
    });
  });

  // ── Integration Tests ───────────────────────────────────────────────────────

  describe("Integration Tests", () => {
    beforeAll(async () => {
      authToken = await registerAndLogin();
    }, 15000);

    test("successfully updates driver profile and returns updated user", async () => {
      const res = await fetch(`${API}/api/driver/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(updatedProfile),
      });
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.make).toBe("Honda");
      expect(data.user.licensePlate).toBe("NEW999");
      expect(data.user.startingAddress).toBe("New Address, Northampton, MA");
    }, 10000);

    test("returns 401 when no auth token is provided", async () => {
      const res = await fetch(`${API}/api/driver/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProfile),
      });
      expect(res.status).toBe(401);
    }, 10000);

    test("GET /api/me reflects the updated profile", async () => {
      const res = await fetch(`${API}/api/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.user.make).toBe("Honda");
      expect(data.user.pickupRadius).toBe(8);
    }, 10000);
  });

  // ── Load Tests ──────────────────────────────────────────────────────────────

  describe("Load Tests", () => {
    test("handles 20 concurrent profile update requests under 10 seconds", async () => {
      expect(authToken).not.toBeNull();

      const requests = Array.from({ length: 20 }, (_, i) =>
        fetch(`${API}/api/driver/profile`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            ...updatedProfile,
            startingAddress: `Street ${i}, Amherst, MA`,
          }),
        }).then((r) => r.json())
      );

      const start = Date.now();
      const results = await Promise.all(requests);
      const duration = Date.now() - start;

      const successful = results.filter((r) => r.success).length;
      expect(successful).toBe(20);
      expect(duration).toBeLessThan(10000);
    }, 30000);
  });
});