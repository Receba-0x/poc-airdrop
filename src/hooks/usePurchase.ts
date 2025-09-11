import {
  purchaseService,
  queryKeys,
  type ItemsFilters,
  type Purchase,
} from "@/services";
import { useQuery } from "@tanstack/react-query";

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

export function usePurchases(filters?: ItemsFilters) {
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
  const query = useQuery({
    queryKey: ["recent-purchases"],
    queryFn: async () => {
      const response = await purchaseService.getRecentPurchases();
      return response as any;
    },
    refetchInterval: 5000,
  });
  return {
    recentPurchases: query.data?.data?.purchases as Purchase[],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

export function usePurchasesByUser(userId: string) {
  const query = useQuery({
    queryKey: ["purchases-by-user", userId],
    queryFn: async () => {
      const response = await purchaseService.getPurchasesByUser(userId);
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
