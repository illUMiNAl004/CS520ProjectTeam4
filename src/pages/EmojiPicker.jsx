import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { riderApi } from "../schema";

const EMOJIS = [
  "🧑", "👩", "👨", "🧔", "👱", "🧕", "👲", "🧑‍🎓", "👩‍🎓", "👨‍🎓",
  "🧑‍💻", "👩‍💻", "👨‍💻", "🧑‍🏫", "👩‍🏫", "👨‍🏫", "🦸", "🦹", "🧙", "🧝",
  "🐶", "🐱", "🐼", "🦊", "🐨", "🐯", "🦁", "🐸", "🐧", "🦄",
  "🌟", "⚡", "🔥", "🌈", "🎯", "🎸", "🏄", "🚀", "🎓", "🏆",
];

export default function EmojiPicker() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const pendingRaw = sessionStorage.getItem("ra_pending_signup");
  const pending = pendingRaw ? JSON.parse(pendingRaw) : null;
  const firstName = pending?.firstName || "there";
  const role = pending?.role;

  const handleContinue = async () => {
    if (!selected) return;
    setSaving(true);
    setError("");

    if (role === "driver") {
      sessionStorage.setItem("ra_pending_signup", JSON.stringify({ ...pending, emoji: selected }));
      navigate("/driver-setup");
      return;
    }

    // rider — write to DB now, flow is complete
    try {
      const result = await riderApi.signup({ ...pending, emoji: selected });
      if (!result.success) {
        setError(result.error || "Something went wrong. Please try again.");
        setSaving(false);
        return;
      }
      sessionStorage.removeItem("ra_pending_signup");
      localStorage.setItem("ra_token", result.token);
      localStorage.setItem("ra_user", JSON.stringify({ ...result.user, emoji: selected }));
      navigate("/");
    } catch {
      setError("Something went wrong. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.topBadge}>Step 1 of {role === "driver" ? "4" : "2"}</div>
          <h1 style={styles.title}>Hey {firstName}, pick your vibe</h1>
          <p style={styles.sub}>This is how other riders and drivers will recognise you.</p>

          {error && (
            <div style={{ background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: "var(--radius-sm)", padding: "10px 14px", fontSize: 13, color: "#dc2626", marginBottom: 16 }}>
              {error}
            </div>
          )}

          {selected && (
            <div style={styles.previewWrap}>
              <div style={styles.preview}>{selected}</div>
              <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 8 }}>Looking good!</p>
            </div>
          )}

          <div style={styles.grid}>
            {EMOJIS.map(emoji => (
              <button
                key={emoji}
                type="button"
                style={{ ...styles.emojiBtn, ...(selected === emoji ? styles.emojiBtnActive : {}) }}
                onClick={() => setSelected(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>

          <button
            className="btn-gold"
            style={{ width: "100%", marginTop: 32, opacity: selected ? 1 : 0.45 }}
            onClick={handleContinue}
            disabled={!selected || saving}
          >
            {saving ? "Creating account..." : role === "driver" ? "Continue to Vehicle Setup →" : "Start Riding →"}
          </button>

          {!selected && (
            <p style={{ fontSize: 12, color: "var(--faint)", textAlign: "center", marginTop: 10 }}>
              Pick an emoji to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    background: "#f7f5f0",
    minHeight: "calc(100vh - 64px)",
    paddingTop: 88,
    paddingBottom: 64,
    display: "flex",
    alignItems: "center",
  },
  container: { width: "100%", maxWidth: 560, margin: "0 auto", padding: "0 24px" },
  card: {
    background: "#fff",
    borderRadius: "var(--radius-xl)",
    padding: "40px 36px",
    boxShadow: "var(--shadow-md)",
  },
  topBadge: {
    display: "inline-block",
    background: "var(--gold-pale)",
    color: "var(--gold-dark)",
    border: "1px solid var(--gold-border)",
    borderRadius: "var(--radius-pill)",
    fontSize: 12,
    fontWeight: 600,
    padding: "4px 12px",
    marginBottom: 20,
  },
  title: { fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "var(--dark)", marginBottom: 8 },
  sub: { fontSize: 14, color: "var(--muted)", marginBottom: 28 },
  previewWrap: { textAlign: "center", marginBottom: 20 },
  preview: {
    fontSize: 72, lineHeight: 1, display: "inline-block",
    background: "var(--gold-pale)", borderRadius: "var(--radius-xl)",
    padding: "16px 24px", border: "2px solid var(--gold-border)",
  },
  grid: { display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 8 },
  emojiBtn: {
    fontSize: 26, background: "var(--surface)", border: "1.5px solid var(--border)",
    borderRadius: "var(--radius-md)", padding: "10px 6px",
    cursor: "pointer", transition: "all 0.15s", lineHeight: 1,
  },
  emojiBtnActive: {
    background: "var(--gold-pale)", borderColor: "var(--gold)",
    transform: "scale(1.15)", boxShadow: "var(--shadow-gold)",
  },
};