import type { ApiClient } from "../base/ApiClient";

export interface LeaderboardResponse {
  leaderboard: Leaderboard[];
  totalUsers: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
  };
  period: {
    startDate: string;
    endDate: string;
  };
  generatedAt: string;
}

export interface Leaderboard {
  rank: number;
  userId: string;
  username: string;
  imageUrl: string;
  lastWinAmount: number;
  totalWinAmount: number;
  totalItemsWon: number;
  lastActivity: string;
  totalPurchases: number;
}

export class LeaderboardService {
  constructor(private apiClient: ApiClient) {}

  async getLeaderboard(params: { page: number; limit: number }) {
    try {
      const url = "/api/v1/leaderboard";
      return await this.apiClient.get<LeaderboardResponse>(url, { params });
    } catch (error) {
      return { success: false, error: "Error on getLeaderboard", data: null };
    }
  }

  async getTopLeaders() {
    try {
      const url = "/api/v1/leaderboard/top-leaders";
      return await this.apiClient.get(url);
    } catch (error) {
      return { success: false, error: "Error on getTopLeaders", data: null };
    }
  }
}
