import React, { useState } from "react";
import { HashRouter, Routes, Route, Link, NavLink } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import BookRide from "./pages/BookRide";
import Matching from "./pages/Matching";
import Payment from "./pages/Payment";
import DriverProfile from "./pages/DriverProfile";
import "./styles.css";

export const ROUTES = {
  home: "/",
  auth: "/auth",
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
        <Route path={ROUTES.auth} element={<Auth />} />
        <Route path={ROUTES.book} element={<BookRide />} />
        <Route path={ROUTES.matching} element={<Matching />} />
        <Route path={ROUTES.payment} element={<Payment />} />
        <Route path={ROUTES.driverProfile} element={<DriverProfile />} />
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
          <Link to={`${ROUTES.auth}?role=driver`}>
            <button className="btn-outline" style={{ padding: "8px 18px", fontSize: 13 }}>Drive with us</button>
          </Link>
          <Link to={ROUTES.auth}>
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
            <Link to={ROUTES.auth} style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Sign Up</Link>
            <Link to={ROUTES.book} style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Book</Link>
          </div>
        </div>
      </div>
    </footer>
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
