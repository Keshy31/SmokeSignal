import { useState, useEffect } from 'react';
import { FireLocation } from '@/types';

export const useFires = () => {
  const [fires, setFires] = useState<FireLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchFires = async () => {
    try {
      setIsLoading(true);
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      try {
        const response = await fetch('/api/fires', { 
          signal: controller.signal,
          headers: { 'Cache-Control': 'max-age=21600' } // Cache for 6 hours, matches server cache
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Validate data is an array
        if (!Array.isArray(data)) {
          console.error('Invalid fire data format:', data);
          throw new Error('Server returned invalid fire data format');
        }
        
        // Check for required properties in each fire
        const validFires = data.filter(fire => {
          return fire && 
                 typeof fire.id === 'string' && 
                 typeof fire.latitude === 'number' && 
                 typeof fire.longitude === 'number';
        });
        
        if (validFires.length < data.length) {
          console.warn(`Filtered out ${data.length - validFires.length} invalid fire entries`);
        }
        
        console.log('Successfully fetched fire data:', validFires.length, 'fires');
        setFires(validFires);
        setError(null);
        
        // Cache data for offline use
        if ('caches' in window) {
          try {
            const cache = await caches.open('fire-app-cache-v1');
            const responseToCache = new Response(JSON.stringify(validFires), {
              headers: { 'Content-Type': 'application/json' }
            });
            await cache.put('/api/fires', responseToCache);
          } catch (cacheError) {
            console.warn('Could not cache fire data:', cacheError);
          }
        }
      } catch (error: unknown) {
        clearTimeout(timeoutId);
        
        // Check for network errors first
        if (!navigator.onLine) {
          throw new Error('You are offline. Using cached data if available.');
        }
        
        // Handle AbortError for timeouts
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timed out. Server may be unavailable.');
        }
        
        // Re-throw with better error message if possible
        if (error instanceof Error) {
          throw new Error(`Error fetching fire data: ${error.message}`);
        } else {
          throw new Error('Unknown error fetching fire data');
        }
      }
    } catch (err) {
      console.error('Error fetching fires:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      // Try to get cached data when server request fails
      if ('caches' in window) {
        try {
          const cache = await caches.open('fire-app-cache-v1');
          const cachedResponse = await cache.match('/api/fires');
          if (cachedResponse) {
            const cachedData = await cachedResponse.json();
            console.log('Retrieved', cachedData.length, 'fires from cache');
            setFires(cachedData);
          }
        } catch (cacheError) {
          console.error('Error retrieving cached fire data:', cacheError);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch fires data on component mount with request deduplication
  useEffect(() => {
    let isMounted = true;
    let fetchPromise: Promise<void> | null = null;
    
    const debouncedFetch = async () => {
      // If a fetch is already in progress, return that promise
      if (fetchPromise) {
        return fetchPromise;
      }
      
      fetchPromise = fetchFires().finally(() => {
        fetchPromise = null;
      });
      
      return fetchPromise;
    };
    
    // Initial fetch
    debouncedFetch().catch(error => {
      console.error('Failed to load initial fire data:', error);
      if (isMounted) {
        setError(error instanceof Error ? error : new Error(String(error)));
      }
    });
    
    // Set up auto-refresh every 6 hours to match server cache duration
    const interval = setInterval(() => {
      if (isMounted) {
        console.log('Auto-refreshing fire data (6-hour interval)');
        debouncedFetch().catch(error => {
          console.error('Failed to refresh fire data:', error);
          if (isMounted) {
            setError(error instanceof Error ? error : new Error(String(error)));
          }
        });
      }
    }, 6 * 60 * 60 * 1000); // 6 hours
    
    // Clean up function
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);
  
  return {
    fires,
    isLoading,
    error,
    refetch: fetchFires
  };
};