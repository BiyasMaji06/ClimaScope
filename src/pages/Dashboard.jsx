import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import {
  apiRequest,
  getGuestCities,
  isLoggedIn
} from "../api";

function cityId(city) {
  return String(city._id || city.id);
}

function weatherInfo(code) {
  if (code === 0) return { icon: "☀️", label: "Clear sky" };
  if ([1, 2].includes(code)) return { icon: "🌤️", label: "Partly cloudy" };
  if (code === 3) return { icon: "☁️", label: "Overcast" };
  if ([45, 48].includes(code)) return { icon: "🌫️", label: "Foggy" };
  if ([51, 53, 55, 56, 57].includes(code)) return { icon: "🌦️", label: "Drizzle" };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { icon: "🌧️", label: "Rainy" };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { icon: "❄️", label: "Snow" };
  if ([95, 96, 99].includes(code)) return { icon: "⛈️", label: "Thunderstorm" };
  return { icon: "🌡️", label: "Weather conditions" };
}

function formatDate(value) {
  return new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString(
    "en-IN",
    { day: "numeric", month: "short" }
  );
}

function formatDay(value) {
  return new Date(`${value}T12:00:00`).toLocaleDateString(
    "en-IN",
    { weekday: "short" }
  );
}

function formatHour(value) {
  const time = value.slice(11, 16).split(":");
  const hour = Number(time[0]);
  const suffix = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}${suffix}`;
}

async function fetchWeather(city) {
  return apiRequest(
    `/weather?latitude=${city.latitude}&longitude=${city.longitude}`
  );
}

export default function Dashboard() {
  const [cities, setCities] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [weatherByCity, setWeatherByCity] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard(preferredId) {
    setLoading(true);
    setError("");

    try {
      let savedCities;

      if (isLoggedIn()) {
        const result = await apiRequest("/cities");
        savedCities = result.cities || [];
      } else {
        savedCities = getGuestCities();
      }

      setCities(savedCities);

      if (!savedCities.length) {
        setSelectedId("");
        setWeatherByCity({});
        return;
      }

      const nextId =
        savedCities.find((city) => cityId(city) === preferredId)
          ? preferredId
          : savedCities.find((city) => cityId(city) === selectedId)
            ? selectedId
            : cityId(savedCities[0]);

      setSelectedId(nextId);

      const results = await Promise.allSettled(
        savedCities.map(async (city) => ({
          id: cityId(city),
          data: await fetchWeather(city)
        }))
      );

      const weatherMap = {};

      results.forEach((result) => {
        if (result.status === "fulfilled") {
          weatherMap[result.value.id] = result.value.data;
        }
      });

      setWeatherByCity(weatherMap);

      if (!weatherMap[nextId]) {
        throw new Error(
          "Weather data could not be loaded. Please refresh and try again."
        );
      }
    } catch (err) {
      setError(err.message || "Unable to load the dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const selectedCity = cities.find(
    (city) => cityId(city) === selectedId
  );

  const weather = weatherByCity[selectedId];
  const current = weather?.current;
  const daily = weather?.daily;
  const hourly = weather?.hourly;
  const currentInfo = weatherInfo(current?.weather_code);

  const hourlyData = hourly?.time
    ?.map((time, index) => ({
      time,
      label: formatHour(time),
      temperature: hourly.temperature_2m[index]
    }))
    .filter((item) => item.time >= current?.time)
    .slice(0, 24) || [];

  const forecast = daily?.time?.map((date, index) => ({
    date,
    code: daily.weather_code[index],
    max: daily.temperature_2m_max[index],
    min: daily.temperature_2m_min[index],
    uv: daily.uv_index_max[index]
  })) || [];

  return (
    <main className="page-container">
      <div className="page-heading dashboard-heading">
        <div>
          <p className="eyebrow">YOUR WEATHER OVERVIEW</p>
          <h1>Weather Dashboard</h1>
          <p className="subtitle">
            Weather insights for your favourite cities.
          </p>
        </div>

        <div className="dashboard-actions">
          <select
            className="city-select"
            aria-label="Choose a city"
            value={selectedId}
            disabled={!cities.length || loading}
            onChange={(event) => setSelectedId(event.target.value)}
          >
            {cities.map((city) => (
              <option key={cityId(city)} value={cityId(city)}>
                {city.name}, {city.country}
              </option>
            ))}
          </select>

          <button
            className="secondary-button"
            onClick={() => loadDashboard(selectedId)}
            disabled={loading}
          >
            {loading ? "Loading..." : "↻ Refresh"}
          </button>
        </div>
      </div>

      {!isLoggedIn() && (
        <div className="guest-notice">
          <span>👋</span>
          <p>
            You're exploring as a guest. Your city changes are saved
            in this browser.
          </p>
        </div>
      )}

      {error && (
        <div className="error-message dashboard-error">
          {error}
          <button
            className="secondary-button"
            onClick={() => loadDashboard(selectedId)}
          >
            Try again
          </button>
        </div>
      )}

      {loading && !weather ? (
        <div className="card loading">Loading weather information...</div>
      ) : !cities.length ? (
        <section className="card empty-state">
          <div className="empty-icon">🌍</div>
          <h2>No saved cities</h2>
          <p>Add a city to start viewing weather.</p>
          <a href="/cities" className="primary-button">
            Manage Cities
          </a>
        </section>
      ) : current ? (
        <>
          <section className="weather-hero">
            <div className="weather-hero-main">
              <p className="hero-location">
                📍 {selectedCity?.name}, {selectedCity?.country}
              </p>
              <p className="hero-date">
                {weather.timezone} · {formatDate(current.time)}
              </p>

              <div className="hero-temperature">
                <span className="hero-weather-icon">
                  {currentInfo.icon}
                </span>
                <span>{Math.round(current.temperature_2m)}°C</span>
              </div>

              <p className="hero-condition">{currentInfo.label}</p>
              <p className="hero-feels">
                Feels like {Math.round(current.apparent_temperature)}°C
              </p>
            </div>

            <div className="hero-details">
              <div className="hero-detail">
                <span>💧</span>
                <div>
                  <p>Humidity</p>
                  <strong>{current.relative_humidity_2m}%</strong>
                </div>
              </div>

              <div className="hero-detail">
                <span>💨</span>
                <div>
                  <p>Wind speed</p>
                  <strong>{current.wind_speed_10m} km/h</strong>
                </div>
              </div>

              <div className="hero-detail">
                <span>🌧️</span>
                <div>
                  <p>Precipitation</p>
                  <strong>{current.precipitation} mm</strong>
                </div>
              </div>

              <div className="hero-detail">
                <span>🌡️</span>
                <div>
                  <p>Feels like</p>
                  <strong>{Math.round(current.apparent_temperature)}°C</strong>
                </div>
              </div>
            </div>
          </section>

          <section className={`heat-advisory heat-${weather.heatAdvisory?.level || "normal"}`}>
            <span className="advisory-icon">
              {weather.heatAdvisory?.level === "high" ? "⚠️" : "☀️"}
            </span>
            <div>
              <h3>
                {weather.heatAdvisory?.title || "Weather advisory"}
              </h3>
              <p>
                {weather.heatAdvisory?.message ||
                  "Check local weather conditions before heading outdoors."}
              </p>
            </div>
          </section>

          <section className="dashboard-grid">
            <div className="card chart-card">
              <div className="section-header">
                <div>
                  <h2 className="card-title">Hourly Temperature</h2>
                  <p className="muted">Forecast for the next 24 hours</p>
                </div>
                <span className="unit-pill">°C</span>
              </div>

              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={hourlyData}
                    margin={{ top: 15, right: 12, left: -15, bottom: 5 }}
                  >
                    <CartesianGrid stroke="#edf1f7" strokeDasharray="4 4" />
                    <XAxis
                      dataKey="label"
                      interval={3}
                      tick={{ fill: "#7b8798", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      unit="°"
                      tick={{ fill: "#7b8798", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(value) => [`${value}°C`, "Temperature"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="temperature"
                      stroke="#3478f6"
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <h2 className="card-title">Today's Overview</h2>
              <p className="muted">Important weather details</p>

              <div className="overview-row">
                <span>🌡️ Temperature range</span>
                <strong>
                  {daily?.temperature_2m_min?.[0] ?? "—"}° –{" "}
                  {daily?.temperature_2m_max?.[0] ?? "—"}°C
                </strong>
              </div>

              <div className="overview-row">
                <span>☀️ Maximum UV index</span>
                <strong>{daily?.uv_index_max?.[0] ?? "—"}</strong>
              </div>

              <div className="overview-row">
                <span>🌅 Sunrise</span>
                <strong>
                  {daily?.sunrise?.[0]
                    ? formatHour(daily.sunrise[0])
                    : "—"}
                </strong>
              </div>

              <div className="overview-row">
                <span>🌇 Sunset</span>
                <strong>
                  {daily?.sunset?.[0]
                    ? formatHour(daily.sunset[0])
                    : "—"}
                </strong>
              </div>
            </div>
          </section>

          <section className="card forecast-card">
            <div className="section-header">
              <div>
                <h2 className="card-title">7-Day Forecast</h2>
                <p className="muted">Daily high and low temperatures</p>
              </div>
            </div>

            <div className="forecast-list">
              {forecast.map((day, index) => {
                const info = weatherInfo(day.code);

                return (
                  <div className="forecast-day" key={day.date}>
                    <div className="forecast-date">
                      <strong>{index === 0 ? "Today" : formatDay(day.date)}</strong>
                      <span>{formatDate(day.date)}</span>
                    </div>

                    <span className="forecast-icon">{info.icon}</span>
                    <span className="forecast-condition">{info.label}</span>

                    <div className="forecast-temperatures">
                      <strong>{Math.round(day.max)}°</strong>
                      <span>{Math.round(day.min)}°</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      ) : null}
    </main>
  );
}