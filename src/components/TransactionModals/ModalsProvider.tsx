"use client";
import React from "react";
import { DepositModal } from "./DepositModal";
import { WithdrawModal } from "./WithdrawModal";

export function ModalsProvider() {
  return (
    <>
      <DepositModal />
      <WithdrawModal />
    </>
  );
}

export {
  useDepositModal,
  useWithdrawModal,
  useLoginModal,
} from "@/stores/modalStore";
export type {
  TransactionType,
  TransactionStatus,
  CurrencyType,
} from "@/stores/transactionStore";
export type {
  Transaction,
  TransactionFormData,
} from "@/stores/transactionStore";
