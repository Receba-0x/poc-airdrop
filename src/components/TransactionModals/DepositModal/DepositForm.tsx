import React from "react";
import { motion } from "framer-motion";
import { Info } from "lucide-react";
import { Button } from "@/components/Button";

import { CurrencyType } from "@/stores/transactionStore";

interface DepositFormProps {
  depositForm: { amount: string };
  currentTransaction?: any;
  isInitializing: boolean;
  validateAmount: (
    amount: string,
    currency: CurrencyType,
    type: "deposit" | "withdraw"
  ) => boolean;
  onAmountChange: (amount: string) => void;
  onInitDeposit: () => void;
  onCancel: () => void;
}

export function DepositForm({
  depositForm,
  currentTransaction,
  isInitializing,
  validateAmount,
  onAmountChange,
  onInitDeposit,
  onCancel,
}: DepositFormProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
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
            max="10000"
            value={depositForm.amount}
            onChange={(e) => onAmountChange(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-3 border border-neutral-6 rounded-lg text-neutral-12 focus:outline-none focus:ring-2 focus:ring-primary-8"
            placeholder="0.00"
          />
          {depositForm.amount &&
            !validateAmount(depositForm.amount, "SOL", "deposit") && (
              <p className="text-red-500 text-sm">
                Amount must be between 0.01 and 10000 SOL (max 5 decimal places)
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
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onInitDeposit}
            disabled={
              !depositForm.amount ||
              !validateAmount(depositForm.amount, "SOL", "deposit") ||
              isInitializing ||
              currentTransaction?.status === "pending"
            }
            className="flex-1"
          >
            {isInitializing
              ? "Initializing..."
              : currentTransaction?.status === "pending"
              ? "Deposit in Progress"
              : "Generate Deposit Address"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
