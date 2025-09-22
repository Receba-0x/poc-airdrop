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
export type CurrencyType = "SOL" | "USD";

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
    }),
    {
      name: "transaction-store",
    }
  )
);
