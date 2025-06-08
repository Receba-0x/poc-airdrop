import { Modal } from "./Modal";
import { motion } from "framer-motion";
import { LogoIcon } from "./Icons/LogoIcon";
import { useLanguage } from "@/contexts/LanguageContext";

interface TransactionPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: "initializing" | "processing" | "determining" | "delivering" | "saving" | "success" | "error";
  amount?: string;
  boxType?: string;
  errorMessage?: string;
  transactionHash?: string;
  prize?: any;
}

export function TransactionPurchaseModal({
  isOpen,
  onClose,
  status,
  amount,
  boxType,
  errorMessage,
  transactionHash,
  prize,
}: TransactionPurchaseModalProps) {
  const { t } = useLanguage();

  const getStatusIcon = () => {
    if (status === "success") {
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
    } else if (status === "error") {
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
    } else {
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
    }
  };

  const getTitle = () => {
    switch (status) {
      case "initializing":
        return t("purchase.initializing");
      case "processing":
        return t("purchase.processingPayment");
      case "determining":
        return t("purchase.determiningPrize");
      case "delivering":
        return t("purchase.deliveringPrize");
      case "saving":
        return t("purchase.savingData");
      case "success":
        return prize ? t("box.congratulations") : t("purchase.complete");
      case "error":
        return t("purchase.errorTitle");
      default:
        return t("box.openingBox");
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case "initializing":
        return t("purchase.initializing");
      case "processing":
        return t("purchase.processingPaymentDetail");
      case "determining":
        return t("purchase.determiningPrizeDetail");
      case "delivering":
        return t("purchase.deliveringPrizeDetail");
      case "saving":
        return t("purchase.savingDataDetail");
      case "success":
        return prize ? t("box.awesome") : t("purchase.complete");
      case "error":
        return errorMessage || t("purchase.genericError");
      default:
        return "";
    }
  };

  const getProgressValue = () => {
    switch (status) {
      case "initializing":
        return 10;
      case "processing":
        return 30;
      case "determining":
        return 50;
      case "delivering":
        return 70;
      case "saving":
        return 90;
      case "success":
        return 100;
      case "error":
        return 100;
      default:
        return 0;
    }
  };

  const showProgressBar = ["initializing", "processing", "determining", "delivering", "saving"].includes(status);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={getTitle()} showCloseButton={status === "success" || status === "error"}>
      <div className="flex flex-col items-center py-2">
        {getStatusIcon()}

        <p className={`text-center mb-4 ${status === "error" ? "text-red-400" : "text-gray-300"}`}>
          {getStatusMessage()}
        </p>

        {showProgressBar && (
          <div className="w-full bg-[#1A1A1A] rounded-full h-2.5 mb-6">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${getProgressValue()}%` }}
              transition={{ duration: 0.5 }}
              className="bg-[#FFD60A] h-2.5 rounded-full"
            ></motion.div>
          </div>
        )}

        {/* Transaction Details */}
        {status !== "error" && (
          <div className="w-full space-y-4 mt-2">
            {(status === "success" || status === "processing") && (
              <div className="bg-[#1A1A1A] rounded-lg p-3 w-full">
                <h3 className="text-sm text-gray-400 mb-2">{t("staking.transactionDetails")}</h3>
                
                <div className="space-y-2">
                  {amount && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-300">{t("transactions.amount")}:</span>
                      <div className="flex items-center">
                        <LogoIcon className="w-3 h-3 mr-1" />
                        <span className="font-medium">{amount} $ADR</span>
                      </div>
                    </div>
                  )}
                  
                  {boxType && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-300">{t("box.type")}:</span>
                      <span className="font-medium">{boxType}</span>
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
            )}
            
            {status === "success" && prize && (
              <div className="bg-[#1A1A1A] rounded-lg p-3 w-full mt-4">
                <h3 className="text-sm text-gray-400 mb-2">{t("box.yourPrize")}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">{t("box.wonPrize")}:</span>
                  <span className="font-medium text-[#FFD60A]">{prize.name}</span>
                </div>
                {prize.amount && (
                  <div className="flex justify-between mt-2">
                    <span className="text-sm text-gray-300">{t("transactions.amount")}:</span>
                    <span className="font-medium text-[#FFD60A]">{prize.amount} {prize.type === "sol" ? "SOL" : "$ADR"}</span>
                  </div>
                )}
              </div>
            )}
            
            {["initializing", "processing", "determining", "delivering", "saving"].includes(status) && (
              <div className="flex justify-center">
                <div className="bg-[#1A1A1A] px-3 py-1 rounded text-xs text-gray-400">
                  {t("common.pleaseDoNotCloseWindow")}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {(status === "success" || status === "error") && (
          <div className="flex gap-3 mt-6">
            {status === "error" && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                className="py-2 px-6 rounded bg-[#2A2A2A] text-white"
              >
                {t("purchase.cancel")}
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onClose}
              className={`py-2 px-6 rounded ${
                status === "success"
                  ? "bg-[#FFD60A] text-black"
                  : "bg-[#3A3A3A] text-white"
              }`}
            >
              {status === "success" ? t("common.done") : t("purchase.tryAgain")}
            </motion.button>
          </div>
        )}
      </div>
    </Modal>
  );
} 