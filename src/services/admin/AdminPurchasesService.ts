import { ApiClient, ApiResponse } from "../base/ApiClient";

export interface AdminPurchase {
  id: string;
  userId: string;
  lootboxId: string;
  walletAddress: string;
  transactionHash?: string;
  amount: number;
  currency: "SOL" | "USD";
  status:
    | "PENDING"
    | "CONFIRMED"
    | "OPENED"
    | "DELIVERED"
    | "CANCELLED"
    | "FAILED";
  openedAt?: string;
  createdAt: string;
  serverSeed?: string;
  clientSeed?: string;
  nonce?: number;
  randomResult?: number;
  rewards?: Array<{
    id: string;
    itemId: string;
    quantity: number;
    value: number;
  }>;
}

export interface PurchaseStats {
  total: number;
  byStatus: Record<string, number>;
  totalRevenue: number;
  todayPurchases: number;
  recentPurchases: number;
}

export interface PurchasesFilters {
  userId?: string;
  status?:
    | "PENDING"
    | "CONFIRMED"
    | "OPENED"
    | "DELIVERED"
    | "CANCELLED"
    | "FAILED";
  skip?: number;
  take?: number;
}

export interface UpdatePurchaseStatusRequest {
  status:
    | "PENDING"
    | "CONFIRMED"
    | "OPENED"
    | "DELIVERED"
    | "CANCELLED"
    | "FAILED";
}

export interface FairnessVerificationRequest {
  purchaseId: string;
  clientSeed: string;
  serverSeed: string;
}

export interface FairnessData {
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
  randomResult: number;
  isFair: boolean;
}

export interface ClientSeedResponse {
  clientSeed: string;
}

export class AdminPurchasesService {
  constructor(private apiClient: ApiClient) {}

  // ==========================================
  // LISTAR COMPRAS
  // ==========================================

  async getPurchases(
    filters?: PurchasesFilters
  ): Promise<ApiResponse<AdminPurchase[]>> {
    const params = new URLSearchParams();
    if (filters?.userId) params.append("userId", filters.userId);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.skip !== undefined)
      params.append("skip", filters.skip.toString());
    if (filters?.take !== undefined)
      params.append("take", filters.take.toString());

    const query = params.toString() ? `?${params.toString()}` : "";
    return this.apiClient.get<AdminPurchase[]>(`/api/v1/purchases${query}`);
  }

  async getPurchaseById(
    purchaseId: string
  ): Promise<ApiResponse<AdminPurchase>> {
    return this.apiClient.get<AdminPurchase>(`/api/v1/purchases/${purchaseId}`);
  }

  async getPurchasesByUser(
    userId: string
  ): Promise<ApiResponse<AdminPurchase[]>> {
    return this.apiClient.get<AdminPurchase[]>(
      `/api/v1/purchases/user/${userId}`
    );
  }

  // ==========================================
  // ESTATÍSTICAS
  // ==========================================

  async getPurchasesStats(): Promise<ApiResponse<PurchaseStats>> {
    console.log("/api/v1/purchases/stats");
    return this.apiClient.get<PurchaseStats>("/api/v1/purchases/stats");
  }

  // ==========================================
  // ATUALIZAR STATUS
  // ==========================================

  async updatePurchaseStatus(
    purchaseId: string,
    statusUpdate: UpdatePurchaseStatusRequest
  ): Promise<ApiResponse<AdminPurchase>> {
    return this.apiClient.patch<AdminPurchase>(
      `/api/v1/purchases/${purchaseId}`,
      statusUpdate
    );
  }

  // ==========================================
  // VERIFICAÇÃO DE FAIRNESS
  // ==========================================

  async verifyFairness(
    request: FairnessVerificationRequest
  ): Promise<ApiResponse<{ isFair: boolean }>> {
    return this.apiClient.post("/api/v1/purchases/verify-fairness", request);
  }

  async getFairnessData(
    purchaseId: string
  ): Promise<ApiResponse<FairnessData>> {
    return this.apiClient.get<FairnessData>(
      `/api/v1/purchases/${purchaseId}/fairness-data`
    );
  }

  async generateClientSeed(): Promise<ApiResponse<ClientSeedResponse>> {
    return this.apiClient.get<ClientSeedResponse>(
      "/api/v1/purchases/generate-client-seed"
    );
  }
}
