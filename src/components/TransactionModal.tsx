import { Modal } from "./Modal";
import { motion } from "framer-motion";
import { LogoIcon } from "./Icons/LogoIcon";
import { useLanguage } from "@/contexts/LanguageContext";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: "loading" | "success" | "error";
  type: "stake" | "unstake";
  amount?: string;
  period?: string;
  errorMessage?: string;
  transactionHash?: string;
  estimatedRewards?: number;
}

export function TransactionModal({
  isOpen,
  onClose,
  status,
  type,
  amount,
  period,
  errorMessage,
  transactionHash,
  estimatedRewards,
}: TransactionModalProps) {
  const { t } = useLanguage();

  const getStatusIcon = () => {
    switch (status) {
      case "loading":
        return (
          <div className="w-16 h-16 rounded-full bg-[#1A1A1A] flex items-center justify-center mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <svg
                className="w-8 h-8 text-[#FFD60A]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </motion.div>
          </div>
        );
      case "success":
        return (
          <div className="w-16 h-16 rounded-full bg-green-100/10 flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-green-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
      case "error":
        return (
          <div className="w-16 h-16 rounded-full bg-red-100/10 flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
    }
  };

  const getTitle = () => {
    if (status === "loading") {
      return type === "stake" ? t("staking.stakingInProgress") : t("staking.unstakingInProgress");
    } else if (status === "success") {
      return type === "stake" ? t("staking.stakingSuccess") : t("staking.unstakingSuccess");
    } else {
      return type === "stake" ? t("staking.stakingFailed") : t("staking.unstakingFailed");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={getTitle()} showCloseButton={status !== "loading"}>
      <div className="flex flex-col items-center py-2">
        {getStatusIcon()}

        {status === "loading" && (
          <p className="text-center text-gray-300 mb-4">
            {type === "stake"
              ? t("staking.processingStakeMessage")
              : t("staking.processingUnstakeMessage")}
          </p>
        )}

        {status === "success" && (
          <p className="text-center text-gray-300 mb-4">
            {type === "stake"
              ? t("staking.stakingSuccessMessage")
              : t("staking.unstakingSuccessMessage")}
          </p>
        )}

        {status === "error" && (
          <p className="text-center text-red-400 mb-4">{errorMessage || t("common.errorOccurred")}</p>
        )}

        {/* Transaction Details */}
        {status !== "error" && (
          <div className="w-full space-y-4 mt-2">
            <div className="bg-[#1A1A1A] rounded-lg p-3 w-full">
              <h3 className="text-sm text-gray-400 mb-2">{t("staking.transactionDetails")}</h3>
              
              <div className="space-y-2">
                {amount && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-300">{t("staking.amount")}:</span>
                    <div className="flex items-center">
                      <LogoIcon className="w-3 h-3 mr-1" />
                      <span className="font-medium">{amount} $ADR</span>
                    </div>
                  </div>
                )}
                
                {type === "stake" && period && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-300">{t("staking.period")}:</span>
                    <span className="font-medium">{period}</span>
                  </div>
                )}
                
                {type === "stake" && estimatedRewards !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-300">{t("staking.estimatedRewards")}:</span>
                    <div className="flex items-center">
                      <LogoIcon className="w-3 h-3 mr-1" />
                      <span className="font-medium text-[#FFD60A]">
                        {estimatedRewards.toFixed(3)} $ADR
                      </span>
                    </div>
                  </div>
                )}

                {status === "success" && transactionHash && (
                  <div className="pt-1">
                    <span className="text-sm text-gray-300 block mb-1">{t("common.transactionHash")}:</span>
                    <div className="bg-[#0F0F0F] rounded p-2 overflow-x-auto">
                      <code className="text-xs break-all text-green-300">{transactionHash}</code>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {status === "loading" && (
              <div className="flex justify-center">
                <div className="bg-[#1A1A1A] px-3 py-1 rounded text-xs text-gray-400">
                  {t("common.pleaseDoNotCloseWindow")}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        {status !== "loading" && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className={`mt-6 py-2 px-8 rounded ${
              status === "success"
                ? "bg-[#FFD60A] text-black"
                : "bg-[#2A2A2A] text-white"
            }`}
          >
            {status === "success" ? t("common.done") : t("common.close")}
          </motion.button>
        )}
      </div>
    </Modal>
  );
} 