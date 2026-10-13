const API_BASE_URL = "http://localhost:5000/api";
const GUEST_CITIES_KEY = "climaGuestCities";

export function getToken() {
  return localStorage.getItem("climateToken");
}

export function getSavedUser() {
  try {
    return JSON.parse(localStorage.getItem("climateUser") || "null");
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return Boolean(getToken());
}

export function saveSession(data) {
  localStorage.setItem("climateToken", data.token);
  localStorage.setItem("climateUser", JSON.stringify(data.user));
}

export function clearSession() {
  localStorage.removeItem("climateToken");
  localStorage.removeItem("climateUser");
}

export function getGuestCities() {
  try {
    const saved = localStorage.getItem(GUEST_CITIES_KEY);

    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
  }

  return [
    {
      id: "guest-mumbai",
      name: "Mumbai",
      country: "India",
      latitude: 19.076,
      longitude: 72.8777
    },
    {
      id: "guest-kolkata",
      name: "Kolkata",
      country: "India",
      latitude: 22.5726,
      longitude: 88.3639
    },
    {
      id: "guest-delhi",
      name: "Delhi",
      country: "India",
      latitude: 28.6139,
      longitude: 77.209
    },
    {
      id: "guest-bengaluru",
      name: "Bengaluru",
      country: "India",
      latitude: 12.9716,
      longitude: 77.5946
    },
    {
      id: "guest-bhopal",
      name: "Bhopal",
      country: "India",
      latitude: 23.2599,
      longitude: 77.4126
    }
  ];
}

export function saveGuestCities(cities) {
  localStorage.setItem(GUEST_CITIES_KEY, JSON.stringify(cities));
}

export async function apiRequest(endpoint, options = {}) {
  const headers = {
    ...(options.body
      ? { "Content-Type": "application/json" }
      : {}),
    ...options.headers
  };

  const token = getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
}