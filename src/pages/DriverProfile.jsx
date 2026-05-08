import React, { useState, useEffect } from "react";
import { driverApi } from "../schema";

const GUIDELINE_OPTIONS = [
  { key: "noSmoking", label: "No smoking", icon: "🚭" },
  { key: "musicOn", label: "Music on", icon: "🎵" },
  { key: "quietRide", label: "Quiet ride", icon: "🤫" },
  { key: "noPets", label: "No pets", icon: "🐾" },
  { key: "noFood", label: "No food", icon: "🍔" },
  { key: "acAlwaysOn", label: "AC always on", icon: "❄️" },
  { key: "luggageOk", label: "Luggage ok", icon: "🧳" },
  { key: "carSeat", label: "Car seat", icon: "👶" },
  { key: "accessible", label: "Accessible", icon: "♿" },
];

const PREF_OPTIONS = [
  { key: "allowSharedRides", icon: "👥", label: "Allow shared rides", sub: "Multiple passengers per trip" },
  { key: "campusRoutesOnly", icon: "🗺️", label: "Campus routes only", sub: "Limit pickups to on-campus locations" },
  { key: "verifiedRidersOnly", icon: "⭐", label: "Verified riders only", sub: "University email verification required" },
];

const DEFAULT_GUIDELINES = {
  noSmoking: false, musicOn: false, quietRide: false,
  noPets: false, noFood: false, acAlwaysOn: false, luggageOk: false,
  carSeat: false, accessible: false,
  maxRiders: 2, customNote: "",
};

const DEFAULT_PREFS = {
  allowSharedRides: false, campusRoutesOnly: false,
  verifiedRidersOnly: false, isOnline: false,
};

export default function DriverProfile() {
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("guidelines");

  const [vehicle, setVehicle] = useState({ make: "", model: "", year: "", color: "", licensePlate: "", maxSeats: 4 });
  const [guidelines, setGuidelines] = useState(DEFAULT_GUIDELINES);
  const [preferences, setPreferences] = useState(DEFAULT_PREFS);
  const [startingAddress, setStartingAddress] = useState("");
  const [pickupRadius, setPickupRadius] = useState(5);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    driverApi.getProfile().then(res => {
      if (res.success) {
        const d = res.user;
        setProfile(d);
        setVehicle({
          make: d.make || "", model: d.model || "", year: d.year || "",
          color: d.color || "", licensePlate: d.licensePlate || "", maxSeats: d.maxSeats || 4,
        });
        setGuidelines({ ...DEFAULT_GUIDELINES, ...(d.guidelines || {}) });
        setPreferences({ ...DEFAULT_PREFS, ...(d.preferences || {}), isOnline: d.isOnline || false });
        setStartingAddress(d.startingAddress || "");
        setPickupRadius(d.pickupRadius || 5);
      }
      setLoading(false);
    });
  }, []);

  const toggleGuideline = (key) => setGuidelines(g => ({ ...g, [key]: !g[key] }));
  const togglePref = (key) => setPreferences(p => ({ ...p, [key]: !p[key] }));
  const toggleOnline = async () => {
    const newVal = !preferences.isOnline;
    setPreferences(p => ({ ...p, isOnline: newVal }));
    const token = localStorage.getItem("ra_token");
    await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5001"}/api/driver/online`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isOnline: newVal }),
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const token = localStorage.getItem("ra_token");
      const res = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5001"}/api/driver/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ vehicle, guidelines, preferences, startingAddress, pickupRadius }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || "Save failed."); }
      else {
        const stored = JSON.parse(localStorage.getItem("ra_user") || "{}");
        localStorage.setItem("ra_user", JSON.stringify({ ...stored, ...data.user }));
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", background: "#f7f5f0" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--muted)" }}>Loading profile...</div>
      </div>
    );
  }

  const initials = profile ? `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}` : "?";
  const userRaw = localStorage.getItem("ra_user");
  const userEmoji = userRaw ? JSON.parse(userRaw).emoji : null;

  return (
    <div className="page" style={styles.page}>
      <div style={styles.layout}>

        {/* ── Sidebar ── */}
        <aside style={styles.sidebar}>
          <div style={styles.profileHero}>
            <div style={styles.profileAvatar}>
              {userEmoji ? <span style={{ fontSize: 32 }}>{userEmoji}</span> : initials}
            </div>
            <div>
              <div style={styles.profileName}>{profile?.firstName} {profile?.lastName}</div>
              <div style={styles.profileUni}>{profile?.university}</div>
            </div>

            <div style={styles.onlineRow}>
              <div>
                <div style={{ fontSize: 13, color: "#fff", fontWeight: 500 }}>
                  {preferences.isOnline ? "🟢 Online" : "⚫ Offline"}
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                  {preferences.isOnline ? "Accepting requests" : "Not accepting"}
                </div>
              </div>
              <div className={`toggle-switch ${preferences.isOnline ? "on" : "off"}`} onClick={toggleOnline}>
                <div className="toggle-knob" />
              </div>
            </div>
          </div>

          <div style={styles.vehicleCard}>
            <div style={styles.sectionLabel}>Vehicle</div>
            {vehicle.make ? (
              <>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginTop: 8 }}>
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
                  {vehicle.color} · {vehicle.licensePlate} · {vehicle.maxSeats} seats
                </div>
              </>
            ) : (
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 8 }}>No vehicle added yet</div>
            )}
          </div>

          {startingAddress && (
            <div style={styles.vehicleCard}>
              <div style={styles.sectionLabel}>Starting Location</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 8 }}>{startingAddress}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>Radius: {pickupRadius} mi</div>
            </div>
          )}
        </aside>

        {/* ── Main content ── */}
        <main style={styles.main}>
          <div style={styles.tabs}>
            {["guidelines", "preferences", "vehicle"].map(tab => (
              <button
                key={tab}
                style={{ ...styles.tab, ...(activeTab === tab ? styles.tabActive : {}) }}
                onClick={() => setActiveTab(tab)}
              >
                {{ guidelines: "🎯 Ride Guidelines", preferences: "⚙️ Preferences", vehicle: "🚗 Vehicle & Location" }[tab]}
              </button>
            ))}
          </div>

          {error && (
            <div style={{ background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: "var(--radius-sm)", padding: "10px 14px", fontSize: 13, color: "#dc2626" }}>
              {error}
            </div>
          )}

          {/* ── Guidelines tab ── */}
          {activeTab === "guidelines" && (
            <div style={styles.tabContent}>
              <div>
                <h2 style={styles.tabTitle}>Ride Guidelines</h2>
                <p style={styles.tabSub}>Set your rules — riders will see these before booking.</p>
              </div>
              <div style={styles.chipsGrid}>
                {GUIDELINE_OPTIONS.map(opt => (
                  <button
                    key={opt.key}
                    className={`chip ${guidelines[opt.key] ? "active" : ""}`}
                    style={{ fontSize: 14, padding: "10px 18px" }}
                    onClick={() => toggleGuideline(opt.key)}
                  >
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>

              <div style={styles.sliderSection}>
                <div style={styles.sliderLabel}>
                  Max Riders per Trip
                  <span style={styles.sliderVal}>{guidelines.maxRiders}</span>
                </div>
                <input
                  type="range" min={1} max={4} step={1}
                  value={guidelines.maxRiders}
                  onChange={e => setGuidelines(g => ({ ...g, maxRiders: +e.target.value }))}
                  style={{ width: "100%", accentColor: "var(--gold)" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)" }}>
                  <span>1 rider</span><span>4 riders</span>
                </div>
              </div>

              <div className="input-wrap">
                <label className="input-label">Custom Note to Riders (optional)</label>
                <textarea
                  className="input-field"
                  rows={3}
                  placeholder='e.g. "Please be ready at the pickup spot — I can only wait 2 minutes."'
                  value={guidelines.customNote || ""}
                  onChange={e => setGuidelines(g => ({ ...g, customNote: e.target.value }))}
                  style={{ resize: "vertical" }}
                />
              </div>
            </div>
          )}

          {/* ── Preferences tab ── */}
          {activeTab === "preferences" && (
            <div style={styles.tabContent}>
              <div>
                <h2 style={styles.tabTitle}>Trip Preferences</h2>
                <p style={styles.tabSub}>Control how and what rides you accept.</p>
              </div>
              <div style={styles.prefsList}>
                {PREF_OPTIONS.map(pref => (
                  <div key={pref.key} style={styles.prefRow}>
                    <div style={styles.prefIcon}>{pref.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={styles.prefLabel}>{pref.label}</div>
                      <div style={styles.prefSub}>{pref.sub}</div>
                    </div>
                    <div className={`toggle-switch ${preferences[pref.key] ? "on" : "off"}`} onClick={() => togglePref(pref.key)}>
                      <div className="toggle-knob" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Vehicle & Location tab ── */}
          {activeTab === "vehicle" && (
            <div style={styles.tabContent}>
              <div>
                <h2 style={styles.tabTitle}>Vehicle & Location</h2>
                <p style={styles.tabSub}>Keep your vehicle details and pickup area up to date.</p>
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
                      value={vehicle[f.key] || ""}
                      onChange={e => setVehicle(v => ({ ...v, [f.key]: e.target.value }))}
                    />
                  </div>
                ))}
                <div className="input-wrap">
                  <label className="input-label">Max Seats</label>
                  <input
                    className="input-field" type="number" min={1} max={7}
                    value={vehicle.maxSeats}
                    onChange={e => setVehicle(v => ({ ...v, maxSeats: +e.target.value }))}
                  />
                </div>
              </div>

              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 24 }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Starting Location</h3>
                <div className="input-wrap" style={{ marginBottom: 20 }}>
                  <label className="input-label">Starting Address</label>
                  <input
                    className="input-field"
                    placeholder="e.g. 123 Main St, Amherst, MA"
                    value={startingAddress}
                    onChange={e => setStartingAddress(e.target.value)}
                  />
                </div>
                <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "20px 22px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: "var(--dark)" }}>Pickup Radius</span>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "var(--gold)" }}>{pickupRadius} mi</span>
                  </div>
                  <input
                    type="range" min={1} max={50} step={1}
                    value={pickupRadius}
                    onChange={e => setPickupRadius(+e.target.value)}
                    style={{ width: "100%", accentColor: "var(--gold)" }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)", marginTop: 6 }}>
                    <span>1 mi</span><span>50 mi</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div style={styles.saveBar}>
            {saved && <span style={styles.savedMsg}>✓ Profile saved!</span>}
            <button className="btn-gold" style={{ padding: "14px 40px", fontSize: 15 }} onClick={handleSave} disabled={saving}>
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
    width: 300, flexShrink: 0, background: "var(--dark)",
    padding: "32px 24px", display: "flex", flexDirection: "column", gap: 24, overflowY: "auto",
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
  sectionLabel: {
    fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10,
  },
  vehicleCard: { background: "rgba(255,255,255,0.06)", borderRadius: "var(--radius-md)", padding: "14px" },
  main: { flex: 1, padding: "32px 40px", display: "flex", flexDirection: "column", gap: 28, overflowY: "auto" },
  tabs: { display: "flex", gap: 4, background: "var(--surface)", borderRadius: "var(--radius-pill)", padding: 4, width: "fit-content" },
  tab: {
    padding: "8px 20px", borderRadius: "var(--radius-pill)", border: "none",
    background: "transparent", fontSize: 13, fontWeight: 500, color: "var(--muted)",
    cursor: "pointer", fontFamily: "var(--font-body)", transition: "all 0.2s",
  },
  tabActive: { background: "var(--gold)", color: "#fff", boxShadow: "var(--shadow-gold)" },
  tabContent: { display: "flex", flexDirection: "column", gap: 24 },
  tabTitle: { fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: "var(--black)", marginBottom: 6 },
  tabSub: { fontSize: 14, color: "var(--muted)" },
  chipsGrid: { display: "flex", flexWrap: "wrap", gap: 10 },
  sliderSection: { background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "20px 22px" },
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