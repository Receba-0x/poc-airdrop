"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';

interface BoxStats {
  totalBoxesOpened: number;
  totalCryptoBoxesOpened: number;
  totalSuperPrizeBoxesOpened: number;
  remainingBoxes: number;
  remainingCryptoBoxes: number;
  remainingSuperPrizeBoxes: number;
  maxBoxes: number;
  maxCryptoBoxes: number;
  maxSuperPrizeBoxes: number;
  prizeStatistics: any[];
  recentPurchases: any[];
}

export function useBoxStats() {
  const MAX_BOXES_PER_TYPE = 275; // Default value if API doesn't provide it
  
  const [stats, setStats] = useState<BoxStats>({
    totalBoxesOpened: 0,
    totalCryptoBoxesOpened: 0,
    totalSuperPrizeBoxesOpened: 0,
    remainingBoxes: MAX_BOXES_PER_TYPE,
    remainingCryptoBoxes: MAX_BOXES_PER_TYPE,
    remainingSuperPrizeBoxes: MAX_BOXES_PER_TYPE,
    maxBoxes: MAX_BOXES_PER_TYPE,
    maxCryptoBoxes: MAX_BOXES_PER_TYPE,
    maxSuperPrizeBoxes: MAX_BOXES_PER_TYPE,
    prizeStatistics: [],
    recentPurchases: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get('/api/prize-stats');
      
      if (response.data.success) {
        const { 
          totalBoxesOpened, 
          totalCryptoBoxesOpened, 
          totalSuperPrizeBoxesOpened, 
          remainingCryptoBoxes,
          remainingSuperPrizeBoxes,
          maxCryptoBoxes,
          maxSuperPrizeBoxes,
          prizeStatistics, 
          recentPurchases 
        } = response.data.data;
        
        // Use API values or fallback to defaults
        setStats({
          totalBoxesOpened: totalBoxesOpened || 0,
          totalCryptoBoxesOpened: totalCryptoBoxesOpened || 0,
          totalSuperPrizeBoxesOpened: totalSuperPrizeBoxesOpened || 0,
          remainingBoxes: remainingSuperPrizeBoxes || MAX_BOXES_PER_TYPE - totalSuperPrizeBoxesOpened || 0,
          remainingCryptoBoxes: remainingCryptoBoxes || MAX_BOXES_PER_TYPE - totalCryptoBoxesOpened || 0,
          remainingSuperPrizeBoxes: remainingSuperPrizeBoxes || MAX_BOXES_PER_TYPE - totalSuperPrizeBoxesOpened || 0,
          maxBoxes: maxSuperPrizeBoxes || MAX_BOXES_PER_TYPE,
          maxCryptoBoxes: maxCryptoBoxes || MAX_BOXES_PER_TYPE,
          maxSuperPrizeBoxes: maxSuperPrizeBoxes || MAX_BOXES_PER_TYPE,
          prizeStatistics: prizeStatistics || [],
          recentPurchases: recentPurchases || []
        });
      }
    } catch (err) {
      console.error('Erro ao buscar estatísticas:', err);
      setError('Erro ao carregar estatísticas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats
  };
} 