"use client";
import React, { useState } from "react";
import { BaseModal } from "./BaseModal";
import { TransactionForm } from "./TransactionForm";
import { useWithdrawModal, useModalStore } from "@/stores/modalStore";
import { useTransactionStore } from "@/stores/transactionStore";
import { Button } from "@/components/Button";
import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export function WithdrawModal() {
  const { isOpen, closeWithdrawModal } = useWithdrawModal();
  const { submitTransaction, setSubmitting, resetWithdrawForm, withdrawForm } =
    useTransactionStore();
  const { setLoading, isLoading, loadingMessage } = useModalStore();

  const [withdrawCompleted, setWithdrawCompleted] = useState(false);

  const handleCloseModal = () => {
    resetWithdrawForm();
    closeWithdrawModal();
    setWithdrawCompleted(false);
  };

  const handleConfirmWithdraw = async () => {
    try {
      setLoading(true, "Processing withdrawal...");
      await submitTransaction("withdraw");
      setWithdrawCompleted(true);
    } catch (error) {
      console.error("Withdraw error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    resetWithdrawForm();
    closeWithdrawModal();
    setWithdrawCompleted(false);
  };

  if (isLoading) {
    return (
      <BaseModal
        isOpen={isOpen}
        onClose={handleCancel}
        title="Processing Withdrawal"
        preventClose={true}
        size="sm"
      >
        <div className="flex flex-col items-center justify-center py-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-primary-8 border-t-transparent rounded-full mb-4"
          />
          <p className="text-neutral-12 font-medium">{loadingMessage}</p>
          <p className="text-neutral-11 text-sm mt-2">
            Please wait, this may take a few moments...
          </p>
        </div>
      </BaseModal>
    );
  }

  if (withdrawCompleted) {
    return (
      <BaseModal
        isOpen={isOpen}
        onClose={handleCancel}
        title=""
        size="md"
        showCloseButton={false}
      >
        <div className="flex flex-col items-center justify-center mt-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 10, stiffness: 300 }}
            className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4"
          >
            <CheckCircle className="w-8 h-8 text-white" />
          </motion.div>
          <h3 className="text-xl font-semibold text-green-11">
            Withdrawal Successful!
          </h3>
          <p className="text-neutral-11 text-center">
            Your withdrawal request has been submitted and will be processed
            shortly
          </p>
        </div>
        <div className="flex gap-2 w-full mt-4 pt-4">
          <Button
            className="flex-1"
            variant="outline"
            onClick={handleCloseModal}
          >
            Close
          </Button>
          <Button className="flex-1" onClick={handleConfirmWithdraw}>
            View Transaction
          </Button>
        </div>
      </BaseModal>
    );
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Withdraw Funds"
      size="lg"
    >
      <div className="space-y-2">
        <p>Transfer tokens from your platform balance to your wallet</p>

        <TransactionForm
          type="withdraw"
          onSubmit={handleConfirmWithdraw}
          onCancel={handleCancel}
        />
      </div>
    </BaseModal>
  );
}
