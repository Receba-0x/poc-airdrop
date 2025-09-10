"use client";
import React, { useState, useEffect } from "react";
import {
  useTransactionStore,
  TransactionFormData,
  CurrencyType,
} from "@/stores/transactionStore";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

interface TransactionFormProps {
  type: "deposit" | "withdraw";
  onSubmit: () => void;
  onCancel: () => void;
}

const currencies: { value: CurrencyType; label: string; minAmount: number }[] =
  [
    { value: "SOL", label: "SOL", minAmount: 0.001 },
    { value: "USDC", label: "USDC", minAmount: 1 },
    { value: "BUSD", label: "BUSD", minAmount: 1 },
  ];

export function TransactionForm({
  type,
  onSubmit,
  onCancel,
}: TransactionFormProps) {
  const {
    depositForm,
    withdrawForm,
    updateDepositForm,
    updateWithdrawForm,
    validateAmount,
    validateAddress,
    isSubmitting,
    setValidating,
    isValidating,
  } = useTransactionStore();

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
        } else if (!validateAmount(value, formData.currency)) {
          const minAmount =
            currencies.find((c) => c.value === formData.currency)?.minAmount ||
            0;
          error = `Minimum amount is ${minAmount} ${formData.currency}`;
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

    if (!validateAmount(formData.amount, formData.currency)) {
      const minAmount =
        currencies.find((c) => c.value === formData.currency)?.minAmount || 0;
      newErrors.amount = `Minimum amount is ${minAmount} ${formData.currency}`;
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
          Amount ({formData.currency})
        </label>
        <div className="relative">
          <Input
            type="number"
            value={formData.amount}
            onChange={(e) => handleInputChange("amount", e.target.value)}
            placeholder={`Enter amount in ${formData.currency}`}
            className="pr-20"
            step="0.001"
            min={selectedCurrency?.minAmount || 0}
            disabled={isSubmitting}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-11 text-sm">
            {formData.currency}
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

      {/* Currency Selector */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-neutral-12">
          Currency
        </label>
        <div className="grid grid-cols-3 gap-2">
          {currencies.map((currency) => (
            <button
              key={currency.value}
              type="button"
              onClick={() => handleInputChange("currency", currency.value)}
              className={`p-3 rounded-lg border text-sm font-medium transition-all duration-200 ${
                formData.currency === currency.value
                  ? "border-primary-8 bg-primary-2 text-primary-12"
                  : "border-neutral-6 bg-neutral-4 text-neutral-11 hover:border-neutral-5"
              }`}
              disabled={isSubmitting}
            >
              {currency.label}
            </button>
          ))}
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

      {/* Minimum Amount Info */}
      <div className="bg-neutral-4 rounded-lg p-3">
        <div className="flex items-center gap-2 text-neutral-11 text-sm">
          <CheckCircle className="w-4 h-4 text-primary-10" />
          <span>
            Minimum {type} amount: {selectedCurrency?.minAmount}{" "}
            {formData.currency}
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
