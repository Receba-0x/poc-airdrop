"use client";
import React, { useState, useEffect } from "react";
import { BaseModal } from "./BaseModal";
import { TransactionForm } from "./TransactionForm";
import { useWithdrawModal, useModalStore } from "@/stores/modalStore";
import { useTransactionStore } from "@/stores/transactionStore";
import { Button } from "@/components/Button";
import { CheckCircle, AlertCircle, Info, Copy, Clock, Wallet } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export function WithdrawModal() {
  const { isOpen, closeWithdrawModal } = useWithdrawModal();
  const {
    submitTransaction,
    verifyTransaction,
    cancelTransaction,
    resetWithdrawForm,
    withdrawForm,
    updateWithdrawForm,
    currentTransaction,
    validateAmount,
    validateAddress,
    isSubmitting,
  } = useTransactionStore();
  const { setLoading, isLoading, loadingMessage } = useModalStore();

  const [withdrawCompleted, setWithdrawCompleted] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<'waiting' | 'processing' | 'sent' | 'confirming' | 'success' | 'error'>('waiting');
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Timer para expiração
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (currentTransaction?.expiresAt && !withdrawCompleted && !showProcessing) {
      const updateTimeLeft = () => {
        const now = new Date().getTime();
        const expiry = new Date(currentTransaction.expiresAt!).getTime();
        const remaining = Math.max(0, Math.floor((expiry - now) / 1000));

        setTimeLeft(remaining);

        if (remaining <= 0) {
          setProcessingStep('error');
        }
      };

      updateTimeLeft();
      interval = setInterval(updateTimeLeft, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentTransaction?.expiresAt, withdrawCompleted, showProcessing]);

  const handleCloseModal = () => {
    resetWithdrawForm();
    closeWithdrawModal();
    setWithdrawCompleted(false);
    setShowProcessing(false);
    setProcessingStep('waiting');
    setTimeLeft(0);
  };

  const handleInitWithdraw = async () => {
    try {
      setLoading(true, "Initializing withdrawal request...");
      await submitTransaction("withdraw");
      setShowProcessing(true);
      setProcessingStep('waiting');
    } catch (error: any) {
      console.error("Withdraw init error:", error);
      toast.error(error.message || "Failed to initialize withdrawal. Please try again.", {
        icon: "❌",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProcessWithdraw = async () => {
    if (!currentTransaction) return;

    try {
      setProcessingStep('processing');
      setLoading(true, "Processing withdrawal...");

      // Chama o endpoint de processamento (envio de SOL)
      await submitTransaction("withdraw");
      setProcessingStep('sent');

      toast.success("Withdrawal processed! SOL sent to your wallet.", {
        icon: "✅",
        duration: 4000,
      });
    } catch (error: any) {
      console.error("Withdraw process error:", error);
      setProcessingStep('error');
      toast.error(error.message || "Failed to process withdrawal. Please try again.", {
        icon: "❌",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyWithdraw = async () => {
    if (!currentTransaction) return;

    try {
      setProcessingStep('confirming');
      setLoading(true, "Confirming withdrawal...");

      await verifyTransaction(currentTransaction.id, 'withdraw', currentTransaction.txHash);
      setProcessingStep('success');
      setWithdrawCompleted(true);

      toast.success("Withdrawal confirmed successfully!", {
        icon: "✅",
        duration: 4000,
      });
    } catch (error: any) {
      console.error("Withdraw verify error:", error);
      setProcessingStep('error');
      toast.error(error.message || "Failed to verify withdrawal. Please try again.", {
        icon: "❌",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelWithdraw = async () => {
    if (!currentTransaction) return;

    try {
      setLoading(true, "Cancelling withdrawal...");
      await cancelTransaction(currentTransaction.id, 'withdraw');
      handleCloseModal();
    } catch (error: any) {
      console.error("Cancel withdraw error:", error);
      toast.error("Failed to cancel withdrawal. Please try again.", {
        icon: "❌",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    resetWithdrawForm();
    closeWithdrawModal();
    setWithdrawCompleted(false);
    setShowProcessing(false);
    setProcessingStep('waiting');
    setTimeLeft(0);
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
          <Button className="flex-1" onClick={handleInitWithdraw}>
            Request Withdrawal
          </Button>
        </div>
      </BaseModal>
    );
  }

  // Estado inicial - formulário de saque
  if (!showProcessing && !withdrawCompleted) {
    return (
      <BaseModal
        isOpen={isOpen}
        onClose={handleCancel}
        title="Withdraw Funds"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-neutral-11">
            Transfer funds from your platform balance to your Solana wallet
          </p>

          {/* Formulário de quantidade */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-12">
              Amount (USD)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max="5000"
              value={withdrawForm.amount}
              onChange={(e) => updateWithdrawForm({ amount: e.target.value })}
              className="w-full px-3 py-2 bg-neutral-3 border border-neutral-6 rounded-lg text-neutral-12 focus:outline-none focus:ring-2 focus:ring-primary-8"
              placeholder="0.00"
            />
            {withdrawForm.amount && !validateAmount(withdrawForm.amount, 'SOL', 'withdraw') && (
              <p className="text-red-500 text-sm">
                Amount must be between 0.01 and 5000 USD (max 2 decimal places)
              </p>
            )}
          </div>

          {/* Formulário de endereço da carteira */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-12">
              Solana Wallet Address
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={withdrawForm.address || ''}
                onChange={(e) => updateWithdrawForm({ address: e.target.value })}
                className="flex-1 px-3 py-2 bg-neutral-3 border border-neutral-6 rounded-lg text-neutral-12 focus:outline-none focus:ring-2 focus:ring-primary-8 font-mono text-sm"
                placeholder="Enter your Solana wallet address"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={async () => {
                  try {
                    const address = await navigator.clipboard.readText();
                    if (address) {
                      updateWithdrawForm({ address });
                      toast.success("Address pasted!");
                    }
                  } catch (error) {
                    toast.error("Failed to paste address");
                  }
                }}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            {withdrawForm.address && !validateAddress(withdrawForm.address) && (
              <p className="text-red-500 text-sm">
                Invalid Solana wallet address format
              </p>
            )}
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div className="text-sm text-amber-800 dark:text-amber-200">
                <p className="font-medium mb-1">Withdrawal Information:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Make sure the Solana wallet address is correct</li>
                  <li>• Withdrawals are processed automatically</li>
                  <li>• Rate limit: 5 withdrawals per day</li>
                  <li>• Processing time: Usually 1-5 minutes</li>
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
              onClick={handleInitWithdraw}
              disabled={
                !withdrawForm.amount ||
                !withdrawForm.address ||
                !validateAmount(withdrawForm.amount, 'SOL', 'withdraw') ||
                !validateAddress(withdrawForm.address) ||
                isSubmitting
              }
              className="flex-1"
            >
              {isSubmitting ? "Initializing..." : "Request Withdrawal"}
            </Button>
          </div>
        </div>
      </BaseModal>
    );
  }

  // Estado de processamento - mostra status e permite ações
  if (showProcessing && !withdrawCompleted) {
    return (
      <BaseModal
        isOpen={isOpen}
        onClose={handleCancel}
        title="Process Withdrawal"
        size="lg"
      >
        <div className="space-y-4">
          {/* Informações do saque */}
          {currentTransaction && (
            <div className="bg-neutral-4 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-11">Amount:</span>
                <span className="font-medium">${currentTransaction.usdAmount} USD</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-11">SOL Amount:</span>
                <span className="font-medium">{currentTransaction.solAmount} SOL</span>
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

          {/* Endereço de destino */}
          {currentTransaction?.destinationWallet && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-12">
                Sending to wallet:
              </label>
              <div className="flex items-center gap-2 p-3 bg-neutral-4 rounded-lg">
                <Wallet className="w-4 h-4 text-neutral-11" />
                <code className="flex-1 font-mono text-sm">{currentTransaction.destinationWallet}</code>
              </div>
            </div>
          )}

          {/* Status de processamento */}
          <div className="bg-neutral-4 rounded-lg p-4">
            {processingStep === 'waiting' && timeLeft > 0 && (
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-orange-500 animate-pulse" />
                <div>
                  <p className="font-medium text-neutral-12">Ready to process withdrawal</p>
                  <p className="text-sm text-neutral-11">
                    Click "Send SOL" to transfer {currentTransaction?.solAmount} SOL to your wallet
                  </p>
                </div>
              </div>
            )}

            {processingStep === 'processing' && (
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-primary-8 border-t-transparent rounded-full"
                />
                <div>
                  <p className="font-medium text-neutral-12">Sending SOL to your wallet...</p>
                  <p className="text-sm text-neutral-11">
                    This may take a few minutes
                  </p>
                </div>
              </div>
            )}

            {processingStep === 'sent' && (
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium text-neutral-12">SOL sent successfully!</p>
                  <p className="text-sm text-neutral-11">
                    Transaction: {currentTransaction?.txHash?.slice(0, 8)}...{currentTransaction?.txHash?.slice(-8)}
                  </p>
                </div>
              </div>
            )}

            {processingStep === 'confirming' && (
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-primary-8 border-t-transparent rounded-full"
                />
                <div>
                  <p className="font-medium text-neutral-12">Confirming transaction...</p>
                  <p className="text-sm text-neutral-11">
                    Waiting for blockchain confirmation
                  </p>
                </div>
              </div>
            )}

            {processingStep === 'error' && (
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="font-medium text-neutral-12">Processing failed</p>
                  <p className="text-sm text-neutral-11">
                    {timeLeft <= 0 ? "Withdrawal request expired" : "Please try again or contact support"}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelWithdraw}
              className="flex-1"
              disabled={processingStep === 'processing' || processingStep === 'confirming'}
            >
              Cancel
            </Button>
            {processingStep === 'waiting' && (
              <Button
                type="button"
                onClick={handleProcessWithdraw}
                className="flex-1"
              >
                Send SOL
              </Button>
            )}
            {processingStep === 'sent' && (
              <Button
                type="button"
                onClick={handleVerifyWithdraw}
                className="flex-1"
              >
                Confirm Transaction
              </Button>
            )}
            {processingStep === 'error' && (
              <Button
                type="button"
                onClick={() => setProcessingStep('waiting')}
                className="flex-1"
              >
                Try Again
              </Button>
            )}
          </div>
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
          onSubmit={handleInitWithdraw}
          onCancel={handleCancel}
        />
      </div>
    </BaseModal>
  );
}
