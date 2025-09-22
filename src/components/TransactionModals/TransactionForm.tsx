"use client";
import React, { useState, useEffect } from "react";
import {
  useTransactionStore,
  TransactionFormData,
  CurrencyType,
} from "@/stores/transactionStore";
import { useTransactionValidation } from "@/hooks/useTransactionValidation";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

interface TransactionFormProps {
  type: "deposit" | "withdraw";
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const currencies: { value: CurrencyType; label: string; minAmount: number }[] =
  [
    { value: "SOL", label: "SOL", minAmount: 0.001 },
    { value: "USD", label: "USD", minAmount: 0.01 },
  ];

export function TransactionForm({
  type,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: TransactionFormProps) {
  const { depositForm, withdrawForm, updateDepositForm, updateWithdrawForm } =
    useTransactionStore();
  const { validateAmount, validateAddress } = useTransactionValidation();
  const [isValidating, setValidating] = useState(false);

  const formData = type === "deposit" ? depositForm : withdrawForm;
  const updateForm =
    type === "deposit" ? updateDepositForm : updateWithdrawForm;

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (touched.amount) {
      validateField("amount", formData.amount);
    }
    if (touched.address && type === "withdraw") {
      validateField("address", formData.address || "");
    }
  }, [formData.amount, formData.address, formData.currency, touched]);

  const validateField = (field: string, value: string) => {
    setValidating(true);
    let error = "";

    switch (field) {
      case "amount":
        if (!value.trim()) {
          error = "Amount is required";
        } else if (!validateAmount(value, formData.currency, type)) {
          if (type === "deposit") {
            error =
              "Amount must be between 0.01 and 10000 SOL (max 2 decimal places)";
          } else {
            error =
              "Amount must be between 0.01 and 5000 USD (max 2 decimal places)";
          }
        }
        break;
      case "address":
        if (type === "withdraw" && !value.trim()) {
          error = "Address is required for withdrawal";
        } else if (type === "withdraw" && !validateAddress(value)) {
          error = "Please enter a valid Solana address";
        }
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
    setValidating(false);
  };

  const handleInputChange = (
    field: keyof TransactionFormData,
    value: string
  ) => {
    updateForm({ [field]: value });
    if (!touched[field]) {
      setTouched((prev) => ({ ...prev, [field]: true }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar todos os campos
    const newErrors: Record<string, string> = {};

    if (!validateAmount(formData.amount, formData.currency, type)) {
      if (type === "deposit") {
        newErrors.amount =
          "Amount must be between 0.01 and 10000 SOL (max 2 decimal places)";
      } else {
        newErrors.amount =
          "Amount must be between 0.01 and 5000 USD (max 2 decimal places)";
      }
    }

    if (type === "withdraw" && !validateAddress(formData.address || "")) {
      newErrors.address = "Please enter a valid Solana address";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit();
    }
  };

  const selectedCurrency = currencies.find(
    (c) => c.value === formData.currency
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Amount Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-neutral-12">
          Amount ({type === "deposit" ? "SOL" : "USD"})
        </label>
        <div className="relative">
          <Input
            type="number"
            value={formData.amount}
            onChange={(e) => handleInputChange("amount", e.target.value)}
            placeholder={`Enter amount in ${
              type === "deposit" ? "SOL" : "USD"
            }`}
            className="pr-20"
            step={type === "deposit" ? "0.0001" : "0.01"}
            min={type === "deposit" ? "0.01" : "0.01"}
            max={type === "deposit" ? "10" : "5000"}
            disabled={isSubmitting}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-11 text-sm">
            {type === "deposit" ? "SOL" : "USD"}
          </div>
        </div>
        {errors.amount && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-red-400 text-sm"
          >
            <AlertCircle className="w-4 h-4" />
            {errors.amount}
          </motion.div>
        )}
      </div>

      {/* Currency Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
        <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200 text-sm">
          <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>
            {type === "deposit"
              ? "Deposits are made in SOL and converted to USD automatically"
              : "Withdrawals are requested in USD and paid in SOL automatically"}
          </span>
        </div>
      </div>

      {type === "withdraw" && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-12">
            Recipient Address
          </label>
          <Input
            type="text"
            value={formData.address || ""}
            onChange={(e) => handleInputChange("address", e.target.value)}
            placeholder="Enter Solana wallet address"
            disabled={isSubmitting}
          />
          {errors.address && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-red-400 text-sm"
            >
              <AlertCircle className="w-4 h-4" />
              {errors.address}
            </motion.div>
          )}
        </div>
      )}

      {/* Amount Limits Info */}
      <div className="bg-neutral-4 rounded-lg p-3">
        <div className="flex items-center gap-2 text-neutral-11 text-sm">
          <CheckCircle className="w-4 h-4 text-primary-10" />
          <span>
            {type === "deposit"
              ? "Deposit limits: 0.01 - 10 SOL (max 4 decimal places)"
              : "Withdrawal limits: 0.01 - 5000 USD (max 2 decimal places)"}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || isValidating}
          className="flex-1"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </div>
          ) : (
            `Confirm ${type === "deposit" ? "Deposit" : "Withdrawal"}`
          )}
        </Button>
      </div>
    </form>
  );
}
