import { ApiClient, ApiResponse } from "../base/ApiClient";

export interface Lootbox {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  items?: LootboxItem[];
  currency: "SOL" | "USD";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LootboxItem {
  id: string;
  isActive: boolean;
  item: Item;
  itemId: string;
  lootboxId: string;
  probability: number;
  minQuantity: number;
  maxQuantity: number;
}

export interface Item {
  id: string;
  name: string;
  type: "SOL" | "NFT" | "physical";
  value?: number;
  rarity: "common" | "rare" | "epic" | "legendary";
  description?: string;
  imageUrl?: string;
}

export interface PurchaseRequest {
  action: "purchase";
  boxId: string;
  clientSeed: string;
}

export interface PurchaseResponse {
  success: boolean;
  wonPrize: Item;
  fairData: {
    serverSeed: string;
    clientSeed: string;
    nonce: number;
    randomNumber: number;
  };
  purchaseId: string;
  timestamp: string;
}

export interface FairnessData {
  purchaseId: string;
  serverSeed: string;
  clientSeed: string;
  nonce: number;
  randomNumber: number;
  hash: string;
}

export class LootboxService {
  constructor(private apiClient: ApiClient) {}

  async getAvailableLootboxes(): Promise<ApiResponse<Lootbox[]>> {
    try {
      const result = await this.apiClient.get<Lootbox[]>(
        "/api/v1/lootbox?action=get-stock"
      );
      return result;
    } catch (error) {
      console.error("Erro ao carregar lootboxes:", error);
      return {
        success: false,
        error: "Erro ao carregar lootboxes",
        data: [],
      };
    }
  }

  async getLootbox(id: string): Promise<ApiResponse<Lootbox>> {
    return this.apiClient.get<Lootbox>(`/api/v1/lootbox/${id}/items`);
  }

  async purchaseLootbox(
    request: PurchaseRequest
  ): Promise<ApiResponse<PurchaseResponse>> {
    return this.apiClient.put<PurchaseResponse>("/api/v1/lootbox", request);
  }

  // ==========================================
  // PLAYER: Verificar Fairness
  // ==========================================

  async verifyPurchaseFairness(
    purchaseId: string
  ): Promise<ApiResponse<FairnessData>> {
    return this.apiClient.get<FairnessData>(
      `/purchases/${purchaseId}/fairness-data`
    );
  }

  // ==========================================
  // ADMIN: Criar Itens
  // ==========================================

  async createItem(itemData: Omit<Item, "id">): Promise<ApiResponse<Item>> {
    return this.apiClient.post<Item>("/api/v1/items", itemData);
  }

  async createItemsBatch(
    items: Omit<Item, "id">[],
    batchSize: number = 10
  ): Promise<ApiResponse<Item[]>> {
    return this.apiClient.post<Item[]>("/api/v1/items/batch", {
      items,
      batchSize,
    });
  }

  // ==========================================
  // ADMIN: Criar Lootbox
  // ==========================================

  async createLootbox(
    name: string,
    price: number,
    currency: "SOL" | "USD" = "SOL"
  ): Promise<ApiResponse<Lootbox>> {
    return this.apiClient.post<Lootbox>("/api/v1/lootbox", {
      name,
      price,
      currency,
      isActive: true,
    });
  }

  // ==========================================
  // ADMIN: Vincular Itens à Lootbox
  // ==========================================

  async linkItemToLootbox(
    lootboxId: string,
    itemData: {
      itemId: string;
      probability: number;
      minQuantity?: number;
      maxQuantity?: number;
    }
  ): Promise<ApiResponse<any>> {
    return this.apiClient.post(`/api/v1/lootbox/${lootboxId}/items`, itemData);
  }

  // ==========================================
  // UTILITIES
  // ==========================================

  generateClientSeed(): string {
    return `user-seed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Método para verificar se o sistema está funcionando
  async healthCheck(): Promise<
    ApiResponse<{ status: string; timestamp: string }>
  > {
    try {
      await this.apiClient.get("/api/v1/lootbox");
      return {
        success: true,
        data: {
          status: "healthy",
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: "unhealthy",
        data: {
          status: "unhealthy",
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  // Invalidar cache de lootbox
  invalidateCache(): void {
    // Implementar invalidação se necessário
  }

  // Limpar cache
  clearCache(): void {
    // Implementar limpeza se necessário
  }
}
