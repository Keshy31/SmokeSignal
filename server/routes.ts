import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import axios from "axios";
import { getActiveFires } from "./firms-api";

// Mapbox token from environment variable
const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN || "";

// South Africa Western Cape bounding box (approximate)
const SA_WESTERN_CAPE = {
  minLat: -34.5,
  maxLat: -32.5,
  minLon: 18.2,
  maxLon: 20.0
};

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoint for Mapbox token
  app.get("/api/mapbox-token", (req, res) => {
    if (!MAPBOX_ACCESS_TOKEN) {
      return res.status(500).json({ error: "Mapbox access token not configured" });
    }
    res.json({ token: MAPBOX_ACCESS_TOKEN });
  });

  // API route for NASA FIRMS fire data
  app.get("/api/fires", async (req, res) => {
    try {
      // Set cache headers for faster loading - matches server cache duration
      res.set({
        'Cache-Control': 'public, max-age=21600', // Cache for 6 hours (matches processed cache)
        'ETag': `"fires-${Math.floor(Date.now() / (6 * 60 * 60 * 1000))}"`, // Change ETag every 6 hours
        'Last-Modified': new Date().toUTCString()
      });
      
      // Get real fire data from FIRMS API
      const fires = await getActiveFires();

      // Debug the first fire's confidence (only in development)
      if (fires && fires.length > 0 && process.env.NODE_ENV === 'development') {
        console.log(`DEBUG: First fire confidence from API: "${fires[0].confidence}" (${typeof fires[0].confidence})`);
      }

      res.json(fires);
    } catch (error: any) {
      console.error("Error fetching fire data:", error.message);

      // Fallback to dummy data if FIRMS API fails
      try {
        const dummyFireData = generateDummyFireData();
        console.warn("Using dummy fire data due to FIRMS API error");
        res.json(dummyFireData);
      } catch (fallbackError) {
        console.error("Error generating fallback fire data:", fallbackError);
        res.status(500).json({ error: "Failed to fetch fire data" });
      }
    }
  });

  // API route for weather data from OpenWeatherMap
  app.get("/api/weather", async (req, res) => {
    try {
      const lat = req.query.lat || SA_WESTERN_CAPE.minLat;
      const lon = req.query.lon || SA_WESTERN_CAPE.minLon;
      
      const OPENWEATHER_API_KEY = process.env.REPLIT_SECRET_OPENWEATHER_API_KEY;
      if (!OPENWEATHER_API_KEY) {
        throw new Error("OpenWeatherMap API key not configured");
      }

      // Use the correct API endpoint and structure
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
      );

      // Map the response to our expected format
      const weather = {
        temperature: Math.round(response.data.main.temp),
        humidity: response.data.main.humidity,
        windSpeed: Math.round(response.data.wind.speed * 3.6), // Convert m/s to km/h
        windDirection: getWindDirection(response.data.wind.deg)
      };

      res.json(weather);
    } catch (error: any) {
      console.error("Error fetching weather data:", error.message);
      // Fallback to reasonable defaults if API fails
      res.json({
        temperature: 25,
        humidity: 50,
        windSpeed: 10,
        windDirection: 'SE'
      });
    }
  });

  // API route for fire danger index based on actual fire data
  app.get("/api/fire-danger", async (req, res) => {
    try {
      const lat = req.query.lat || SA_WESTERN_CAPE.minLat;
      const lon = req.query.lon || SA_WESTERN_CAPE.minLon;

      // Get actual fire data to factor into danger calculation
      let highestIntensity = 'Low';
      let maxFrp = 0;

      try {
        // Get the active fires data
        const fires = await getActiveFires();

        // Calculate distance from requested location to each fire
        // and find the highest intensity fires within 50km
        if (fires && fires.length > 0) {
          fires.forEach(fire => {
            // Simple distance check (approximate)
            const latDiff = Math.abs(Number(lat) - fire.latitude);
            const lonDiff = Math.abs(Number(lon) - fire.longitude);

            // Rough distance estimate in degrees (1 degree ≈ 111km)
            const approxDistance = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff) * 111;

            // Only consider fires within 50km
            if (approxDistance <= 50) {
              // Track highest FRP (Fire Radiative Power)
              if (fire.frp > maxFrp) {
                maxFrp = fire.frp;
              }

              // Track highest intensity level
              if (fire.intensity === 'Extreme' && highestIntensity !== 'Extreme') {
                highestIntensity = 'Extreme';
              } else if (fire.intensity === 'High' && 
                        (highestIntensity !== 'Extreme' && highestIntensity !== 'High')) {
                highestIntensity = 'High';
              } else if (fire.intensity === 'Moderate' && 
                        (highestIntensity !== 'Extreme' && highestIntensity !== 'High' && 
                         highestIntensity !== 'Moderate')) {
                highestIntensity = 'Moderate';
              }
            }
          });
        }
      } catch (fireDataError) {
        console.error("Error getting fire data for danger calculation:", fireDataError);
        // Continue with environmental factors only if fire data fails
      }

      // Get real weather data
      let temp = 25, humidity = 50, windSpeed = 10;
      const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
      try {
        if (OPENWEATHER_API_KEY) {
          const weatherResponse = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
          );
          temp = weatherResponse.data.main.temp;
          humidity = weatherResponse.data.main.humidity;
          windSpeed = weatherResponse.data.wind.speed * 3.6; // Convert m/s to km/h
        } else {
          throw new Error("OPENWEATHER_API_KEY is not defined");
        }
      } catch (weatherError: any) {
        console.warn("Using default weather values due to API error:", weatherError.message);
      }

      // Base environmental danger value (0-100)
      let environmentalDanger = Math.min(100, Math.max(0, 
        ((temp - 20) * 2) + // Temperature contribution (reduced weight, higher threshold)
        ((100 - humidity) * 0.3) + // Humidity contribution (reduced weight)
        (windSpeed * 2) // Wind contribution (reduced weight)
      ));

      // Adjust environmental danger based on actual fire conditions
      let fireDangerBoost = 0;

      if (maxFrp > 0) {
        // Fire boost based on max FRP found - more granular scale
        if (maxFrp > 100) fireDangerBoost = 100; // Extreme fires
        else if (maxFrp > 75) fireDangerBoost = 80; // Very high fires
        else if (maxFrp > 50) fireDangerBoost = 60; // High fires
        else if (maxFrp > 25) fireDangerBoost = 40; // Moderate fires
        else fireDangerBoost = 20; // Low fires
      }

      // Combine environmental factors and actual fire data
      let dangerValue = 0;

      if (maxFrp > 0) {
        // When fires are present, heavily weight the fire danger
        dangerValue = (environmentalDanger * 0.2) + (fireDangerBoost * 0.8);
      } else {
        // When no fires, use environmental factors with lower cap
        dangerValue = Math.min(environmentalDanger, 50); // Cap at Moderate if no fires
      }

      // Determine danger level
      let level, color;
      if (dangerValue < 25) {
        level = 'Low';
        color = '#4CAF50'; // Safety Green from color palette
      } else if (dangerValue < 50) {
        level = 'Moderate';
        color = '#FFA500'; // Warning Orange from color palette
      } else if (dangerValue < 75) {
        level = 'High';
        color = '#FFA500'; // Warning Orange from color palette
      } else {
        level = 'Severe';
        color = '#E63946'; // Fire Red from color palette
      }

      // Override based on highest intensity fire if it's extreme
      if (highestIntensity === 'Extreme') {
        level = 'Severe';
        color = '#E63946'; // Fire Red from color palette
        dangerValue = Math.max(dangerValue, 80);
      }

      res.json({
        level,
        value: Math.round(dangerValue),
        color
      });
    } catch (error: any) {
      console.error("Error calculating fire danger index:", error.message);
      res.status(500).json({ error: "Failed to calculate fire danger index" });
    }
  });

  // API route for subscribing to fire alerts
  app.post("/api/subscribe", async (req, res) => {
    try {
      const { fireId, deviceToken } = req.body;

      if (!fireId || !deviceToken) {
        return res.status(400).json({ error: "Missing required parameters" });
      }

      // In a real app, this would store the subscription in a database
      // For demo, we'll just return a success response
      res.json({ success: true, message: "Subscribed to alerts for this fire" });
    } catch (error: any) {
      console.error("Error subscribing to alerts:", error.message);
      res.status(500).json({ error: "Failed to subscribe to alerts" });
    }
  });

  // API route for getting a messaging token
  app.get("/api/messaging-token", (req, res) => {
    // In a real app with Firebase, this would generate a real token
    // For demo, we'll return a mock token
    res.json({ token: "mock-firebase-messaging-token-" + Date.now() });
  });

  const httpServer = createServer(app);

  return httpServer;
}

// Helper function to convert wind degrees to direction
function getWindDirection(degrees: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

// Generate dummy fire data that resembles NASA FIRMS data (global coverage)
function generateDummyFireData() {
  const numFires = 15 + Math.floor(Math.random() * 25); // Generate 15-40 fires for global coverage
  const globalFireLocations = [
    // California wildfire regions
    { name: 'Los Angeles', lat: 34.0522, lon: -118.2437 },
    { name: 'San Francisco Bay Area', lat: 37.7749, lon: -122.4194 },
    { name: 'Sacramento', lat: 38.5816, lon: -121.4944 },
    
    // Australia bushfire regions
    { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
    { name: 'Melbourne', lat: -37.8136, lon: 144.9631 },
    { name: 'Perth', lat: -31.9505, lon: 115.8605 },
    
    // Amazon rainforest
    { name: 'Amazon Basin', lat: -3.4653, lon: -62.2159 },
    { name: 'São Paulo', lat: -23.5505, lon: -46.6333 },
    
    // European fire regions
    { name: 'Southern Spain', lat: 37.3886, lon: -5.9823 },
    { name: 'Southern France', lat: 43.6047, lon: 3.8767 },
    { name: 'Greece', lat: 37.9838, lon: 23.7275 },
    
    // African savanna
    { name: 'Kenya Savanna', lat: -1.2864, lon: 36.8172 },
    { name: 'South Africa', lat: -30.5595, lon: 22.9375 },
    
    // Siberian forests
    { name: 'Siberian Taiga', lat: 60.0000, lon: 90.0000 },
    
    // Canadian boreal forest
    { name: 'British Columbia', lat: 54.0000, lon: -125.0000 },
    
    // Indonesian peatlands
    { name: 'Sumatra', lat: -2.5489, lon: 118.0149 },
    { name: 'Borneo', lat: 1.5533, lon: 110.3592 }
  ];

  const satellites = ['AQUA', 'TERRA', 'SNPP', 'NOAA-20'];
  const daynight = ['D', 'N'];

  const fires = [];

  for (let i = 0; i < numFires; i++) {
    // Select random location and add small random offset
    const baseLocation = globalFireLocations[Math.floor(Math.random() * globalFireLocations.length)];
    const latOffset = (Math.random() * 0.1) - 0.05;
    const lonOffset = (Math.random() * 0.1) - 0.05;

    const brightness = 300 + Math.random() * 100;
    const frp = 10 + Math.random() * 90; // Fire Radiative Power in MW

    const today = new Date();
    const acqDate = today.toISOString().split('T')[0].replace(/-/g, '/');
    const acqTime = Math.floor(Math.random() * 2400).toString().padStart(4, '0');

    // Determine intensity based on FRP
    let intensity, displayStatus;
    if (frp > 80) {
      intensity = 'Extreme';
      displayStatus = 'Evacuate';
    } else if (frp > 50) {
      intensity = 'High';
      displayStatus = 'Evacuate';
    } else if (frp > 25) {
      intensity = 'Moderate';
      displayStatus = 'Be Ready';
    } else {
      intensity = 'Low';
      displayStatus = 'Monitor';
    }

    // Calculate a random distance (1-15 km)
    const distance = (Math.random() * 14 + 1).toFixed(1);

    // Random detection time (1-24 hours ago)
    const detectedTime = `${Math.floor(Math.random() * 24) + 1} hours`;

    fires.push({
      id: `fire-${i + 1}`,
      latitude: baseLocation.lat + latOffset,
      longitude: baseLocation.lon + lonOffset,
      brightness: brightness,
      scan: 1.0 + Math.random() * 0.5,
      track: 1.0 + Math.random() * 0.5,
      acq_date: acqDate,
      acq_time: acqTime,
      satellite: satellites[Math.floor(Math.random() * satellites.length)],
      confidence: Math.floor(Math.random() * 100),
      version: '1.0',
      bright_t31: brightness - 10 - Math.random() * 20,
      frp: frp,
      daynight: daynight[Math.floor(Math.random() * daynight.length)],
      // Added computed properties for our app
      location: baseLocation.name,
      distance: distance,
      detectedTime: detectedTime,
      intensity: intensity,
      displayStatus: displayStatus
    });
  }

  return fires;
}