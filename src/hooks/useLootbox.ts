import {
  invalidateQueries,
  lootboxService,
  queryKeys,
  PurchaseRequest,
} from "@/services";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useLootbox(id: string) {
  const query = useQuery({
    queryKey: queryKeys.lootbox.detail(id),
    queryFn: async () => {
      return lootboxService.getLootbox(id);
    },
    staleTime: 2 * 60 * 1000,
  });

  return {
    lootbox: query.data?.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

export function useLootboxes() {
  const query = useQuery({
    queryKey: queryKeys.lootbox.lists(),
    queryFn: async () => {
      const result = await lootboxService.getAvailableLootboxes();
      return result;
    },
    staleTime: 2 * 60 * 1000,
  });

  return {
    lootboxes: query.data?.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function usePurchaseLootbox() {
  const mutation = useMutation({
    mutationFn: async (request: PurchaseRequest) => {
      return lootboxService.purchaseLootbox(request);
    },
    onSuccess: (data, request) => {
      invalidateQueries.lootbox();
      invalidateQueries.purchases();
    },
    onError: (error) => {
      console.error("Purchase failed:", error);
    },
  });

  return {
    purchase: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    data: mutation.data,
    reset: mutation.reset,
  };
}

export function usePurchaseFairness(purchaseId: string) {
  const query = useQuery({
    queryKey: ["purchases", "fairness", purchaseId],
    queryFn: async () => {
      return lootboxService.verifyPurchaseFairness(purchaseId);
    },
    enabled: !!purchaseId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    fairnessData: query.data?.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

// Hook para criar lootbox (admin)
export function useCreateLootbox() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: {
      name: string;
      price: number;
      currency?: "SOL" | "USD";
    }) => {
      return lootboxService.createLootbox(data.name, data.price, data.currency);
    },
    onSuccess: () => {
      // Invalidar lista de lootboxes
      invalidateQueries.lootbox();
    },
  });

  return {
    createLootbox: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}

// Hook para criar item (admin)
export function useCreateItem() {
  const mutation = useMutation({
    mutationFn: async (itemData: any) => {
      return lootboxService.createItem(itemData);
    },
  });

  return {
    createItem: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}

// Hook para criar itens em lote (admin)
export function useCreateItemsBatch() {
  const mutation = useMutation({
    mutationFn: async (data: { items: any[]; batchSize?: number }) => {
      return lootboxService.createItemsBatch(data.items, data.batchSize);
    },
  });

  return {
    createItemsBatch: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}

// Hook para vincular item à lootbox (admin)
export function useLinkItemToLootbox() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: { lootboxId: string; itemData: any }) => {
      return lootboxService.linkItemToLootbox(data.lootboxId, data.itemData);
    },
    onSuccess: () => {
      // Invalidar lootboxes após vincular item
      invalidateQueries.lootbox();
    },
  });

  return {
    linkItem: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}

// Hook utilitário para gerar client seed
export function useClientSeed() {
  const generateSeed = () => {
    return lootboxService.generateClientSeed();
  };

  return { generateSeed };
}

// Hook para health check
export function useHealthCheck() {
  const query = useQuery({
    queryKey: ["lootbox", "health"],
    queryFn: async () => {
      return lootboxService.healthCheck();
    },
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 60 * 1000, // Refetch a cada minuto
  });

  return {
    isHealthy: query.data?.data?.status === "healthy",
    lastCheck: query.data?.data?.timestamp,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
