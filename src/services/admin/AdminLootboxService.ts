import { ApiClient, ApiResponse } from "../base/ApiClient";

export interface AdminLootbox {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
  currency: "SOL" | "USD";
  sortOrder?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  items?: AdminLootboxItem[];
}

export interface AdminLootboxItem {
  id: string;
  lootboxId: string;
  itemId: string;
  probability: number;
  minQuantity: number;
  maxQuantity: number;
  isActive: boolean;
  item?: {
    id: string;
    name: string;
    type: string;
    rarity: string;
    value: number;
  };
}

export interface CreateLootboxRequest {
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
  currency?: "SOL" | "USD";
  sortOrder?: number;
  items?: Array<{
    itemId: string;
    probability: number;
    minQuantity?: number;
    maxQuantity?: number;
  }>;
}

export interface UpdateLootboxRequest {
  name?: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  currency?: "SOL" | "USD";
  sortOrder?: number;
  isActive?: boolean;
}

export interface LootboxStock {
  id: string;
  name: string;
  price: number;
  totalItems: number;
  activeItems: number;
  totalProbability: number;
}

export interface LinkItemToLootboxRequest {
  itemId: string;
  probability: number;
  minQuantity?: number;
  maxQuantity?: number;
}

export class AdminLootboxService {
  constructor(private apiClient: ApiClient) {}

  // ==========================================
  // CRIAR LOOTBOX
  // ==========================================

  async createLootbox(
    lootboxData: CreateLootboxRequest
  ): Promise<ApiResponse<AdminLootbox>> {
    return this.apiClient.post<AdminLootbox>("/api/v1/lootbox", lootboxData);
  }

  // ==========================================
  // CONSULTAR LOOTBOXES
  // ==========================================

  async getLootboxesStock(): Promise<
    ApiResponse<{
      success: boolean;
      length: number;
      data: LootboxStock[];
    }>
  > {
    return this.apiClient.get("/api/v1/lootbox?action=get-stock");
  }

  async getLootboxWithItems(lootboxId: string): Promise<
    ApiResponse<{
      success: boolean;
      data: AdminLootbox;
    }>
  > {
    const response = await this.apiClient.get(
      `/api/v1/lootbox/${lootboxId}/items`
    );
    return response.data;
  }

  // ==========================================
  // ATUALIZAR LOOTBOX
  // ==========================================

  async updateLootbox(
    lootboxId: string,
    updates: UpdateLootboxRequest
  ): Promise<ApiResponse<AdminLootbox>> {
    return this.apiClient.put<AdminLootbox>(
      `/api/v1/lootbox/${lootboxId}`,
      updates
    );
  }

  // ==========================================
  // VINCULAR/DESVINCULAR ITENS
  // ==========================================

  async linkItemToLootbox(
    lootboxId: string,
    itemData: LinkItemToLootboxRequest
  ): Promise<
    ApiResponse<{
      id: string;
      lootboxId: string;
      itemId: string;
      probability: number;
      minQuantity: number;
      maxQuantity: number;
      isActive: boolean;
    }>
  > {
    return this.apiClient.post(`/api/v1/lootbox/${lootboxId}/items`, itemData);
  }

  async unlinkItemFromLootbox(
    lootboxId: string,
    itemId: string
  ): Promise<ApiResponse<void>> {
    return this.apiClient.delete(
      `/api/v1/lootbox/${lootboxId}/items/${itemId}`
    );
  }

  // ==========================================
  // DELETAR LOOTBOX
  // ==========================================

  async deleteLootbox(lootboxId: string): Promise<ApiResponse<void>> {
    return this.apiClient.delete(`/api/v1/lootbox/${lootboxId}`);
  }
}
