import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { driverApi } from "../schema";
import { API_BASE_URL } from "../schema";

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

export default function DriverSetup() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = vehicle, 2 = preferences, 3 = location
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [vehicle, setVehicle] = useState({
    make: "", model: "", year: "", color: "", licensePlate: "", maxSeats: 4,
  });

  const [guidelines, setGuidelines] = useState({
    noSmoking: true, musicOn: true, quietRide: false,
    noPets: true, noFood: false, acAlwaysOn: false, luggageOk: false,
    carSeat: false, accessible: false,
  });

  const [preferences, setPreferences] = useState({
    allowSharedRides: true, campusRoutesOnly: false, verifiedRidersOnly: true,
  });

  const [location, setLocation] = useState({
    startingAddress: "",
    pickupRadius: 5,
  });

  const updateVehicle = (k, v) => setVehicle(prev => ({ ...prev, [k]: v }));
  const toggleGuideline = (k) => setGuidelines(prev => ({ ...prev, [k]: !prev[k] }));
  const togglePref = (k) => setPreferences(prev => ({ ...prev, [k]: !prev[k] }));

  const handleNext = () => {
    if (step === 1) {
      if (!vehicle.make || !vehicle.model || !vehicle.year || !vehicle.color || !vehicle.licensePlate)
        return setError("Please fill in all vehicle details.");
    }
    if (step === 3) {
      if (!location.startingAddress) return setError("Please enter your starting location.");
    }
    setError("");
    setStep(s => s + 1);
  };

  const handleFinish = async () => {
    if (!location.startingAddress) return setError("Please enter your starting location.");
    setError("");
    setSaving(true);
    try {
      const pending = JSON.parse(sessionStorage.getItem("ra_pending_signup") || "{}");
      const res = await fetch(`${API_BASE_URL}/api/driver/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...pending, vehicle, guidelines, preferences, location }),
      });
      const result = await res.json();
      if (!result.success) {
        setError(result.error || "Something went wrong. Please try again.");
        setSaving(false);
        return;
      }
      sessionStorage.removeItem("ra_pending_signup");
      localStorage.setItem("ra_token", result.token);
      localStorage.setItem("ra_user", JSON.stringify({ ...result.user, emoji: pending.emoji }));
      navigate("/");
    } catch {
      setError("Something went wrong. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Let's set up your driver profile</h1>
          <p style={styles.sub}>Just a few things before you start accepting rides.</p>

          {/* Step indicator */}
          <div style={styles.steps}>
            {["Vehicle", "Preferences", "Location"].map((label, i) => (
              <div key={label} style={styles.stepItem}>
                <div style={{ ...styles.stepDot, ...(step > i + 1 ? styles.stepDone : step === i + 1 ? styles.stepActive : styles.stepInactive) }}>
                  {step > i + 1 ? "✓" : i + 1}
                </div>
                <span style={{ ...styles.stepLabel, color: step === i + 1 ? "var(--dark)" : "var(--muted)" }}>{label}</span>
                {i < 2 && <div style={styles.stepLine} />}
              </div>
            ))}
          </div>
        </div>

        <div style={styles.card}>
          {error && <div style={styles.errorBox}>{error}</div>}

          {/* Step 1 — Vehicle Details */}
          {step === 1 && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>🚗 Your Vehicle</h2>
              <p style={styles.sectionSub}>Riders will see this info when they book a ride with you.</p>
              <div style={styles.grid2}>
                <div className="input-wrap">
                  <label className="input-label">Make</label>
                  <input className="input-field" placeholder="Honda" value={vehicle.make} onChange={e => updateVehicle("make", e.target.value)} />
                </div>
                <div className="input-wrap">
                  <label className="input-label">Model</label>
                  <input className="input-field" placeholder="Civic" value={vehicle.model} onChange={e => updateVehicle("model", e.target.value)} />
                </div>
                <div className="input-wrap">
                  <label className="input-label">Year</label>
                  <input className="input-field" placeholder="2021" value={vehicle.year} onChange={e => updateVehicle("year", e.target.value)} />
                </div>
                <div className="input-wrap">
                  <label className="input-label">Color</label>
                  <input className="input-field" placeholder="White" value={vehicle.color} onChange={e => updateVehicle("color", e.target.value)} />
                </div>
              </div>
              <div className="input-wrap">
                <label className="input-label">License Plate</label>
                <input className="input-field" placeholder="ABC 1234" value={vehicle.licensePlate} onChange={e => updateVehicle("licensePlate", e.target.value)} />
              </div>
              <div className="input-wrap">
                <label className="input-label">Max Seats (excluding driver)</label>
                <input className="input-field" type="number" min={1} max={6} value={vehicle.maxSeats} onChange={e => updateVehicle("maxSeats", +e.target.value)} />
              </div>
            </div>
          )}

          {/* Step 2 — Preferences */}
          {step === 2 && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>⚙️ Ride Preferences</h2>
              <p style={styles.sectionSub}>Set your rules — riders will see these before booking.</p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 28 }}>
                {GUIDELINE_OPTIONS.map(opt => (
                  <button
                    key={opt.key}
                    type="button"
                    className={`chip ${guidelines[opt.key] ? "active" : ""}`}
                    style={{ fontSize: 14, padding: "10px 18px" }}
                    onClick={() => toggleGuideline(opt.key)}
                  >
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {PREF_OPTIONS.map(pref => (
                  <div key={pref.key} style={styles.prefRow}>
                    <div style={{ fontSize: 22, width: 28, textAlign: "center" }}>{pref.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: "var(--dark)" }}>{pref.label}</div>
                      <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{pref.sub}</div>
                    </div>
                    <div
                      className={`toggle-switch ${preferences[pref.key] ? "on" : "off"}`}
                      onClick={() => togglePref(pref.key)}
                    >
                      <div className="toggle-knob" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 — Location */}
          {step === 3 && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>📍 Starting Location & Radius</h2>
              <p style={styles.sectionSub}>Where are you based? We'll match you with nearby riders.</p>

              <div className="input-wrap">
                <label className="input-label">Starting Address</label>
                <input
                  className="input-field"
                  placeholder="e.g. 123 Main St, Amherst, MA"
                  value={location.startingAddress}
                  onChange={e => setLocation(l => ({ ...l, startingAddress: e.target.value }))}
                />
              </div>

              <div style={styles.sliderCard}>
                <div style={styles.sliderHeader}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: "var(--dark)" }}>Pickup Radius</span>
                  <span style={styles.radiusVal}>{location.pickupRadius} mi</span>
                </div>
                <input
                  type="range" min={1} max={50} step={1}
                  value={location.pickupRadius}
                  onChange={e => setLocation(l => ({ ...l, pickupRadius: +e.target.value }))}
                  style={{ width: "100%", accentColor: "var(--gold)", margin: "12px 0" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)" }}>
                  <span>1 mi</span>
                  <span>50 mi</span>
                </div>
                <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 12 }}>
                  You'll only be matched with riders within {location.pickupRadius} mile{location.pickupRadius !== 1 ? "s" : ""} of your starting location.
                </p>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div style={styles.btnRow}>
            {step > 1 && (
              <button type="button" className="btn-outline" style={{ padding: "12px 28px" }} onClick={() => { setError(""); setStep(s => s - 1); }}>
                Back
              </button>
            )}
            {step < 3
              ? <button type="button" className="btn-gold" style={{ padding: "12px 36px", marginLeft: "auto" }} onClick={handleNext}>Next</button>
              : <button type="button" className="btn-gold" style={{ padding: "12px 36px", marginLeft: "auto" }} onClick={handleFinish} disabled={saving}>
                  {saving ? "Saving..." : "Finish Setup"}
                </button>
            }
          </div>
        </div>

      </div>
    </div>
  );
}

const styles = {
  page: { background: "#f7f5f0", minHeight: "calc(100vh - 64px)", paddingTop: 88, paddingBottom: 64 },
  container: { maxWidth: 620, margin: "0 auto", padding: "0 24px" },

  header: { marginBottom: 32 },
  title: { fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "var(--dark)", marginBottom: 8 },
  sub: { fontSize: 15, color: "var(--muted)", marginBottom: 28 },

  steps: { display: "flex", alignItems: "center", gap: 0 },
  stepItem: { display: "flex", alignItems: "center", gap: 8 },
  stepDot: {
    width: 32, height: 32, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 13, fontWeight: 700, flexShrink: 0,
  },
  stepActive: { background: "var(--gold)", color: "#fff" },
  stepDone: { background: "var(--success)", color: "#fff" },
  stepInactive: { background: "var(--border)", color: "var(--muted)" },
  stepLabel: { fontSize: 13, fontWeight: 500, whiteSpace: "nowrap" },
  stepLine: { width: 32, height: 2, background: "var(--border)", margin: "0 4px" },

  card: {
    background: "#fff", borderRadius: "var(--radius-xl)",
    padding: "36px 32px", boxShadow: "var(--shadow-md)",
  },

  errorBox: {
    background: "#fff5f5", border: "1px solid #fca5a5",
    borderRadius: "var(--radius-sm)", padding: "10px 14px",
    fontSize: 13, color: "#dc2626", marginBottom: 20,
  },

  section: { display: "flex", flexDirection: "column", gap: 20 },
  sectionTitle: { fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "var(--dark)", marginBottom: 2 },
  sectionSub: { fontSize: 14, color: "var(--muted)", marginTop: -12 },

  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },

  prefRow: {
    display: "flex", alignItems: "center", gap: 16,
    background: "#fff", border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)", padding: "14px 18px",
  },

  sliderCard: {
    background: "#fff", border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)", padding: "20px 22px",
  },
  sliderHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  radiusVal: { fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: "var(--gold)" },

  btnRow: { display: "flex", alignItems: "center", marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--border)" },
};