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
import { useMutation, useQuery } from "@tanstack/react-query";

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
  });
  const users = (query.data as any)?.users || [];
  return {
    users: users || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useAdminUsersStats() {
  const query = useQuery({
    queryKey: ["admin-users-stats"],
    queryFn: async () => {
      const response = await adminUserService.getUsersStats();
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
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
