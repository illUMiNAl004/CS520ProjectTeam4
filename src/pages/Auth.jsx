/**
 * RideAway — Page 2: Auth (Login / Sign Up)
 * File: src/pages/Auth.jsx
 * Team member: assign to person responsible for auth
 *
 * Features:
 * - Rider / Driver role toggle
 * - Login ↔ Sign-up switcher
 * - Schema-connected form (stubs, not yet live)
 */

import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

// ── Schema stubs (wire up when backend is ready) ──
import { riderApi, driverApi, RIDER_SCHEMA_SHAPE, DRIVER_SCHEMA_SHAPE } from "../schema";

export default function Auth() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  // role: "rider" | "driver"
  const [role, setRole] = useState(params.get("role") === "driver" ? "driver" : "rider");
  // mode: "login" | "signup"
  const [mode, setMode] = useState("signup");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Rider signup fields (mirrors RIDER_SCHEMA_SHAPE)
  const [riderForm, setRiderForm] = useState({
    firstName: "", lastName: "",
    email: "", password: "",
    university: "",
  });

  // Driver signup fields (mirrors DRIVER_SCHEMA_SHAPE)
  const [driverForm, setDriverForm] = useState({
    firstName: "", lastName: "",
    email: "", password: "",
    university: "",
    vehicleMake: "", vehicleModel: "",
    vehicleYear: "", vehicleColor: "",
    licensePlate: "",
  });

  // Login fields (shared)
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let result;
      if (mode === "login") {
        // ── TODO: connect to real backend ──
        result = role === "rider"
          ? await riderApi.login(loginForm)
          : await driverApi.login(loginForm);
      } else {
        const formData = role === "rider"
          ? { ...RIDER_SCHEMA_SHAPE, ...riderForm }
          : { ...DRIVER_SCHEMA_SHAPE, ...driverForm,
              vehicle: { make: driverForm.vehicleMake, model: driverForm.vehicleModel,
                         year: driverForm.vehicleYear, color: driverForm.vehicleColor,
                         licensePlate: driverForm.licensePlate } };
        result = role === "rider"
          ? await riderApi.signup(formData)
          : await driverApi.signup(formData);
      }

      if (!result.success) {
        setError(result.error || "Something went wrong. Please try again.");
        return;
      }

      localStorage.setItem("ra_token", result.token);
      localStorage.setItem("ra_user", JSON.stringify(result.user));

      if (result.user.role === "rider") navigate("/book");
      else navigate("/driver-profile");

    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateRider = (k, v) => setRiderForm(f => ({ ...f, [k]: v }));
  const updateDriver = (k, v) => setDriverForm(f => ({ ...f, [k]: v }));
  const updateLogin = (k, v) => setLoginForm(f => ({ ...f, [k]: v }));

  return (
    <div className="page" style={styles.page}>
      <div style={styles.container}>

        {/* ── Left panel ── */}
        <div style={styles.leftPanel}>
          <div style={styles.leftInner}>
            <Link to="/" style={styles.backLink}>← Back to home</Link>
            <div style={styles.brandBlock}>
              <span style={styles.brandLogo}>Ride<span style={{ color: "var(--gold)" }}>Away</span></span>
              <p style={styles.brandTagline}>Ride cheaper, safer and together</p>
            </div>
            <div style={styles.leftQuote}>
              <p style={{ fontSize: 22, fontFamily: "var(--font-display)", fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                "The easiest way to get around campus — and I actually save money."
              </p>
              <div style={styles.quoteAuthor}>
                <div style={styles.quoteAvatar}>AJ</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#fff" }}>Alex Johnson</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Rider · 48 rides</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right panel (form) ── */}
        <div style={styles.rightPanel}>
          <div style={styles.formCard}>

            {/* Role toggle */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
              <div className="role-toggle">
                <button
                  className={`role-btn ${role === "rider" ? "active" : ""}`}
                  onClick={() => setRole("rider")}
                >🧍 Rider</button>
                <button
                  className={`role-btn ${role === "driver" ? "active" : ""}`}
                  onClick={() => setRole("driver")}
                >🚗 Driver</button>
              </div>
            </div>

            <h2 style={styles.formTitle}>
              {mode === "login" ? "Welcome back" : role === "rider" ? "Join as a Rider" : "Join as a Driver"}
            </h2>
            <p style={styles.formSub}>
              {mode === "login"
                ? "Sign in to your RideAway account"
                : role === "driver"
                ? "Set up your driver profile and start earning"
                : "Create your account and start riding"}
            </p>

            {/* SSO button */}
            <button style={styles.ssoBtn}>
              🎓 &nbsp;Continue with University SSO
            </button>

            <div style={styles.orDivider}>
              <div style={styles.orLine} /><span style={{ fontSize: 12, color: "var(--faint)", flexShrink: 0 }}>or</span><div style={styles.orLine} />
            </div>

            {error && <div style={styles.errorBox}>{error}</div>}

            <form onSubmit={handleSubmit} style={styles.form}>

              {/* ── LOGIN FORM ── */}
              {mode === "login" && (
                <>
                  <InputField label="Email" type="email" placeholder="you@university.edu"
                    value={loginForm.email} onChange={v => updateLogin("email", v)} />
                  <InputField label="Password" type="password" placeholder="••••••••"
                    value={loginForm.password} onChange={v => updateLogin("password", v)} />
                </>
              )}

              {/* ── RIDER SIGNUP ── */}
              {mode === "signup" && role === "rider" && (
                <>
                  <div style={styles.row2}>
                    <InputField label="First Name" placeholder="Alex"
                      value={riderForm.firstName} onChange={v => updateRider("firstName", v)} />
                    <InputField label="Last Name" placeholder="Johnson"
                      value={riderForm.lastName} onChange={v => updateRider("lastName", v)} />
                  </div>
                  <InputField label="University Email" type="email" placeholder="alex@university.edu"
                    value={riderForm.email} onChange={v => updateRider("email", v)} />
                  <InputField label="University" placeholder="e.g. UC Berkeley"
                    value={riderForm.university} onChange={v => updateRider("university", v)} />
                  <InputField label="Password" type="password" placeholder="Create a password"
                    value={riderForm.password} onChange={v => updateRider("password", v)} />
                </>
              )}

              {/* ── DRIVER SIGNUP ── */}
              {mode === "signup" && role === "driver" && (
                <>
                  <div style={styles.row2}>
                    <InputField label="First Name" placeholder="Marcus"
                      value={driverForm.firstName} onChange={v => updateDriver("firstName", v)} />
                    <InputField label="Last Name" placeholder="Kim"
                      value={driverForm.lastName} onChange={v => updateDriver("lastName", v)} />
                  </div>
                  <InputField label="University Email" type="email" placeholder="marcus@university.edu"
                    value={driverForm.email} onChange={v => updateDriver("email", v)} />
                  <InputField label="University" placeholder="e.g. UCLA"
                    value={driverForm.university} onChange={v => updateDriver("university", v)} />
                  <div style={styles.sectionDivider}>🚗 Vehicle Details</div>
                  <div style={styles.row2}>
                    <InputField label="Make" placeholder="Honda"
                      value={driverForm.vehicleMake} onChange={v => updateDriver("vehicleMake", v)} />
                    <InputField label="Model" placeholder="Civic"
                      value={driverForm.vehicleModel} onChange={v => updateDriver("vehicleModel", v)} />
                  </div>
                  <div style={styles.row2}>
                    <InputField label="Year" placeholder="2021"
                      value={driverForm.vehicleYear} onChange={v => updateDriver("vehicleYear", v)} />
                    <InputField label="Color" placeholder="White"
                      value={driverForm.vehicleColor} onChange={v => updateDriver("vehicleColor", v)} />
                  </div>
                  <InputField label="License Plate" placeholder="ABC 1234"
                    value={driverForm.licensePlate} onChange={v => updateDriver("licensePlate", v)} />
                  <InputField label="Password" type="password" placeholder="Create a password"
                    value={driverForm.password} onChange={v => updateDriver("password", v)} />
                </>
              )}

              <button type="submit" className="btn-gold" style={{ width: "100%", marginTop: 8 }} disabled={loading}>
                {loading ? "Please wait..." : mode === "login" ? "Sign In" : `Create ${role === "driver" ? "Driver" : "Rider"} Account`}
              </button>
            </form>

            <p style={styles.switchMode}>
              {mode === "login" ? "Don't have an account? " : "Already have an account? "}
              <button style={styles.switchBtn} onClick={() => setMode(mode === "login" ? "signup" : "login")}>
                {mode === "login" ? "Sign up" : "Log in"}
              </button>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, type = "text", placeholder, value, onChange }) {
  return (
    <div className="input-wrap">
      <label className="input-label">{label}</label>
      <input
        className="input-field"
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}

const styles = {
  page: { background: "#f7f5f0", minHeight: "100vh", paddingTop: 64 },
  container: {
    display: "flex", minHeight: "calc(100vh - 64px)",
  },
  leftPanel: {
    flex: "0 0 400px",
    background: "var(--dark)",
    padding: 48,
    display: "flex",
    flexDirection: "column",
    position: "sticky", top: 64, height: "calc(100vh - 64px)",
  },
  leftInner: { display: "flex", flexDirection: "column", height: "100%", gap: 32 },
  backLink: { fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 500 },
  brandBlock: { marginTop: "auto" },
  brandLogo: {
    fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, color: "#fff",
  },
  brandTagline: { fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 6 },
  leftQuote: {
    background: "rgba(255,255,255,0.06)", borderRadius: "var(--radius-lg)",
    padding: 24, marginTop: "auto",
  },
  quoteAuthor: { display: "flex", alignItems: "center", gap: 12, marginTop: 20 },
  quoteAvatar: {
    width: 40, height: 40, borderRadius: "50%", background: "var(--gold)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "var(--font-display)", fontWeight: 700, color: "#fff", fontSize: 14,
  },
  rightPanel: {
    flex: 1, display: "flex", alignItems: "flex-start",
    justifyContent: "center", padding: "48px 24px", overflowY: "auto",
  },
  formCard: {
    width: "100%", maxWidth: 480,
    background: "#fff", borderRadius: "var(--radius-xl)",
    padding: "40px 36px",
    boxShadow: "var(--shadow-md)",
  },
  formTitle: {
    fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800,
    marginBottom: 8, color: "var(--black)",
  },
  formSub: { fontSize: 14, color: "var(--muted)", marginBottom: 28 },
  ssoBtn: {
    width: "100%", padding: "12px 0",
    border: "1.5px solid var(--border)", borderRadius: "var(--radius-md)",
    background: "#fff", fontSize: 14, fontWeight: 500,
    color: "var(--dark)", cursor: "pointer", fontFamily: "var(--font-body)",
    transition: "background 0.2s",
  },
  orDivider: {
    display: "flex", alignItems: "center", gap: 12, margin: "20px 0",
  },
  orLine: { flex: 1, height: "0.5px", background: "var(--border)" },
  errorBox: {
    background: "#fff5f5", border: "1px solid #fca5a5",
    borderRadius: "var(--radius-sm)", padding: "10px 14px",
    fontSize: 13, color: "#dc2626", marginBottom: 16,
  },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  sectionDivider: {
    fontSize: 12, fontWeight: 600, color: "var(--gold-dark)",
    textTransform: "uppercase", letterSpacing: "0.6px",
    borderBottom: "1px solid var(--gold-border)", paddingBottom: 8,
  },
  switchMode: { fontSize: 14, color: "var(--muted)", textAlign: "center", marginTop: 20 },
  switchBtn: {
    background: "none", border: "none", color: "var(--gold)",
    fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 14,
  },
};
