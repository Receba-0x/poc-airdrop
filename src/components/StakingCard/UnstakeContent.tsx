import { Button } from "../Button";
import { useUnstaking } from "@/hooks/useUnstaking";
import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { TransactionModal } from "../TransactionModal";

function formatTimeLeft(seconds: number) {
  if (seconds <= 0) return "00:00:00";
  const h = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export function UnstakeContent() {
  const {
    stakeInfo,
    onUnstake,
    isLoading,
    modalOpen,
    modalStatus,
    errorMessage,
    transactionHash,
    closeModal,
  } = useUnstaking();
  const { t } = useLanguage();
  const [secondsLeft, setSecondsLeft] = useState<number>(0);

  useEffect(() => {
    if (!stakeInfo) return;
    setSecondsLeft(Math.max(0, Math.floor(stakeInfo.secondsLeft)));
    if (stakeInfo.secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [stakeInfo]);

  if (!stakeInfo) {
    return (
      <div className="text-center py-8 text-sm sm:text-base">
        {t("staking.loadingStakeInfo")}
      </div>
    );
  }

  const canUnstake = secondsLeft <= 0 && !stakeInfo.claimed;

  return (
    <div className="flex flex-col min-h-[420px]">
      <div className="flex-1 space-y-4 sm:space-y-6">
        {/* Summary Section */}
        <div>
          <h2 className="mb-3 sm:mb-4 font-semibold text-lg sm:text-xl">
            {t("staking.resume")}
          </h2>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
              <span className="text-[#B4B4B4] text-sm sm:text-base">
                {t("staking.stakedAmountLabel")}:
              </span>
              <span className="font-bold text-sm sm:text-base">
                {stakeInfo.amount || "0"} $ADR
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
              <span className="text-[#B4B4B4] text-sm sm:text-base">
                {t("staking.period")}:
              </span>
              <span className="font-bold text-sm sm:text-base">
                {stakeInfo.period}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
              <span className="text-[#B4B4B4] text-sm sm:text-base">
                {t("staking.startTime")}:
              </span>
              <span className="font-bold text-sm sm:text-base break-all sm:break-normal">
                {stakeInfo.startTime?.toLocaleString()}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
              <span className="text-[#B4B4B4] text-sm sm:text-base">
                {t("staking.unlockTime")}:
              </span>
              <span className="font-bold text-sm sm:text-base break-all sm:break-normal">
                {stakeInfo.unlockTime?.toLocaleString()}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
              <span className="text-[#B4B4B4] text-sm sm:text-base">
                {t("staking.status")}:
              </span>
              <span
                className={`font-bold text-sm sm:text-base ${
                  stakeInfo.claimed ? "text-green-500" : "text-yellow-400"
                }`}
              >
                {stakeInfo.claimed
                  ? t("staking.claimed")
                  : secondsLeft > 0
                  ? t("staking.locked")
                  : t("staking.available")}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
              <span className="text-[#B4B4B4] text-sm sm:text-base">
                {t("staking.timeLeft")}:
              </span>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="font-mono text-base sm:text-lg text-[#FFD60A]">
                  {secondsLeft > 0 ? formatTimeLeft(secondsLeft) : "00:00:00"}
                </span>
                {secondsLeft > 0 && (
                  <span className="text-xs text-gray-400">(H:M:S)</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-[#1A1A1A] rounded-lg p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  stakeInfo.claimed
                    ? "bg-green-500"
                    : secondsLeft > 0
                    ? "bg-yellow-400"
                    : "bg-green-500"
                }`}
              />
              <span className="text-sm sm:text-base font-medium">
                {" "}
                {stakeInfo.claimed
                  ? t("staking.rewardsClaimedStatus")
                  : secondsLeft > 0
                  ? t("staking.awaitingUnlockStatus")
                  : t("staking.readyForWithdrawalStatus")}{" "}
              </span>
            </div>
            {!stakeInfo.claimed && secondsLeft <= 0 && (
              <span className="text-xs sm:text-sm text-[#FFD60A] font-medium">
                {" "}
                {t("staking.availableForUnstake")}{" "}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-center sm:justify-end mt-4 sm:mt-6">
        <Button
          onClick={onUnstake}
          disabled={isLoading || !canUnstake}
          className="w-full sm:w-auto sm:min-w-[160px] h-[44px] sm:h-[48px] text-sm sm:text-base"
        >
          {isLoading
            ? t("staking.processing")
            : stakeInfo.claimed
            ? t("staking.alreadyClaimed")
            : secondsLeft > 0
            ? t("staking.waitToUnstake")
            : t("staking.confirmUnstake")}
        </Button>
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={closeModal}
        status={modalStatus}
        type="unstake"
        amount={stakeInfo.amount?.toString()}
        errorMessage={errorMessage}
        transactionHash={transactionHash}
      />
    </div>
  );
}
