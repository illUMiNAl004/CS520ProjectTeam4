/**
 * UC1: Register an Account
 * Covers: Unit | Integration | Load
 */

const API = "http://localhost:5001";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPassword = (pw) => pw.length >= 8;
const hasRequiredFields = (data) =>
  ["email", "password", "firstName", "lastName", "university", "phone"].every(
    (f) => !!data[f]
  );
const isValidRole = (role) => ["rider", "driver"].includes(role);

// ── Unit Tests ──────────────────────────────────────────────────────────────

describe("UC1: Register an Account", () => {
  describe("Unit Tests", () => {
    test("rejects email without @ symbol", () => {
      expect(isValidEmail("invalidemail")).toBe(false);
    });

    test("rejects email missing domain", () => {
      expect(isValidEmail("student@")).toBe(false);
    });

    test("accepts a valid email address", () => {
      expect(isValidEmail("student@umass.edu")).toBe(true);
    });

    test("rejects password shorter than 8 characters", () => {
      expect(isValidPassword("short")).toBe(false);
    });

    test("accepts password of exactly 8 characters", () => {
      expect(isValidPassword("abcd1234")).toBe(true);
    });

    test("accepts password longer than 8 characters", () => {
      expect(isValidPassword("averylongpassword")).toBe(true);
    });

    test("fails validation when required fields are missing", () => {
      expect(hasRequiredFields({ email: "a@b.com", password: "pass1234" })).toBe(false);
    });

    test("passes validation when all required fields are present", () => {
      expect(
        hasRequiredFields({
          email: "a@b.com",
          password: "pass1234",
          firstName: "Jane",
          lastName: "Doe",
          university: "UMass",
          phone: "413-000-0000",
        })
      ).toBe(true);
    });

    test("rejects an invalid role", () => {
      expect(isValidRole("admin")).toBe(false);
    });

    test("accepts rider as a valid role", () => {
      expect(isValidRole("rider")).toBe(true);
    });

    test("accepts driver as a valid role", () => {
      expect(isValidRole("driver")).toBe(true);
    });
  });

  // ── Integration Tests ───────────────────────────────────────────────────────

  describe("Integration Tests", () => {
    const testEmail = `uc1_${Date.now()}@umass.edu`;

    test("creates a rider account and returns a token", async () => {
      const res = await fetch(`${API}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "rider",
          email: testEmail,
          password: "password123",
          firstName: "Jane",
          lastName: "Doe",
          university: "UMass Amherst",
          phone: "413-000-0001",
        }),
      });
      const data = await res.json();
      expect(res.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.token).toBeDefined();
      expect(data.user.email).toBe(testEmail);
      expect(data.user.role).toBe("rider");
    }, 10000);

    test("returns 409 when the same email is registered twice", async () => {
      const res = await fetch(`${API}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "rider",
          email: testEmail,
          password: "password123",
          firstName: "Duplicate",
          lastName: "User",
          university: "UMass Amherst",
          phone: "413-000-0002",
        }),
      });
      const data = await res.json();
      expect(res.status).toBe(409);
      expect(data.success).toBe(false);
    }, 10000);

    test("returns 400 for an invalid email format", async () => {
      const res = await fetch(`${API}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "rider",
          email: "notanemail",
          password: "password123",
          firstName: "Jane",
          lastName: "Doe",
          university: "UMass",
          phone: "413-000-0003",
        }),
      });
      expect(res.status).toBe(400);
    }, 10000);

    test("returns 400 when password is too short", async () => {
      const res = await fetch(`${API}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "rider",
          email: `new_${Date.now()}@umass.edu`,
          password: "short",
          firstName: "Jane",
          lastName: "Doe",
          university: "UMass",
          phone: "413-000-0004",
        }),
      });
      expect(res.status).toBe(400);
    }, 10000);

    test("returns 400 when required fields are missing", async () => {
      const res = await fetch(`${API}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@umass.edu", password: "password123" }),
      });
      expect(res.status).toBe(400);
    }, 10000);
  });

  // ── Load Tests ──────────────────────────────────────────────────────────────

  describe("Load Tests", () => {
    test("handles 20 concurrent signup requests under 10 seconds", async () => {
      const requests = Array.from({ length: 20 }, (_, i) =>
        fetch(`${API}/api/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role: "rider",
            email: `uc1_load_${Date.now()}_${i}@umass.edu`,
            password: "password123",
            firstName: `Load${i}`,
            lastName: "Tester",
            university: "UMass Amherst",
            phone: `413-111-${String(i).padStart(4, "0")}`,
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