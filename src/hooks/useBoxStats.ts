"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";

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

      const { data } = await axios.post("/api/lootbox", {
        action: "get-stock",
      });

      if (data.success) {
        const boxStock = data.data.boxStock;
        const cryptoBox = boxStock.find((b: any) => b.box_type === "crypto");
        const superPrizeBox = boxStock.find(
          (b: any) => b.box_type === "super_prize"
        );

        setStats({
          totalBoxesOpened:
            (cryptoBox?.initial_stock ?? 0) -
            (cryptoBox?.current_stock ?? 0) +
            (superPrizeBox?.initial_stock ?? 0) -
            (superPrizeBox?.current_stock ?? 0),
          totalCryptoBoxesOpened:
            (cryptoBox?.initial_stock ?? 0) - (cryptoBox?.current_stock ?? 0),
          totalSuperPrizeBoxesOpened:
            (superPrizeBox?.initial_stock ?? 0) -
            (superPrizeBox?.current_stock ?? 0),
          remainingCryptoBoxes: cryptoBox?.current_stock ?? 0,
          remainingSuperPrizeBoxes: superPrizeBox?.current_stock ?? 0,
          maxCryptoBoxes: cryptoBox?.initial_stock ?? 0,
          maxSuperPrizeBoxes: superPrizeBox?.initial_stock ?? 0,
        });
      } else {
        throw new Error(data.error || "Failed to fetch stats");
      }
    } catch (err: any) {
      console.error("Error fetching box stats:", err);
      setError(err.message || "Failed to fetch box statistics");
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
