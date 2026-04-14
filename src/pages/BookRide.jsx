/**
 * RideAway — Page 3: Book a Ride
 * File: src/pages/BookRide.jsx
 * Team member: assign to person responsible for booking flow
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// ── Schema stub ──
// import { riderApi } from "../schema";
// When ready: call riderApi to POST a trip request

export default function BookRide() {
  const navigate = useNavigate();

  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [seats, setSeats] = useState(1);
  const [shared, setShared] = useState(true);
  const [rideType, setRideType] = useState("standard");
  const [step, setStep] = useState(1); // 1 = input, 2 = confirm

  const estimatedFare = shared ? "$3.50" : "$5.20";
  const estimatedTime = "~8 min";
  const estimatedDist = "2.4 mi";

  const handleFindDriver = () => {
    if (!pickup || !dropoff) return;
    // TODO: call riderApi to POST trip
    // const trip = await riderApi.requestTrip({ pickup, dropoff, seats, shared, rideType });
    navigate("/matching");
  };

  return (
    <div className="page" style={styles.page}>
      <div style={styles.layout}>

        {/* ── Left: Form panel ── */}
        <div style={styles.formPanel}>
          <div style={styles.formHeader}>
            <h1 style={styles.title}>Where to?</h1>
            <p style={styles.sub}>Enter your pickup and destination</p>
          </div>

          {/* Location inputs */}
          <div style={styles.locationCard}>
            <div style={styles.locRow}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <div style={{ ...styles.dot, background: "var(--gold)" }} />
                <div style={styles.dotLine} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={styles.locLabel}>Pickup</div>
                <input
                  className="input-field"
                  style={{ border: "none", background: "transparent", padding: "4px 0", fontSize: 15 }}
                  placeholder="Enter pickup location..."
                  value={pickup}
                  onChange={e => setPickup(e.target.value)}
                />
              </div>
            </div>
            <div style={styles.locDivider} />
            <div style={styles.locRow}>
              <div style={{ ...styles.dot, background: "var(--black)" }} />
              <div style={{ flex: 1 }}>
                <div style={styles.locLabel}>Drop-off</div>
                <input
                  className="input-field"
                  style={{ border: "none", background: "transparent", padding: "4px 0", fontSize: 15 }}
                  placeholder="Where are you headed?"
                  value={dropoff}
                  onChange={e => setDropoff(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Quick Suggestions */}
          <div style={styles.suggestions}>
            <p style={styles.suggestLabel}>Recent & Popular</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {["Main Library", "Student Union", "Rec Center", "Off-Campus Apartments"].map(loc => (
                <button key={loc} style={styles.suggestItem} onClick={() => !pickup ? setPickup(loc) : setDropoff(loc)}>
                  <span style={styles.suggestIcon}>📍</span>
                  <span style={{ fontSize: 14, color: "var(--dark)" }}>{loc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Ride options */}
          <div style={styles.optionsRow}>
            {/* Seats */}
            <div style={styles.optionBox}>
              <div style={styles.optionLabel}>Seats</div>
              <div style={styles.counter}>
                <button style={styles.counterBtn} onClick={() => setSeats(Math.max(1, seats - 1))}>−</button>
                <span style={styles.counterVal}>{seats}</span>
                <button style={styles.counterBtn} onClick={() => setSeats(Math.min(4, seats + 1))}>+</button>
              </div>
            </div>

            {/* Share toggle */}
            <div style={styles.optionBox}>
              <div style={styles.optionLabel}>Share Ride</div>
              <div
                className={`toggle-switch ${shared ? "on" : "off"}`}
                onClick={() => setShared(!shared)}
                style={{ margin: "8px auto 0" }}
              >
                <div className="toggle-knob" />
              </div>
            </div>

            {/* Ride type */}
            <div style={{ ...styles.optionBox, flex: 2 }}>
              <div style={styles.optionLabel}>Ride Type</div>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                {["standard", "express"].map(t => (
                  <button
                    key={t}
                    style={{
                      ...styles.typeBtn,
                      ...(rideType === t ? styles.typeBtnActive : {}),
                    }}
                    onClick={() => setRideType(t)}
                  >
                    {t === "standard" ? "🚗 Standard" : "⚡ Express"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Fare estimate */}
          {pickup && dropoff && (
            <div style={styles.fareEstimate}>
              <div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>Estimated fare</div>
                <div style={{ fontSize: 12, color: "var(--faint)", marginTop: 2 }}>{estimatedDist} · {estimatedTime}</div>
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "var(--gold)" }}>
                {estimatedFare}
              </div>
            </div>
          )}

          {shared && (
            <div style={styles.sharedNote}>
              💰 Sharing this ride saves you up to 35% vs riding solo
            </div>
          )}

          <button
            className="btn-gold"
            style={{ width: "100%", fontSize: 16, padding: "16px 0", marginTop: 4 }}
            onClick={handleFindDriver}
            disabled={!pickup || !dropoff}
          >
            Find My Driver →
          </button>
        </div>

        {/* ── Right: Map placeholder ── */}
        <div style={styles.mapPanel}>
          <div style={styles.mapPlaceholder}>
            <div style={styles.mapGrid} />
            <div style={{ ...styles.mapRoad, top: "45%", left: 0, right: 0, height: 8 }} />
            <div style={{ ...styles.mapRoad, top: "65%", left: 0, right: 0, height: 6 }} />
            <div style={{ ...styles.mapRoad, left: "40%", top: 0, bottom: 0, width: 8, height: "100%" }} />
            <div style={{ ...styles.mapRoad, left: "65%", top: 0, bottom: 0, width: 6, height: "100%" }} />
            <div style={styles.mapCar}>🚗</div>
            {pickup && <div style={styles.mapPinA}>📍<span style={styles.pinLabel}>You</span></div>}
            {dropoff && <div style={styles.mapPinB}>🏁<span style={styles.pinLabel}>Dest</span></div>}
            {!pickup && !dropoff && (
              <div style={styles.mapOverlay}>
                <p style={{ color: "#888", fontSize: 15 }}>Enter locations to see your route</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

const styles = {
  page: { background: "#f7f5f0" },
  layout: {
    display: "flex", height: "calc(100vh - 64px)",
  },
  formPanel: {
    width: 440, flexShrink: 0,
    background: "#fff", padding: "36px 32px",
    overflowY: "auto",
    display: "flex", flexDirection: "column", gap: 20,
    borderRight: "0.5px solid var(--border)",
  },
  formHeader: {},
  title: { fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "var(--black)", marginBottom: 6 },
  sub: { fontSize: 14, color: "var(--muted)" },

  locationCard: {
    border: "1.5px solid var(--border)", borderRadius: "var(--radius-md)",
    overflow: "hidden", background: "var(--surface)",
  },
  locRow: { padding: "12px 16px", display: "flex", alignItems: "center", gap: 14 },
  locLabel: { fontSize: 10, color: "var(--gold)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 2 },
  dot: { width: 12, height: 12, borderRadius: "50%", flexShrink: 0 },
  dotLine: { width: 2, height: 20, background: "var(--border)", borderRadius: 1 },
  locDivider: { height: "0.5px", background: "var(--border)", margin: "0 16px" },

  suggestions: {},
  suggestLabel: { fontSize: 11, color: "var(--faint)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 },
  suggestItem: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "10px 14px", background: "var(--surface)",
    border: "1px solid var(--border)", borderRadius: "var(--radius-sm)",
    cursor: "pointer", textAlign: "left", width: "100%",
    fontFamily: "var(--font-body)", transition: "background 0.15s",
  },
  suggestIcon: { fontSize: 16 },

  optionsRow: { display: "flex", gap: 12 },
  optionBox: {
    flex: 1, background: "var(--surface)", border: "1.5px solid var(--border)",
    borderRadius: "var(--radius-md)", padding: "12px 14px", textAlign: "center",
  },
  optionLabel: { fontSize: 11, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" },
  counter: { display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 6 },
  counterBtn: {
    width: 28, height: 28, borderRadius: "50%", border: "1.5px solid var(--border)",
    background: "#fff", fontSize: 16, cursor: "pointer", lineHeight: 1,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "var(--font-body)",
  },
  counterVal: { fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, minWidth: 20 },
  typeBtn: {
    flex: 1, padding: "8px 0", borderRadius: "var(--radius-sm)",
    border: "1.5px solid var(--border)", background: "#fff",
    fontSize: 12, cursor: "pointer", fontFamily: "var(--font-body)",
    color: "var(--muted)", transition: "all 0.15s",
  },
  typeBtnActive: {
    background: "var(--gold-pale)", borderColor: "var(--gold)", color: "var(--gold-dark)", fontWeight: 500,
  },
  fareEstimate: {
    background: "var(--gold-pale)", border: "1px solid var(--gold-border)",
    borderRadius: "var(--radius-md)", padding: "16px 20px",
    display: "flex", justifyContent: "space-between", alignItems: "center",
  },
  sharedNote: {
    background: "#f0f9ff", border: "1px solid #bae6fd",
    borderRadius: "var(--radius-sm)", padding: "10px 14px",
    fontSize: 13, color: "#0369a1",
  },

  mapPanel: { flex: 1, position: "relative" },
  mapPlaceholder: {
    width: "100%", height: "100%",
    background: "#e8f0e0", position: "relative", overflow: "hidden",
  },
  mapGrid: {
    position: "absolute", inset: 0,
    backgroundImage: "repeating-linear-gradient(0deg,rgba(0,0,0,0.04) 0,rgba(0,0,0,0.04) 1px,transparent 1px,transparent 48px),repeating-linear-gradient(90deg,rgba(0,0,0,0.04) 0,rgba(0,0,0,0.04) 1px,transparent 1px,transparent 48px)",
  },
  mapRoad: { position: "absolute", background: "#d4c89a" },
  mapCar: {
    position: "absolute", top: "42%", left: "37%",
    fontSize: 28, animation: "carMove 4s ease-in-out infinite",
  },
  mapPinA: { position: "absolute", top: "38%", left: "38%", fontSize: 24, display: "flex", flexDirection: "column", alignItems: "center" },
  mapPinB: { position: "absolute", bottom: "28%", right: "30%", fontSize: 24, display: "flex", flexDirection: "column", alignItems: "center" },
  pinLabel: {
    fontSize: 11, fontWeight: 600, background: "var(--dark)", color: "#fff",
    padding: "2px 7px", borderRadius: 20, marginTop: 2, fontFamily: "var(--font-body)",
  },
  mapOverlay: {
    position: "absolute", inset: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "rgba(255,255,255,0.3)",
  },
};
