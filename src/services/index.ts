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
import { ApiClient } from "./base/ApiClient";
import { LootboxService } from "./lootbox/LootboxService";
import { UploadService } from "./upload/UploadService";
import { UserService } from "./user/UserService";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";
export const apiClient = new ApiClient(API_BASE_URL);
export const lootboxService = new LootboxService(apiClient);
export const userService = new UserService(apiClient);
export const uploadService = new UploadService(apiClient);
