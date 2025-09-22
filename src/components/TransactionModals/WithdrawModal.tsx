"use client";
import React, { useState } from "react";
import { BaseModal } from "./BaseModal";
import { useWithdrawModal } from "@/stores/modalStore";
import { useTransactionStore } from "@/stores/transactionStore";
import { useWithdraw } from "@/hooks/useWithdraw";
import { WithdrawForm } from "./WithdrawModal/WithdrawForm";
import { WithdrawSuccess } from "./WithdrawModal/WithdrawSuccess";
import { WithdrawLoading } from "./WithdrawModal/WithdrawLoading";

export function WithdrawModal() {
  const { isOpen, closeWithdrawModal } = useWithdrawModal();
  const {
    resetWithdrawForm,
    withdrawForm,
    updateWithdrawForm,
  } = useTransactionStore();
  const { withdrawSolana, isWithdrawing } = useWithdraw();

  const [withdrawCompleted, setWithdrawCompleted] = useState(false);

  const handleCloseModal = () => {
    resetWithdrawForm();
    closeWithdrawModal();
    setWithdrawCompleted(false);
  };

  const handleWithdraw = async () => {
    try {
      await withdrawSolana({
        usdAmount: parseFloat(withdrawForm.amount),
      });

      setWithdrawCompleted(true);
    } catch (error: any) {
      console.error("Withdraw error:", error);
    }
  };

  const handleCancel = () => {
    resetWithdrawForm();
    closeWithdrawModal();
    setWithdrawCompleted(false);
  };

  // Estado de loading durante o processamento
  if (isWithdrawing) {
    return (
      <BaseModal
        isOpen={isOpen}
        onClose={handleCancel}
        title="Processando Saque"
        preventClose={true}
        size="sm"
      >
        <WithdrawLoading
          message="Processando saque..."
          description="Aguarde, isso pode levar alguns instantes..."
        />
      </BaseModal>
    );
  }

  // Estado de sucesso
  if (withdrawCompleted) {
    return (
      <BaseModal
        isOpen={isOpen}
        onClose={handleCancel}
        title=""
        size="md"
        showCloseButton={false}
      >
        <WithdrawSuccess
          onCloseModal={handleCloseModal}
          onInitWithdraw={() => {
            setWithdrawCompleted(false);
          }}
        />
      </BaseModal>
    );
  }

  // Estado inicial - formulário de saque
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Sacar Fundos"
      size="lg"
    >
        <WithdrawForm
          withdrawForm={withdrawForm}
          isInitializing={isWithdrawing}
          validateAmount={() => true} // Validação já feita no componente
          onAmountChange={(amount) => updateWithdrawForm({ amount })}
          onInitWithdraw={handleWithdraw}
          onCancel={handleCancel}
        />
    </BaseModal>
  );
}
