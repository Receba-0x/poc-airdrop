import type { ApiClient, ApiResponse } from "../base/ApiClient";

export interface Purchase {
  id: string;
  userId: string;
  lootboxId: string;
  walletAddress: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  serverSeed: string;
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
  randomResult: number;
  lootbox: {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    price: number;
    currency: string;
    isActive: boolean;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
  };
  user: {
    id: string;
    username: string;
  };
  rewards: Reward[];
}

export interface Reward {
  id: string;
  purchaseId: string;
  itemId: string;
  quantity: number;
  item: {
    id: string;
    name: string;
    imageUrl: string;
    type: string;
    rarity: string;
    value: number;
    metadata: {
      lootboxId: string;
      maxQuantity: string;
      minQuantity: string;
      probability: string;
    };
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export interface PurchaseStats {
  total: number;
  byStatus: Record<string, number>;
  totalRevenue: number;
  todayPurchases: number;
  todayRevenue: number;
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

export interface PurchaseError {
  message: string;
  code?: string;
  field?: string;
}

export interface RecentPurchasesResponse {
  success: boolean;
  data: {
    purchases: Purchase[];
    total: number;
    hasMore: boolean;
    lastUpdate: string;
  };
  message: "Compras recentes obtidas com sucesso";
}

export class PurchaseService {
  constructor(private apiClient: ApiClient) {}

  async getPurchases(
    filters?: PurchasesFilters
  ): Promise<ApiResponse<Purchase[]>> {
    const params = new URLSearchParams();
    if (filters?.userId) params.append("userId", filters.userId);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.skip !== undefined)
      params.append("skip", filters.skip.toString());
    if (filters?.take !== undefined)
      params.append("take", filters.take.toString());

    const query = params.toString() ? `?${params.toString()}` : "";
    return this.apiClient.get<Purchase[]>(`/api/v1/purchases${query}`);
  }

  async getPurchaseById(purchaseId: string): Promise<ApiResponse<Purchase>> {
    return this.apiClient.get<Purchase>(`/api/v1/purchases/${purchaseId}`);
  }

  async getPurchasesStats(): Promise<ApiResponse<PurchaseStats>> {
    console.log("/api/v1/purchases/stats");
    return this.apiClient.get<PurchaseStats>("/api/v1/purchases/stats");
  }

  async updatePurchaseStatus(
    purchaseId: string,
    statusUpdate: UpdatePurchaseStatusRequest
  ): Promise<ApiResponse<Purchase>> {
    return this.apiClient.patch<Purchase>(
      `/api/v1/purchases/${purchaseId}`,
      statusUpdate
    );
  }

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

  async getRecentPurchases(): Promise<ApiResponse<RecentPurchasesResponse>> {
    const url = "/api/v1/purchases/recent";
    return this.apiClient.get<RecentPurchasesResponse>(url);
  }
}
