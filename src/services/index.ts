export { ApiClient } from "./base/ApiClient";
export type { ApiResponse } from "./base/ApiClient";
export { LootboxService } from "./lootbox/LootboxService";
export { UploadService } from "./upload/UploadService";
export type {
  Lootbox,
  Item,
  PurchaseRequest,
  PurchaseResponse,
  FairnessData,
} from "./lootbox/LootboxService";
export {
  queryClient,
  queryKeys,
  invalidateQueries,
  removeQueries,
} from "./cache/QueryClient";

// Admin services
export {
  AdminItemsService,
  AdminPurchasesService,
  AdminLootboxService,
} from "./admin";
export type {
  AdminItem,
  CreateItemRequest,
  CreateItemWithLootboxRequest,
  BatchCreateItemsRequest,
  BatchCreateItemsWithLootboxRequest,
  ItemsStats,
  ItemsFilters,
  UpdateItemRequest,
  AdminPurchase,
  FairnessData as AdminFairnessData,
  AdminLootbox,
  AdminLootboxItem,
  CreateLootboxRequest,
  UpdateLootboxRequest,
  LootboxStock,
  LinkItemToLootboxRequest,
} from "./admin";
export type {
  Purchase,
  Reward,
  PurchaseStats,
  PurchasesFilters,
  UpdatePurchaseStatusRequest,
  FairnessVerificationRequest,
  ClientSeedResponse,
} from "./purchases/PurchaseService";

import { ApiClient } from "./base/ApiClient";
import { LootboxService } from "./lootbox/LootboxService";
import { UploadService } from "./upload/UploadService";
import { UserService } from "./user/UserService";
import { AdminItemsService } from "./admin/AdminItemsService";
import { AdminPurchasesService } from "./admin/AdminPurchasesService";
import { AdminLootboxService } from "./admin/AdminLootboxService";
import { ItemService } from "./item/ItemService";
import { PurchaseService } from "./purchases/PurchaseService";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";
export const apiClient = new ApiClient(API_BASE_URL);
export const lootboxService = new LootboxService(apiClient);
export const itemService = new ItemService(apiClient);
export const userService = new UserService(apiClient);
export const purchaseService = new PurchaseService(apiClient);
export const uploadService = new UploadService(apiClient);
export const adminItemsService = new AdminItemsService(apiClient);
export const adminPurchasesService = new AdminPurchasesService(apiClient);
export const adminLootboxService = new AdminLootboxService(apiClient);
