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
  AdminUserService,
  AdminUploadService,
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
  AdminUser,
  CreateUserRequest,
  UpdateUserRequest,
  UsersStats,
  UsersFilters,
  ResetUserPasswordRequest,
  UploadImageResponse,
  UploadedFile,
  UploadListResponse,
  UploadFilters,
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
import { AdminUserService } from "./admin/AdminUserService";
import { AdminUploadService } from "./admin/AdminUploadService";
import { ItemService } from "./item/ItemService";
import { PurchaseService } from "./purchases/PurchaseService";
import { LeaderboardService } from "./leaderboard/LeaderboardService";
import { SolanaTransactionService } from "./solana/SolanaTransactionService";
export type { Leaderboard } from "./leaderboard/LeaderboardService";

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
export const adminUserService = new AdminUserService(apiClient);
export const adminUploadService = new AdminUploadService(apiClient);
export const leaderboardService = new LeaderboardService(apiClient);
export const solanaTransactionService = new SolanaTransactionService(apiClient);
