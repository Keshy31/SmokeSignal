import { useState, useEffect } from 'react';
import { fetchFireDangerIndex } from '@/lib/api';
import { FireDangerIndex } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

export const useFireDanger = (latitude: number, longitude: number) => {
  const { data, isLoading, error, refetch } = useQuery<FireDangerIndex>({
    queryKey: ['/api/fire-danger', latitude, longitude],
    queryFn: async () => {
      try {
        return await fetchFireDangerIndex(latitude, longitude);
      } catch (error) {
        console.error('Error fetching fire danger index:', error);
        // Return default value in case of error
        return {
          level: 'Moderate',
          value: 50,
          color: '#FFA500' // Warning Orange from color palette
        };
      }
    },
    refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes
    refetchOnWindowFocus: true,
    // Provide a fallback value if the query hasn't been fetched yet
    placeholderData: {
      level: 'Moderate',
      value: 50,
      color: '#FFA500' // Warning Orange from color palette
    },
    // Better error handling
    retry: 3 // Retry failed requests 3 times
  });

  return {
    fireDanger: data,
    isLoading,
    error,
    refetch
  };
};
