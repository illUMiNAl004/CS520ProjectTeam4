export const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

export const RIDER_SCHEMA_SHAPE = {
  id: null, role: "rider", email: "", universitySSO: null,
  emailVerified: false, firstName: "", lastName: "", avatarUrl: null,
  phone: null, university: "", defaultPickup: null, savedAddresses: [],
  preferShared: true, loyaltyPoints: 0, totalRides: 0, totalSpent: 0,
  paymentMethods: [], createdAt: null, updatedAt: null, lastLoginAt: null,
};

export const DRIVER_SCHEMA_SHAPE = {
  id: null, role: "driver", email: "", universitySSO: null,
  emailVerified: false, firstName: "", lastName: "", avatarUrl: null,
  phone: "", university: "",
  vehicle: { make: "", model: "", year: null, color: "", licensePlate: "", maxSeats: 4 },
  guidelines: { noSmoking: true, musicOn: true, quietRide: false, noPets: true, noFood: false, maxRiders: 2, acAlwaysOn: false, luggageOk: false, customNote: null },
  preferences: { allowSharedRides: true, campusRoutesOnly: false, verifiedRidersOnly: true, isOnline: false },
  rating: 0, totalRides: 0, totalEarned: 0, acceptanceRate: 0,
  licenseVerified: false, backgroundChecked: false, vehicleInspected: false,
  createdAt: null, updatedAt: null, lastActiveAt: null,
};

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("ra_token");
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  return res.json();
}

export const riderApi = {
  signup: (formData) =>
    apiFetch("/api/signup", { method: "POST", body: JSON.stringify({ role: "rider", ...formData }) }),
  login: ({ email, password }) =>
    apiFetch("/api/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  getProfile: () => apiFetch("/api/me"),
  updateProfile: (_id, updates) => apiFetch("/api/me", { method: "PATCH", body: JSON.stringify(updates) }),
};

export const driverApi = {
  signup: (formData) =>
    apiFetch("/api/signup", { method: "POST", body: JSON.stringify({ role: "driver", ...formData }) }),
  login: ({ email, password }) =>
    apiFetch("/api/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  getProfile: () => apiFetch("/api/me"),
  updateGuidelines: (_id, guidelines) => apiFetch("/api/me", { method: "PATCH", body: JSON.stringify({ guidelines }) }),
  updatePreferences: (_id, preferences) => apiFetch("/api/me", { method: "PATCH", body: JSON.stringify({ preferences }) }),
  setOnlineStatus: (_id, isOnline) => apiFetch("/api/me", { method: "PATCH", body: JSON.stringify({ isOnline }) }),
};