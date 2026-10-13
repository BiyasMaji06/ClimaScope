const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const latitude = Number(req.query.latitude);
    const longitude = Number(req.query.longitude);

    if (
      req.query.latitude === undefined ||
      req.query.longitude === undefined ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return res.status(400).json({
        message: "Valid latitude and longitude are required."
      });
    }

    const url = new URL(
      "https://api.open-meteo.com/v1/forecast"
    );

    url.searchParams.set("latitude", String(latitude));
    url.searchParams.set("longitude", String(longitude));

    url.searchParams.set(
      "current",
      [
        "temperature_2m",
        "relative_humidity_2m",
        "apparent_temperature",
        "is_day",
        "precipitation",
        "weather_code",
        "wind_speed_10m"
      ].join(",")
    );

    url.searchParams.set(
      "hourly",
      [
        "temperature_2m",
        "relative_humidity_2m",
        "precipitation_probability",
        "weather_code"
      ].join(",")
    );

    url.searchParams.set(
      "daily",
      [
        "weather_code",
        "temperature_2m_max",
        "temperature_2m_min",
        "sunrise",
        "sunset",
        "uv_index_max"
      ].join(",")
    );

    url.searchParams.set("timezone", "auto");
    url.searchParams.set("forecast_days", "7");

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Weather service returned an error.");
    }

    const data = await response.json();

    const temperature = data.current?.temperature_2m;

    let heatAdvisory = {
      level: "normal",
      title: "Normal conditions",
      message: "Check the forecast before heading outdoors."
    };

    if (Number.isFinite(temperature) && temperature >= 40) {
      heatAdvisory = {
        level: "high",
        title: "Extreme heat advisory",
        message:
          "Very high temperatures. Limit outdoor activity, " +
          "seek shade, and drink water regularly."
      };
    } else if (
      Number.isFinite(temperature) &&
      temperature >= 35
    ) {
      heatAdvisory = {
        level: "moderate",
        title: "High temperature advisory",
        message:
          "It is hot outside. Stay hydrated and take breaks " +
          "in a cool place."
      };
    }

    return res.json({
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone,
      current: data.current,
      hourly: data.hourly,
      daily: data.daily,
      heatAdvisory
    });
  } catch (error) {
    console.error("Weather API error:", error.message);

    return res.status(502).json({
      message: "Unable to fetch weather data. Please try again."
    });
  }
});

module.exports = router;