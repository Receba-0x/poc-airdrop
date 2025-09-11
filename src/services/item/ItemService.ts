import { ApiClient, type ApiResponse } from "../base/ApiClient";

export interface ItemsFilters {
  skip?: number;
  take?: number;
  type?: string;
  rarity?: string;
  isActive?: boolean;
}

export interface Item {
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

export interface CreateItemPayload {
  name: string;
  type: string;
  rarity: string;
  imageUrl: string;
  value: number;
  isActive: boolean;
  lootboxLink: {
    lootboxId: string;
    probability: number;
    minQuantity: number;
    maxQuantity: number;
  };
}

export interface CreateItemBatchPayload {
  batchSize: number;
  lootboxId: string;
  items: CreateItemPayload[];
}

export class ItemService {
  constructor(private apiClient: ApiClient) {}

  async getItems(filters?: ItemsFilters): Promise<ApiResponse<Item[]>> {
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
    return this.apiClient.get<Item[]>(`/api/v1/items${query}`);
  }

  async createItem(payload: CreateItemPayload): Promise<ApiResponse<Item>> {
    return this.apiClient.post<Item>("/api/v1/items/with-lootbox", payload);
  }

  async createItemBatch(
    payload: CreateItemBatchPayload
  ): Promise<ApiResponse<Item[]>> {
    const url = `/api/v1/items/batch/with-lootbox`;
    return this.apiClient.post<Item[]>(url, payload);
  }

  async getItem(itemId: string): Promise<ApiResponse<Item>> {
    return this.apiClient.get<Item>(`/api/v1/items/${itemId}`);
  }

  async updateItem(itemData: Omit<Item, "id">): Promise<ApiResponse<Item>> {
    return this.apiClient.put<Item>("/api/v1/items", itemData);
  }

  async deleteItem(itemId: string): Promise<ApiResponse<void>> {
    return this.apiClient.delete(`/api/v1/items/${itemId}`);
  }

  async createItemsBatchFromCSV(
    file: File,
    lootboxId: string
  ): Promise<
    ApiResponse<{
      success: number;
      failed: number;
      errors: Array<{ row: number; data: any; error: string }>;
      items: Item[];
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
}
