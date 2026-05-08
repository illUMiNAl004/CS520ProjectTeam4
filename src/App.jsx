import React, { useState } from "react";
import { HashRouter, Routes, Route, Link, NavLink } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import BookRide from "./pages/BookRide";
import Matching from "./pages/Matching";
import Payment from "./pages/Payment";
import DriverProfile from "./pages/DriverProfile";
import "./styles.css";

// all the route paths in one place so we're not hardcoding strings everywhere
export const ROUTES = {
  home: "/",
  login: "/login",
  signup: "/signup",
  book: "/book",
  matching: "/matching",
  payment: "/payment",
  driverProfile: "/driver-profile",
};

export default function App() {
  return (
    <HashRouter>
      <Navbar />
      <Routes>
        <Route path={ROUTES.home} element={<Home />} />
        {/* separate routes for login/signup so the Auth component fully remounts each time */}
        <Route path={ROUTES.login} element={<Auth key="login" initialMode="login" />} />
        <Route path={ROUTES.signup} element={<Auth key="signup" initialMode="signup" />} />
        {/* wrap pages that need auth — shows a gated screen if no token */}
        <Route path={ROUTES.book} element={<ProtectedRoute><BookRide /></ProtectedRoute>} />
        <Route path={ROUTES.matching} element={<ProtectedRoute><Matching /></ProtectedRoute>} />
        <Route path={ROUTES.payment} element={<ProtectedRoute><Payment /></ProtectedRoute>} />
        <Route path={ROUTES.driverProfile} element={<ProtectedRoute><DriverProfile /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </HashRouter>
  );
}

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <nav className="navbar">
      <div className="container">
        <Link to={ROUTES.home} className="navbar-logo">Ride<span>Away</span></Link>
        <ul className="navbar-links">
          <li><NavLink to={ROUTES.home} end className={({ isActive }) => isActive ? "active" : ""}>Home</NavLink></li>
          <li><NavLink to={ROUTES.book} className={({ isActive }) => isActive ? "active" : ""}>Book a Ride</NavLink></li>
          <li><NavLink to={ROUTES.driverProfile} className={({ isActive }) => isActive ? "active" : ""}>Driver</NavLink></li>
        </ul>
        <div className="navbar-cta">
          <Link to={ROUTES.login}>
            <button className="btn-outline" style={{ padding: "8px 18px", fontSize: 13 }}>Log In</button>
          </Link>
          <Link to={ROUTES.signup}>
            <button className="btn-gold" style={{ padding: "8px 18px", fontSize: 13 }}>Sign Up</button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <span className="footer-logo">Ride<span>Away</span></span>
          <span>Ride cheaper, safer and together</span>
          <div style={{ display: "flex", gap: 24 }}>
            <Link to={ROUTES.home} style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Home</Link>
            <Link to={ROUTES.signup} style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Sign Up</Link>
            <Link to={ROUTES.book} style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Book</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// checks for a token in localStorage — if missing, shows the not logged in screen
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("ra_token");
  if (!token) return <NotLoggedIn />;
  return children;
}

function NotLoggedIn() {
  return (
    <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "#f7f5f0" }}>
      <div style={{ textAlign: "center", maxWidth: 480 }}>
        <div style={{ fontSize: 72, lineHeight: 1, marginBottom: 16 }}>🚗💨</div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "var(--dark)", marginBottom: 12 }}>
          Whoa, not so fast!
        </h2>
        <p style={{ fontSize: 16, color: "var(--muted)", marginBottom: 8 }}>
          You need an account to hop in. Sign up or log in and we'll get you moving.
        </p>
        <p style={{ fontSize: 13, color: "var(--faint)", marginBottom: 32 }}>
          Don't worry — it takes less than a minute. 🎓
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Link to={ROUTES.signup}>
            <button className="btn-gold" style={{ padding: "12px 28px" }}>Create Account</button>
          </Link>
          <Link to={ROUTES.login}>
            <button className="btn-outline" style={{ padding: "12px 28px" }}>Log In</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 80, fontWeight: 800, color: "var(--gold)", lineHeight: 1 }}>404</div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, marginTop: 16, marginBottom: 8 }}>Page not found</h2>
        <p style={{ color: "var(--muted)", marginBottom: 28 }}>Looks like this route doesn't exist.</p>
        <Link to={ROUTES.home}><button className="btn-gold" style={{ padding: "12px 32px" }}>Back to Home</button></Link>
      </div>
    </div>
  );
}