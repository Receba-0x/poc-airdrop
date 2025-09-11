import { ApiClient, ApiResponse } from "../base/ApiClient";

export interface AdminItem {
  id: string;
  name: string;
  description?: string;
  type: "SOL" | "PHYSICAL" | "NFT" | "SPECIAL";
  rarity: "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY" | "MYTHIC";
  value: number;
  imageUrl?: string;
  metadata?: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateItemRequest {
  name: string;
  description?: string;
  type: "SOL" | "PHYSICAL" | "NFT" | "SPECIAL";
  rarity: "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY" | "MYTHIC";
  value: number;
  imageUrl?: string;
  metadata?: Record<string, any>;
  isActive?: boolean;
}

export interface CreateItemWithLootboxRequest extends CreateItemRequest {
  lootboxLink: {
    lootboxId: string;
    probability: number;
    minQuantity?: number;
    maxQuantity?: number;
  };
}

export interface BatchCreateItemsRequest {
  batchSize: number;
  items: CreateItemRequest[];
}

export interface BatchCreateItemsWithLootboxRequest
  extends BatchCreateItemsRequest {
  lootboxId?: string; // Vinculação global
}

export interface ItemsStats {
  total: number;
  byType: Record<string, number>;
  byRarity: Record<string, number>;
  active: number;
  inactive: number;
}

export interface ItemsFilters {
  skip?: number;
  take?: number;
  type?: "SOL" | "PHYSICAL" | "NFT" | "SPECIAL";
  rarity?: "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY" | "MYTHIC";
  isActive?: boolean;
}

export interface UpdateItemRequest {
  name?: string;
  description?: string;
  type?: "SOL" | "PHYSICAL" | "NFT" | "SPECIAL";
  rarity?: "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY" | "MYTHIC";
  value?: number;
  imageUrl?: string;
  metadata?: Record<string, any>;
  isActive?: boolean;
}

export class AdminItemsService {
  constructor(private apiClient: ApiClient) {}

  async createItemsBatchFromCSV(
    file: File,
    lootboxId: string
  ): Promise<
    ApiResponse<{
      success: number;
      failed: number;
      errors: Array<{ row: number; data: any; error: string }>;
      items: AdminItem[];
    }>
  > {
    const formData = new FormData();
    formData.append("file", file);

    return this.apiClient.post(
      `/api/v1/items/batch/csv?lootboxId=${lootboxId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  }

  async createItem(
    itemData: CreateItemRequest
  ): Promise<ApiResponse<AdminItem>> {
    return this.apiClient.post<AdminItem>("/api/v1/items", itemData);
  }

  async createItemWithLootbox(
    itemData: CreateItemWithLootboxRequest
  ): Promise<ApiResponse<AdminItem>> {
    return this.apiClient.post<AdminItem>(
      "/api/v1/items/with-lootbox",
      itemData
    );
  }

  async createItemsBatch(request: BatchCreateItemsRequest): Promise<
    ApiResponse<{
      success: number;
      failed: number;
      errors: Array<{ index: number; item: CreateItemRequest; error: string }>;
      items: AdminItem[];
    }>
  > {
    return this.apiClient.post("/api/v1/items/batch", request);
  }

  async createItemsBatchWithLootbox(
    request: BatchCreateItemsWithLootboxRequest
  ): Promise<
    ApiResponse<{
      success: number;
      failed: number;
      errors: Array<{ index: number; item: CreateItemRequest; error: string }>;
      items: AdminItem[];
    }>
  > {
    return this.apiClient.post("/api/v1/items/batch/with-lootbox", request);
  }

  // ==========================================
  // LISTAR E BUSCAR ITENS
  // ==========================================

  async getItems(filters?: ItemsFilters): Promise<ApiResponse<AdminItem[]>> {
    const params = new URLSearchParams();
    if (filters?.skip !== undefined)
      params.append("skip", filters.skip.toString());
    if (filters?.take !== undefined)
      params.append("take", filters.take.toString());
    if (filters?.type) params.append("type", filters.type);
    if (filters?.rarity) params.append("rarity", filters.rarity);
    if (filters?.isActive !== undefined)
      params.append("isActive", filters.isActive.toString());

    const query = params.toString() ? `?${params.toString()}` : "";
    console.log(`/api/v1/items${query}`);
    return this.apiClient.get<AdminItem[]>(`/api/v1/items${query}`);
  }

  async getItemById(itemId: string): Promise<ApiResponse<AdminItem>> {
    return this.apiClient.get<AdminItem>(`/api/v1/items/${itemId}`);
  }

  // ==========================================
  // ESTATÍSTICAS
  // ==========================================

  async getItemsStats(): Promise<ApiResponse<ItemsStats>> {
    return this.apiClient.get<ItemsStats>("/api/v1/items/stats");
  }

  // ==========================================
  // ATUALIZAR ITENS
  // ==========================================

  async updateItem(
    itemId: string,
    updates: UpdateItemRequest
  ): Promise<ApiResponse<AdminItem>> {
    return this.apiClient.patch<AdminItem>(`/api/v1/items/${itemId}`, updates);
  }

  // ==========================================
  // DELETAR ITENS
  // ==========================================

  async deleteItem(itemId: string): Promise<ApiResponse<void>> {
    return this.apiClient.delete(`/api/v1/items/${itemId}`);
  }
}
