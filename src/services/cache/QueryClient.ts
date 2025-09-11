import {
  QueryClient,
  QueryCache,
  MutationCache,
  DefaultOptions,
} from "@tanstack/react-query";

const defaultQueryOptions: DefaultOptions = {
  queries: {
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.status === 401 || error?.status === 403) return false;
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
  },
  mutations: {
    retry: false, // Mutations geralmente não devem ser retry automaticamente
    onError: (error) => {
      console.error("Mutation error:", error);
    },
  },
};

const queryCache = new QueryCache({
  onError: (error, query) => {
    console.error("Query error:", {
      queryKey: query.queryKey,
      error: error?.message || error,
      timestamp: new Date().toISOString(),
    });

    // Aqui você pode adicionar lógica para enviar erros para um serviço de monitoramento
  },
});

// Cache de mutations para tratamento global
const mutationCache = new MutationCache({
  onError: (error) => {
    // Log de erros para monitoramento
    console.error("Mutation error:", {
      error: error?.message || error,
      timestamp: new Date().toISOString(),
    });
  },
});

// Cliente de queries configurado
export const queryClient = new QueryClient({
  queryCache,
  mutationCache,
  defaultOptions: defaultQueryOptions,
});

// Keys para queries (padronização)
export const queryKeys = {
  // Lootbox
  lootbox: {
    all: ["lootbox"] as const,
    lists: () => [...queryKeys.lootbox.all, "list"] as const,
    list: (filters: any) => [...queryKeys.lootbox.lists(), filters] as const,
    details: () => [...queryKeys.lootbox.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.lootbox.details(), id] as const,
    purchases: (wallet: string) =>
      [...queryKeys.lootbox.all, "purchases", wallet] as const,
  },

  // Items
  items: {
    all: ["items"] as const,
    lists: () => [...queryKeys.items.all, "list"] as const,
    list: (filters: any) => [...queryKeys.items.lists(), filters] as const,
    details: () => [...queryKeys.items.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.items.details(), id] as const,
  },

  // Purchases
  purchases: {
    all: ["purchases"] as const,
    lists: () => [...queryKeys.purchases.all, "list"] as const,
    list: (filters: any) => [...queryKeys.purchases.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.purchases.all, "detail", id] as const,
  },

  // Leaderboard
  leaderboard: {
    all: ["leaderboard"] as const,
    list: (page?: number, limit?: number) =>
      [...queryKeys.leaderboard.all, "list", page, limit] as const,
    top: () => [...queryKeys.leaderboard.all, "top"] as const,
  },
};

// Funções utilitárias para invalidação de cache
export const invalidateQueries = {
  // Invalidar todas as queries relacionadas a lootbox
  lootbox: () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.lootbox.all }),

  // Invalidar queries de items
  items: () => queryClient.invalidateQueries({ queryKey: queryKeys.items.all }),

  // Invalidar queries de purchases
  purchases: () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.purchases.all }),

  // Invalidar tudo
  all: () => queryClient.invalidateQueries(),
};

// Funções utilitárias para remoção de cache
export const removeQueries = {
  lootbox: () => queryClient.removeQueries({ queryKey: queryKeys.lootbox.all }),
  items: () => queryClient.removeQueries({ queryKey: queryKeys.items.all }),
  purchases: () =>
    queryClient.removeQueries({ queryKey: queryKeys.purchases.all }),
};
