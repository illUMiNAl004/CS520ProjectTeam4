/**
 * RideAway — Page 4: Driver Matching
 * File: src/pages/Matching.jsx
 * Team member: assign to person responsible for matching/live tracking
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ── Schema stub ──
// import { riderApi } from "../schema";
// TODO: poll riderApi.getTripStatus(tripId) for real-time updates
// TODO: connect to WebSocket for live driver location

const MOCK_DRIVER = {
  name: "Marcus Kim",
  initials: "MK",
  vehicle: "Honda Civic · White",
  plate: "ABC 1234",
  rating: 4.9,
  rides: 142,
  eta: 4,
};

export default function Matching() {
  const navigate = useNavigate();
  const [etaSeconds, setEtaSeconds] = useState(MOCK_DRIVER.eta * 60);
  const [status, setStatus] = useState("en_route"); // en_route | arrived | in_ride
  const [carPos, setCarPos] = useState({ x: 120, y: 140 });

  useEffect(() => {
    // Simulate car movement
    const move = setInterval(() => {
      setCarPos(p => ({
        x: p.x + (Math.random() - 0.4) * 6,
        y: p.y + (Math.random() - 0.4) * 3,
      }));
    }, 800);

    // Countdown ETA
    const tick = setInterval(() => {
      setEtaSeconds(s => {
        if (s <= 0) { clearInterval(tick); setStatus("arrived"); return 0; }
        return s - 1;
      });
    }, 1000);

    return () => { clearInterval(move); clearInterval(tick); };
  }, []);

  const etaDisplay = status === "arrived"
    ? "Arrived!"
    : `${Math.floor(etaSeconds / 60)}:${String(etaSeconds % 60).padStart(2, "0")}`;

  return (
    <div className="page" style={styles.page}>
      <div style={styles.layout}>

        {/* ── Map ── */}
        <div style={styles.mapArea}>
          <div style={styles.mapBg}>
            <div style={styles.mapGrid} />
            {/* Roads */}
            <div style={{ ...styles.road, top: "45%", left: 0, right: 0, height: 10 }} />
            <div style={{ ...styles.road, top: "25%", left: 0, right: 0, height: 6 }} />
            <div style={{ ...styles.road, top: "70%", left: 0, right: 0, height: 6 }} />
            <div style={{ ...styles.road, left: "35%", top: 0, bottom: 0, width: 10 }} />
            <div style={{ ...styles.road, left: "60%", top: 0, bottom: 0, width: 6 }} />

            {/* Animated car */}
            <div style={{
              ...styles.mapCar,
              left: Math.max(40, Math.min(carPos.x, 400)),
              top: Math.max(40, Math.min(carPos.y, 200)),
            }}>
              🚗
            </div>

            {/* Pickup pin */}
            <div style={styles.pickupPin}>
              <div style={styles.pinPulse} />
              📍
            </div>

            {/* Status badge on map */}
            <div style={{
              ...styles.mapStatusBadge,
              background: status === "arrived" ? "var(--success)" : "var(--gold)",
            }}>
              {status === "arrived" ? "✓ Driver Arrived!" : "● Driver En Route"}
            </div>
          </div>
        </div>

        {/* ── Bottom panel ── */}
        <div style={styles.panel}>

          {/* ETA bar */}
          <div style={{
            ...styles.etaBar,
            background: status === "arrived" ? "var(--success)" : "var(--dark)",
          }}>
            <div>
              <div style={styles.etaLabel}>{status === "arrived" ? "Your driver is here!" : "Arriving in"}</div>
              <div style={styles.etaTime}>{etaDisplay}</div>
            </div>
            <div style={styles.etaBadge}>
              {status === "arrived" ? "Check outside" : "En route"}
            </div>
          </div>

          {/* Driver card */}
          <div style={styles.driverCard}>
            <div style={styles.driverAvatar}>{MOCK_DRIVER.initials}</div>
            <div style={{ flex: 1 }}>
              <div style={styles.driverName}>{MOCK_DRIVER.name}</div>
              <div style={styles.driverMeta}>{MOCK_DRIVER.vehicle} · {MOCK_DRIVER.plate}</div>
              <div style={styles.driverMeta}>{MOCK_DRIVER.rides} rides completed</div>
            </div>
            <div style={styles.ratingBlock}>
              <div style={styles.ratingNum}>{MOCK_DRIVER.rating}</div>
              <div style={styles.ratingStars}>★★★★★</div>
            </div>
          </div>

          {/* Ride details strip */}
          <div style={styles.rideDetails}>
            <div style={styles.rideDetailItem}>
              <span style={styles.rideDetailLabel}>From</span>
              <span style={styles.rideDetailVal}>Main Library</span>
            </div>
            <div style={styles.rideDetailDivider} />
            <div style={styles.rideDetailItem}>
              <span style={styles.rideDetailLabel}>To</span>
              <span style={styles.rideDetailVal}>University Ave & 5th</span>
            </div>
            <div style={styles.rideDetailDivider} />
            <div style={styles.rideDetailItem}>
              <span style={styles.rideDetailLabel}>Fare</span>
              <span style={{ ...styles.rideDetailVal, color: "var(--gold)", fontFamily: "var(--font-display)", fontWeight: 700 }}>$3.50</span>
            </div>
          </div>

          {/* Action buttons */}
          <div style={styles.actions}>
            <button style={styles.actionBtn}>
              <span style={styles.actionIcon}>💬</span>
              <span>Message</span>
            </button>
            <button style={styles.actionBtn}>
              <span style={styles.actionIcon}>📞</span>
              <span>Call</span>
            </button>
            <button style={{ ...styles.actionBtn, color: "var(--danger)", borderColor: "#fca5a5" }}>
              <span style={styles.actionIcon}>✕</span>
              <span>Cancel</span>
            </button>
          </div>

          {status === "arrived" && (
            <button
              className="btn-gold"
              style={{ width: "100%", fontSize: 16, padding: "16px 0" }}
              onClick={() => navigate("/payment")}
            >
              I'm in the car — Start Ride →
            </button>
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
  mapCar: {
    position: "absolute",
    fontSize: 28, zIndex: 5,
    filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.2))",
    transition: "left 0.8s ease, top 0.8s ease",
  },
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
    zIndex: 6, boxShadow: "var(--shadow-sm)",
    fontFamily: "var(--font-body)",
  },

  panel: {
    background: "#fff", borderRadius: "24px 24px 0 0",
    padding: "24px 28px 32px",
    display: "flex", flexDirection: "column", gap: 16,
    boxShadow: "0 -4px 24px rgba(0,0,0,0.08)",
    zIndex: 10,
  },
  etaBar: {
    borderRadius: "var(--radius-md)", padding: "16px 20px",
    display: "flex", justifyContent: "space-between", alignItems: "center",
    transition: "background 0.4s",
  },
  etaLabel: { fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 500 },
  etaTime: { fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "#fff" },
  etaBadge: {
    fontSize: 12, background: "rgba(255,255,255,0.15)", color: "#fff",
    padding: "6px 14px", borderRadius: "var(--radius-pill)",
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
  ratingBlock: { textAlign: "center" },
  ratingNum: { fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: "var(--gold)" },
  ratingStars: { fontSize: 11, color: "var(--gold)" },

  rideDetails: {
    display: "flex", background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)", overflow: "hidden",
  },
  rideDetailItem: { flex: 1, padding: "12px 16px", display: "flex", flexDirection: "column", gap: 4 },
  rideDetailLabel: { fontSize: 10, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" },
  rideDetailVal: { fontSize: 13, fontWeight: 500, color: "var(--dark)" },
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
