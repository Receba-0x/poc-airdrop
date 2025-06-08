import { motion } from "framer-motion";
import { Button } from "../Button";
import { LogoIcon } from "../Icons/LogoIcon";
import { useStaking } from "@/hooks/useStaking";
import { useLanguage } from "@/contexts/LanguageContext";
import { TransactionModal } from "../TransactionModal";

export function StakeContent() {
  const staking = useStaking();
  const { t } = useLanguage();

  return (
    <div className="min-h-[420px] flex flex-col">
      <div className="flex-1 space-y-4 sm:space-y-6">
        <div>
          <div className="flex flex-col sm:flex-row sm:justify-between mb-2 gap-1 sm:gap-0">
            <span className="text-sm sm:text-base">{t("staking.amount")}</span>
            <span className="text-sm sm:text-base text-gray-300">
              {t("staking.balance")}: {staking.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $ADR
            </span>
          </div>
          <div className="flex items-center bg-[#1A1A1A] rounded p-2 sm:p-3">
            <div className="flex items-center gap-1 text-xs sm:text-sm bg-[#313131] rounded p-1 px-2 sm:px-3">
              {" "}
              <LogoIcon className="w-3 h-3 sm:w-4 sm:h-4" />{" "}
              <span className="xs:inline">$ADR</span>{" "}
            </div>
            <input
              type="text"
              value={staking.amount}
              onChange={staking.handleAmountChange}
              placeholder="0.00"
              className="bg-transparent flex-1 mx-2 sm:mx-3 outline-none w-full text-sm sm:text-base"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={staking.handleMaxClick}
              className="text-[#FFD60A] hover:brightness-110 transition-all text-sm sm:text-base font-medium"
            >
              {t("staking.max")}
            </motion.button>
          </div>
          {Number(staking.amount) > staking.balance && (
            <p className="text-red-500 text-xs sm:text-sm mt-1">
              {t("staking.insufficientBalance")}
            </p>
          )}
        </div>
        <div>
          <h2 className="mb-3 sm:mb-4 font-semibold text-lg sm:text-xl">
            {t("staking.period")}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap gap-2 text-xs sm:text-sm">
            {staking.periods.map((periodInfo) => (
              <motion.button
                key={periodInfo.period}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => staking.setSelectedPeriod(periodInfo.period)}
                className={`${staking.selectedPeriod === periodInfo.period
                  ? "bg-[#FFD60A] text-black"
                  : "bg-[#1A1A1A] hover:bg-[#2A2A2A]"
                  } px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all duration-200 text-center`}
              >
                <div className="font-medium">{periodInfo.label}</div>
                <div className="text-[10px] sm:text-[11px] opacity-75 mt-0.5">
                  APY {periodInfo.apy}%
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Summary Section */}
        <div>
          <h2 className="mb-3 sm:mb-4 font-semibold text-lg sm:text-xl">
            {t("staking.resume")}
          </h2>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[#B4B4B4] text-sm sm:text-base">
                {t("staking.stakingAmount")}:
              </span>
              <span className="font-bold text-sm sm:text-base">
                {staking.amount || "0"} $ADR
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#B4B4B4] text-sm sm:text-base">
                {t("staking.lockupPeriod")}:
              </span>
              <span className="font-bold text-sm sm:text-base">
                {staking.periods.find(
                  (p) => p.period === staking.selectedPeriod
                )?.label || t("staking.none")}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#B4B4B4] text-sm sm:text-base">
                {t("staking.estimatedRewards")}:
              </span>
              <span className="font-bold text-sm sm:text-base text-[#FFD60A]">
                {staking.estimatedRewards.toFixed(3)} $ADR
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stake Button */}
      <div className="flex justify-center sm:justify-end mt-4 sm:mt-6">
        <Button
          onClick={staking.onStake}
          disabled={!staking.isValid || staking.isLoading}
          className="w-full sm:w-auto sm:min-w-[140px] h-[44px] sm:h-[48px] text-sm sm:text-base"
        >
          {staking.isLoading ? t("common.loading") : t("staking.stake")}
        </Button>
      </div>

      <TransactionModal
        isOpen={staking.modalOpen}
        onClose={staking.closeModal}
        status={staking.modalStatus}
        type="stake"
        amount={staking.amount}
        period={staking.getSelectedPeriodLabel()}
        errorMessage={staking.errorMessage}
        transactionHash={staking.transactionHash}
        estimatedRewards={staking.estimatedRewards}
      />
    </div>
  );
}
