/**
 * RideAway — Page 5: Payment
 * File: src/pages/Payment.jsx
 * Team member: assign to person responsible for payments
 */

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// ── Schema stub ──
// import { riderApi } from "../schema";
// TODO: call riderApi.processPayment(tripId, paymentMethodId)
// TODO: call riderApi.updateProfile to add loyaltyPoints earned

const TRIP = {
  from: "Main Library",
  to: "University Ave & 5th St",
  distance: "2.4 mi",
  duration: "8 min",
  baseFare: 2.00,
  distanceFare: 1.20,
  shareDiscount: -0.80,
  serviceFee: 0.10,
  get total() { return this.baseFare + this.distanceFare + this.shareDiscount + this.serviceFee; },
  pointsEarned: 35,
  driver: { name: "Marcus Kim", initials: "MK", rating: 4.9 },
};

export default function Payment() {
  const navigate = useNavigate();
  const [method, setMethod] = useState("card");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [paid, setPaid] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handlePay = async () => {
    setProcessing(true);
    // TODO: replace with real payment API call
    // const result = await riderApi.processPayment(tripId, method);
    await new Promise(r => setTimeout(r, 1200)); // simulate
    setProcessing(false);
    setPaid(true);
  };

  if (paid) {
    return (
      <div className="page" style={styles.successPage}>
        <div style={styles.successCard}>
          <div style={styles.successCircle}>✓</div>
          <h2 style={styles.successTitle}>Payment Confirmed!</h2>
          <p style={styles.successSub}>
            Thanks for riding with RideAway.<br />
            You earned <strong style={{ color: "var(--gold)" }}>{TRIP.pointsEarned} loyalty points</strong>!
          </p>

          {/* Rate your driver */}
          <div style={styles.rateBlock}>
            <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 12 }}>How was your ride with {TRIP.driver.name}?</p>
            <div style={styles.stars}>
              {[1, 2, 3, 4, 5].map(s => (
                <button
                  key={s}
                  style={{ ...styles.starBtn, color: s <= (hoverRating || rating) ? "#f59e0b" : "#ddd" }}
                  onClick={() => setRating(s)}
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                >★</button>
              ))}
            </div>
            {rating > 0 && <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 8 }}>Thanks for the feedback!</p>}
          </div>

          <Link to="/book">
            <button className="btn-gold" style={{ width: 240, padding: "14px 0" }}>Book Another Ride</button>
          </Link>
          <Link to="/">
            <button className="btn-outline" style={{ width: 240, padding: "13px 0", marginTop: 10 }}>Back to Home</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page" style={styles.page}>
      <div style={styles.container}>

        {/* ── Left: Receipt ── */}
        <div style={styles.receiptPanel}>
          <h2 style={styles.panelTitle}>Trip Summary</h2>

          <div style={styles.routeCard}>
            <div style={styles.routeRow}>
              <div style={{ ...styles.routeDot, background: "var(--gold)" }} />
              <div>
                <div style={styles.routeLabel}>From</div>
                <div style={styles.routeVal}>{TRIP.from}</div>
              </div>
            </div>
            <div style={styles.routeLine} />
            <div style={styles.routeRow}>
              <div style={{ ...styles.routeDot, background: "var(--dark)" }} />
              <div>
                <div style={styles.routeLabel}>To</div>
                <div style={styles.routeVal}>{TRIP.to}</div>
              </div>
            </div>
          </div>

          <div style={styles.statsRow}>
            <div style={styles.statItem}><span style={styles.statVal}>{TRIP.distance}</span><span style={styles.statLabel}>Distance</span></div>
            <div style={styles.statDivider} />
            <div style={styles.statItem}><span style={styles.statVal}>{TRIP.duration}</span><span style={styles.statLabel}>Duration</span></div>
            <div style={styles.statDivider} />
            <div style={styles.statItem}>
              <span style={{ ...styles.statVal, color: "var(--gold)" }}>+{TRIP.pointsEarned} pts</span>
              <span style={styles.statLabel}>Loyalty</span>
            </div>
          </div>

          <div style={styles.fareTable}>
            <div style={styles.fareRow}>
              <span style={styles.fareLabel}>Base fare</span>
              <span style={styles.fareVal}>${TRIP.baseFare.toFixed(2)}</span>
            </div>
            <div style={styles.fareRow}>
              <span style={styles.fareLabel}>Distance ({TRIP.distance})</span>
              <span style={styles.fareVal}>${TRIP.distanceFare.toFixed(2)}</span>
            </div>
            <div style={styles.fareRow}>
              <span style={styles.fareLabel}>Shared ride discount</span>
              <span style={{ ...styles.fareVal, color: "var(--success)" }}>${TRIP.shareDiscount.toFixed(2)}</span>
            </div>
            <div style={styles.fareRow}>
              <span style={styles.fareLabel}>Service fee</span>
              <span style={styles.fareVal}>${TRIP.serviceFee.toFixed(2)}</span>
            </div>
            <div style={{ height: "0.5px", background: "var(--border)", margin: "12px 0" }} />
            <div style={{ ...styles.fareRow }}>
              <span style={{ ...styles.fareLabel, color: "var(--gold)", fontWeight: 700, fontSize: 16 }}>Total</span>
              <span style={{ ...styles.fareVal, color: "var(--gold)", fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800 }}>
                ${TRIP.total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Driver summary */}
          <div style={styles.driverRow}>
            <div style={styles.driverAvatar}>{TRIP.driver.initials}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--dark)" }}>{TRIP.driver.name}</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Your driver · {TRIP.driver.rating}★</div>
            </div>
          </div>
        </div>

        {/* ── Right: Payment panel ── */}
        <div style={styles.payPanel}>
          <h2 style={styles.panelTitle}>Payment Method</h2>

          <div style={styles.methods}>
            {[
              { id: "card", icon: "💳", label: "Credit / Debit Card" },
              { id: "applepay", icon: "📱", label: "Apple Pay" },
              { id: "points", icon: "🎓", label: "Loyalty Points (350 pts)" },
            ].map(m => (
              <button
                key={m.id}
                style={{ ...styles.methodBtn, ...(method === m.id ? styles.methodActive : {}) }}
                onClick={() => setMethod(m.id)}
              >
                <span style={{ fontSize: 22 }}>{m.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{m.label}</span>
                <div style={{ ...styles.methodRadio, ...(method === m.id ? styles.methodRadioActive : {}) }} />
              </button>
            ))}
          </div>

          {method === "card" && (
            <div style={styles.cardForm}>
              <div className="input-wrap">
                <label className="input-label">Card Number</label>
                <input className="input-field" placeholder="•••• •••• •••• ••••" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="input-wrap">
                  <label className="input-label">Expiry</label>
                  <input className="input-field" placeholder="MM / YY" />
                </div>
                <div className="input-wrap">
                  <label className="input-label">CVC</label>
                  <input className="input-field" placeholder="•••" />
                </div>
              </div>
            </div>
          )}

          {method === "points" && (
            <div style={styles.pointsNote}>
              🎓 You have <strong>350 loyalty points</strong> — enough to cover this ride!
              You'll have <strong>315 pts</strong> remaining.
            </div>
          )}

          <div style={styles.totalRow}>
            <span style={{ fontSize: 16, color: "var(--muted)" }}>Amount due</span>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, color: "var(--dark)" }}>
              ${TRIP.total.toFixed(2)}
            </span>
          </div>

          <button
            className="btn-gold"
            style={{ width: "100%", fontSize: 17, padding: "18px 0" }}
            onClick={handlePay}
            disabled={processing}
          >
            {processing ? "Processing..." : `Pay $${TRIP.total.toFixed(2)} →`}
          </button>

          <p style={{ fontSize: 12, color: "var(--faint)", textAlign: "center", marginTop: 12 }}>
            🔒 Secured by RideAway. Your payment info is never stored.
          </p>
        </div>

      </div>
    </div>
  );
}

const styles = {
  page: { background: "#f7f5f0" },
  container: {
    display: "flex", gap: 0, maxWidth: 960,
    margin: "0 auto", padding: "40px 24px",
    flexWrap: "wrap",
  },

  receiptPanel: {
    flex: "1 1 400px", background: "#fff", borderRadius: "var(--radius-xl) 0 0 var(--radius-xl)",
    padding: "36px 32px", display: "flex", flexDirection: "column", gap: 20,
    borderRight: "0.5px solid var(--border)",
  },
  payPanel: {
    flex: "1 1 360px", background: "#fff", borderRadius: "0 var(--radius-xl) var(--radius-xl) 0",
    padding: "36px 32px", display: "flex", flexDirection: "column", gap: 20,
  },
  panelTitle: { fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "var(--black)" },

  routeCard: {
    background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)", padding: "16px 18px",
  },
  routeRow: { display: "flex", alignItems: "center", gap: 14 },
  routeDot: { width: 12, height: 12, borderRadius: "50%", flexShrink: 0 },
  routeLine: { width: 2, height: 20, background: "var(--border)", margin: "4px 0 4px 5px" },
  routeLabel: { fontSize: 10, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" },
  routeVal: { fontSize: 14, fontWeight: 500, color: "var(--dark)" },

  statsRow: {
    display: "flex", background: "var(--gold-pale)",
    border: "1px solid var(--gold-border)", borderRadius: "var(--radius-md)",
    overflow: "hidden",
  },
  statItem: { flex: 1, padding: "12px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 },
  statVal: { fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--dark)" },
  statLabel: { fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.4px" },
  statDivider: { width: "0.5px", background: "var(--gold-border)", margin: "8px 0" },

  fareTable: {
    display: "flex", flexDirection: "column", gap: 8,
    background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)", padding: "16px 18px",
  },
  fareRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  fareLabel: { fontSize: 14, color: "var(--muted)" },
  fareVal: { fontSize: 14, fontWeight: 500, color: "var(--dark)" },

  driverRow: {
    display: "flex", alignItems: "center", gap: 14,
    padding: "14px 16px", background: "var(--surface)",
    border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
  },
  driverAvatar: {
    width: 44, height: 44, borderRadius: "50%", background: "var(--gold)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "var(--font-display)", fontWeight: 700, color: "#fff", fontSize: 15,
  },

  methods: { display: "flex", flexDirection: "column", gap: 10 },
  methodBtn: {
    display: "flex", alignItems: "center", gap: 14,
    padding: "14px 18px", background: "#fff",
    border: "1.5px solid var(--border)", borderRadius: "var(--radius-md)",
    cursor: "pointer", fontFamily: "var(--font-body)", color: "var(--dark)",
    transition: "all 0.15s", textAlign: "left",
  },
  methodActive: {
    border: "1.5px solid var(--gold)", background: "var(--gold-pale)",
  },
  methodRadio: {
    width: 18, height: 18, borderRadius: "50%",
    border: "2px solid var(--border)", marginLeft: "auto", flexShrink: 0,
    transition: "all 0.15s",
  },
  methodRadioActive: { border: "5px solid var(--gold)" },

  cardForm: { display: "flex", flexDirection: "column", gap: 14 },
  pointsNote: {
    background: "var(--gold-pale)", border: "1px solid var(--gold-border)",
    borderRadius: "var(--radius-sm)", padding: "12px 16px",
    fontSize: 13, color: "var(--gold-dark)", lineHeight: 1.6,
  },

  totalRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "16px 0", borderTop: "0.5px solid var(--border)",
  },

  // Success screen
  successPage: {
    background: "#f7f5f0", display: "flex",
    alignItems: "center", justifyContent: "center",
    minHeight: "calc(100vh - 64px)", padding: 24,
  },
  successCard: {
    background: "#fff", borderRadius: "var(--radius-xl)",
    padding: "48px 40px", maxWidth: 420, width: "100%",
    textAlign: "center", boxShadow: "var(--shadow-lg)",
    display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
  },
  successCircle: {
    width: 72, height: 72, borderRadius: "50%", background: "var(--gold)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 32, color: "#fff",
    animation: "scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  },
  successTitle: { fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "var(--dark)" },
  successSub: { fontSize: 15, color: "var(--muted)", lineHeight: 1.7 },
  rateBlock: { padding: "16px 24px", background: "var(--surface)", borderRadius: "var(--radius-md)", width: "100%" },
  stars: { display: "flex", gap: 4, justifyContent: "center" },
  starBtn: {
    fontSize: 32, background: "none", border: "none", cursor: "pointer",
    transition: "color 0.1s", lineHeight: 1,
  },
};
