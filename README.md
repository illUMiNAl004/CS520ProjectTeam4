# RideLink

RideLink is a campus focused ridesharing web application built for the CS 520 team project at UMass Amherst. It connects riders and drivers in the Five College community through a simple flow for account setup, ride matching, and driver profile management.

## Project Overview

The goal of RideLink is to provide a safer, lower-cost, and more community oriented alternative to generic rideshare platforms tailored for students and campus communities. The app includes separate rider and driver experiences, role based access, and a backend API with PostgreSQL backed persistence. 

## Features

- **Five College verified accounts** — Signup restricted to `.edu` email addresses
- **Role-based experience** — Separate flows and dashboards for riders and drivers
- **JWT authentication** — Secure session management with bcryptjs password hashing
- **Driver onboarding & profile** — Vehicle details, ride guidelines, and preferences
- **Automatic ride matching** — Riders are matched to available online drivers based on location
- **Interactive map integration** — Leaflet and React Leaflet for route and location display
- **Address autocomplete** — Powered by Nominatim (OpenStreetMap) scoped to the Pioneer Valley
- **Profile management** — Riders and drivers can update preferences and account details


## Build and Run Instructions

All setup, environment, build, and run instructions are documented in `BUILD.md`.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, React Router |
| Backend | Node.js, Express.js |
| Database | PostgreSQL via Supabase |
| Authentication | JWT, bcryptjs |
| Maps | Leaflet, React Leaflet |
| Address Search | Nominatim (OpenStreetMap) |

---

## Team

- Aditi Khodke
- Tanishq Saria
- Aarin Mehta
- Vedaant Agrawal

