import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, Copy } from "lucide-react";
import { Button } from "@/components/Button";
import toast from "react-hot-toast";
import { CurrencyType } from "@/stores/transactionStore";

// Validação de precisão decimal (máximo 2 casas decimais)
const validateWithdrawAmount = (amount: string): boolean => {
  const num = parseFloat(amount);
  if (isNaN(num) || !isFinite(num) || num <= 0 || num > 5000) {
    return false;
  }
  // Verifica se tem no máximo 2 casas decimais
  return Math.round(num * 100) === num * 100;
};

interface WithdrawFormProps {
  withdrawForm: { amount: string };
  isInitializing: boolean;
  validateAmount: (
    amount: string,
    currency: CurrencyType,
    type: "deposit" | "withdraw"
  ) => boolean;
  onAmountChange: (amount: string) => void;
  onInitWithdraw: () => void;
  onCancel: () => void;
}

export function WithdrawForm({
  withdrawForm,
  isInitializing,
  validateAmount,
  onAmountChange,
  onInitWithdraw,
  onCancel,
}: WithdrawFormProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
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
            onChange={(e) => onAmountChange(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-3 border border-neutral-6 rounded-lg text-neutral-12 focus:outline-none focus:ring-2 focus:ring-primary-8"
            placeholder="0.00"
          />
          {withdrawForm.amount &&
            !validateWithdrawAmount(withdrawForm.amount) && (
              <p className="text-red-500 text-sm">
                Valor deve estar entre 0.01 e 5000 USD (máximo 2 casas decimais)
              </p>
            )}
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="text-sm text-amber-800 dark:text-amber-200">
              <p className="font-medium mb-1">Informações sobre Saque:</p>
              <ul className="space-y-1 text-xs">
                <li>
                  • Os fundos serão enviados para sua carteira Solana
                  configurada
                </li>
                <li>• Saques são processados automaticamente pelo sistema</li>
                <li>• Limite: 5 saques por dia</li>
                <li>• Tempo de processamento: Geralmente 1-5 minutos</li>
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
            onClick={onInitWithdraw}
            disabled={
              !withdrawForm.amount ||
              !validateWithdrawAmount(withdrawForm.amount) ||
              isInitializing
            }
            className="flex-1"
          >
            {isInitializing ? "Processando..." : "Solicitar Saque"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
