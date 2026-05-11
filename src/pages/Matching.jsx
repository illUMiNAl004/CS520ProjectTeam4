import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = process.env.REACT_APP_API_URL || "http://localhost:5001";

export default function Matching() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("searching"); // searching | waiting | matched | timeout | cancelled_by_driver | error
  const [driver, setDriver] = useState(null);
  const [matchId, setMatchId] = useState(null);
  const [ride, setRide] = useState({ pickup: "", dropoff: "" });
  const [secondsLeft, setSecondsLeft] = useState(2 * 60 * 60); // 2 hours
  const retryRef = React.useRef(null);
  const countdownRef = React.useRef(null);

  useEffect(() => {
    const rideRaw = sessionStorage.getItem("ra_ride");
    const { pickup = "", dropoff = "" } = rideRaw ? JSON.parse(rideRaw) : {};
    setRide({ pickup, dropoff });

    const token = localStorage.getItem("ra_token");
    const tryMatch = () => {
      fetch(`${API}/api/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ pickup, dropoff }),
      })
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            clearInterval(retryRef.current);
            clearInterval(countdownRef.current);
            setDriver(data.driver);
            setMatchId(data.matchId);
            sessionStorage.setItem("ra_driver", JSON.stringify(data.driver));
            sessionStorage.setItem("ra_match_id", data.matchId);
            setStatus("matched");
          } else {
            setStatus("waiting");
          }
        })
        .catch(() => setStatus("error"));
    };

    tryMatch();

    // Retry every 30 seconds
    retryRef.current = setInterval(tryMatch, 30000);

    // Countdown 2 hours; give up when it hits 0
    countdownRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(retryRef.current);
          clearInterval(countdownRef.current);
          setStatus("timeout");
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => {
      clearInterval(retryRef.current);
      clearInterval(countdownRef.current);
    };
  }, []);

  // Poll every 5s to detect if driver cancelled
  useEffect(() => {
    if (status !== "matched" || !matchId) return;
    const token = localStorage.getItem("ra_token");
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API}/api/match/active`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.match?.status === "cancelled") {
          clearInterval(interval);
          setStatus("cancelled_by_driver");
        }
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [status, matchId]);

  const handleCancel = async () => {
    if (matchId) {
      const token = localStorage.getItem("ra_token");
      await fetch(`${API}/api/match/${matchId}/cancel`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    sessionStorage.removeItem("ra_ride");
    navigate("/book");
  };

  const driverInitials = driver
    ? `${driver.firstName?.[0] || ""}${driver.lastName?.[0] || ""}`
    : "?";

  return (
    <div className="page" style={styles.page}>
      <div style={styles.layout}>

        {/* Map area */}
        <div style={styles.mapArea}>
          <div style={styles.mapBg}>
            <div style={styles.mapGrid} />
            <div style={{ ...styles.road, top: "45%", left: 0, right: 0, height: 10 }} />
            <div style={{ ...styles.road, top: "25%", left: 0, right: 0, height: 6 }} />
            <div style={{ ...styles.road, top: "70%", left: 0, right: 0, height: 6 }} />
            <div style={{ ...styles.road, left: "35%", top: 0, bottom: 0, width: 10 }} />
            <div style={{ ...styles.road, left: "60%", top: 0, bottom: 0, width: 6 }} />
            <div style={styles.pickupPin}>
              <div style={styles.pinPulse} />
              📍
            </div>
            <div style={{
              ...styles.mapStatusBadge,
              background: status === "matched" ? "var(--success)" : status === "cancelled_by_driver" || status === "timeout" || status === "error" ? "var(--danger)" : "var(--gold)",
            }}>
              {(status === "searching" || status === "waiting") && "● Searching for driver..."}
              {status === "matched" && "✓ Driver Matched!"}
              {status === "cancelled_by_driver" && "✕ Ride Cancelled"}
              {status === "timeout" && "✕ No drivers found"}
              {status === "error" && "Something went wrong"}
            </div>
          </div>
        </div>

        {/* Bottom panel */}
        <div style={styles.panel}>

          {/* Searching / Waiting state */}
          {(status === "searching" || status === "waiting") && (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--dark)" }}>
                {status === "searching" ? "Finding your driver..." : "Looking for a driver..."}
              </div>
              <div style={{ fontSize: 14, color: "var(--muted)", marginTop: 6 }}>
                {status === "waiting" ? "No drivers available right now. Checking again every 30 seconds." : "Matching you with a nearby driver"}
              </div>
              {status === "waiting" && (
                <div style={{ fontSize: 13, color: "var(--gold-dark)", marginTop: 10, fontWeight: 600 }}>
                  Giving up in {Math.floor(secondsLeft / 3600)}h {Math.floor((secondsLeft % 3600) / 60)}m {secondsLeft % 60}s
                </div>
              )}
              <button
                style={{ marginTop: 20, padding: "10px 28px", borderRadius: "var(--radius-pill)", border: "1.5px solid var(--border)", background: "#fff", cursor: "pointer", fontSize: 13, fontFamily: "var(--font-body)", color: "var(--muted)" }}
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          )}

          {/* Cancelled by driver */}
          {status === "cancelled_by_driver" && (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🚫</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--dark)", marginBottom: 8 }}>
                Your driver cancelled the ride
              </div>
              <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 20 }}>
                Sorry about that! Find another driver.
              </p>
              <button className="btn-gold" style={{ padding: "12px 32px" }} onClick={() => navigate("/book")}>
                Find Another Driver
              </button>
            </div>
          )}

          {/* Timeout */}
          {status === "timeout" && (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>⏰</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--dark)", marginBottom: 8 }}>
                No drivers found
              </div>
              <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 20 }}>
                We couldn't find a driver after 2 hours. Please try again later.
              </p>
              <button className="btn-outline" style={{ padding: "12px 32px" }} onClick={() => navigate("/book")}>
                Back to Booking
              </button>
            </div>
          )}

          {/* Error */}
          {status === "error" && (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>😔</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--dark)", marginBottom: 8 }}>
                Something went wrong
              </div>
              <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 20 }}>Please try again.</p>
              <button className="btn-outline" style={{ padding: "12px 32px" }} onClick={() => navigate("/book")}>
                Back to Booking
              </button>
            </div>
          )}

          {/* Matched state */}
          {status === "matched" && driver && (
            <>
              {/* Driver card */}
              <div style={styles.driverCard}>
                <div style={styles.driverAvatar}>{driverInitials}</div>
                <div style={{ flex: 1 }}>
                  <div style={styles.driverName}>{driver.firstName} {driver.lastName}</div>
                  <div style={styles.driverMeta}>
                    {[driver.year, driver.make, driver.model].filter(Boolean).join(" ")}
                    {driver.color ? ` · ${driver.color}` : ""}
                  </div>
                  <div style={styles.driverMeta}>
                    {driver.licensePlate ? `🪪 ${driver.licensePlate}` : ""}
                    {driver.maxSeats ? `  ·  ${driver.maxSeats} seats` : ""}
                  </div>
                </div>
                <div style={styles.matchBadge}>✓ Matched</div>
              </div>

              {/* Ride details */}
              <div style={styles.rideDetails}>
                <div style={styles.rideDetailItem}>
                  <span style={styles.rideDetailLabel}>From</span>
                  <span style={styles.rideDetailVal}>{ride.pickup || "—"}</span>
                </div>
                <div style={styles.rideDetailDivider} />
                <div style={styles.rideDetailItem}>
                  <span style={styles.rideDetailLabel}>To</span>
                  <span style={styles.rideDetailVal}>{ride.dropoff || "—"}</span>
                </div>
              </div>

              {/* SMS / Call / Cancel */}
              <div style={styles.actions}>
                <a
                  href={`sms:${driver.phone}`}
                  style={{ ...styles.actionBtn, textDecoration: "none" }}
                >
                  <span style={styles.actionIcon}>💬</span>
                  <span>Message</span>
                </a>
                <a
                  href={`tel:${driver.phone}`}
                  style={{ ...styles.actionBtn, textDecoration: "none" }}
                >
                  <span style={styles.actionIcon}>📞</span>
                  <span>Call</span>
                </a>
                <button
                  style={{ ...styles.actionBtn, color: "var(--danger)", borderColor: "#fca5a5" }}
                  onClick={handleCancel}
                >
                  <span style={styles.actionIcon}>✕</span>
                  <span>Cancel</span>
                </button>
              </div>

              <button
                className="btn-gold"
                style={{ width: "100%", fontSize: 16, padding: "16px 0" }}
                onClick={() => navigate("/payment")}
              >
                I'm in the car — Start Ride →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { background: "#f7f5f0" },
  layout: { display: "flex", flexDirection: "column", height: "calc(100vh - 64px)" },

  mapArea: { flex: 1, position: "relative", overflow: "hidden" },
  mapBg: { position: "absolute", inset: 0, background: "#dde8d0" },
  mapGrid: {
    position: "absolute", inset: 0,
    backgroundImage: "repeating-linear-gradient(0deg,rgba(0,0,0,0.03) 0,rgba(0,0,0,0.03) 1px,transparent 1px,transparent 48px),repeating-linear-gradient(90deg,rgba(0,0,0,0.03) 0,rgba(0,0,0,0.03) 1px,transparent 1px,transparent 48px)",
  },
  road: { position: "absolute", background: "#c8bc88" },
  pickupPin: {
    position: "absolute", bottom: "30%", left: "35%",
    fontSize: 28, zIndex: 5,
    display: "flex", flexDirection: "column", alignItems: "center",
  },
  pinPulse: {
    position: "absolute", top: 4, left: 4,
    width: 20, height: 20, borderRadius: "50%",
    background: "rgba(201,168,76,0.3)",
    animation: "pulsePing 1.5s ease-in-out infinite",
  },
  mapStatusBadge: {
    position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)",
    color: "#fff", fontSize: 13, fontWeight: 600,
    padding: "6px 16px", borderRadius: "var(--radius-pill)",
    zIndex: 6, boxShadow: "var(--shadow-sm)", fontFamily: "var(--font-body)",
  },

  panel: {
    background: "#fff", borderRadius: "24px 24px 0 0",
    padding: "24px 28px 32px",
    display: "flex", flexDirection: "column", gap: 16,
    boxShadow: "0 -4px 24px rgba(0,0,0,0.08)", zIndex: 10,
  },

  driverCard: {
    display: "flex", alignItems: "center", gap: 16,
    background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)", padding: "16px 18px",
  },
  driverAvatar: {
    width: 52, height: 52, borderRadius: "50%", background: "var(--gold)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "var(--font-display)", fontWeight: 700, color: "#fff", fontSize: 18,
    flexShrink: 0,
  },
  driverName: { fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--dark)" },
  driverMeta: { fontSize: 12, color: "var(--muted)", marginTop: 2 },
  matchBadge: {
    fontSize: 12, fontWeight: 600, color: "var(--success)",
    background: "#f0fdf4", border: "1px solid #bbf7d0",
    borderRadius: "var(--radius-pill)", padding: "4px 12px", flexShrink: 0,
  },

  rideDetails: {
    display: "flex", background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)", overflow: "hidden",
  },
  rideDetailItem: { flex: 1, padding: "12px 16px", display: "flex", flexDirection: "column", gap: 4, minWidth: 0 },
  rideDetailLabel: { fontSize: 10, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" },
  rideDetailVal: { fontSize: 12, fontWeight: 500, color: "var(--dark)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  rideDetailDivider: { width: "0.5px", background: "var(--border)", margin: "8px 0" },

  actions: { display: "flex", gap: 12 },
  actionBtn: {
    flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
    padding: "12px 0", background: "#fff", border: "1.5px solid var(--border)",
    borderRadius: "var(--radius-md)", cursor: "pointer",
    fontSize: 12, fontWeight: 500, color: "var(--dark)",
    fontFamily: "var(--font-body)", transition: "background 0.15s",
  },
  actionIcon: { fontSize: 18 },
};