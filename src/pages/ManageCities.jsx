import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  apiRequest,
  getGuestCities,
  isLoggedIn,
  saveGuestCities
} from "../api";

function cityId(city) {
  return String(city._id || city.id);
}

export default function ManageCities() {
  const [cities, setCities] = useState([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadCities() {
    setLoadingCities(true);
    setError("");

    try {
      if (isLoggedIn()) {
        const data = await apiRequest("/cities");
        setCities(data.cities || []);
      } else {
        setCities(getGuestCities());
      }
    } catch (err) {
      setError(err.message);
      setCities(getGuestCities());
    } finally {
      setLoadingCities(false);
    }
  }

  useEffect(() => {
    loadCities();
  }, []);

  async function handleSearch(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setResults([]);

    if (query.trim().length < 2) {
      setError("Enter at least two characters to search.");
      return;
    }

    setSearching(true);

    try {
      const data = await apiRequest(
        `/cities/search?q=${encodeURIComponent(query.trim())}`
      );

      setResults(data.cities || []);

      if (!data.cities?.length) {
        setMessage("No matching cities found. Try another search.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSearching(false);
    }
  }

  async function handleAdd(city) {
    setError("");
    setMessage("");

    const duplicate = cities.some(
      (saved) =>
        Math.abs(saved.latitude - city.latitude) < 0.0001 &&
        Math.abs(saved.longitude - city.longitude) < 0.0001
    );

    if (duplicate) {
      setError(`${city.name} is already in your saved cities.`);
      return;
    }

    try {
      if (isLoggedIn()) {
        await apiRequest("/cities", {
          method: "POST",
          body: JSON.stringify({
            name: city.name,
            country: city.country || "",
            latitude: city.latitude,
            longitude: city.longitude
          })
        });

        await loadCities();
      } else {
        const newCity = {
          id: `guest-${Date.now()}-${Math.round(city.latitude * 1000)}`,
          name: city.name,
          country: city.country || "",
          latitude: city.latitude,
          longitude: city.longitude
        };

        const updated = [...cities, newCity];
        saveGuestCities(updated);
        setCities(updated);
      }

      setMessage(`${city.name} was added successfully.`);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRemove(city) {
    setError("");
    setMessage("");

    try {
      if (isLoggedIn()) {
        await apiRequest(`/cities/${cityId(city)}`, {
          method: "DELETE"
        });

        await loadCities();
      } else {
        const updated = cities.filter(
          (item) => cityId(item) !== cityId(city)
        );

        saveGuestCities(updated);
        setCities(updated);
      }

      setMessage(`${city.name} was removed.`);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="page-container">
      <div className="page-heading">
        <p className="eyebrow">PERSONALISE YOUR EXPERIENCE</p>
        <h1>Manage Cities</h1>
        <p className="subtitle">
          Search for locations and choose which cities appear on your dashboard.
        </p>
      </div>

      {!isLoggedIn() && (
        <div className="guest-notice">
          <span>💾</span>
          <p>
            Guest mode is active. Your saved cities are stored in this
            browser, so you don't need an account to try the app.
          </p>
        </div>
      )}

      <section className="card city-search-card">
        <h2 className="card-title">Find a city</h2>
        <p className="muted">
          Search by city name to find its weather location.
        </p>

        <form className="city-search-form" onSubmit={handleSearch}>
          <input
            className="search-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="e.g. Pune, Chennai, London..."
            aria-label="Search for a city"
          />

          <button
            className="primary-button"
            type="submit"
            disabled={searching}
          >
            {searching ? "Searching..." : "Search"}
          </button>
        </form>

        {error && <p className="error-message city-message">{error}</p>}
        {message && <p className="success-message city-message">{message}</p>}

        {results.length > 0 && (
          <div className="search-results">
            <h3>Search results</h3>

            {results.map((city, index) => {
              const alreadyAdded = cities.some(
                (saved) =>
                  Math.abs(saved.latitude - city.latitude) < 0.0001 &&
                  Math.abs(saved.longitude - city.longitude) < 0.0001
              );

              return (
                <div
                  className="search-result-row"
                  key={`${city.name}-${city.latitude}-${city.longitude}-${index}`}
                >
                  <div className="search-result-icon">📍</div>

                  <div className="search-result-info">
                    <strong>{city.name}</strong>
                    <span>
                      {[city.admin1, city.country].filter(Boolean).join(", ")}
                    </span>
                  </div>

                  <button
                    className={alreadyAdded ? "secondary-button" : "primary-button"}
                    disabled={alreadyAdded}
                    onClick={() => handleAdd(city)}
                    type="button"
                  >
                    {alreadyAdded ? "Added" : "+ Add"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="saved-cities-section">
        <div className="section-header">
          <div>
            <h2>Your Saved Cities</h2>
            <p className="muted">
              {cities.length} {cities.length === 1 ? "city" : "cities"} saved
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={loadCities}
            disabled={loadingCities}
          >
            ↻ Refresh
          </button>
        </div>

        {loadingCities ? (
          <div className="card loading">Loading saved cities...</div>
        ) : cities.length === 0 ? (
          <div className="card empty-state">
            <div className="empty-icon">🏙️</div>
            <h3>No cities saved</h3>
            <p>Search above and add your first city.</p>
          </div>
        ) : (
          <div className="saved-city-list">
            {cities.map((city) => (
              <div className="saved-city-row" key={cityId(city)}>
                <div className="saved-city-icon">🌍</div>

                <div className="saved-city-info">
                  <strong>{city.name}</strong>
                  <span>{city.country || "Country not specified"}</span>
                  <small>
                    {Number(city.latitude).toFixed(3)},{" "}
                    {Number(city.longitude).toFixed(3)}
                  </small>
                </div>

                <Link
                  to="/"
                  className="secondary-button city-view-link"
                >
                  View weather
                </Link>

                <button
                  className="danger-button"
                  onClick={() => handleRemove(city)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}