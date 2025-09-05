"use client";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";

type BurnTransaction = {
  id: string;
  amount: number;
  timestamp: number;
  wallet_address: string;
  nft_mint: string;
  transaction_signature: string;
};

export function useBurnTransactions() {
  const [transactions, setTransactions] = useState<BurnTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastTimestamp, setLastTimestamp] = useState<number>(0);

  const fetchInitialTransactions = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/transactions?limit=15');
      if (data.success) {
        setTransactions(data.data);
        if (data.data.length > 0) setLastTimestamp(data.data[0].timestamp);
      }
    } catch (error) {
      console.error('❌ Error fetching initial transactions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkForNewTransactions = useCallback(async () => {
    if (lastTimestamp === 0) return;
    try {
      const { data } = await axios.get(`/api/transactions?limit=3&lastTimestamp=${lastTimestamp}`);
      if (data.success && data.data.length > 0) {
        const newTxs: BurnTransaction[] = data.data;
        for (let i = 0; i < newTxs.length; i++) {
          const newTx = newTxs[i];
          setTimeout(() => {
            setTransactions(prev => {
              const alreadyExists = prev.some(tx => tx.id === newTx.id);
              if (alreadyExists) return prev;
              const updated = [newTx, ...prev];
              const sorted = updated.sort((a, b) => b.timestamp - a.timestamp);
              return sorted.slice(0, 15);
            });
            setLastTimestamp(newTx.timestamp);
          }, i * 1000);
        }
      }
    } catch (err) {
      console.error("❌ Error fetching new transactions", err);
    }
  }, [lastTimestamp]);

 /*  useEffect(() => {
    fetchInitialTransactions();
  }, []);

  useEffect(() => {
    if (lastTimestamp === 0) return;
    const interval = setInterval(() => {
      checkForNewTransactions();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [checkForNewTransactions, lastTimestamp]); */

  return {
    transactions,
    isLoading
  };
} 