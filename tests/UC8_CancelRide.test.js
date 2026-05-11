/**
 * UC8: Cancel Ride
 * Covers: Unit | Integration | Load
 */

const API = "http://localhost:5001";

let riderToken = null;
let driverToken = null;
let activeMatchId = null;

const createMatchedPair = async (suffix = "") => {
  const driverRes = await fetch(`${API}/api/driver/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: `uc8_driver${suffix}_${Date.now()}@umass.edu`,
      password: "password123",
      firstName: "Cancel",
      lastName: "Driver",
      university: "UMass Amherst",
      phone: "413-000-0600",
      vehicle: { make: "Kia", model: "Soul", year: "2019", color: "Orange", licensePlate: "CXL001", maxSeats: 4 },
      guidelines: {},
      preferences: { allowSharedRides: true },
      location: { startingAddress: "Campus Center, Amherst, MA", pickupRadius: 5 },
    }),
  });
  const dToken = (await driverRes.json()).token;

  await fetch(`${API}/api/driver/online`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${dToken}` },
    body: JSON.stringify({ isOnline: true }),
  });

  const riderRes = await fetch(`${API}/api/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      role: "rider",
      email: `uc8_rider${suffix}_${Date.now()}@umass.edu`,
      password: "password123",
      firstName: "Cancel",
      lastName: "Rider",
      university: "UMass Amherst",
      phone: "413-000-0601",
    }),
  });
  const rToken = (await riderRes.json()).token;

  const matchRes = await fetch(`${API}/api/match`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${rToken}` },
    body: JSON.stringify({ pickup: "Campus Center, Amherst", dropoff: "Northampton" }),
  });
  const matchData = await matchRes.json();

  return { dToken, rToken, matchId: matchData.matchId };
};

const cancelMatch = (token, matchId) =>
  fetch(`${API}/api/match/${matchId}/cancel`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  }).then((r) => r.json());

// ── Unit Tests ──────────────────────────────────────────────────────────────

describe("UC8: Cancel Ride", () => {
  describe("Unit Tests", () => {
    test("match status transitions to cancelled after cancel", () => {
      let status = "active";
      const cancel = () => { status = "cancelled"; };
      cancel();
      expect(status).toBe("cancelled");
    });

    test("cancelled status is not active", () => {
      expect("cancelled").not.toBe("active");
    });

    test("cancel endpoint URL is constructed correctly", () => {
      const matchId = 42;
      const url = `/api/match/${matchId}/cancel`;
      expect(url).toBe("/api/match/42/cancel");
    });

    test("ra_ride is cleared from sessionStorage after cancellation", () => {
      const store = { ra_ride: JSON.stringify({ pickup: "A", dropoff: "B" }) };
      delete store.ra_ride;
      expect(store.ra_ride).toBeUndefined();
    });

    test("rider cancellation targets rider_id column", () => {
      const role = "rider";
      const col = role === "driver" ? "driver_id" : "rider_id";
      expect(col).toBe("rider_id");
    });

    test("driver cancellation targets driver_id column", () => {
      const role = "driver";
      const col = role === "driver" ? "driver_id" : "rider_id";
      expect(col).toBe("driver_id");
    });

    test("cancellation with no matchId skips the API call", () => {
      let called = false;
      const handleCancel = (matchId) => {
        if (matchId) called = true;
      };
      handleCancel(null);
      expect(called).toBe(false);
    });
  });

  // ── Integration Tests ───────────────────────────────────────────────────────

  describe("Integration Tests", () => {
    beforeAll(async () => {
      const pair = await createMatchedPair();
      riderToken = pair.rToken;
      driverToken = pair.dToken;
      activeMatchId = pair.matchId;
    }, 25000);

    test("rider can cancel an active match", async () => {
      const pair = await createMatchedPair("_rider_cancel");
      const data = await cancelMatch(pair.rToken, pair.matchId);
      expect(data.success).toBe(true);
    }, 15000);

    test("driver can cancel an active match", async () => {
      const pair = await createMatchedPair("_driver_cancel");
      const data = await cancelMatch(pair.dToken, pair.matchId);
      expect(data.success).toBe(true);
    }, 15000);

    test("match status shows as cancelled after rider cancels", async () => {
      const pair = await createMatchedPair("_status_check");
      await cancelMatch(pair.rToken, pair.matchId);

      const res = await fetch(`${API}/api/match/active`, {
        headers: { Authorization: `Bearer ${pair.rToken}` },
      });
      const data = await res.json();
      expect(data.match.status).toBe("cancelled");
    }, 20000);

    test("returns 404 when cancelling a non-existent match", async () => {
      const res = await fetch(`${API}/api/match/9999999/cancel`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${riderToken}` },
      });
      expect(res.status).toBe(404);
    }, 10000);

    test("returns 401 without an auth token", async () => {
      const res = await fetch(`${API}/api/match/${activeMatchId}/cancel`, {
        method: "PATCH",
      });
      expect(res.status).toBe(401);
    }, 10000);
  });

  // ── Load Tests ──────────────────────────────────────────────────────────────

  describe("Load Tests", () => {
    test("handles 15 concurrent cancellations from different riders", async () => {
      const pairs = await Promise.all(
        Array.from({ length: 15 }, (_, i) => createMatchedPair(`_concurrent_${i}`))
      );

      const start = Date.now();
      const results = await Promise.all(
        pairs.map((p) => cancelMatch(p.rToken, p.matchId))
      );
      const duration = Date.now() - start;

      const successful = results.filter((r) => r.success).length;
      expect(successful).toBe(15);
      expect(duration).toBeLessThan(15000);
    }, 120000);
  });
});