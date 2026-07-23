import axios from "axios";
import fs from "fs/promises";
import path from "path";
import { FireLocation } from "../client/src/types/index";

// FIRMS API configuration
const FIRMS_API_BASE_URL = "https://firms.modaps.eosdis.nasa.gov/api/area/csv";
const FIRMS_API_KEY = process.env.FIRMS_API_KEY;
const AREA_CODE = "world"; // Global fire data
const DAYS_TO_LOOK_BACK = 1; // Look back 1 day for fire data (areas API provides more recent data)
const MAX_INACTIVE_TIME = 48; // Keep fires for 48 hours after they're last seen
const SAME_FIRE_THRESHOLD = 2.0; // Threshold in km for considering two fires as the same

// Cache configuration
const CACHE_FILE = path.join(
  process.cwd(),
  "server",
  "cache",
  "fires-cache.json",
);
const CACHE_DIR = path.join(process.cwd(), "server", "cache");
const CACHE_EXPIRY = 12 * 60 * 60 * 1000; // 12 hours - fetch twice daily

// Type for the raw FIRMS data from areas API
interface FirmsRawData {
  latitude: string;
  longitude: string;
  bright_ti4: string; // Using bright_ti4 instead of brightness for VIIRS
  scan: string;
  track: string;
  acq_date: string;
  acq_time: string;
  satellite: string;
  instrument: string;
  confidence: string;
  version: string;
  bright_ti5: string; // Using bright_ti5 instead of bright_t31 for VIIRS
  frp: string;
  daynight: string;
}

// Type for our cached fire data with timestamps
interface CachedFireData {
  fires: FireLocation[];
  lastFetched: number;
  processedFires: FireLocation[]; // Store the final processed data
  lastProcessed: number; // When the processing was last done
  fireMap: Record<
    string,
    {
      fire: FireLocation;
      lastSeen: number;
      isActive: boolean;
    }
  >;
}

// Initial cache structure
const initialCache: CachedFireData = {
  fires: [],
  lastFetched: 0,
  processedFires: [],
  lastProcessed: 0,
  fireMap: {},
};

// Make sure cache directory exists
async function ensureCacheDir() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch (error) {
    console.error("Error creating cache directory:", error);
  }
}

// Load cache from file
async function loadCache(): Promise<CachedFireData> {
  try {
    await ensureCacheDir();
    const data = await fs.readFile(CACHE_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or is invalid, return initial cache
    return { ...initialCache };
  }
}

// Save cache to file
async function saveCache(cache: CachedFireData) {
  try {
    await ensureCacheDir();
    await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
  } catch (error) {
    console.error("Error saving cache:", error);
  }
}

// Generate a unique ID for a fire based on its properties
function generateFireId(fire: FirmsRawData): string {
  // Use full precision coordinates
  const lat = parseFloat(fire.latitude);
  const lon = parseFloat(fire.longitude);

  // Create ID from coordinates, date, time, and satellite to ensure uniqueness
  return `${lat}-${lon}-${fire.acq_date.replace(/\//g, "-")}-${fire.acq_time}-${fire.satellite}`;
}

function areSameFireLocation(
  fire1: FirmsRawData,
  fire2: FirmsRawData,
): boolean {
  const distance = calculateDistance(
    parseFloat(fire1.latitude),
    parseFloat(fire1.longitude),
    parseFloat(fire2.latitude),
    parseFloat(fire2.longitude),
  );
  return distance <= SAME_FIRE_THRESHOLD;
}

// Calculate distance between two coordinates (in km)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Radius of the earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Get location name based on coordinates (global version)
function getLocationName(latitude: number, longitude: number): string {
  // Global major locations with their coordinates
  const locations = [
    // Major global fire-prone regions and cities
    // North America
    { name: "Los Angeles", lat: 34.0522, lon: -118.2437, province: "California, USA" },
    { name: "San Francisco", lat: 37.7749, lon: -122.4194, province: "California, USA" },
    { name: "Phoenix", lat: 33.4484, lon: -112.0740, province: "Arizona, USA" },
    { name: "Denver", lat: 39.7392, lon: -104.9903, province: "Colorado, USA" },
    { name: "Vancouver", lat: 49.2827, lon: -123.1207, province: "British Columbia, Canada" },
    { name: "Calgary", lat: 51.0447, lon: -114.0719, province: "Alberta, Canada" },

    // South America
    { name: "São Paulo", lat: -23.5505, lon: -46.6333, province: "Brazil" },
    { name: "Rio de Janeiro", lat: -22.9068, lon: -43.1729, province: "Brazil" },
    { name: "Brasília", lat: -15.8267, lon: -47.9218, province: "Brazil" },
    { name: "Buenos Aires", lat: -34.6118, lon: -58.3960, province: "Argentina" },
    { name: "Santiago", lat: -33.4489, lon: -70.6693, province: "Chile" },

    // Europe
    { name: "Madrid", lat: 40.4168, lon: -3.7038, province: "Spain" },
    { name: "Barcelona", lat: 41.3851, lon: 2.1734, province: "Spain" },
    { name: "Rome", lat: 41.9028, lon: 12.4964, province: "Italy" },
    { name: "Athens", lat: 37.9838, lon: 23.7275, province: "Greece" },
    { name: "Lisbon", lat: 38.7223, lon: -9.1393, province: "Portugal" },
    { name: "Paris", lat: 48.8566, lon: 2.3522, province: "France" },

    // Africa
    { name: "Cape Town", lat: -33.9249, lon: 18.4241, province: "South Africa" },
    { name: "Johannesburg", lat: -26.2041, lon: 28.0473, province: "South Africa" },
    { name: "Nairobi", lat: -1.2864, lon: 36.8172, province: "Kenya" },
    { name: "Cairo", lat: 30.0444, lon: 31.2357, province: "Egypt" },
    { name: "Lagos", lat: 6.5244, lon: 3.3792, province: "Nigeria" },

    // Asia
    { name: "Sydney", lat: -33.8688, lon: 151.2093, province: "Australia" },
    { name: "Melbourne", lat: -37.8136, lon: 144.9631, province: "Australia" },
    { name: "Perth", lat: -31.9505, lon: 115.8605, province: "Australia" },
    { name: "Jakarta", lat: -6.2088, lon: 106.8456, province: "Indonesia" },
    { name: "Manila", lat: 14.5995, lon: 120.9842, province: "Philippines" },
    { name: "Bangkok", lat: 13.7563, lon: 100.5018, province: "Thailand" },
    { name: "Mumbai", lat: 19.0760, lon: 72.8777, province: "India" },
    { name: "Delhi", lat: 28.7041, lon: 77.1025, province: "India" },
    { name: "Beijing", lat: 39.9042, lon: 116.4074, province: "China" },
    { name: "Shanghai", lat: 31.2304, lon: 121.4737, province: "China" },
    { name: "Tokyo", lat: 35.6762, lon: 139.6503, province: "Japan" },

    // Russia/Siberia (major fire regions)
    { name: "Moscow", lat: 55.7558, lon: 37.6173, province: "Russia" },
    { name: "Novosibirsk", lat: 55.0084, lon: 82.9357, province: "Russia" },
    { name: "Irkutsk", lat: 52.2978, lon: 104.2964, province: "Russia" },
  ];

  // Find closest location
  let closest = {
    name: "Unknown Location",
    distance: Number.MAX_VALUE,
    province: "",
  };
  for (const location of locations) {
    const distance = calculateDistance(
      latitude,
      longitude,
      location.lat,
      location.lon,
    );
    if (distance < closest.distance) {
      closest = {
        name: location.name,
        distance,
        province: location.province,
      };
    }
  }

  // If distance is greater than 200km, it's too far from any known location (increased for global scale)
  if (closest.distance > 200) {
    // For global data, try to determine country/region based on coordinates
    if (latitude >= 25 && latitude <= 49 && longitude >= -125 && longitude <= -66) {
      return "United States";
    } else if (latitude >= 42 && latitude <= 70 && longitude >= -140 && longitude <= -52) {
      return "Canada";
    } else if (latitude >= -56 && latitude <= 15 && longitude >= -82 && longitude <= -35) {
      return "South America";
    } else if (latitude >= 35 && latitude <= 71 && longitude >= -10 && longitude <= 40) {
      return "Europe";
    } else if (latitude >= -35 && latitude <= 37 && longitude >= -20 && longitude <= 55) {
      return "Africa";
    } else if (latitude >= -47 && latitude <= 55 && longitude >= 25 && longitude <= 180) {
      return "Asia";
    } else if (latitude >= -47 && latitude <= -10 && longitude >= 113 && longitude <= 154) {
      return "Australia";
    }
    return closest.province || "Unknown Location";
  }

  return closest.name;
}

// Determine fire intensity based on FRP
function getFireIntensity(
  frp: number,
): "Low" | "Moderate" | "High" | "Extreme" {
  if (frp > 80) return "Extreme";
  if (frp > 50) return "High";
  if (frp > 25) return "Moderate";
  return "Low";
}

// Determine display status based on intensity
function getDisplayStatus(
  intensity: string,
): "Monitor" | "Be Ready" | "Evacuate" {
  if (intensity === "Extreme" || intensity === "High") return "Evacuate";
  if (intensity === "Moderate") return "Be Ready";
  return "Monitor";
}

// Calculate detected time string
function getDetectedTimeString(acqDate: string, acqTime: string): string {
  // Convert acquisition date and time to a timestamp
  let year, month, day;

  // Handle both YYYY-MM-DD and YYYY/MM/DD formats
  if (acqDate.includes("-")) {
    [year, month, day] = acqDate.split("-");
  } else if (acqDate.includes("/")) {
    [year, month, day] = acqDate.split("/");
  } else {
    // Default fallback if format is unknown
    const today = new Date();
    year = today.getFullYear().toString();
    month = (today.getMonth() + 1).toString();
    day = today.getDate().toString();
    console.warn(`Unexpected date format: ${acqDate}, using today's date`);
  }

  // Format acqTime to ensure it's 4 digits
  const formattedTime = acqTime.padStart(4, "0");
  const hours = parseInt(formattedTime.substring(0, 2));
  const minutes = parseInt(formattedTime.substring(2, 4));

  const acqTimestamp = new Date(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day),
    hours,
    minutes,
  ).getTime();

  const now = Date.now();
  const diffMs = now - acqTimestamp;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return "Just now";
  if (diffHours === 1) return "1 hour ago";
  return `${diffHours} hours ago`;
}

// Convert raw FIRMS data to our FireLocation format
function convertFirmsDataToFireLocation(rawData: FirmsRawData): FireLocation {
  const latitude = parseFloat(rawData.latitude);
  const longitude = parseFloat(rawData.longitude);
  const brightness = parseFloat(rawData.bright_ti4);
  const frp = parseFloat(rawData.frp);
  const location = getLocationName(latitude, longitude);
  const intensity = getFireIntensity(frp);
  const displayStatus = getDisplayStatus(intensity);

  // Format acquisition date for display (YYYY-MM-DD to YYYY/MM/DD)
  const acqDate = rawData.acq_date.replace(/-/g, "/");

  return {
    id: generateFireId(rawData),
    latitude,
    longitude,
    brightness,
    scan: parseFloat(rawData.scan),
    track: parseFloat(rawData.track),
    acq_date: acqDate,
    acq_time: rawData.acq_time,
    satellite: rawData.satellite,
    confidence: rawData.confidence, // Keep as string for VIIRS values like 'n', 'l', 'h'
    version: rawData.version,
    bright_t31: parseFloat(rawData.bright_ti5), // Using bright_ti5 as bright_t31 equivalent
    frp,
    daynight: rawData.daynight,

    // Computed properties
    location,
    // Distance will be calculated on the client side based on user's location
    distance: "0", // Default value that will be updated on the client
    detectedTime: getDetectedTimeString(rawData.acq_date, rawData.acq_time),
    intensity: intensity as "Low" | "Moderate" | "High" | "Extreme",
    displayStatus: displayStatus as "Monitor" | "Be Ready" | "Evacuate",
  };
}

// Parse CSV data from FIRMS API
function parseCSV(csv: string): FirmsRawData[] {
  const lines = csv.split("\n");
  // Get header line and parse column names
  const headers = lines[0].split(",");

  // Only add debug logs in development mode
  if (process.env.NODE_ENV === "development") {
    // Occasional minimal logging for verification
    if (lines.length > 1 && Math.random() < 0.1) {
      // Only log 10% of the time to reduce noise
      console.log(`Parsed ${lines.length - 1} rows from FIRMS CSV data`);
    }
  }

  const result: FirmsRawData[] = [];

  // Start from line 1 (skip headers)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(",");
    const entry: any = {};

    // Map each value to its corresponding header
    headers.forEach((header, index) => {
      entry[header] = values[index];
    });

    result.push(entry as FirmsRawData);
  }

  return result;
}

// Fetch fire data from FIRMS API
export async function fetchFiresFromFirms(): Promise<FireLocation[]> {
  // Load current cache
  const cache = await loadCache();

  // Check if processed cache is still valid (15 minutes)
  const now = Date.now();
  const PROCESSED_CACHE_EXPIRY = 6 * 60 * 60 * 1000; // 6 hours for processed data cache
  
  if (cache.lastProcessed > 0 && now - cache.lastProcessed < PROCESSED_CACHE_EXPIRY && cache.processedFires.length > 0) {
    const hoursAgo = Math.round((now - cache.lastProcessed) / (60 * 60 * 1000));
    console.log(`Retrieved ${cache.processedFires.length} fires from processed cache (${hoursAgo}h ago)`);
    return cache.processedFires;
  }
  
  // If raw data cache is still valid, use it for processing
  if (cache.lastFetched > 0 && now - cache.lastFetched < CACHE_EXPIRY) {
    const hoursAgo = Math.round((now - cache.lastFetched) / (60 * 60 * 1000));
    console.log(`Retrieved ${Object.keys(cache.fireMap).length} fires from raw cache (${hoursAgo}h ago)`);
    const activeFires = Object.values(cache.fireMap)
      .filter((item) => item.isActive)
      .map((item) => item.fire);
    
    // Update processed cache
    cache.processedFires = activeFires;
    cache.lastProcessed = now;
    await saveCache(cache);
    
    return activeFires;
  }

  if (!FIRMS_API_KEY) {
    throw new Error("FIRMS API key is not configured");
  }

  try {
    // Use the areas API endpoint format as provided
    let url = `${FIRMS_API_BASE_URL}/${FIRMS_API_KEY}/VIIRS_NOAA21_NRT/${AREA_CODE}/${DAYS_TO_LOOK_BACK}`;

    console.log(`🔥 Fetching fresh fire data from FIRMS API (scheduled fetch)`);
    console.log(`Cache expired - last fetch was ${Math.round((now - cache.lastFetched) / (60 * 60 * 1000))}h ago`);
    
    let response = await axios.get(url);
    console.log(`VIIRS_NOAA21_NRT Response status: ${response.status}, Response length: ${response.data.length}`);
    
    // Debug: Log first few lines of response
    if (response.data && response.data.length > 0) {
      const lines = response.data.split('\n');
      console.log(`First few lines of CSV data:`);
      console.log(lines.slice(0, 5).join('\n'));
    }

    // Parse CSV to get raw fire data
    let rawFires = parseCSV(response.data);
    console.log(`Received ${rawFires.length} fires from VIIRS_NOAA21_NRT`);

    // If no fires from NOAA21, try VIIRS_SNPP_NRT as fallback
    if (rawFires.length === 0) {
      console.log("No fires from VIIRS_NOAA21_NRT, trying VIIRS_SNPP_NRT...");
      url = `${FIRMS_API_BASE_URL}/${FIRMS_API_KEY}/VIIRS_SNPP_NRT/${AREA_CODE}/${DAYS_TO_LOOK_BACK}`;
      response = await axios.get(url);
      console.log(`VIIRS_SNPP_NRT Response status: ${response.status}, Response length: ${response.data.length}`);
      rawFires = parseCSV(response.data);
      console.log(`Received ${rawFires.length} fires from VIIRS_SNPP_NRT`);
    }

    // Convert to our format
    const newFires = rawFires.map(convertFirmsDataToFireLocation);

    // Update cache
    updateFireCache(cache, newFires, now);

    // Save updated cache
    // Get active fires
    const activeFires = Object.values(cache.fireMap)
      .filter((item) => item.isActive)
      .map((item) => item.fire);
    
    // Update processed cache
    cache.processedFires = activeFires;
    cache.lastProcessed = Date.now();
    
    await saveCache(cache);

    // Return only active fires
    return activeFires;
  } catch (error) {
    console.error("Error fetching fires from FIRMS API:", error);

    // If API call fails, return cached fires if available
    if (cache.fires.length > 0) {
      console.log("Returning cached fires due to API error");
      return Object.values(cache.fireMap)
        .filter((item) => item.isActive)
        .map((item) => item.fire);
    }

    // If no cached data, throw error to be handled by caller
    throw error;
  }
}

// Update fire cache with new data
function updateFireCache(
  cache: CachedFireData,
  newFires: FireLocation[],
  timestamp: number,
) {
  // Create a map of new fires by ID for easy lookup
  const newFiresMap: Record<string, FireLocation> = {};
  newFires.forEach((fire) => {
    newFiresMap[fire.id] = fire;
  });

  // Update the cache.fireMap with new fire data
  // For each fire in the new data:
  newFires.forEach((fire) => {
    if (cache.fireMap[fire.id]) {
      // Update existing fire
      cache.fireMap[fire.id] = {
        fire,
        lastSeen: timestamp,
        isActive: true,
      };
    } else {
      // Add new fire
      cache.fireMap[fire.id] = {
        fire,
        lastSeen: timestamp,
        isActive: true,
      };
    }
  });

  // Mark any fire not in the new data as inactive immediately
  Object.keys(cache.fireMap).forEach((fireId) => {
    if (!newFiresMap[fireId]) {
      cache.fireMap[fireId].isActive = false;
    }
  });

  // Update cache metadata
  cache.lastFetched = timestamp;
  cache.fires = Object.values(cache.fireMap)
    .filter((item) => item.isActive)
    .map((item) => item.fire);

  console.log(`Cache updated: ${cache.fires.length} active fires`);
}

// Get active fire data, fetching from API if necessary
export async function getActiveFires(): Promise<FireLocation[]> {
  try {
    return await fetchFiresFromFirms();
  } catch (error) {
    console.error("Error getting active fires:", error);
    throw error;
  }
}