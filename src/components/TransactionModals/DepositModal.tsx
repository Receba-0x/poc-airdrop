"use client";
import React, { useState } from "react";
import { BaseModal } from "./BaseModal";
import { WalletAddress } from "./WalletAddress";
import { useDepositModal, useModalStore } from "@/stores/modalStore";
import { useTransactionStore, CurrencyType } from "@/stores/transactionStore";
import { PROJECT_DEPOSIT_WALLET } from "@/constants";
import { Button } from "@/components/Button";
import { CheckCircle, AlertCircle, Info } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export function DepositModal() {
  const { isOpen, closeDepositModal } = useDepositModal();
  const {
    submitTransaction,
    setSubmitting,
    resetDepositForm,
    depositForm,
    updateDepositForm,
  } = useTransactionStore();
  const { setLoading, isLoading, loadingMessage } = useModalStore();

  const [depositCompleted, setDepositCompleted] = useState(false);

  const handleCloseModal = () => {
    resetDepositForm();
    closeDepositModal();
    setDepositCompleted(false);
  };

  const handleConfirmDeposit = async () => {
    try {
      setLoading(true, "Confirming deposit...");
      await submitTransaction("deposit");
      setDepositCompleted(true);
    } catch (error) {
      console.error("Deposit error:", error);
      toast.error("Failed to confirm deposit. Please try again.", {
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

  if (depositCompleted) {
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
            Deposit Successful!
          </h3>
          <p className="text-neutral-11 text-center">
            Your funds have been received and will be credited to your account
            balance shortly
          </p>
        </div>
        <div className="flex gap-2 w-full mt-4 pt-4">
          <Button
            className="flex-1"
            variant="outline"
            onClick={handleCloseModal}
          >
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleConfirmDeposit}>
            I have sent the funds
          </Button>
        </div>
      </BaseModal>
    );
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Deposit Funds"
      size="lg"
    >
      <div className="space-y-2">
        <p>Transfer tokens from your wallet to your platform balance</p>

        <WalletAddress
          address={PROJECT_DEPOSIT_WALLET}
          label={`Deposit Address (${depositForm.currency})`}
        />

        <div className="bg-neutral-4 rounded-lg p-3">
          <div className="flex items-center gap-2 text-neutral-11 text-sm">
            <CheckCircle className="w-4 h-4 text-primary-10" />
            <span>
              Send any amount of {depositForm.currency} to the address above.
              Your balance will be updated automatically.
            </span>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirmDeposit}
            className="flex-1"
          >
            I have sent the funds
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}
