import { create } from "zustand";
import { devtools } from "zustand/middleware";

export type ModalType = "deposit" | "withdraw" | "confirm" | "login" | null;

interface ModalData {
  amount?: number;
  currency?: string;
  address?: string;
  message?: string;
  [key: string]: any;
}

interface ModalState {
  isOpen: boolean;
  type: ModalType;
  data: ModalData | null;

  isLoading: boolean;
  loadingMessage: string;

  openModal: (type: ModalType, data?: ModalData) => void;
  closeModal: () => void;
  setLoading: (loading: boolean, message?: string) => void;
  updateModalData: (data: Partial<ModalData>) => void;
}

// Store principal dos modais
export const useModalStore = create<ModalState>()(
  devtools(
    (set, get) => ({
      isOpen: false,
      type: null,
      data: null,
      isLoading: false,
      loadingMessage: "",

      // Ações
      openModal: (type, data) => {
        set({
          isOpen: true,
          type,
          data: data || null,
          isLoading: false,
          loadingMessage: "",
        });
      },

      closeModal: () => {
        set({
          isOpen: false,
          type: null,
          data: null,
          isLoading: false,
          loadingMessage: "",
        });
      },

      setLoading: (loading, message = "") => {
        set({
          isLoading: loading,
          loadingMessage: message,
        });
      },

      updateModalData: (newData) => {
        const currentData = get().data;
        set({
          data: { ...currentData, ...newData },
        });
      },
    }),
    {
      name: "modal-store",
    }
  )
);

export const useDepositModal = () => {
  const { openModal, closeModal, isOpen, type, data } = useModalStore();

  return {
    isOpen: isOpen && type === "deposit",
    data: data as ModalData | null,
    openDepositModal: (data?: ModalData) => openModal("deposit", data),
    closeDepositModal: closeModal,
  };
};

export const useLoginModal = () => {
  const { openModal, closeModal, isOpen, type, data } = useModalStore();

  return {
    isOpen: isOpen && type === "login",
    data: data as ModalData | null,
    openLoginModal: (data?: ModalData) => openModal("login", data),
    closeLoginModal: closeModal,
  };
};

export const useWithdrawModal = () => {
  const { openModal, closeModal, isOpen, type, data } = useModalStore();

  return {
    isOpen: isOpen && type === "withdraw",
    data: data as ModalData | null,
    openWithdrawModal: (data?: ModalData) => openModal("withdraw", data),
    closeWithdrawModal: closeModal,
  };
};

export const useConfirmModal = () => {
  const { openModal, closeModal, isOpen, type, data } = useModalStore();

  return {
    isOpen: isOpen && type === "confirm",
    data: data as ModalData | null,
    openConfirmModal: (data?: ModalData) => openModal("confirm", data),
    closeConfirmModal: closeModal,
  };
};
