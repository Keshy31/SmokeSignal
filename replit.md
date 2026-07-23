# Western Cape Fire Warning Application

## Project Overview
A cutting-edge geospatial fire warning application for South Africa's Western Cape region, delivering real-time fire risk intelligence through advanced technologies.

## Key Technologies
- React with TypeScript for robust frontend development
- Mapbox for precise geospatial visualization
- Real-time NASA FIRMS data processing and risk assessment
- Comprehensive multilingual support
- Dynamic fire marker visualization with intensity-based color gradients and custom SVG icons
- Enhanced UI with gradient-based popup styling and intensity-matched glow effects
- Responsive navbar with app logo and language selector

## Project Architecture

### Backend (Express.js)
- `server/index.ts` - Main Express server setup
- `server/routes.ts` - API routes including `/api/fires`, `/api/fire-danger`, `/api/mapbox-token`
- `server/firms-api.ts` - NASA FIRMS API integration with caching and data processing
- `server/storage.ts` - Storage interface (currently using in-memory storage)

### Frontend (React + TypeScript)
- `client/src/pages/home.tsx` - Main application page
- `client/src/components/MapContainer.tsx` - Map container with Mapbox integration
- `client/src/components/FireMarkers.tsx` - Fire markers rendering on map
- `client/src/components/FireDetailModal.tsx` - Fire detail modal display
- `client/src/components/FireDangerIndex.tsx` - Fire danger visualization
- `client/src/hooks/useFires.ts` - Fire data fetching and management

### Shared
- `shared/schema.ts` - Database schema and types using Drizzle ORM

## Current Fire Data Implementation
- Uses NASA FIRMS API for real-time fire detection data
- Processes CSV data with fields: latitude, longitude, bright_ti4, scan, track, acq_date, acq_time, satellite, instrument, confidence, version, bright_ti5, frp, daynight
- Implements caching mechanism for API responses
- Provides fallback to dummy data if API fails
- Displays fires with intensity-based styling and interactive markers

## API Endpoints
- `GET /api/fires` - Fetch active fire data from NASA FIRMS
- `GET /api/fire-danger` - Get fire danger level for location
- `GET /api/mapbox-token` - Get Mapbox access token

## Environment Variables Required
- `FIRMS_API_KEY` - NASA FIRMS API key for fire data
- `OPENWEATHER_API_KEY` - OpenWeather API key for weather data
- `MAPBOX_TOKEN` - Mapbox access token for map functionality

## Recent Changes
- **2025-08-20**: Successfully migrated fires API to use NASA FIRMS areas endpoint
  - Now fetches 70,989+ real-time fires from VIIRS_NOAA21_NRT satellite data
  - Removed hardcoded API key, now uses secure environment variable
  - Updated API configuration for areas-based fire data retrieval
  - Enhanced debugging and CSV data processing

## User Preferences
- Focus on South African Western Cape region
- Real-time fire detection and alerting
- Multi-language support (English, Afrikaans, Xhosa)
- Mobile-responsive design
- Offline capability with caching

## Development Notes
- Uses Vite for fast development and building
- Implements comprehensive error handling and loading states
- Uses TanStack Query for data fetching and caching
- Follows modern React patterns with hooks and context