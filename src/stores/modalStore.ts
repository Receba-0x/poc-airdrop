import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// Tipos para os diferentes tipos de modal
export type ModalType = 'deposit' | 'withdraw' | 'confirm' | null

// Interface para os dados dos modais
interface ModalData {
  amount?: number
  currency?: string
  address?: string
  message?: string
  [key: string]: any
}

// Interface do estado do modal
interface ModalState {
  // Estado dos modais
  isOpen: boolean
  type: ModalType
  data: ModalData | null

  // Loading states
  isLoading: boolean
  loadingMessage: string

  // Ações
  openModal: (type: ModalType, data?: ModalData) => void
  closeModal: () => void
  setLoading: (loading: boolean, message?: string) => void
  updateModalData: (data: Partial<ModalData>) => void
}

// Store principal dos modais
export const useModalStore = create<ModalState>()(
  devtools(
    (set, get) => ({
      // Estado inicial
      isOpen: false,
      type: null,
      data: null,
      isLoading: false,
      loadingMessage: '',

      // Ações
      openModal: (type, data) => {
        set({
          isOpen: true,
          type,
          data: data || null,
          isLoading: false,
          loadingMessage: ''
        })
      },

      closeModal: () => {
        set({
          isOpen: false,
          type: null,
          data: null,
          isLoading: false,
          loadingMessage: ''
        })
      },

      setLoading: (loading, message = '') => {
        set({
          isLoading: loading,
          loadingMessage: message
        })
      },

      updateModalData: (newData) => {
        const currentData = get().data
        set({
          data: { ...currentData, ...newData }
        })
      }
    }),
    {
      name: 'modal-store'
    }
  )
)

// Hooks específicos para conveniência
export const useDepositModal = () => {
  const { openModal, closeModal, isOpen, type, data } = useModalStore()

  return {
    isOpen: isOpen && type === 'deposit',
    data: data as ModalData | null,
    openDepositModal: (data?: ModalData) => openModal('deposit', data),
    closeDepositModal: closeModal
  }
}

export const useWithdrawModal = () => {
  const { openModal, closeModal, isOpen, type, data } = useModalStore()

  return {
    isOpen: isOpen && type === 'withdraw',
    data: data as ModalData | null,
    openWithdrawModal: (data?: ModalData) => openModal('withdraw', data),
    closeWithdrawModal: closeModal
  }
}

export const useConfirmModal = () => {
  const { openModal, closeModal, isOpen, type, data } = useModalStore()

  return {
    isOpen: isOpen && type === 'confirm',
    data: data as ModalData | null,
    openConfirmModal: (data?: ModalData) => openModal('confirm', data),
    closeConfirmModal: closeModal
  }
}
