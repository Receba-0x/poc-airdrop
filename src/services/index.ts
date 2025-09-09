// Exportar cliente base
export { ApiClient } from './base/ApiClient';
export type { ApiResponse } from './base/ApiClient';

// Exportar serviço de lootbox
export { LootboxService } from './lootbox/LootboxService';
export type {
  Lootbox,
  Item,
  PurchaseRequest,
  PurchaseResponse,
  FairnessData,
} from './lootbox/LootboxService';

// Exportar configurações de cache
export {
  queryClient,
  queryKeys,
  invalidateQueries,
  removeQueries,
} from './cache/QueryClient';

// Instância singleton do ApiClient
import { ApiClient } from './base/ApiClient';
import { LootboxService } from './lootbox/LootboxService';
import { UserService } from './user/UserService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

export const apiClient = new ApiClient(API_BASE_URL);

// Instâncias dos serviços
export const lootboxService = new LootboxService(apiClient);
export const userService = new UserService(apiClient);
