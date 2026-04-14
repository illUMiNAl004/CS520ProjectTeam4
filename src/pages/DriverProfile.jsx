/**
 * RideAway — Page 6: Driver Profile
 * File: src/pages/DriverProfile.jsx
 * Team member: assign to person responsible for driver dashboard
 */

import React, { useState } from "react";

// ── Schema stubs ──
import { DRIVER_SCHEMA_SHAPE, driverApi } from "../schema";
// TODO: on mount, call driverApi.getProfile(driverId) to load real data
// TODO: on save, call driverApi.updateGuidelines and driverApi.updatePreferences

const MOCK_DRIVER = {
  ...DRIVER_SCHEMA_SHAPE,
  id: "mock_001",
  firstName: "Marcus",
  lastName: "Kim",
  initials: "MK",
  university: "UCLA",
  vehicle: { make: "Honda", model: "Civic", year: 2021, color: "White", licensePlate: "ABC 1234", maxSeats: 4 },
  rating: 4.9,
  totalRides: 142,
  totalEarned: 51200, // cents → $512
  acceptanceRate: 0.94,
  guidelines: {
    noSmoking: true, musicOn: true, quietRide: false,
    noPets: true, noFood: false, maxRiders: 2,
    acAlwaysOn: false, luggageOk: false, customNote: null,
  },
  preferences: {
    allowSharedRides: true, campusRoutesOnly: false,
    verifiedRidersOnly: true, isOnline: true,
  },
  licenseVerified: true,
  backgroundChecked: true,
  vehicleInspected: false,
};

const GUIDELINE_OPTIONS = [
  { key: "noSmoking", label: "No smoking", icon: "🚭" },
  { key: "musicOn", label: "Music on", icon: "🎵" },
  { key: "quietRide", label: "Quiet ride", icon: "🤫" },
  { key: "noPets", label: "No pets", icon: "🐾" },
  { key: "noFood", label: "No food", icon: "🍔" },
  { key: "acAlwaysOn", label: "AC always on", icon: "❄️" },
  { key: "luggageOk", label: "Luggage ok", icon: "🧳" },
];

export default function DriverProfile() {
  const [driver, setDriver] = useState(MOCK_DRIVER);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("guidelines"); // guidelines | stats | vehicle

  const toggleOnline = async () => {
    const newStatus = !driver.preferences.isOnline;
    setDriver(d => ({ ...d, preferences: { ...d.preferences, isOnline: newStatus } }));
    // TODO: await driverApi.setOnlineStatus(driver.id, newStatus);
  };

  const toggleGuideline = (key) => {
    setDriver(d => ({
      ...d,
      guidelines: { ...d.guidelines, [key]: !d.guidelines[key] },
    }));
  };

  const togglePref = (key) => {
    setDriver(d => ({
      ...d,
      preferences: { ...d.preferences, [key]: !d.preferences[key] },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    // TODO: wire up real save
    // await driverApi.updateGuidelines(driver.id, driver.guidelines);
    // await driverApi.updatePreferences(driver.id, driver.preferences);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="page" style={styles.page}>
      <div style={styles.layout}>

        {/* ── Sidebar ── */}
        <aside style={styles.sidebar}>
          {/* Profile hero */}
          <div style={styles.profileHero}>
            <div style={styles.profileAvatar}>{driver.initials || `${driver.firstName[0]}${driver.lastName[0]}`}</div>
            <div>
              <div style={styles.profileName}>{driver.firstName} {driver.lastName}</div>
              <div style={styles.profileUni}>{driver.university}</div>
            </div>

            {/* Online toggle */}
            <div style={styles.onlineRow}>
              <div>
                <div style={{ fontSize: 13, color: "#fff", fontWeight: 500 }}>
                  {driver.preferences.isOnline ? "🟢 Online" : "⚫ Offline"}
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                  {driver.preferences.isOnline ? "Accepting requests" : "Not accepting"}
                </div>
              </div>
              <div
                className={`toggle-switch ${driver.preferences.isOnline ? "on" : "off"}`}
                onClick={toggleOnline}
              >
                <div className="toggle-knob" />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={styles.statsGrid}>
            {[
              { val: driver.rating, label: "Rating", unit: "★" },
              { val: driver.totalRides, label: "Rides", unit: "" },
              { val: `$${(driver.totalEarned / 100).toFixed(0)}`, label: "Earned", unit: "" },
              { val: `${Math.round(driver.acceptanceRate * 100)}%`, label: "Acceptance", unit: "" },
            ].map(s => (
              <div key={s.label} style={styles.statCard}>
                <div style={styles.statVal}>{s.val}{s.unit}</div>
                <div style={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Verification badges */}
          <div style={styles.verifySection}>
            <div style={styles.sectionLabel}>Verification</div>
            <div style={styles.badges}>
              {[
                { label: "License", ok: driver.licenseVerified },
                { label: "Background", ok: driver.backgroundChecked },
                { label: "Vehicle", ok: driver.vehicleInspected },
              ].map(b => (
                <div key={b.label} style={{ ...styles.badge, ...(b.ok ? styles.badgeOk : styles.badgePending) }}>
                  {b.ok ? "✓" : "⏳"} {b.label}
                </div>
              ))}
            </div>
          </div>

          {/* Vehicle */}
          <div style={styles.vehicleCard}>
            <div style={styles.sectionLabel}>Vehicle</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginTop: 8 }}>
              {driver.vehicle.year} {driver.vehicle.make} {driver.vehicle.model}
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
              {driver.vehicle.color} · {driver.vehicle.licensePlate} · {driver.vehicle.maxSeats} seats
            </div>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main style={styles.main}>
          {/* Tabs */}
          <div style={styles.tabs}>
            {["guidelines", "preferences", "vehicle"].map(tab => (
              <button
                key={tab}
                style={{ ...styles.tab, ...(activeTab === tab ? styles.tabActive : {}) }}
                onClick={() => setActiveTab(tab)}
              >
                {{ guidelines: "🎯 Ride Guidelines", preferences: "⚙️ Preferences", vehicle: "🚗 Vehicle Info" }[tab]}
              </button>
            ))}
          </div>

          {/* ── Guidelines tab ── */}
          {activeTab === "guidelines" && (
            <div style={styles.tabContent}>
              <div style={styles.tabHeader}>
                <h2 style={styles.tabTitle}>Ride Guidelines</h2>
                <p style={styles.tabSub}>Set your rules — riders will see these before booking your car.</p>
              </div>

              <div style={styles.chipsGrid}>
                {GUIDELINE_OPTIONS.map(opt => (
                  <button
                    key={opt.key}
                    className={`chip ${driver.guidelines[opt.key] ? "active" : ""}`}
                    style={{ fontSize: 14, padding: "10px 18px" }}
                    onClick={() => toggleGuideline(opt.key)}
                  >
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>

              {/* Max riders */}
              <div style={styles.sliderSection}>
                <div style={styles.sliderLabel}>
                  Max Riders per Trip
                  <span style={styles.sliderVal}>{driver.guidelines.maxRiders}</span>
                </div>
                <input
                  type="range" min={1} max={4} step={1}
                  value={driver.guidelines.maxRiders}
                  onChange={e => setDriver(d => ({ ...d, guidelines: { ...d.guidelines, maxRiders: +e.target.value } }))}
                  style={{ width: "100%", accentColor: "var(--gold)" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)" }}>
                  <span>1 rider</span><span>4 riders</span>
                </div>
              </div>

              {/* Custom note */}
              <div className="input-wrap">
                <label className="input-label">Custom Note to Riders (optional)</label>
                <textarea
                  className="input-field"
                  rows={3}
                  placeholder='e.g. "Please be ready at the pickup spot — I can only wait 2 minutes."'
                  value={driver.guidelines.customNote || ""}
                  onChange={e => setDriver(d => ({ ...d, guidelines: { ...d.guidelines, customNote: e.target.value } }))}
                  style={{ resize: "vertical" }}
                />
              </div>
            </div>
          )}

          {/* ── Preferences tab ── */}
          {activeTab === "preferences" && (
            <div style={styles.tabContent}>
              <div style={styles.tabHeader}>
                <h2 style={styles.tabTitle}>Trip Preferences</h2>
                <p style={styles.tabSub}>Control how and what rides you accept.</p>
              </div>

              <div style={styles.prefsList}>
                {[
                  { key: "allowSharedRides", icon: "👥", label: "Allow shared rides", sub: "Multiple passengers per trip" },
                  { key: "campusRoutesOnly", icon: "🗺️", label: "Campus routes only", sub: "Limit pickups to on-campus locations" },
                  { key: "verifiedRidersOnly", icon: "⭐", label: "Verified riders only", sub: "University email verification required" },
                ].map(pref => (
                  <div key={pref.key} style={styles.prefRow}>
                    <div style={styles.prefIcon}>{pref.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={styles.prefLabel}>{pref.label}</div>
                      <div style={styles.prefSub}>{pref.sub}</div>
                    </div>
                    <div
                      className={`toggle-switch ${driver.preferences[pref.key] ? "on" : "off"}`}
                      onClick={() => togglePref(pref.key)}
                    >
                      <div className="toggle-knob" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Vehicle tab ── */}
          {activeTab === "vehicle" && (
            <div style={styles.tabContent}>
              <div style={styles.tabHeader}>
                <h2 style={styles.tabTitle}>Vehicle Info</h2>
                <p style={styles.tabSub}>Keep your vehicle details up to date.</p>
              </div>
              <div style={styles.vehicleForm}>
                {[
                  { label: "Make", key: "make", placeholder: "Honda" },
                  { label: "Model", key: "model", placeholder: "Civic" },
                  { label: "Year", key: "year", placeholder: "2021" },
                  { label: "Color", key: "color", placeholder: "White" },
                  { label: "License Plate", key: "licensePlate", placeholder: "ABC 1234" },
                ].map(f => (
                  <div key={f.key} className="input-wrap">
                    <label className="input-label">{f.label}</label>
                    <input
                      className="input-field"
                      placeholder={f.placeholder}
                      value={driver.vehicle[f.key] || ""}
                      onChange={e => setDriver(d => ({ ...d, vehicle: { ...d.vehicle, [f.key]: e.target.value } }))}
                    />
                  </div>
                ))}
                <div className="input-wrap">
                  <label className="input-label">Max Seats</label>
                  <input
                    className="input-field" type="number" min={1} max={7}
                    value={driver.vehicle.maxSeats}
                    onChange={e => setDriver(d => ({ ...d, vehicle: { ...d.vehicle, maxSeats: +e.target.value } }))}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Save button (always visible) */}
          <div style={styles.saveBar}>
            {saved && <span style={styles.savedMsg}>✓ Profile saved successfully!</span>}
            <button
              className="btn-gold"
              style={{ padding: "14px 40px", fontSize: 15 }}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </main>

      </div>
    </div>
  );
}

const styles = {
  page: { background: "#f7f5f0" },
  layout: { display: "flex", minHeight: "calc(100vh - 64px)" },

  sidebar: {
    width: 300, flexShrink: 0,
    background: "var(--dark)",
    padding: "32px 24px",
    display: "flex", flexDirection: "column", gap: 24,
    overflowY: "auto",
  },
  profileHero: {
    display: "flex", flexDirection: "column", gap: 16,
    paddingBottom: 24, borderBottom: "0.5px solid rgba(255,255,255,0.1)",
  },
  profileAvatar: {
    width: 64, height: 64, borderRadius: "50%", background: "var(--gold)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "var(--font-display)", fontWeight: 800, color: "#fff", fontSize: 22,
  },
  profileName: { fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, color: "#fff" },
  profileUni: { fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 },
  onlineRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    background: "rgba(255,255,255,0.06)", borderRadius: "var(--radius-md)", padding: "12px 14px",
  },

  statsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  statCard: {
    background: "rgba(255,255,255,0.06)", borderRadius: "var(--radius-sm)",
    padding: "12px 10px", textAlign: "center",
  },
  statVal: { fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, color: "var(--gold)" },
  statLabel: { fontSize: 11, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.4px", marginTop: 2 },

  sectionLabel: {
    fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10,
  },
  verifySection: {},
  badges: { display: "flex", flexDirection: "column", gap: 8 },
  badge: { fontSize: 12, fontWeight: 500, padding: "6px 12px", borderRadius: "var(--radius-sm)" },
  badgeOk: { background: "rgba(34,167,34,0.15)", color: "#4ade80" },
  badgePending: { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" },

  vehicleCard: {
    background: "rgba(255,255,255,0.06)", borderRadius: "var(--radius-md)", padding: "14px",
  },

  main: { flex: 1, padding: "32px 40px", display: "flex", flexDirection: "column", gap: 28, overflowY: "auto" },
  tabs: { display: "flex", gap: 4, background: "var(--surface)", borderRadius: "var(--radius-pill)", padding: 4, width: "fit-content" },
  tab: {
    padding: "8px 20px", borderRadius: "var(--radius-pill)", border: "none",
    background: "transparent", fontSize: 13, fontWeight: 500, color: "var(--muted)",
    cursor: "pointer", fontFamily: "var(--font-body)", transition: "all 0.2s",
  },
  tabActive: { background: "var(--gold)", color: "#fff", boxShadow: "var(--shadow-gold)" },

  tabContent: { display: "flex", flexDirection: "column", gap: 24 },
  tabHeader: {},
  tabTitle: { fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: "var(--black)", marginBottom: 6 },
  tabSub: { fontSize: 14, color: "var(--muted)" },

  chipsGrid: { display: "flex", flexWrap: "wrap", gap: 10 },

  sliderSection: {
    background: "#fff", border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)", padding: "20px 22px",
  },
  sliderLabel: { display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 500, color: "var(--dark)", marginBottom: 14 },
  sliderVal: { fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: "var(--gold)" },

  prefsList: { display: "flex", flexDirection: "column", gap: 12 },
  prefRow: {
    display: "flex", alignItems: "center", gap: 16,
    background: "#fff", border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)", padding: "16px 20px",
  },
  prefIcon: { fontSize: 22, width: 28, textAlign: "center" },
  prefLabel: { fontSize: 14, fontWeight: 500, color: "var(--dark)" },
  prefSub: { fontSize: 12, color: "var(--muted)", marginTop: 2 },

  vehicleForm: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },

  saveBar: {
    display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 16,
    borderTop: "0.5px solid var(--border)", paddingTop: 24, marginTop: "auto",
  },
  savedMsg: {
    fontSize: 14, color: "var(--success)", fontWeight: 500,
    background: "#f0fdf4", border: "1px solid #bbf7d0",
    borderRadius: "var(--radius-sm)", padding: "8px 14px",
  },
};
