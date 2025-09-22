import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, RefreshCw, Copy, AlertCircle } from "lucide-react";
import { WalletAddress } from "../WalletAddress";
import { Button } from "@/components/Button";
import { useClipboard } from "@/hooks/useClipboard";

interface DepositVerificationProps {
  currentTransaction: any;
  timeLeft: number;
  verificationStep: "waiting" | "verifying" | "success" | "error";
  isVerifying: boolean;
  isLoadingDeposits: boolean;
  onRefetchDeposits: () => void;
  onVerifyDeposit: () => void;
  onCancelDeposit: () => void;
}

export function DepositVerification({
  currentTransaction,
  timeLeft: initialTimeLeft,
  verificationStep,
  isVerifying,
  isLoadingDeposits,
  onRefetchDeposits,
  onVerifyDeposit,
  onCancelDeposit,
}: DepositVerificationProps) {
  const { copyToClipboard, isCopied } = useClipboard();
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
        {/* Informações do depósito */}
        {currentTransaction && (
          <div className="bg-neutral-4 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-11">Amount:</span>
              <span className="font-medium">
                {currentTransaction.solAmount} SOL
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-11">USD Value:</span>
              <span className="font-medium">
                ${currentTransaction.usdAmount?.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-11">SOL Price:</span>
              <span className="font-medium">
                ${currentTransaction.solPrice?.toFixed(2)}
              </span>
            </div>
            {timeLeft > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-11">Expires in:</span>
                <div className="flex items-center gap-2">
                  <Clock className={`w-4 h-4 ${getTimeColor(timeLeft)}`} />
                  <span
                    className={`font-medium font-mono ${getTimeColor(
                      timeLeft
                    )}`}
                  >
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Botão de refresh */}
        <div className="flex justify-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRefetchDeposits}
            disabled={isLoadingDeposits}
            className="text-xs"
          >
            <RefreshCw
              className={`w-3 h-3 mr-1 ${
                isLoadingDeposits ? "animate-spin" : ""
              }`}
            />
            Check Status
          </Button>
        </div>

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
              <code className="flex-1 font-mono text-sm">
                {currentTransaction.memo}
              </code>
              <Button
                onClick={() => copyToClipboard(currentTransaction.memo!)}
                size="sm"
                variant="ghost"
              >
                <Copy className="w-4 h-4" />
                {isCopied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>
        )}

        {/* Status de verificação */}
        <div className="bg-neutral-4 rounded-lg p-4">
          {verificationStep === "error" ? (
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="font-medium text-neutral-12">
                  Verification failed
                </p>
                <p className="text-sm text-neutral-11">
                  {timeLeft <= 0
                    ? "Deposit request expired"
                    : "Transaction not found. Please try again."}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Clock
                className={`w-5 h-5 ${
                  timeLeft <= 300
                    ? "text-red-500 animate-pulse"
                    : "text-orange-500"
                }`}
              />
              <div>
                <p className="font-medium text-neutral-12">
                  Waiting for payment...
                  {timeLeft <= 300 && (
                    <span className="text-red-500 font-bold ml-2">
                      (Time running out!)
                    </span>
                  )}
                </p>
                <p className="text-sm text-neutral-11">
                  Send {currentTransaction?.solAmount} SOL to the address above
                </p>
                {timeLeft <= 300 && (
                  <p className="text-xs text-red-500 mt-1">
                    ⚠️ Please complete your payment quickly!
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancelDeposit}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onVerifyDeposit}
            disabled={isVerifying || timeLeft <= 0}
            className="flex-1"
          >
            {isVerifying ? "Verifying..." : "I've sent the SOL"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
