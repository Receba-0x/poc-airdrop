import {
  QueryClient,
  QueryCache,
  MutationCache,
  DefaultOptions,
} from "@tanstack/react-query";

const defaultQueryOptions: DefaultOptions = {
  queries: {
    staleTime: 10 * 60 * 1000, // Aumentado para 10 minutos
    gcTime: 30 * 60 * 1000, // Aumentado para 30 minutos
    retry: (failureCount, error: any) => {
      if (error?.status === 401 || error?.status === 403) return false;
      return failureCount < 2; // Reduzido para 2 tentativas
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Máximo 10s
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Desabilitado para reduzir fetches desnecessários
    refetchOnReconnect: "always",
    networkMode: "online", // Só fazer requests quando online
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

  // Deposit
  deposit: {
    all: ["deposit"] as const,
    lists: () => [...queryKeys.deposit.all, "list"] as const,
    list: (filters: any) => [...queryKeys.deposit.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.deposit.all, "detail", id] as const,
    requests: () => [...queryKeys.deposit.all, "requests"] as const,
    init: () => [...queryKeys.deposit.all, "init"] as const,
    cancel: (id: string) => [...queryKeys.deposit.all, "cancel", id] as const,
  },

  // Withdraw
  withdraw: {
    all: ["withdraw"] as const,
    lists: () => [...queryKeys.withdraw.all, "list"] as const,
    list: (filters: any) => [...queryKeys.withdraw.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.withdraw.all, "detail", id] as const,
    requests: () => [...queryKeys.withdraw.all, "requests"] as const,
    init: () => [...queryKeys.withdraw.all, "init"] as const,
    cancel: (id: string) => [...queryKeys.withdraw.all, "cancel", id] as const,
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

  // Admin Users
  adminUsers: {
    all: ["admin-users"] as const,
    lists: () => [...queryKeys.adminUsers.all, "list"] as const,
    list: (filters: any) => [...queryKeys.adminUsers.lists(), filters] as const,
    details: () => [...queryKeys.adminUsers.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.adminUsers.details(), id] as const,
  },

  // Admin Uploads
  adminUploads: {
    all: ["admin-uploads"] as const,
    lists: () => [...queryKeys.adminUploads.all, "list"] as const,
    list: (filters: any) =>
      [...queryKeys.adminUploads.lists(), filters] as const,
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

  // Invalidar queries de admin users
  adminUsers: () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers.all }),

  // Invalidar queries de admin uploads
  adminUploads: () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.adminUploads.all }),

  // Invalidar tudo
  all: () => queryClient.invalidateQueries(),
};

// Funções utilitárias para remoção de cache
export const removeQueries = {
  lootbox: () => queryClient.removeQueries({ queryKey: queryKeys.lootbox.all }),
  items: () => queryClient.removeQueries({ queryKey: queryKeys.items.all }),
  purchases: () =>
    queryClient.removeQueries({ queryKey: queryKeys.purchases.all }),
  adminUsers: () =>
    queryClient.removeQueries({ queryKey: queryKeys.adminUsers.all }),
  adminUploads: () =>
    queryClient.removeQueries({ queryKey: queryKeys.adminUploads.all }),
};
