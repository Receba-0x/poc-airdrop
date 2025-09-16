import { solanaTransactionService } from "@/services";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

// Tipos para transações
export type TransactionType = "deposit" | "withdraw";
export type TransactionStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled"
  | "expired"
  | "sent"
  | "confirmed";
export type CurrencyType = "SOL" | "USDC" | "BUSD";

// Interface para uma transação
export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: CurrencyType;
  status: TransactionStatus;
  address?: string;
  txHash?: string;
  createdAt: Date;
  updatedAt: Date;
  errorMessage?: string;
  // Novos campos da API Solana
  usdAmount?: number;
  solAmount?: number;
  solPrice?: number;
  serverWallet?: string;
  memo?: string;
  expiresAt?: Date;
  destinationWallet?: string;
  description?: string;
}

// Interface para os dados do formulário
export interface TransactionFormData {
  amount: string;
  currency: CurrencyType;
  address?: string;
}

// Interface do estado das transações
interface TransactionState {
  // Estado das transações
  transactions: Transaction[];
  currentTransaction: Transaction | null;

  // Estado dos formulários
  depositForm: TransactionFormData;
  withdrawForm: TransactionFormData;

  // Estados de loading
  isSubmitting: boolean;
  isValidating: boolean;

  // Ações para transações
  createTransaction: (
    type: TransactionType,
    data: Omit<Transaction, "id" | "status" | "createdAt" | "updatedAt">
  ) => Transaction;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  setCurrentTransaction: (transaction: Transaction | null) => void;

  // Ações para formulários
  updateDepositForm: (data: Partial<TransactionFormData>) => void;
  updateWithdrawForm: (data: Partial<TransactionFormData>) => void;
  resetDepositForm: () => void;
  resetWithdrawForm: () => void;

  // Ações de validação e submissão
  validateAmount: (
    amount: string,
    currency: CurrencyType,
    type: TransactionType
  ) => boolean;
  validateAddress: (address: string) => boolean;
  submitTransaction: (type: TransactionType) => Promise<void>;
  verifyTransaction: (
    transactionId: string,
    type: TransactionType,
    transactionHash?: string
  ) => Promise<any>;
  cancelTransaction: (
    transactionId: string,
    type: TransactionType
  ) => Promise<void>;

  // Estados de loading
  setSubmitting: (submitting: boolean) => void;
  setValidating: (validating: boolean) => void;
}

// Valores iniciais dos formulários
const initialDepositForm: TransactionFormData = {
  amount: "",
  currency: "SOL",
};

const initialWithdrawForm: TransactionFormData = {
  amount: "",
  currency: "SOL",
  address: "",
};

// Store principal das transações
export const useTransactionStore = create<TransactionState>()(
  devtools(
    (set, get) => ({
      // Estado inicial
      transactions: [],
      currentTransaction: null,
      depositForm: initialDepositForm,
      withdrawForm: initialWithdrawForm,
      isSubmitting: false,
      isValidating: false,

      // Ações para transações
      createTransaction: (type, data) => {
        const transaction: Transaction = {
          id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          status: "pending",
          createdAt: new Date(),
          updatedAt: new Date(),
          ...data,
        };

        set((state) => ({
          transactions: [transaction, ...state.transactions],
          currentTransaction: transaction,
        }));

        return transaction;
      },

      // Função auxiliar para obter transação por ID
      getTransactionById: (id: string) => {
        return get().transactions.find((tx) => tx.id === id);
      },

      updateTransaction: (id, updates) => {
        set((state) => ({
          transactions: state.transactions.map((tx) =>
            tx.id === id ? { ...tx, ...updates, updatedAt: new Date() } : tx
          ),
          currentTransaction:
            state.currentTransaction?.id === id
              ? {
                  ...state.currentTransaction,
                  ...updates,
                  updatedAt: new Date(),
                }
              : state.currentTransaction,
        }));
      },

      setCurrentTransaction: (transaction) => {
        set({ currentTransaction: transaction });
      },

      // Ações para formulários
      updateDepositForm: (data) => {
        set((state) => ({
          depositForm: { ...state.depositForm, ...data },
        }));
      },

      updateWithdrawForm: (data) => {
        set((state) => ({
          withdrawForm: { ...state.withdrawForm, ...data },
        }));
      },

      resetDepositForm: () => {
        set({ depositForm: initialDepositForm });
      },

      resetWithdrawForm: () => {
        set({ withdrawForm: initialWithdrawForm });
      },

      // Validações conforme API Solana
      validateAmount: (amount, currency, type) => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) return false;

        // Validações específicas por tipo e moeda conforme documentação
        if (type === "deposit") {
          // Para depósitos, amount é em SOL
          if (currency === "SOL") {
            return (
              numAmount >= 0.01 &&
              numAmount <= 10 &&
              numAmount.toString().split(".")[1]?.length <= 4
            );
          }
        } else if (type === "withdraw") {
          // Para saques, amount é em USD
          return (
            numAmount >= 0.01 &&
            numAmount <= 5000 &&
            numAmount.toString().split(".")[1]?.length <= 2
          );
        }

        return false;
      },

      validateAddress: (address) => {
        // Validação de carteira Solana (44 caracteres)
        return (
          address &&
          address.length === 44 &&
          /^[1-9A-HJ-NP-Za-km-z]+$/.test(address)
        );
      },

      // Submissão de transação usando API Solana
      submitTransaction: async (type: TransactionType) => {
        const { setSubmitting, updateTransaction } = get();
        const formData =
          type === "deposit" ? get().depositForm : get().withdrawForm;

        try {
          setSubmitting(true);

          if (type === "deposit") {
            // Iniciar depósito
            const depositResponse = await solanaTransactionService.initDeposit({
              solAmount: parseFloat(formData.amount),
            });

            // Atualizar transação com dados da resposta
            updateTransaction(depositResponse.id, {
              amount: depositResponse.solAmount,
              usdAmount: depositResponse.usdAmount,
              solAmount: depositResponse.solAmount,
              solPrice: depositResponse.solPrice,
              serverWallet: depositResponse.serverWallet,
              memo: depositResponse.memo,
              expiresAt: new Date(depositResponse.expiresAt),
              status: "pending",
            });
          } else if (type === "withdraw") {
            // Iniciar saque
            const withdrawResponse =
              await solanaTransactionService.initWithdraw({
                usdAmount: parseFloat(formData.amount),
                destinationWallet: formData.address!,
                description: `Withdraw to ${formData.address}`,
              });

            // Atualizar transação com dados da resposta
            updateTransaction(withdrawResponse.id, {
              usdAmount: withdrawResponse.usdAmount,
              solAmount: withdrawResponse.solAmount,
              solPrice: withdrawResponse.solPrice,
              destinationWallet: withdrawResponse.destinationWallet,
              expiresAt: new Date(withdrawResponse.expiresAt),
              status: "pending",
            });
          }
        } catch (error: any) {
          console.error("Erro ao submeter transação:", error);

          // Tratar erros específicos da API
          if (error.message.includes("Limite diário")) {
            throw new Error(
              "Limite diário de transações atingido. Tente novamente amanhã."
            );
          } else if (error.message.includes("Saldo insuficiente")) {
            throw new Error("Saldo insuficiente para realizar esta transação.");
          } else if (error.message.includes("carteira Solana inválido")) {
            throw new Error("Formato de carteira Solana inválido.");
          } else if (error.message.includes("Rate limit")) {
            throw new Error(
              "Muitas tentativas. Aguarde alguns minutos e tente novamente."
            );
          }

          throw error;
        } finally {
          setSubmitting(false);
        }
      },

      // Verificar transação (para depósitos e saques)
      verifyTransaction: async (
        transactionId: string,
        type: TransactionType,
        transactionHash?: string
      ) => {
        const { updateTransaction } = get();

        try {
          if (type === "deposit") {
            const response = await solanaTransactionService.verifyDeposit({
              depositId: transactionId,
              transactionHash,
            });

            updateTransaction(transactionId, {
              status: "completed",
              txHash: response.transaction.transactionHash,
            });

            return response;
          } else {
            const response = await solanaTransactionService.verifyWithdraw({
              withdrawId: transactionId,
              transactionHash: transactionHash!,
            });

            updateTransaction(transactionId, {
              status: "confirmed",
              txHash: response.transaction.transactionHash,
            });

            return response;
          }
        } catch (error: any) {
          console.error("Erro ao verificar transação:", error);
          throw error;
        }
      },

      // Cancelar transação
      cancelTransaction: async (
        transactionId: string,
        type: TransactionType
      ) => {
        const { updateTransaction } = get();

        try {
          if (type === "deposit") {
            await solanaTransactionService.cancelDeposit(transactionId);
          } else {
            await solanaTransactionService.cancelWithdraw(transactionId);
          }

          updateTransaction(transactionId, { status: "cancelled" });
        } catch (error: any) {
          console.error("Erro ao cancelar transação:", error);
          throw error;
        }
      },

      // Estados de loading
      setSubmitting: (submitting) => {
        set({ isSubmitting: submitting });
      },

      setValidating: (validating) => {
        set({ isValidating: validating });
      },
    }),
    {
      name: "transaction-store",
    }
  )
);
