"use client";
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface BoxStats {
  totalBoxesOpened: number;
  totalCryptoBoxesOpened: number;
  totalSuperPrizeBoxesOpened: number;
  remainingCryptoBoxes: number;
  remainingSuperPrizeBoxes: number;
  maxCryptoBoxes: number;
  maxSuperPrizeBoxes: number;
}

export function useBoxStats() {
  const [stats, setStats] = useState<BoxStats>({
    totalBoxesOpened: 0,
    totalCryptoBoxesOpened: 0,
    totalSuperPrizeBoxesOpened: 0,
    remainingCryptoBoxes: 275,
    remainingSuperPrizeBoxes: 275,
    maxCryptoBoxes: 275,
    maxSuperPrizeBoxes: 275,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post('/api/lootbox', {
        action: 'get-stats'
      });
      
      if (response.data.success) {
        setStats(response.data.data);
      } else {
        throw new Error(response.data.error || 'Failed to fetch stats');
      }
    } catch (err: any) {
      console.error('Error fetching box stats:', err);
      setError(err.message || 'Failed to fetch box statistics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refetch,
  };
} 