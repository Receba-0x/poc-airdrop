"use client";
import { leaderboardService, queryKeys, type Leaderboard } from "@/services";
import { useQuery } from "@tanstack/react-query";

interface UseLeaderboardParams {
  page?: number;
  limit?: number;
}

export function useLeaderboard(params: UseLeaderboardParams = {}) {
  const { page = 1, limit = 20 } = params;

  const query = useQuery({
    queryKey: queryKeys.leaderboard.list(page, limit),
    queryFn: async () => {
      const response = await leaderboardService.getLeaderboard({ page, limit });
      return {
        data: response.data?.leaderboard,
        totalCount: response.data?.totalUsers,
        totalPages: response.data?.pagination.totalPages,
        currentPage: response.data?.pagination.page,
        hasNextPage: response.data?.pagination.hasNextPage,
        hasPrevPage: response.data?.pagination.hasPrevPage,
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    leaderboard: query.data?.data,
    totalCount: query.data?.totalCount,
    totalPages: query.data?.totalPages,
    currentPage: query.data?.currentPage,
    hasNextPage: query.data?.hasNextPage,
    hasPrevPage: query.data?.hasPrevPage,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useTopLeaders() {
  const query = useQuery({
    queryKey: queryKeys.leaderboard.top(),
    queryFn: async () => {
      const response = await leaderboardService.getTopLeaders();
      return response.data;
    },
  });

  return {
    topLeaders: query.data?.topLeaders,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
