import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// Tipos para transações
export type TransactionType = 'deposit' | 'withdraw'
export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
export type CurrencyType = 'SOL' | 'USDC' | 'BUSD'

// Interface para uma transação
export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  currency: CurrencyType
  status: TransactionStatus
  address?: string
  txHash?: string
  createdAt: Date
  updatedAt: Date
  errorMessage?: string
}

// Interface para os dados do formulário
export interface TransactionFormData {
  amount: string
  currency: CurrencyType
  address?: string
}

// Interface do estado das transações
interface TransactionState {
  // Estado das transações
  transactions: Transaction[]
  currentTransaction: Transaction | null

  // Estado dos formulários
  depositForm: TransactionFormData
  withdrawForm: TransactionFormData

  // Estados de loading
  isSubmitting: boolean
  isValidating: boolean

  // Ações para transações
  createTransaction: (type: TransactionType, data: Omit<Transaction, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => Transaction
  updateTransaction: (id: string, updates: Partial<Transaction>) => void
  setCurrentTransaction: (transaction: Transaction | null) => void

  // Ações para formulários
  updateDepositForm: (data: Partial<TransactionFormData>) => void
  updateWithdrawForm: (data: Partial<TransactionFormData>) => void
  resetDepositForm: () => void
  resetWithdrawForm: () => void

  // Ações de validação e submissão
  validateAmount: (amount: string, currency: CurrencyType) => boolean
  validateAddress: (address: string) => boolean
  submitTransaction: (type: TransactionType) => Promise<void>

  // Estados de loading
  setSubmitting: (submitting: boolean) => void
  setValidating: (validating: boolean) => void
}

// Valores iniciais dos formulários
const initialDepositForm: TransactionFormData = {
  amount: '',
  currency: 'SOL'
}

const initialWithdrawForm: TransactionFormData = {
  amount: '',
  currency: 'SOL',
  address: ''
}

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
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
          ...data
        }

        set(state => ({
          transactions: [transaction, ...state.transactions],
          currentTransaction: transaction
        }))

        return transaction
      },

      // Função auxiliar para obter transação por ID
      getTransactionById: (id: string) => {
        return get().transactions.find(tx => tx.id === id)
      },

      updateTransaction: (id, updates) => {
        set(state => ({
          transactions: state.transactions.map(tx =>
            tx.id === id
              ? { ...tx, ...updates, updatedAt: new Date() }
              : tx
          ),
          currentTransaction: state.currentTransaction?.id === id
            ? { ...state.currentTransaction, ...updates, updatedAt: new Date() }
            : state.currentTransaction
        }))
      },

      setCurrentTransaction: (transaction) => {
        set({ currentTransaction: transaction })
      },

      // Ações para formulários
      updateDepositForm: (data) => {
        set(state => ({
          depositForm: { ...state.depositForm, ...data }
        }))
      },

      updateWithdrawForm: (data) => {
        set(state => ({
          withdrawForm: { ...state.withdrawForm, ...data }
        }))
      },

      resetDepositForm: () => {
        set({ depositForm: initialDepositForm })
      },

      resetWithdrawForm: () => {
        set({ withdrawForm: initialWithdrawForm })
      },

      // Validações
      validateAmount: (amount, currency) => {
        const numAmount = parseFloat(amount)
        if (isNaN(numAmount) || numAmount <= 0) return false

        // Validações específicas por moeda
        switch (currency) {
          case 'SOL':
            return numAmount >= 0.001 // Mínimo 0.001 SOL
          case 'USDC':
            return numAmount >= 1 // Mínimo 1 USDC
          case 'BUSD':
            return numAmount >= 1 // Mínimo 1 BUSD
          default:
            return false
        }
      },

      validateAddress: (address) => {
        // Validação básica de endereço Solana (43-44 caracteres)
        return address && address.length >= 32 && address.length <= 44
      },

      // Submissão de transação
      submitTransaction: async (type: TransactionType) => {
        const { setSubmitting, createTransaction } = get()
        const formData = type === 'deposit' ? get().depositForm : get().withdrawForm

        try {
          setSubmitting(true)

          // Criar transação
          const transactionData = {
            amount: parseFloat(formData.amount),
            currency: formData.currency,
            address: formData.address,
            type
          }

          const transaction = createTransaction(type, transactionData)

          // Simular processamento (substituir por chamada real da API)
          setTimeout(() => {
            get().updateTransaction(transaction.id, { status: 'processing' })

            setTimeout(() => {
              get().updateTransaction(transaction.id, {
                status: 'completed',
                txHash: `tx_${Math.random().toString(36).substr(2, 9)}`
              })
            }, 2000)
          }, 1000)

        } catch (error) {
          console.error('Erro ao submeter transação:', error)
          throw error
        } finally {
          setSubmitting(false)
        }
      },

      // Estados de loading
      setSubmitting: (submitting) => {
        set({ isSubmitting: submitting })
      },

      setValidating: (validating) => {
        set({ isValidating: validating })
      }
    }),
    {
      name: 'transaction-store'
    }
  )
)
