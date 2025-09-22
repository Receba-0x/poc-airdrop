import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Wallet
} from "lucide-react";
import { Button } from "@/components/Button";

interface WithdrawVerificationProps {
  currentTransaction: any;
  timeLeft: number;
  processingStep: 'waiting' | 'processing' | 'sent' | 'confirming' | 'success' | 'error';
  isProcessing: boolean;
  isConfirming: boolean;
  onProcessWithdraw: () => void;
  onVerifyWithdraw: () => void;
  onCancelWithdraw: () => void;
  onTryAgain: () => void;
}

export function WithdrawVerification({
  currentTransaction,
  timeLeft: initialTimeLeft,
  processingStep,
  isProcessing,
  isConfirming,
  onProcessWithdraw,
  onVerifyWithdraw,
  onCancelWithdraw,
  onTryAgain,
}: WithdrawVerificationProps) {
  const [timeLeft, setTimeLeft] = useState(initialTimeLeft);

  // Countdown timer
  useEffect(() => {
    setTimeLeft(initialTimeLeft);

    if (initialTimeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [initialTimeLeft]);

  // Format time as MM:SS or HH:MM:SS or DD:HH:MM:SS
  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return "00:00";

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (days > 0) {
      return `${days.toString().padStart(2, "0")}:${hours
        .toString()
        .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    } else if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    } else {
      return `${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
  };

  // Get color based on time remaining
  const getTimeColor = (seconds: number): string => {
    if (seconds <= 0) return "text-red-600";
    if (seconds <= 300) return "text-red-500 animate-pulse"; // Last 5 minutes
    if (seconds <= 600) return "text-orange-500"; // Last 10 minutes
    return "text-orange-600";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
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
                <div className="flex items-center gap-2">
                  <Clock className={`w-4 h-4 ${getTimeColor(timeLeft)}`} />
                  <span className={`font-medium font-mono ${getTimeColor(timeLeft)}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
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
              <Clock className={`w-5 h-5 ${timeLeft <= 300 ? 'text-red-500 animate-pulse' : 'text-orange-500'}`} />
              <div>
                <p className="font-medium text-neutral-12">
                  Ready to process withdrawal
                  {timeLeft <= 300 && (
                    <span className="text-red-500 font-bold ml-2">
                      (Time running out!)
                    </span>
                  )}
                </p>
                <p className="text-sm text-neutral-11">
                  Click "Send SOL" to transfer {currentTransaction?.solAmount} SOL to your wallet
                </p>
                {timeLeft <= 300 && (
                  <p className="text-xs text-red-500 mt-1">
                    ⚠️ Please complete your withdrawal quickly!
                  </p>
                )}
              </div>
            </div>
          )}

          {processingStep === 'processing' && (
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
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
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
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
            onClick={onCancelWithdraw}
            className="flex-1"
            disabled={processingStep === 'processing' || processingStep === 'confirming'}
          >
            Cancel
          </Button>
          {processingStep === 'waiting' && (
            <Button
              type="button"
              onClick={onProcessWithdraw}
              className="flex-1"
              disabled={isProcessing}
            >
              Send SOL
            </Button>
          )}
          {processingStep === 'sent' && (
            <Button
              type="button"
              onClick={onVerifyWithdraw}
              className="flex-1"
              disabled={isConfirming}
            >
              Confirm Transaction
            </Button>
          )}
          {processingStep === 'error' && (
            <Button
              type="button"
              onClick={onTryAgain}
              className="flex-1"
            >
              Try Again
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
