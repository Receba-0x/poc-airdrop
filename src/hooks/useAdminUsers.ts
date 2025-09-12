import {
  adminUserService,
  queryKeys,
  type UsersFilters,
  type AdminUser,
  type UpdateUserRequest,
  type CreateUserRequest,
  type ResetUserPasswordRequest,
  queryClient,
} from "@/services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useMemo, useCallback } from "react";

export function useAdminUser(id: string) {
  const query = useQuery({
    queryKey: queryKeys.adminUsers.detail(id),
    queryFn: async () => {
      const response = await adminUserService.getUserById(id);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    user: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

export function useAdminUsers(filters?: UsersFilters) {
  const query = useQuery({
    queryKey: queryKeys.adminUsers.list(filters || {}),
    queryFn: async () => {
      const response = await adminUserService.getUsers(filters);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: true, // Sempre habilitado pois é uma página admin
  });

  return {
    users: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

// Hook com debouncing para buscas
export function useAdminUsersWithSearch(initialFilters?: UsersFilters) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debouncing da busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms de delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filters = useMemo(
    () => ({
      ...initialFilters,
      search: debouncedSearchTerm || undefined,
    }),
    [initialFilters, debouncedSearchTerm]
  );

  const query = useQuery({
    queryKey: queryKeys.adminUsers.list(filters),
    queryFn: async () => {
      const response = await adminUserService.getUsers(filters);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: true,
  });

  return {
    users: (query.data as any)?.users || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
  };
}

export function useAdminUsersStats() {
  const query = useQuery({
    queryKey: ["admin-users-stats"],
    queryFn: async () => {
      const response = await adminUserService.getUsersStats();
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  return {
    stats: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

export function useCreateAdminUser() {
  const mutation = useMutation({
    mutationFn: async (userData: CreateUserRequest) => {
      return adminUserService.createUser(userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers.all });
    },
  });

  return {
    createUser: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

export function useUpdateAdminUser() {
  const mutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateUserRequest;
    }) => {
      return adminUserService.updateUser(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers.all });
    },
  });

  return {
    updateUser: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

export function useDeleteAdminUser() {
  const mutation = useMutation({
    mutationFn: async (id: string) => {
      return adminUserService.deleteUser(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers.all });
    },
  });

  return {
    deleteUser: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

export function useResetUserPassword() {
  const mutation = useMutation({
    mutationFn: async (request: ResetUserPasswordRequest) => {
      return adminUserService.resetUserPassword(request);
    },
  });

  return {
    resetPassword: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

export function useBanUser() {
  const mutation = useMutation({
    mutationFn: async (id: string) => {
      return adminUserService.banUser(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers.all });
    },
  });

  return {
    banUser: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

export function useUnbanUser() {
  const mutation = useMutation({
    mutationFn: async (id: string) => {
      return adminUserService.unbanUser(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers.all });
    },
  });

  return {
    unbanUser: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

export function useVerifyUserEmail() {
  const mutation = useMutation({
    mutationFn: async (id: string) => {
      return adminUserService.verifyUserEmail(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers.all });
    },
  });

  return {
    verifyEmail: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

// Função utilitária para prefetching inteligente
export function usePrefetchAdminUsers() {
  const queryClient = useQueryClient();

  const prefetchPage = useCallback(
    (page: number, filters?: UsersFilters) => {
      const prefetchFilters = { ...filters, page };

      queryClient.prefetchQuery({
        queryKey: queryKeys.adminUsers.list(prefetchFilters),
        queryFn: async () => {
          const response = await adminUserService.getUsers(prefetchFilters);
          return response.data;
        },
        staleTime: 5 * 60 * 1000,
      });
    },
    [queryClient]
  );

  const prefetchUserDetail = useCallback(
    (userId: string) => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.adminUsers.detail(userId),
        queryFn: async () => {
          const response = await adminUserService.getUserById(userId);
          return response.data;
        },
        staleTime: 10 * 60 * 1000,
      });
    },
    [queryClient]
  );

  return {
    prefetchPage,
    prefetchUserDetail,
  };
}
