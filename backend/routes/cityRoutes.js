const express = require("express");
const jwt = require("jsonwebtoken");
const City = require("../models/City");
const router = express.Router();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Please log in to manage your cities."
    });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired token. Please log in again."
    });
  }
};

// Search cities using the Open-Meteo Geocoding API
router.get("/search", async (req, res) => {
  try {
    const query = String(req.query.q || "").trim();

    if (query.length < 2) {
      return res.status(400).json({
        message: "Enter at least two characters to search."
      });
    }

    const url = new URL(
      "https://geocoding-api.open-meteo.com/v1/search"
    );

    url.searchParams.set("name", query);
    url.searchParams.set("count", "10");
    url.searchParams.set("language", "en");
    url.searchParams.set("format", "json");

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Geocoding service unavailable.");
    }

    const data = await response.json();

    const cities = (data.results || []).map((city) => ({
      name: city.name,
      country: city.country || "",
      admin1: city.admin1 || "",
      latitude: city.latitude,
      longitude: city.longitude,
      countryCode: city.country_code || ""
    }));

    return res.json({ cities });
  } catch (error) {
    console.error("City search error:", error.message);

    return res.status(502).json({
      message: "Unable to search cities right now."
    });
  }
});

// Retrieve the logged-in user's saved cities
router.get("/", authenticateToken, async (req, res) => {
  try {
    const cities = await City.find({
      user: req.userId
    }).sort({ name: 1 });

    return res.json({ cities });
  } catch (error) {
    console.error("Get cities error:", error.message);

    return res.status(500).json({
      message: "Unable to retrieve saved cities."
    });
  }
});

// Save a city for the logged-in user
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { name, country, latitude, longitude } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof latitude !== "number" ||
      typeof longitude !== "number" ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return res.status(400).json({
        message: "Provide a valid city name, latitude, and longitude."
      });
    }

    const existingCity = await City.findOne({
      user: req.userId,
      latitude,
      longitude
    });

    if (existingCity) {
      return res.status(409).json({
        message: "This city is already saved.",
        city: existingCity
      });
    }

    const city = await City.create({
      name: name.trim(),
      country: typeof country === "string" ? country.trim() : "",
      latitude,
      longitude,
      user: req.userId
    });

    return res.status(201).json({
      message: "City saved successfully.",
      city
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This city is already saved."
      });
    }

    console.error("Save city error:", error.message);

    return res.status(500).json({
      message: "Unable to save this city."
    });
  }
});

// Delete only a city belonging to the logged-in user
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
      return res.status(400).json({
        message: "Invalid city ID."
      });
    }

    const city = await City.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    if (!city) {
      return res.status(404).json({
        message: "City not found in your saved cities."
      });
    }

    return res.json({
      message: "City removed successfully."
    });
  } catch (error) {
    console.error("Delete city error:", error.message);

    return res.status(500).json({
      message: "Unable to remove this city."
    });
  }
});

module.exports = router;