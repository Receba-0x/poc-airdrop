import { ApiClient, ApiResponse } from "../base/ApiClient";

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  emailVerified: boolean;
  avatar?: string;
  firstName: string;
  lastName: string;
  balance: number;
  isActive: boolean;
  isAdmin?: boolean;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  balance?: number;
  isActive?: boolean;
  isAdmin?: boolean;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  balance?: number;
  isActive?: boolean;
  isAdmin?: boolean;
  emailVerified?: boolean;
}

export interface UsersStats {
  total: number;
  active: number;
  inactive: number;
  verified: number;
  unverified: number;
  admins: number;
}

export interface UsersFilters {
  skip?: number;
  take?: number;
  isActive?: boolean;
  emailVerified?: boolean;
  isAdmin?: boolean;
  search?: string;
}

export interface ResetUserPasswordRequest {
  userId: string;
  newPassword: string;
}

export class AdminUserService {
  constructor(private apiClient: ApiClient) {}

  // ==========================================
  // CRIAR USUÁRIOS
  // ==========================================

  async createUser(
    userData: CreateUserRequest
  ): Promise<ApiResponse<AdminUser>> {
    return this.apiClient.post<AdminUser>("/api/v1/users", userData);
  }

  // ==========================================
  // LISTAR E BUSCAR USUÁRIOS
  // ==========================================

  async getUsers(filters?: UsersFilters): Promise<ApiResponse<AdminUser[]>> {
    const params = new URLSearchParams();
    if (filters?.skip !== undefined)
      params.append("skip", filters.skip.toString());
    if (filters?.take !== undefined)
      params.append("take", filters.take.toString());
    if (filters?.isActive !== undefined)
      params.append("isActive", filters.isActive.toString());
    if (filters?.emailVerified !== undefined)
      params.append("emailVerified", filters.emailVerified.toString());
    if (filters?.isAdmin !== undefined)
      params.append("isAdmin", filters.isAdmin.toString());
    if (filters?.search) params.append("search", filters.search);

    const query = params.toString() ? `?${params.toString()}` : "";
    return this.apiClient.get<AdminUser[]>(`/api/v1/user${query}`);
  }

  async getUserById(userId: string): Promise<ApiResponse<AdminUser>> {
    return this.apiClient.get<AdminUser>(`/api/v1/user/${userId}`);
  }

  // ==========================================
  // ESTATÍSTICAS
  // ==========================================

  async getUsersStats(): Promise<ApiResponse<UsersStats>> {
    return this.apiClient.get<UsersStats>("/api/v1/user/stats");
  }

  // ==========================================
  // ATUALIZAR USUÁRIOS
  // ==========================================

  async updateUser(
    userId: string,
    updates: UpdateUserRequest
  ): Promise<ApiResponse<AdminUser>> {
    return this.apiClient.patch<AdminUser>(`/api/v1/user/${userId}`, updates);
  }

  // ==========================================
  // DELETAR USUÁRIOS
  // ==========================================

  async deleteUser(userId: string): Promise<ApiResponse<void>> {
    return this.apiClient.delete(`/api/v1/user/${userId}`);
  }

  // ==========================================
  // SENHA E AUTENTICAÇÃO
  // ==========================================

  async resetUserPassword(
    request: ResetUserPasswordRequest
  ): Promise<ApiResponse<{ message: string }>> {
    return this.apiClient.post<{ message: string }>(
      "/api/v1/user/reset-password",
      request
    );
  }

  // ==========================================
  // AÇÕES ESPECÍFICAS
  // ==========================================

  async banUser(userId: string): Promise<ApiResponse<AdminUser>> {
    return this.updateUser(userId, { isActive: false });
  }

  async unbanUser(userId: string): Promise<ApiResponse<AdminUser>> {
    return this.updateUser(userId, { isActive: true });
  }

  async verifyUserEmail(userId: string): Promise<ApiResponse<AdminUser>> {
    return this.updateUser(userId, { emailVerified: true });
  }

  async updateUserBalance(
    userId: string,
    newBalance: number
  ): Promise<ApiResponse<AdminUser>> {
    return this.updateUser(userId, { balance: newBalance });
  }
}
