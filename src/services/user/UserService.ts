import type { ApiClient } from "../base/ApiClient";

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    username: string;
    email: string;
    emailVerified: boolean;
    avatar: string;
    firstName: string;
    lastName: string;
    balance: number;
  };
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RegisterResponse {
  user: {
    id: string;
    username: string;
    email: string;
    emailVerified: boolean;
    firstName: string;
    lastName: string;
    balance: number;
  };
}

export interface BalanceTransaction {
  id: string;
  userId: string;
  type: string;
  amount: number;
  description: string;
  status: string;
  createdAt: string;
}

export interface AuthError {
  message: string;
  code?: string;
  field?: string;
}

export interface UserItem {
  id: string;
  quantity: number;
  source: string;
  acquiredAt: string;
  item: {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    type: string;
    rarity: string;
    value: 0.5;
    metadata: {
      size: string;
      color: string;
    };
    isActive: boolean;
  };
}

export class UserService {
  constructor(private apiClient: ApiClient) {}

  async login(data: { email: string; password: string }) {
    try {
      const result = await this.apiClient.post<LoginResponse>(
        "/api/v1/auth/login/email",
        data
      );
      return result;
    } catch (error) {
      return {
        success: false,
        error: "Error on login",
        data: null,
      };
    }
  }

  async register(data: RegisterRequest) {
    try {
      const response = await this.apiClient.post<RegisterResponse>(
        "/api/v1/auth/register",
        data
      );
      return response.data?.user ?? null;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = this.apiClient.getRefreshToken();
      if (refreshToken) {
        await this.apiClient.post(
          "/api/v1/auth/logout",
          {},
          { headers: { "x-refresh-token": refreshToken } }
        );
      }
    } catch (error: any) {
      console.error("Logout error:", error);
    } finally {
      this.apiClient.clearTokens();
    }
  }

  async getProfile(): Promise<any> {
    try {
      const response = await this.apiClient.get("/api/v1/auth/profile");
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getBalanceTransactions(filters: {
    limit: number;
    offset: number;
    type: string;
    status: string;
  }): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (filters?.limit !== undefined)
        params.append("limit", filters.limit.toString());
      if (filters?.offset !== undefined)
        params.append("offset", filters.offset.toString());
      if (filters?.type !== undefined)
        params.append("type", filters.type.toString());
      if (filters?.status !== undefined)
        params.append("status", filters.status.toString());

      const query = params.toString() ? `?${params.toString()}` : "";
      const url = `/api/v1/balance/transactions${query}`;
      const response = await this.apiClient.get(url);
      return response as any;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getUserItems(): Promise<any> {
    try {
      const response = await this.apiClient.get(`/api/v1/user/items/me`);
      return response;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async sellItem(itemId: string): Promise<any> {
    try {
      const url = `/api/v1/user/items/${itemId}/sell`;
      const response = await this.apiClient.post(url);
      return response;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async updateUser(id: string, data: any): Promise<any> {
    try {
      const response = await this.apiClient.patch(`/api/v1/user/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async updateUserConfig(data: {
    username?: string;
    walletAddress?: string;
    email?: string;
  }): Promise<any> {
    try {
      return await this.apiClient.post(`/api/v1/user/config/me`, data);
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async updateUserImage(avatar: string): Promise<any> {
    try {
      return await this.apiClient.post(`/api/v1/user/config/image`, {
        avatar,
      });
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async forgotPassword(data: { email: string }): Promise<{ message: string }> {
    try {
      const response = await this.apiClient.post(
        "/api/v1/auth/forgot-password",
        data
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  isAuthenticated(): boolean {
    return !!this.apiClient.getAccessToken();
  }

  async resetPassword(data: {
    token: string;
    password: string;
  }): Promise<{ message: string }> {
    try {
      const response = await this.apiClient.post(
        "/api/v1/auth/reset-password",
        data
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async adminUpdatePassword(data: {
    userId: string;
    password: string;
  }): Promise<{ message: string }> {
    try {
      const response = await this.apiClient.post(
        "/api/v1/auth/admin-update-password",
        data
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): AuthError {
    if (error.response?.data) {
      return {
        message: error.response.data.message || "An error occurred",
        code: error.response.data.code,
        field: error.response.data.field,
      };
    }

    if (error.request) {
      return {
        message: "Network error. Please check your connection.",
        code: "NETWORK_ERROR",
      };
    }

    return {
      message: error.message || "An unexpected error occurred",
      code: "UNKNOWN_ERROR",
    };
  }
}
