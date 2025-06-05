"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';

interface BoxStats {
  totalBoxesOpened: number;
  remainingBoxes: number;
  maxBoxes: number;
  prizeStatistics: any[];
  recentPurchases: any[];
}

export function useBoxStats() {
  const [stats, setStats] = useState<BoxStats>({
    totalBoxesOpened: 0,
    remainingBoxes: 275,
    maxBoxes: 275,
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
        const { totalBoxesOpened, prizeStatistics, recentPurchases } = response.data.data;
        const maxBoxes = 275; // Valor conforme especificação
        const remainingBoxes = Math.max(0, maxBoxes - totalBoxesOpened);
        
        setStats({
          totalBoxesOpened,
          remainingBoxes,
          maxBoxes,
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