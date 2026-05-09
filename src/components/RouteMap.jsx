import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Leaflet's default icons break with webpack — this fixes them
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Takes a plain text address and returns [lat, lng]
// Uses Nominatim (free, no API key needed)
async function geocodeAddress(address) {
  const params = new URLSearchParams({ q: address, format: "json", limit: 1 });
  const response = await fetch("https://nominatim.openstreetmap.org/search?" + params);
  const results = await response.json();

  if (results.length === 0) return null;

  const lat = parseFloat(results[0].lat);
  const lng = parseFloat(results[0].lon);
  return [lat, lng];
}

// Takes two [lat, lng] points and returns an array of points along the road
// Uses OSRM (free, no API key needed)
async function getRoutePoints(startCoords, endCoords) {
  const [startLat, startLng] = startCoords;
  const [endLat, endLng] = endCoords;

  const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.code !== "Ok") return null;

  // OSRM returns [lng, lat] but Leaflet needs [lat, lng], so we flip each point
  const rawPoints = data.routes[0].geometry.coordinates;
  const flippedPoints = rawPoints.map(point => [point[1], point[0]]);
  return flippedPoints;
}

// Small helper component that zooms the map to fit the route
function FitMapToRoute({ routePoints }) {
  const map = useMap();

  useEffect(() => {
    if (routePoints.length > 0) {
      map.fitBounds(routePoints, { padding: [40, 40] });
    }
  }, [routePoints, map]);

  return null;
}

export default function RouteMap({ pickup, dropoff }) {
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState(null);
  const [routePoints, setRoutePoints] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | done | error

  const defaultCenter = [42.3732, -72.5199]; // Amherst, MA

  useEffect(() => {
    // Reset everything if either field is empty
    if (!pickup || !dropoff) {
      setPickupCoords(null);
      setDropoffCoords(null);
      setRoutePoints([]);
      setStatus("idle");
      return;
    }

    // Wait 800ms after user stops typing before calling the APIs
    const timer = setTimeout(async () => {
      setStatus("loading");

      const startCoords = await geocodeAddress(pickup);
      const endCoords = await geocodeAddress(dropoff);

      if (!startCoords || !endCoords) {
        setStatus("error");
        return;
      }

      setPickupCoords(startCoords);
      setDropoffCoords(endCoords);

      const points = await getRoutePoints(startCoords, endCoords);

      if (!points) {
        setStatus("error");
        return;
      }

      setRoutePoints(points);
      setStatus("done");
    }, 800);

    return () => clearTimeout(timer);
  }, [pickup, dropoff]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {pickupCoords && <Marker position={pickupCoords} />}
        {dropoffCoords && <Marker position={dropoffCoords} />}

        {routePoints.length > 0 && (
          <Polyline positions={routePoints} color="#EF4444" weight={5} opacity={0.8} />
        )}

        {routePoints.length > 0 && <FitMapToRoute routePoints={routePoints} />}
      </MapContainer>

      {/* Overlay messages shown on top of the map */}
      {status === "idle" && (
        <div style={overlayStyle}>
          <p style={{ color: "#888", fontSize: 15 }}>Enter locations to see your route</p>
        </div>
      )}
      {status === "loading" && (
        <div style={overlayStyle}>
          <p style={{ color: "#555", fontSize: 15 }}>Finding your route...</p>
        </div>
      )}
      {status === "error" && (
        <div style={overlayStyle}>
          <p style={{ color: "#e55", fontSize: 14 }}>Could not find route — try a more specific address</p>
        </div>
      )}
    </div>
  );
}

const overlayStyle = {
  position: "absolute",
  inset: 0,
  zIndex: 999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(255, 255, 255, 0.75)",
  pointerEvents: "none",
};