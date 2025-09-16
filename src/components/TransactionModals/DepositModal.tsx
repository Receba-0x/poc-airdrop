"use client";
import React, { useState, useEffect } from "react";
import { BaseModal } from "./BaseModal";
import { WalletAddress } from "./WalletAddress";
import { useDepositModal, useModalStore } from "@/stores/modalStore";
import { useTransactionStore, CurrencyType } from "@/stores/transactionStore";
import { Button } from "@/components/Button";
import { CheckCircle, AlertCircle, Info, Copy, Clock } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export function DepositModal() {
  const { isOpen, closeDepositModal } = useDepositModal();
  const {
    submitTransaction,
    verifyTransaction,
    cancelTransaction,
    resetDepositForm,
    depositForm,
    updateDepositForm,
    currentTransaction,
    validateAmount,
    isSubmitting,
  } = useTransactionStore();
  const { setLoading, isLoading, loadingMessage } = useModalStore();

  const [depositCompleted, setDepositCompleted] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationStep, setVerificationStep] = useState<'waiting' | 'verifying' | 'success' | 'error'>('waiting');
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Timer para expiração
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (currentTransaction?.expiresAt && !depositCompleted && !showVerification) {
      const updateTimeLeft = () => {
        const now = new Date().getTime();
        const expiry = new Date(currentTransaction.expiresAt!).getTime();
        const remaining = Math.max(0, Math.floor((expiry - now) / 1000));

        setTimeLeft(remaining);

        if (remaining <= 0) {
          setVerificationStep('error');
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
    setVerificationStep('waiting');
    setTimeLeft(0);
  };

  const handleInitDeposit = async () => {
    try {
      setLoading(true, "Initializing deposit request...");
      await submitTransaction("deposit");
      setShowVerification(true);
    } catch (error: any) {
      console.error("Deposit init error:", error);
      toast.error(error.message || "Failed to initialize deposit. Please try again.", {
        icon: "❌",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDeposit = async () => {
    if (!currentTransaction) return;

    try {
      setVerificationStep('verifying');
      setLoading(true, "Verifying deposit...");

      await verifyTransaction(currentTransaction.id, 'deposit');
      setVerificationStep('success');
      setDepositCompleted(true);

      toast.success("Deposit verified successfully!", {
        icon: "✅",
        duration: 4000,
      });
    } catch (error: any) {
      console.error("Deposit verification error:", error);
      setVerificationStep('error');

      toast.error(error.message || "Failed to verify deposit. Please try again.", {
        icon: "❌",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDeposit = async () => {
    if (!currentTransaction) return;

    try {
      setLoading(true, "Cancelling deposit...");
      await cancelTransaction(currentTransaction.id, 'deposit');
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
    setVerificationStep('waiting');
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
          <Button className="flex-1" onClick={handleInitDeposit}>
            Generate Deposit Address
          </Button>
        </div>
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
        <div className="space-y-4">
          <p className="text-neutral-11">
            Transfer SOL from your wallet to your platform balance
          </p>

          {/* Formulário de quantidade */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-12">
              Amount (SOL)
            </label>
            <input
              type="number"
              step="0.0001"
              min="0.01"
              max="10"
              value={depositForm.amount}
              onChange={(e) => updateDepositForm({ amount: e.target.value })}
              className="w-full px-3 py-2 bg-neutral-3 border border-neutral-6 rounded-lg text-neutral-12 focus:outline-none focus:ring-2 focus:ring-primary-8"
              placeholder="0.00"
            />
            {depositForm.amount && !validateAmount(depositForm.amount, 'SOL', 'deposit') && (
              <p className="text-red-500 text-sm">
                Amount must be between 0.01 and 10 SOL (max 4 decimal places)
              </p>
            )}
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">Deposit Instructions:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Send SOL to the generated deposit address</li>
                  <li>• Include the memo for faster processing</li>
                  <li>• Deposits are processed automatically</li>
                  <li>• Rate limit: 10 deposits per day</li>
                </ul>
              </div>
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
              onClick={handleInitDeposit}
              disabled={!depositForm.amount || !validateAmount(depositForm.amount, 'SOL', 'deposit') || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Initializing..." : "Generate Deposit Address"}
            </Button>
          </div>
        </div>
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
        <div className="space-y-4">
          {/* Informações do depósito */}
          {currentTransaction && (
            <div className="bg-neutral-4 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-11">Amount:</span>
                <span className="font-medium">{currentTransaction.solAmount} SOL</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-11">USD Value:</span>
                <span className="font-medium">${currentTransaction.usdAmount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-11">SOL Price:</span>
                <span className="font-medium">${currentTransaction.solPrice?.toFixed(2)}</span>
              </div>
              {timeLeft > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-11">Expires in:</span>
                  <span className="font-medium text-orange-600">
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Endereço de depósito */}
          {currentTransaction?.serverWallet && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-12">
                Send SOL to this address:
              </label>
              <WalletAddress
                address={currentTransaction.serverWallet}
                label="Deposit Address"
              />
            </div>
          )}

          {/* Memo */}
          {currentTransaction?.memo && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-12">
                Include this memo (important):
              </label>
              <div className="flex items-center gap-2 p-3 bg-neutral-4 rounded-lg">
                <code className="flex-1 font-mono text-sm">{currentTransaction.memo}</code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    navigator.clipboard.writeText(currentTransaction!.memo!);
                    toast.success("Memo copied!");
                  }}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Status de verificação */}
          <div className="bg-neutral-4 rounded-lg p-4">
            {verificationStep === 'waiting' && timeLeft > 0 && (
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-orange-500 animate-pulse" />
                <div>
                  <p className="font-medium text-neutral-12">Waiting for payment...</p>
                  <p className="text-sm text-neutral-11">
                    Send {currentTransaction?.solAmount} SOL to the address above
                  </p>
                </div>
              </div>
            )}

            {verificationStep === 'verifying' && (
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-primary-8 border-t-transparent rounded-full"
                />
                <div>
                  <p className="font-medium text-neutral-12">Verifying transaction...</p>
                  <p className="text-sm text-neutral-11">
                    Checking blockchain for your payment
                  </p>
                </div>
              </div>
            )}

            {verificationStep === 'error' && (
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="font-medium text-neutral-12">Verification failed</p>
                  <p className="text-sm text-neutral-11">
                    {timeLeft <= 0 ? "Deposit request expired" : "Transaction not found. Please try again."}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelDeposit}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleVerifyDeposit}
              disabled={verificationStep === 'verifying' || timeLeft <= 0}
              className="flex-1"
            >
              {verificationStep === 'verifying' ? "Verifying..." : "I've sent the SOL"}
            </Button>
          </div>
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
          address="PLACEHOLDER_ADDRESS"
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
            onClick={handleInitDeposit}
            className="flex-1"
          >
            I have sent the funds
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}
