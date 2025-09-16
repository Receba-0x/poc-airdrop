import { ApiClient } from '@/services/base/ApiClient';

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
  status: 'PENDING';
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
    type: 'DEPOSIT';
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
  status: 'PENDING';
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
    type: 'WITHDRAW';
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
  status: 'PENDING' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';
  createdAt: string;
  expiresAt: string;
}

export interface WithdrawRequest {
  id: string;
  usdAmount: number;
  solAmount: number;
  solPrice: number;
  destinationWallet: string;
  status: 'PENDING' | 'PROCESSING' | 'SENT' | 'CONFIRMED' | 'FAILED' | 'EXPIRED' | 'CANCELLED';
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

export class SolanaTransactionService {
  constructor(private apiClient: ApiClient) {}

  // ========== DEPOSIT ENDPOINTS ==========

  /**
   * Iniciar solicitação de depósito
   */
  async initDeposit(request: DepositInitRequest): Promise<DepositInitResponse> {
    try {
      const response = await this.apiClient.post<DepositInitResponse>(
        '/api/v1/balance/deposit/solana/init',
        request
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to initialize deposit');
      }

      return response.data!;
    } catch (error: any) {
      console.error('Deposit init error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Deposit initialization failed');
    }
  }

  /**
   * Verificar depósito (hash opcional)
   */
  async verifyDeposit(request: DepositVerifyRequest): Promise<DepositVerifyResponse> {
    try {
      const response = await this.apiClient.post<DepositVerifyResponse>(
        '/api/v1/balance/deposit/solana/verify',
        request
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to verify deposit');
      }

      return response.data!;
    } catch (error: any) {
      console.error('Deposit verify error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Deposit verification failed');
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

      if (!response.success) {
        throw new Error(response.message || 'Failed to cancel deposit');
      }

      return response.data!;
    } catch (error: any) {
      console.error('Deposit cancel error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Deposit cancellation failed');
    }
  }

  /**
   * Listar solicitações de depósito
   */
  async getDepositRequests(params?: {
    status?: 'PENDING' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';
    limit?: number;
    offset?: number;
  }): Promise<DepositRequestsResponse> {
    try {
      const response = await this.apiClient.get<DepositRequestsResponse>(
        '/api/v1/balance/deposit/solana/requests',
        { params }
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch deposit requests');
      }

      return response.data!;
    } catch (error: any) {
      console.error('Get deposit requests error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch deposit requests');
    }
  }

  // ========== WITHDRAW ENDPOINTS ==========

  /**
   * Iniciar solicitação de saque
   */
  async initWithdraw(request: WithdrawInitRequest): Promise<WithdrawInitResponse> {
    try {
      const response = await this.apiClient.post<WithdrawInitResponse>(
        '/api/v1/balance/withdraw/solana/init',
        request
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to initialize withdrawal');
      }

      return response.data!;
    } catch (error: any) {
      console.error('Withdraw init error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Withdrawal initialization failed');
    }
  }

  /**
   * Processar saque (enviar SOL)
   */
  async processWithdraw(withdrawId: string): Promise<WithdrawProcessResponse> {
    try {
      const response = await this.apiClient.post<WithdrawProcessResponse>(
        `/api/v1/balance/withdraw/solana/process/${withdrawId}`
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to process withdrawal');
      }

      return response.data!;
    } catch (error: any) {
      console.error('Withdraw process error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Withdrawal processing failed');
    }
  }

  /**
   * Verificar saque concluído
   */
  async verifyWithdraw(request: WithdrawVerifyRequest): Promise<WithdrawVerifyResponse> {
    try {
      const response = await this.apiClient.post<WithdrawVerifyResponse>(
        '/api/v1/balance/withdraw/solana/verify',
        request
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to verify withdrawal');
      }

      return response.data!;
    } catch (error: any) {
      console.error('Withdraw verify error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Withdrawal verification failed');
    }
  }

  /**
   * Cancelar saque pendente
   */
  async cancelWithdraw(withdrawId: string): Promise<{ message: string }> {
    try {
      const response = await this.apiClient.delete<{ message: string }>(
        `/api/v1/balance/withdraw/solana/cancel/${withdrawId}`
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to cancel withdrawal');
      }

      return response.data!;
    } catch (error: any) {
      console.error('Withdraw cancel error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Withdrawal cancellation failed');
    }
  }

  /**
   * Listar solicitações de saque
   */
  async getWithdrawRequests(params?: {
    status?: 'PENDING' | 'PROCESSING' | 'SENT' | 'CONFIRMED' | 'FAILED' | 'EXPIRED' | 'CANCELLED';
    limit?: number;
    offset?: number;
  }): Promise<WithdrawRequestsResponse> {
    try {
      const response = await this.apiClient.get<WithdrawRequestsResponse>(
        '/api/v1/balance/withdraw/solana/requests',
        { params }
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch withdrawal requests');
      }

      return response.data!;
    } catch (error: any) {
      console.error('Get withdraw requests error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch withdrawal requests');
    }
  }

  // ========== UTILITY ENDPOINTS ==========

  /**
   * Obter saldo do usuário
   */
  async getBalance(): Promise<BalanceResponse> {
    try {
      const response = await this.apiClient.get<BalanceResponse>('/api/v1/balance/balance');

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch balance');
      }

      return response.data!;
    } catch (error: any) {
      console.error('Get balance error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch balance');
    }
  }
}
