import { ApiClient } from "@/services/base/ApiClient";

// Interfaces baseadas na documentação da API
export interface DepositInitRequest {
  solAmount: number;
}

export interface DepositInitResponse {
  id: string;
  solAmount: number;
  usdAmount: number;
  solPrice: number;
  serverWallet: string;
  memo: string;
  expiresAt: string;
  status: "PENDING";
}

export interface DepositVerifyRequest {
  depositId: string;
  transactionHash?: string;
}

export interface DepositVerifyResponse {
  message: string;
  balance: number;
  transaction: {
    id: string;
    type: "DEPOSIT";
    amount: number;
    transactionHash: string;
  };
}

export interface WithdrawInitRequest {
  usdAmount: number;
  destinationWallet: string;
  description?: string;
}

export interface WithdrawInitResponse {
  id: string;
  usdAmount: number;
  solAmount: number;
  solPrice: number;
  destinationWallet: string;
  status: "PENDING";
  expiresAt: string;
  createdAt: string;
}

export interface WithdrawProcessResponse {
  message: string;
  transactionHash: string;
}

export interface WithdrawVerifyRequest {
  withdrawId: string;
  transactionHash: string;
}

export interface WithdrawVerifyResponse {
  message: string;
  balance: number;
  transaction: {
    id: string;
    type: "WITHDRAW";
    amount: number;
    transactionHash: string;
  };
}

export interface BalanceResponse {
  balance: number;
  currency: string;
}

export interface DepositRequest {
  id: string;
  solAmount: number;
  usdAmount: number;
  solPrice: number;
  status: "PENDING" | "COMPLETED" | "EXPIRED" | "CANCELLED";
  createdAt: string;
  expiresAt: string;
}

export interface WithdrawRequest {
  id: string;
  usdAmount: number;
  solAmount: number;
  solPrice: number;
  destinationWallet: string;
  status:
    | "PENDING"
    | "PROCESSING"
    | "SENT"
    | "CONFIRMED"
    | "FAILED"
    | "EXPIRED"
    | "CANCELLED";
  transactionHash?: string;
  createdAt: string;
}

export interface DepositRequestsResponse {
  requests: DepositRequest[];
  total: number;
  limit: number;
  offset: number;
}

export interface WithdrawRequestsResponse {
  requests: WithdrawRequest[];
  total: number;
  limit: number;
  offset: number;
}

// Novo endpoint simplificado baseado na documentação
export interface SimpleSolanaWithdrawRequest {
  usdAmount: number;
  description?: string;
}

export interface SimpleSolanaWithdrawResponse {
  userId: string;
  balance: number;
  currency: string;
  lastUpdated: string;
}

// Resposta de fallback (timeout na verificação)
export interface SimpleSolanaWithdrawFallbackResponse {
  success: boolean;
  pending: boolean;
  transactionHash: string;
  withdrawId: string;
  balance: number;
}

export class SolanaTransactionService {
  constructor(private apiClient: ApiClient) {}

  // ========== DEPOSIT ENDPOINTS ==========

  async initDeposit(request: DepositInitRequest): Promise<DepositInitResponse> {
    try {
      const response = await this.apiClient.post<DepositInitResponse>(
        "/api/v1/balance/deposit/solana/init",
        request
      );
      return response as any;
    } catch (error: any) {
      console.error("Deposit init error:", error);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Deposit initialization failed"
      );
    }
  }

  async verifyDeposit(
    request: DepositVerifyRequest
  ): Promise<DepositVerifyResponse> {
    try {
      const url = "/api/v1/balance/deposit/solana/verify";
      const response = await this.apiClient.post<DepositVerifyResponse>(
        url,
        request
      );

      return response as any;
    } catch (error: any) {
      console.error("Deposit verify error:", error);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Deposit verification failed"
      );
    }
  }

  /**
   * Cancelar depósito pendente
   */
  async cancelDeposit(depositId: string): Promise<{ message: string }> {
    try {
      const response = await this.apiClient.delete<{ message: string }>(
        `/api/v1/balance/deposit/solana/cancel/${depositId}`
      );

      return response as any;
    } catch (error: any) {
      console.error("Deposit cancel error:", error);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Deposit cancellation failed"
      );
    }
  }

  async getDepositRequests(params?: {
    status?: "PENDING" | "COMPLETED" | "EXPIRED" | "CANCELLED";
    limit?: number;
    offset?: number;
  }): Promise<DepositRequestsResponse> {
    try {
      const response = await this.apiClient.get<DepositRequestsResponse>(
        "/api/v1/balance/deposit/solana/requests",
        { params }
      );
      return response as any;
    } catch (error: any) {
      console.error("Get deposit requests error:", error);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch deposit requests"
      );
    }
  }

  async withdrawSolana(
    request: SimpleSolanaWithdrawRequest
  ): Promise<
    SimpleSolanaWithdrawResponse | SimpleSolanaWithdrawFallbackResponse
  > {
    try {
      const response = await this.apiClient.post<
        SimpleSolanaWithdrawResponse | SimpleSolanaWithdrawFallbackResponse
      >("/api/v1/balance/withdraw/solana", request);

      return response as any;
    } catch (error: any) {
      console.error("Withdraw solana error:", error);

      // Tratamento específico de timeout (408)
      if (error.response?.status === 408) {
        const fallbackData = error.response.data;
        if (fallbackData?.pending && fallbackData?.transactionHash) {
          return {
            success: true,
            pending: true,
            transactionHash: fallbackData.transactionHash,
            withdrawId: fallbackData.withdrawId,
            balance: fallbackData.balance,
          };
        }
      }

      throw new Error(
        error.response?.data?.message || error.message || "Withdrawal failed"
      );
    }
  }

  /**
   * Listar solicitações de saque
   */
  async getWithdrawRequests(params?: {
    status?:
      | "PENDING"
      | "PROCESSING"
      | "SENT"
      | "CONFIRMED"
      | "FAILED"
      | "EXPIRED"
      | "CANCELLED";
    limit?: number;
    offset?: number;
  }): Promise<WithdrawRequestsResponse> {
    try {
      const response = await this.apiClient.get<WithdrawRequestsResponse>(
        "/api/v1/balance/withdraw/solana/requests",
        { params }
      );

      return response as any;
    } catch (error: any) {
      console.error("Get withdraw requests error:", error);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch withdrawal requests"
      );
    }
  }

  // ========== UTILITY ENDPOINTS ==========

  /**
   * Obter saldo do usuário
   */
  async getBalance(): Promise<BalanceResponse> {
    try {
      const response = await this.apiClient.get<BalanceResponse>(
        "/api/v1/balance/balance"
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to fetch balance");
      }

      return response.data!;
    } catch (error: any) {
      console.error("Get balance error:", error);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch balance"
      );
    }
  }
}
