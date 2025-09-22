"use client";
import React, { useState, useEffect } from "react";
import { BaseModal } from "./BaseModal";
import { useDepositModal, useModalStore } from "@/stores/modalStore";
import { useTransactionStore } from "@/stores/transactionStore";
import { useDeposit } from "@/hooks/useBalance";
import { useTransactionValidation } from "@/hooks/useTransactionValidation";
import { DepositForm } from "./DepositModal/DepositForm";
import { DepositVerification } from "./DepositModal/DepositVerification";
import { DepositSuccess } from "./DepositModal/DepositSuccess";
import { DepositLoading } from "./DepositModal/DepositLoading";
import toast from "react-hot-toast";

export function DepositModal() {
  const { isOpen, closeDepositModal } = useDepositModal();
  const {
    resetDepositForm,
    depositForm,
    updateDepositForm,
    currentTransaction,
  } = useTransactionStore();
  const { validateAmount } = useTransactionValidation();
  const {
    initDeposit,
    verifyDeposit,
    cancelDeposit,
    isInitializing,
    isVerifying,
    isCancelling,
    items: depositRequests,
    isLoading: isLoadingDeposits,
    refetch: refetchDeposits,
  } = useDeposit();
  const { setLoading, isLoading, loadingMessage } = useModalStore();

  const [depositCompleted, setDepositCompleted] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationStep, setVerificationStep] = useState<
    "waiting" | "verifying" | "success" | "error"
  >("waiting");
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (isOpen && !isLoadingDeposits) {
      refetchDeposits();
    }
  }, [isOpen, isLoadingDeposits, refetchDeposits]);

  useEffect(() => {
    if (currentTransaction && !depositCompleted) {
      setShowVerification(true);
      setVerificationStep("waiting");
    } else if (!currentTransaction && !isLoadingDeposits) {
      setShowVerification(false);
    }
  }, [currentTransaction, depositCompleted, isLoadingDeposits]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (
      currentTransaction?.expiresAt &&
      !depositCompleted &&
      !showVerification
    ) {
      const updateTimeLeft = () => {
        const now = new Date().getTime();
        const expiry = new Date(currentTransaction.expiresAt!).getTime();
        const remaining = Math.max(0, Math.floor((expiry - now) / 1000));

        setTimeLeft(remaining);

        if (remaining <= 0) {
          setVerificationStep("error");
        }
      };

      updateTimeLeft();
      interval = setInterval(updateTimeLeft, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentTransaction?.expiresAt, depositCompleted, showVerification]);

  const handleCloseModal = () => {
    resetDepositForm();
    closeDepositModal();
    setDepositCompleted(false);
    setShowVerification(false);
    setVerificationStep("waiting");
    setTimeLeft(0);
  };

  const handleInitDeposit = async () => {
    if (currentTransaction && currentTransaction.status === "pending") {
      toast.error(
        "You already have a pending deposit. Please complete it first.",
        { icon: "⚠️", duration: 3000 }
      );
      return;
    }

    try {
      setLoading(true, "Initializing deposit request...");
      await initDeposit(parseFloat(depositForm.amount));
      setShowVerification(true);
    } catch (error: any) {
      console.error("Deposit init error:", error);
      toast.error(
        error.message || "Failed to initialize deposit. Please try again.",
        { icon: "❌", duration: 4000 }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDeposit = async () => {
    if (!currentTransaction) return;

    try {
      setVerificationStep("verifying");
      setLoading(true, "Verifying deposit...");

      await verifyDeposit({
        depositId: currentTransaction.id,
      });
      setVerificationStep("success");
      setDepositCompleted(true);

      toast.success("Deposit verified successfully!", {
        icon: "✅",
        duration: 4000,
      });
    } catch (error: any) {
      console.error("Deposit verification error:", error);
      setVerificationStep("error");

      toast.error(
        error.message || "Failed to verify deposit. Please try again.",
        {
          icon: "❌",
          duration: 4000,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDeposit = async () => {
    if (!currentTransaction) return;

    try {
      setLoading(true, "Cancelling deposit...");
      await cancelDeposit(currentTransaction.id);
      handleCloseModal();
    } catch (error: any) {
      console.error("Cancel deposit error:", error);
      toast.error("Failed to cancel deposit. Please try again.", {
        icon: "❌",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    resetDepositForm();
    closeDepositModal();
    setDepositCompleted(false);
    setShowVerification(false);
    setVerificationStep("waiting");
    setTimeLeft(0);
  };

  if (isLoading) {
    return (
      <BaseModal
        isOpen={isOpen}
        onClose={handleCancel}
        title="Processing Deposit"
        preventClose={true}
        size="sm"
      >
        <DepositLoading
          title="Processing Deposit"
          message={loadingMessage}
          description="Please wait, this may take a few moments..."
          preventClose={true}
        />
      </BaseModal>
    );
  }

  // Loading state para verificar transações pendentes
  if (isLoadingDeposits) {
    return (
      <BaseModal
        isOpen={isOpen}
        onClose={handleCancel}
        title="Checking Pending Deposits"
        preventClose={false}
        size="sm"
      >
        <DepositLoading
          title="Checking Pending Deposits"
          message="Checking for pending deposits..."
          description="We'll show you the deposit screen if you have any pending transactions."
        />
      </BaseModal>
    );
  }

  if (depositCompleted) {
    return (
      <BaseModal
        isOpen={isOpen}
        onClose={handleCancel}
        title=""
        size="md"
        showCloseButton={false}
      >
        <DepositSuccess
          onCloseModal={handleCloseModal}
          onInitDeposit={handleInitDeposit}
        />
      </BaseModal>
    );
  }

  // Estado inicial - formulário de depósito
  if (!showVerification && !depositCompleted) {
    return (
      <BaseModal
        isOpen={isOpen}
        onClose={handleCancel}
        title="Deposit SOL"
        size="lg"
      >
        <DepositForm
          depositForm={depositForm}
          currentTransaction={currentTransaction}
          isInitializing={isInitializing}
          validateAmount={(amount, currency, type) =>
            validateAmount(amount, currency as any, type as any)
          }
          onAmountChange={(amount: string) => updateDepositForm({ amount })}
          onInitDeposit={handleInitDeposit}
          onCancel={handleCancel}
        />
      </BaseModal>
    );
  }

  // Estado de verificação - mostra endereço e aguarda pagamento
  if (showVerification && !depositCompleted) {
    return (
      <BaseModal
        isOpen={isOpen}
        onClose={handleCancel}
        title="Complete Your Deposit"
        size="lg"
      >
        <DepositVerification
          currentTransaction={currentTransaction}
          timeLeft={timeLeft}
          verificationStep={verificationStep}
          isVerifying={isVerifying}
          isLoadingDeposits={isLoadingDeposits}
          onRefetchDeposits={refetchDeposits}
          onVerifyDeposit={handleVerifyDeposit}
          onCancelDeposit={handleCancelDeposit}
        />
      </BaseModal>
    );
  }

  return null;
}
