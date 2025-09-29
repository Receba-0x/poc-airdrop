import {
  purchaseService,
  queryKeys,
  userService,
  type PurchasesFilters,
  type Purchase,
} from "@/services";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export function usePurchase(id: string) {
  const query = useQuery({
    queryKey: queryKeys.purchases.detail(id),
    queryFn: async () => {
      return purchaseService.getPurchaseById(id);
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    purchase: query.data?.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

export function usePurchases(filters?: PurchasesFilters) {
  const query = useQuery({
    queryKey: queryKeys.purchases.list(filters || {}),
    queryFn: async () => {
      const response = await purchaseService.getPurchases(filters);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
  return {
    purchases: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function usePurchasesStats() {
  const query = useQuery({
    queryKey: ["purchases-stats"],
    queryFn: async () => {
      const response = await purchaseService.getPurchasesStats();
      return response.data;
    },
  });
  return {
    stats: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

export function useRecentPurchases() {
  const [isConnected, setIsConnected] = useState(false);
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  useEffect(() => {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";
    const socket = io(`${baseURL}/purchases`, {
      path: "/socket.io",
      transports: ["websocket"],
      timeout: 20000,
    });

    socket.on("connected", () => {
      setIsConnected(true);
      socket.emit("subscribe-recent-purchases", { limit: 20 });
    });

    socket.on("recent-purchases", (data: { purchases: Purchase[] }) => {
      setPurchases(data.purchases);
    });

    socket.on("recent-purchases-update", (data: { purchases: Purchase[] }) => {
      setPurchases(data.purchases);
    });

    socket.on("new-purchase", (data: { purchase: Purchase }) => {
      setPurchases((prev) => [data.purchase, ...prev.slice(0, 19)]);
    });

    return () => {
      socket.emit("unsubscribe-recent-purchases");
      socket.disconnect();
    };
  }, []);

  return {
    purchases,
    isConnected,
  };
}

export function usePurchasesByUser(userId: string) {
  const query = useQuery({
    queryKey: ["purchases-by-user", userId],
    queryFn: async () => {
      const response = await purchaseService.getPurchases({ userId });
      return response.data;
    },
  });
  return {
    purchases: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
