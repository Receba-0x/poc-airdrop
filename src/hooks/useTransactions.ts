"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import apiClient from "@/libs/axios";
import { useAccount } from "wagmi";

export type Transaction = {
  id: string;
  name: string;
  value: number;
  status:
    | "Completed"
    | "Error"
    | "Processing..."
    | "Claimed"
    | "Delivering"
    | "Delivered";
  date: string;
  prizeId: number;
  isCrypto: boolean;
  txHash: string;
  claimed?: boolean;
};

const transactionCache = new Map<
  string,
  { data: Transaction[]; timestamp: number }
>();
const CACHE_DURATION = 30000;

export function useTransactions(initialLimit = 10) {
  const { address, isConnected } = useAccount();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [limit, setLimit] = useState(initialLimit);

  const formatTransaction = useCallback(
    (tx: any, index: number): Transaction => {
      const prizeName = tx.prize_name || "Unknown Prize";
      const prizeValue = tx.amount_purchased || 0;
      const prizeId = tx.prize_id || 0;
      const isCrypto = tx.is_crypto || prizeId >= 100;
      const claimed = tx.claimed;

      let status: Transaction["status"] = "Completed";
      switch (tx.status) {
        case "error":
          status = "Error";
          break;
        case "processing":
          status = "Processing...";
          break;
        case "claimed":
          status = "Claimed";
          break;
        case "delivering":
          status = "Delivering";
          break;
        case "delivered":
          status = "Delivered";
          break;
      }

      let formattedDate = "Unknown date";
      try {
        const txDate = new Date(
          tx.purchase_timestamp || tx.timestamp || Date.now()
        );
        formattedDate =
          txDate.toLocaleDateString() + " " + txDate.toLocaleTimeString();
      } catch (dateError) {
        console.error("Date formatting error:", dateError);
      }

      return {
        id: tx.nft_mint || tx.nftMint || tx.id || `unknown-${index}`,
        name: prizeName,
        value: prizeValue,
        status,
        date: formattedDate,
        prizeId,
        isCrypto,
        txHash: tx.transaction_signature || tx.transactionSignature || "",
        claimed,
      };
    },
    []
  );

  const fetchTransactions = useCallback(
    async (force = false) => {
      if (!address) return;

      // Check cache first (unless forced refresh)
      const cacheKey = address;
      const cached = transactionCache.get(cacheKey);
      const now = Date.now();

      if (!force && cached && now - cached.timestamp < CACHE_DURATION) {
        setAllTransactions(cached.data);
        setTransactions(cached.data.slice(0, limit));
        setHasMore(cached.data.length > limit);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const { data } = await apiClient.get("/api/get-transactions", {
          params: { wallet: address },
          timeout: 10000, // 10 second timeout
        });

        if (data.success && Array.isArray(data.transactions)) {
          if (data.transactions.length === 0) {
            setTransactions([]);
            setAllTransactions([]);
            setHasMore(false);
            transactionCache.set(cacheKey, { data: [], timestamp: now });
            return;
          }

          // Process transactions more efficiently
          const formattedTransactions = data.transactions
            .map((tx: any, index: number) => {
              try {
                return formatTransaction(tx, index);
              } catch (txError) {
                console.error(
                  `Error processing transaction ${index}:`,
                  txError
                );
                return null;
              }
            })
            .filter(Boolean) as Transaction[];

          setAllTransactions(formattedTransactions);
          setTransactions(formattedTransactions.slice(0, limit));
          setHasMore(formattedTransactions.length > limit);

          // Cache the result
          transactionCache.set(cacheKey, {
            data: formattedTransactions,
            timestamp: now,
          });
        } else {
          throw new Error("Invalid API response format");
        }
      } catch (err: any) {
        console.error("Error fetching transactions:", err);
        const errorMessage =
          err.code === "ECONNABORTED"
            ? "Request timeout - please try again"
            : err.response?.data?.error || "Error loading transactions";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [address, formatTransaction, limit]
  );

  // Load more transactions
  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    setTimeout(() => {
      const newLimit = limit + 10;
      setLimit(newLimit);
      setTransactions(allTransactions.slice(0, newLimit));
      setHasMore(allTransactions.length > newLimit);
      setIsLoadingMore(false);
    }, 300); // Small delay to show loading state
  }, [allTransactions, limit, hasMore, isLoadingMore]);

  // Memoize the refresh function to prevent unnecessary re-renders
  const refreshTransactions = useCallback(() => {
    setLimit(initialLimit);
    fetchTransactions(true);
  }, [fetchTransactions, initialLimit]);

  useEffect(() => {
    if (isConnected && address) {
      fetchTransactions(false);
    } else {
      setTransactions([]);
      setAllTransactions([]);
      setError(null);
      setHasMore(true);
    }
  }, [isConnected, address, fetchTransactions]);

  // Memoize return value to prevent unnecessary re-renders
  return useMemo(
    () => ({
      transactions,
      isLoading,
      isLoadingMore,
      error,
      hasMore,
      refreshTransactions,
      loadMore,
    }),
    [
      transactions,
      isLoading,
      isLoadingMore,
      error,
      hasMore,
      refreshTransactions,
      loadMore,
    ]
  );
}
