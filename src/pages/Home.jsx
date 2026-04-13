import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const STATS = [
  { value: "2,400+", label: "Campus Rides" },
  { value: "$3.50", label: "Avg Fare" },
  { value: "4.9★", label: "Driver Rating" },
  { value: "12", label: "Universities" },
];

const FEATURES = [
  { icon: "👤", title: "Customizable Driver Profiles", desc: "Your car, your rules. Set ride guidelines so every trip is comfortable and transparent from start to finish." },
  { icon: "💬", title: "Ride Messenger", desc: "Coordinate pickup spots and timing directly within the app — no need to exchange numbers." },
  { icon: "📊", title: "Precision Cost-Sharing", desc: "Our algorithm factors distance, stops, and fuel efficiency so every fare is fair and transparent." },
  { icon: "🛡️", title: "Verified Community", desc: "Only university-verified students and drivers. Safe, trusted, campus-first ridesharing." },
];

export default function Home() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

  return (
    <div style={{ background: "#fff", fontFamily: "var(--font-body)" }}>

      <section style={{ minHeight: "calc(100vh - 64px)", paddingTop: 0, display: "flex", alignItems: "center", position: "relative", overflow: "hidden", background: "#fff" }}>
        <div style={{ position: "absolute", top: -200, right: -100, width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -150, left: -80, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "repeating-linear-gradient(0deg,rgba(0,0,0,0.012) 0,rgba(0,0,0,0.012) 1px,transparent 1px,transparent 72px),repeating-linear-gradient(90deg,rgba(0,0,0,0.012) 0,rgba(0,0,0,0.012) 1px,transparent 1px,transparent 72px)" }} />

        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "40px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 80, flexWrap: "wrap", position: "relative", zIndex: 1, width: "100%" }}>

          <div style={{ flex: "1 1 460px", maxWidth: 580, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(32px)", transition: "all 0.7s ease" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fdf8ee", border: "1px solid #f0e4b8", borderRadius: 100, padding: "7px 18px", fontSize: 13, fontWeight: 500, color: "#9e7e30", marginBottom: 32 }}>
              🎓 Built for campus communities
            </div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(44px, 5.5vw, 72px)", fontWeight: 800, lineHeight: 1.05, color: "#111", marginBottom: 24, letterSpacing: "-1px" }}>
              Ride Cheaper,<br /><span style={{ color: "var(--gold)" }}>Safer</span> &amp; Together
            </h1>
            <p style={{ fontSize: 18, color: "#666", lineHeight: 1.75, marginBottom: 40, maxWidth: 480 }}>
              RideAway connects students with trusted campus drivers for affordable, safe, and social rides — powered by your university community.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 56 }}>
              <Link to="/auth"><button style={{ background: "var(--gold)", color: "#fff", border: "none", borderRadius: 12, padding: "15px 32px", fontSize: 15, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-body)", boxShadow: "0 8px 28px rgba(201,168,76,0.3)" }}>Book a Ride</button></Link>
              <Link to="/auth?role=driver"><button style={{ background: "transparent", color: "var(--gold)", border: "1.5px solid var(--gold)", borderRadius: 12, padding: "14px 32px", fontSize: 15, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-body)" }}>Become a Driver</button></Link>
            </div>
            <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
              {STATS.map((s, i) => (
                <div key={s.label} style={{ display: "flex", flexDirection: "column", gap: 3, opacity: visible ? 1 : 0, transition: `all 0.6s ease ${0.2 + i * 0.1}s`, transform: visible ? "translateY(0)" : "translateY(16px)" }}>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "#111", lineHeight: 1 }}>{s.value}</span>
                  <span style={{ fontSize: 11, color: "#999", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.6px" }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ flex: "0 0 300px", opacity: visible ? 1 : 0, transform: visible ? "translateY(0) rotate(-2deg)" : "translateY(40px) rotate(-2deg)", transition: "all 0.8s ease 0.2s" }}>
            <div style={{ width: 280, borderRadius: 38, border: "7px solid #1a1a1a", overflow: "hidden", boxShadow: "0 40px 80px rgba(0,0,0,0.18)", background: "#fff" }}>
              <div style={{ background: "#1a1a1a", padding: "8px 16px", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 10, color: "#fff" }}>9:41</span>
                <span style={{ fontSize: 10, color: "#fff" }}>▲ RideAway</span>
              </div>
              <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ background: "var(--gold)", borderRadius: 16, padding: "20px 16px" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "#fff" }}>RideAway</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 3 }}>Where are you headed?</div>
                </div>
                <div style={{ border: "1.5px solid #eee", borderRadius: 14, overflow: "hidden", background: "#fafafa" }}>
                  <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--gold)", flexShrink: 0 }} />
                    <div><div style={{ fontSize: 9, color: "var(--gold)", fontWeight: 700, textTransform: "uppercase" }}>Pickup</div><div style={{ fontSize: 13, color: "#1a1a1a", fontWeight: 500 }}>Main Library</div></div>
                  </div>
                  <div style={{ height: "0.5px", background: "#eee", margin: "0 14px" }} />
                  <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#1a1a1a", flexShrink: 0 }} />
                    <div><div style={{ fontSize: 9, color: "#888", fontWeight: 700, textTransform: "uppercase" }}>Drop-off</div><div style={{ fontSize: 13, color: "#1a1a1a", fontWeight: 500 }}>University Ave & 5th</div></div>
                  </div>
                </div>
                <div style={{ background: "#fdf8ee", border: "1px solid #f0e4b8", borderRadius: 12, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div><div style={{ fontSize: 11, color: "#888" }}>Estimated fare</div><div style={{ fontSize: 10, color: "#bbb", marginTop: 1 }}>2.4 mi · ~8 min</div></div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: "var(--gold)" }}>$3.50</div>
                </div>
                <button style={{ background: "var(--gold)", color: "#fff", border: "none", borderRadius: 12, padding: "14px 0", width: "100%", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>Find My Driver →</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "120px 0", background: "#fff" }} id="features">
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 40px" }}>
          <div style={{ marginBottom: 64 }}>
            <div style={{ display: "inline-block", background: "#fdf8ee", color: "#9e7e30", border: "1px solid #f0e4b8", borderRadius: 100, padding: "5px 16px", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 20 }}>Features</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(30px, 3.5vw, 48px)", fontWeight: 800, color: "#111", lineHeight: 1.15, marginBottom: 16 }}>Everything you need<br />for the perfect ride</h2>
            <p style={{ fontSize: 17, color: "#666", lineHeight: 1.75, maxWidth: 520 }}>Built for students, by students — with features that put safety, transparency, and community first.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 28 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{ background: "#fff", border: "1px solid #ebebeb", borderRadius: 20, padding: "32px 28px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                <div style={{ width: 52, height: 52, background: "#fdf8ee", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 20 }}>{f.icon}</div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "#111", marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: "#666", lineHeight: 1.75 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "120px 0", background: "#f7f5f0" }} id="how-it-works">
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 40px" }}>
          <div style={{ marginBottom: 64 }}>
            <div style={{ display: "inline-block", background: "#fdf8ee", color: "#9e7e30", border: "1px solid #f0e4b8", borderRadius: 100, padding: "5px 16px", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 20 }}>How it works</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(30px, 3.5vw, 48px)", fontWeight: 800, color: "#111", lineHeight: 1.15 }}>Three steps to your ride</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 48 }}>
            {[
              { num: "01", title: "Sign up", desc: "Create your account with your university email in under 60 seconds." },
              { num: "02", title: "Enter your route", desc: "Tell us your pickup and drop-off. We'll find the best driver nearby." },
              { num: "03", title: "Ride & pay", desc: "Your driver arrives, you ride, payment is automatic. Simple." },
            ].map(s => (
              <div key={s.num} style={{ padding: "8px 0" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 64, fontWeight: 800, color: "var(--gold)", opacity: 0.25, lineHeight: 1, marginBottom: 16 }}>{s.num}</div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "#111", marginBottom: 10 }}>{s.title}</h3>
                <p style={{ fontSize: 15, color: "#666", lineHeight: 1.75 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "120px 0", background: "#1a1a1a" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 40px" }}>
          <div style={{ display: "flex", gap: 80, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ display: "inline-block", background: "rgba(201,168,76,0.15)", color: "var(--gold)", borderRadius: 100, padding: "5px 16px", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 20 }}>Why RideAway?</div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(30px, 3.5vw, 48px)", fontWeight: 800, color: "#fff", lineHeight: 1.15, marginBottom: 16 }}>Campus travel,<br />reimagined</h2>
              <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", lineHeight: 1.8, maxWidth: 420 }}>Getting around campus shouldn't cost a fortune. With trusted drivers, real-time tracking, easy payments, and flexible ride options, we put convenience first.</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 32 }}>
                {["Safe Ride", "Low Cost", "Easy Routes", "Community Building"].map(item => (
                  <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.7)" }}>
                    <span style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--gold)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>✓</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center", minWidth: 280 }}>
              <div style={{ background: "#fff", borderRadius: 24, padding: "36px 32px", maxWidth: 380, width: "100%", boxShadow: "0 24px 60px rgba(0,0,0,0.3)" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, marginBottom: 16, color: "#1a1a1a" }}>Gain loyalty points when we launch</div>
                <p style={{ fontSize: 14, color: "#666", marginBottom: 24, lineHeight: 1.7 }}>Sign up now to reserve your spot and start earning loyalty points from your very first ride.</p>
                <Link to="/auth"><button style={{ background: "var(--gold)", color: "#fff", border: "none", borderRadius: 12, padding: "15px 0", width: "100%", fontSize: 15, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-body)", boxShadow: "0 8px 28px rgba(201,168,76,0.3)" }}>Sign Up — It's Free</button></Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
