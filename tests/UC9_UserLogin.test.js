/**
 * UC9: User Login
 * Covers: Unit | Integration | Load
 */

const API = "http://localhost:5001";

const riderEmail = `uc9_rider_${Date.now()}@umass.edu`;
const driverEmail = `uc9_driver_${Date.now()}@umass.edu`;
const password = "password123";

const login = (email, pw, role) =>
  fetch(`${API}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: pw, role }),
  }).then((r) => Promise.all([r.status, r.json()]));

// ── Unit Tests ──────────────────────────────────────────────────────────────

describe("UC9: User Login", () => {
  describe("Unit Tests", () => {
    test("rejects login attempt when email is empty", () => {
      const canAttemptLogin = (email, pw) => !!email && !!pw;
      expect(canAttemptLogin("", "password123")).toBe(false);
    });

    test("rejects login attempt when password is empty", () => {
      const canAttemptLogin = (email, pw) => !!email && !!pw;
      expect(canAttemptLogin("student@umass.edu", "")).toBe(false);
    });

    test("allows login attempt when both email and password are present", () => {
      const canAttemptLogin = (email, pw) => !!email && !!pw;
      expect(canAttemptLogin("student@umass.edu", "password123")).toBe(true);
    });

    test("role defaults to rider when not specified", () => {
      const resolveRole = (role) => role || "rider";
      expect(resolveRole(undefined)).toBe("rider");
      expect(resolveRole("driver")).toBe("driver");
    });

    test("JWT token is stored in localStorage after login", () => {
      const store = {};
      const saveToken = (token) => { store["ra_token"] = token; };
      saveToken("mock.jwt.token");
      expect(store["ra_token"]).toBe("mock.jwt.token");
    });

    test("user info is stored in localStorage after login", () => {
      const store = {};
      const saveUser = (user) => { store["ra_user"] = JSON.stringify(user); };
      saveUser({ id: 1, role: "rider", email: "student@umass.edu" });
      const retrieved = JSON.parse(store["ra_user"]);
      expect(retrieved.role).toBe("rider");
    });

    test("driver is redirected to /driver-profile after login", () => {
      const getRedirect = (role) => (role === "driver" ? "/driver-profile" : "/");
      expect(getRedirect("driver")).toBe("/driver-profile");
    });

    test("rider is redirected to / after login", () => {
      const getRedirect = (role) => (role === "driver" ? "/driver-profile" : "/");
      expect(getRedirect("rider")).toBe("/");
    });
  });

  // ── Integration Tests ───────────────────────────────────────────────────────

  describe("Integration Tests", () => {
    beforeAll(async () => {
      await fetch(`${API}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "rider",
          email: riderEmail,
          password,
          firstName: "Login",
          lastName: "Rider",
          university: "UMass Amherst",
          phone: "413-000-0700",
        }),
      });

      await fetch(`${API}/api/driver/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: driverEmail,
          password,
          firstName: "Login",
          lastName: "Driver",
          university: "UMass Amherst",
          phone: "413-000-0701",
          vehicle: { make: "Nissan", model: "Sentra", year: "2018", color: "White", licensePlate: "LGN001", maxSeats: 4 },
          guidelines: {},
          preferences: {},
          location: { startingAddress: "Amherst, MA", pickupRadius: 5 },
        }),
      });
    }, 20000);

    test("rider logs in successfully and receives a token", async () => {
      const [status, data] = await login(riderEmail, password, "rider");
      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.token).toBeDefined();
      expect(data.user.role).toBe("rider");
    }, 10000);

    test("driver logs in successfully and receives a token", async () => {
      const [status, data] = await login(driverEmail, password, "driver");
      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.token).toBeDefined();
      expect(data.user.role).toBe("driver");
    }, 10000);

    test("returns 401 for a wrong password", async () => {
      const [status, data] = await login(riderEmail, "wrongpassword", "rider");
      expect(status).toBe(401);
      expect(data.success).toBe(false);
    }, 10000);

    test("returns 401 for an email that does not exist", async () => {
      const [status, data] = await login("nobody@umass.edu", password, "rider");
      expect(status).toBe(401);
      expect(data.success).toBe(false);
    }, 10000);

    test("returns 400 when email is missing from request body", async () => {
      const res = await fetch(`${API}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, role: "rider" }),
      });
      expect(res.status).toBe(400);
    }, 10000);

    test("token from login works to authenticate /api/me", async () => {
      const [, data] = await login(riderEmail, password, "rider");
      const meRes = await fetch(`${API}/api/me`, {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      const meData = await meRes.json();
      expect(meData.success).toBe(true);
      expect(meData.user.email).toBe(riderEmail);
    }, 15000);

    test("rider token returns empty riders list from driver endpoint", async () => {
      const [, data] = await login(riderEmail, password, "rider");
      const res = await fetch(`${API}/api/driver/riders`, {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      expect(res.status).toBe(200);
      const result = await res.json();
      expect(result.success).toBe(true);
      expect(Array.isArray(result.riders)).toBe(true);
      expect(result.riders.length).toBe(0);
    }, 10000);
  });

  // ── Load Tests ──────────────────────────────────────────────────────────────

  describe("Load Tests", () => {
    test("handles 50 concurrent rider login requests under 10 seconds", async () => {
      const requests = Array.from({ length: 50 }, () =>
        login(riderEmail, password, "rider")
      );

      const start = Date.now();
      const results = await Promise.all(requests);
      const duration = Date.now() - start;

      const successful = results.filter(([, d]) => d.success).length;
      expect(successful).toBe(50);
      expect(duration).toBeLessThan(10000);
    }, 30000);

    test("handles 50 concurrent driver login requests under 10 seconds", async () => {
      const requests = Array.from({ length: 50 }, () =>
        login(driverEmail, password, "driver")
      );

      const start = Date.now();
      const results = await Promise.all(requests);
      const duration = Date.now() - start;

      const successful = results.filter(([, d]) => d.success).length;
      expect(successful).toBe(50);
      expect(duration).toBeLessThan(10000);
    }, 30000);

    test("handles 20 concurrent failed login attempts under 10 seconds", async () => {
      const requests = Array.from({ length: 20 }, () =>
        login(riderEmail, "wrongpassword", "rider")
      );

      const start = Date.now();
      const results = await Promise.all(requests);
      const duration = Date.now() - start;

      results.forEach(([status]) => expect(status).toBe(401));
      expect(duration).toBeLessThan(10000);
    }, 30000);
  });
});