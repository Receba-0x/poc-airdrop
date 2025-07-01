import { Modal } from "./Modal";
import { motion } from "framer-motion";
import { LogoIcon } from "./Icons/LogoIcon";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "./Button";
import Image from "next/image";

interface TransactionPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  status:
    | "initializing"
    | "paying_bnb_fee"
    | "checking_balance"
    | "approving_tokens"
    | "burning_tokens"
    | "validating_transaction"
    | "determining_prize"
    | "saving_transaction"
    | "success"
    | "error";
  amount?: string;
  boxType?: string;
  errorMessage?: string;
  transactionHash?: string;
  prize?: any;
  onBuyAgain?: () => void;
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
  onBuyAgain,
}: TransactionPurchaseModalProps) {
  const { t } = useLanguage();

  const steps = [
    {
      key: "initializing",
      label: t("purchase.initializing") || "Initializing",
    },
    {
      key: "paying_bnb_fee",
      label: t("purchase.payingBnbFee") || "Paying BNB Fee",
    },
    {
      key: "checking_balance",
      label: t("purchase.checkingBalance") || "Checking Balance",
    },
    {
      key: "approving_tokens",
      label: t("purchase.approvingTokens") || "Approving Tokens",
    },
    {
      key: "burning_tokens",
      label: t("purchase.burningTokens") || "Burning Tokens",
    },
    {
      key: "validating_transaction",
      label: t("purchase.validatingTransaction") || "Validating Transaction",
    },
    {
      key: "determining_prize",
      label: t("purchase.determiningPrize") || "Determining Prize",
    },
    {
      key: "saving_transaction",
      label: t("purchase.savingTransaction") || "Saving Transaction",
    },
  ];

  const getCurrentStepIndex = () => {
    const stepIndex = steps.findIndex((step) => step.key === status);
    return stepIndex >= 0 ? stepIndex : 0;
  };

  const currentStepIndex = getCurrentStepIndex();
  const progress =
    status === "success"
      ? 100
      : status === "error"
      ? 100
      : ((currentStepIndex + 1) / steps.length) * 100;

  const getStatusIcon = () => {
    if (status === "success") {
      return (
        <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mb-4">
          <svg
            className="w-10 h-10 text-white"
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
        <div className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center mb-4">
          <svg
            className="w-10 h-10 text-white"
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
        <div className="w-20 h-20 mx-auto relative mb-4">
          <div className="w-full h-full border-4 border-[#FFD60A]/30 border-t-[#FFD60A] rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center">
              <Image
                src="/images/logo_token.png"
                alt="logo"
                className="w-full h-full object-cover"
                width={10000}
                height={10000}
                priority
              />
            </div>
          </div>
        </div>
      );
    }
  };

  const getTitle = () => {
    switch (status) {
      case "initializing":
        return t("purchase.initializing");
      case "paying_bnb_fee":
        return t("purchase.payingBnbFee");
      case "checking_balance":
        return t("purchase.checkingBalance");
      case "approving_tokens":
        return t("purchase.approvingTokens");
      case "burning_tokens":
        return t("purchase.burningTokens");
      case "validating_transaction":
        return t("purchase.validatingTransaction");
      case "determining_prize":
        return t("purchase.determiningPrize");
      case "saving_transaction":
        return t("purchase.savingTransaction");
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
      case "paying_bnb_fee":
        return t("purchase.payingBnbFeeDetail");
      case "checking_balance":
        return t("purchase.checkingBalanceDetail");
      case "approving_tokens":
        return t("purchase.approvingTokensDetail");
      case "burning_tokens":
        return t("purchase.burningTokensDetail");
      case "validating_transaction":
        return t("purchase.validatingTransactionDetail");
      case "determining_prize":
        return t("purchase.determiningPrizeDetail");
      case "saving_transaction":
        return t("purchase.savingTransactionDetail");
      case "success":
        return prize ? t("box.awesome") : t("purchase.complete");
      case "error":
        return errorMessage || t("purchase.genericError");
      default:
        return "";
    }
  };

  const showProgressBar = [
    "initializing",
    "paying_bnb_fee",
    "checking_balance",
    "approving_tokens",
    "burning_tokens",
    "validating_transaction",
    "determining_prize",
    "saving_transaction",
  ].includes(status);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => undefined}
      title={""}
      showCloseButton={status === "success" || status === "error"}
    >
      <div className="flex flex-col items-center py-2">
        {showProgressBar && (
          <div className="w-full mb-6">
            <div className="relative">
              <div className="w-full bg-[#1A1A1A] rounded-full h-2">
                <motion.div
                  className="bg-[#FFD60A] h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                <span>
                  Step {currentStepIndex + 1} of {steps.length}
                </span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
            </div>

            {/* Current Step Indicator */}
            <div className="mt-4 text-center">
              <h3 className="text-lg font-semibold text-white mb-1">
                {steps[currentStepIndex]?.label}
              </h3>
              <p className="text-sm text-gray-400">{getStatusMessage()}</p>
            </div>
          </div>
        )}

        {getStatusIcon()}

        {status !== "error" && (
          <div className="w-full space-y-4 mt-2">
            <div className="bg-[#1A1A1A] rounded-lg p-3 w-full">
              <h3 className="text-sm text-gray-400 mb-2">
                {t("staking.transactionDetails")}
              </h3>

              <div className="space-y-2">
                {amount && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-300">
                      {t("transactions.amount")}:
                    </span>
                    <div className="flex items-center">
                      <LogoIcon className="w-3 h-3 mr-1" />
                      <span className="font-medium">
                        {Number(amount).toLocaleString("en-US", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2,
                        })}{" "}
                        $ADR
                      </span>
                    </div>
                  </div>
                )}

                {boxType && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-300">
                      {t("box.type")}:
                    </span>
                    <span className="font-medium">{boxType}</span>
                  </div>
                )}

                {status === "success" && transactionHash && (
                  <div className="pt-1">
                    <span className="text-sm text-gray-300 block mb-1">
                      {t("common.transactionHash")}:
                    </span>
                    <div className="bg-[#0F0F0F] rounded p-2 overflow-x-auto">
                      <code className="text-xs break-all text-green-300">
                        {transactionHash}
                      </code>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {status === "success" && prize && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#1A1A1A] rounded-lg p-4 w-full mt-4 border border-green-400/20"
              >
                <h3 className="text-sm text-gray-400 mb-3">
                  {t("box.yourPrize")}
                </h3>

                <div className="flex items-center mb-3">
                  {prize.image && (
                    <div className="flex-shrink-0 w-12 h-12 mr-3">
                      <img
                        src={prize.image}
                        alt={prize.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">
                        {t("box.wonPrize")}:
                      </span>
                      <span className="font-medium text-[#FFD60A]">
                        {prize.name}
                      </span>
                    </div>
                  </div>
                </div>

                {prize.type === "sol" && (
                  <div className="bg-[#1A1A1A] rounded-md p-3 mt-2 border border-green-400/30">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-400/20 rounded-full flex items-center justify-center mr-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-green-400"
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
                      <div>
                        <p className="text-green-400 text-sm font-medium">
                          {t("box.solDelivered")}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {t("box.checkWallet")}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {prize.type === "physical" && (
                  <div className="bg-[#1A1A1A] rounded-md p-3 mt-2 border border-blue-400/30">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-400/20 rounded-full flex items-center justify-center mr-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-blue-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                          <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H14a1 1 0 001-1v-3h-5.05a2.5 2.5 0 00-4.9 0H3V5a1 1 0 011-1h4a1 1 0 001-1 1 1 0 011-1h3a1 1 0 011 1 1 1 0 001 1h4a1 1 0 011 1v6h-1M3 4a1 1 0 011-1h5.5l.15-.15a2.5 2.5 0 013.7 0L13.5 3H18a1 1 0 011 1v2h-1" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-blue-400 text-sm font-medium">
                          {t("box.physicalPrize")}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {t("box.claimInstructions")}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {showProgressBar && (
              <div className="flex justify-center mt-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-[#1A1A1A] px-4 py-2 rounded-lg border border-[#333333]"
                >
                  <p className="text-xs text-gray-400 text-center">
                    {t("common.pleaseDoNotCloseWindow")}
                  </p>
                </motion.div>
              </div>
            )}
          </div>
        )}

        {(status === "success" || status === "error") && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 mt-6 w-full"
          >
            {status === "error" && (
              <Button variant="secondary" onClick={onClose} className="flex-1">
                {t("purchase.cancel")}
              </Button>
            )}
            <Button
              className={status === "error" ? "flex-1" : "w-full"}
              variant={status === "success" ? "secondary" : "primary"}
              onClick={onClose}
            >
              {status === "success" ? t("common.done") : t("purchase.tryAgain")}
            </Button>
            {status === "success" && (
              <Button className="w-full" variant="primary" onClick={onBuyAgain}>
                {t("common.buyAgain")}
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </Modal>
  );
}
