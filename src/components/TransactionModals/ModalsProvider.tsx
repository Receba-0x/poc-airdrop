import React from "react";
import { DepositModal } from "./DepositModal";
import { WithdrawModal } from "./WithdrawModal";

/**
 * Provider que gerencia todos os modais de transação
 * Deve ser incluído no layout principal da aplicação
 */
export function ModalsProvider() {
  return (
    <>
      <DepositModal />
      <WithdrawModal />
    </>
  );
}

// Hook personalizado para acessar os modais
export {
  useDepositModal,
  useWithdrawModal,
  useLoginModal,
} from "@/stores/modalStore";

// Tipos para conveniência
export type {
  TransactionType,
  TransactionStatus,
  CurrencyType,
} from "@/stores/transactionStore";
export type {
  Transaction,
  TransactionFormData,
} from "@/stores/transactionStore";
