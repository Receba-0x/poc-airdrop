"use client";
import { useState } from "react";
import { StakingPeriod } from "@/interfaces";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUser } from "@/contexts/UserContext";

interface PeriodInfo {
  label: string;
  apy: number;
  minutes: number;
  period: StakingPeriod;
}

const getPeriodInfo = (
  t: (key: string) => string
): Record<StakingPeriod, PeriodInfo> => ({
  [StakingPeriod.Minutes1]: {
    label: t("staking.days7"),
    apy: 5,
    minutes: 1,
    period: StakingPeriod.Minutes1,
  },
  [StakingPeriod.Minutes2]: {
    label: t("staking.days14"),
    apy: 10,
    minutes: 2,
    period: StakingPeriod.Minutes2,
  },
  [StakingPeriod.Minutes5]: {
    label: t("staking.days30"),
    apy: 20,
    minutes: 5,
    period: StakingPeriod.Minutes5,
  },
  [StakingPeriod.Minutes10]: {
    label: t("staking.days90"),
    apy: 40,
    minutes: 10,
    period: StakingPeriod.Minutes10,
  },
});

export function useStaking() {
  const { t } = useLanguage();
  const { balance, refreshBalance } = useUser();
  const PERIOD_INFO = getPeriodInfo(t);
  const [amount, setAmount] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<StakingPeriod>(
    StakingPeriod.Minutes1
  );
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState<
    "loading" | "success" | "error"
  >("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [transactionHash, setTransactionHash] = useState("");

  const handleMaxClick = () => {
    setAmount(balance.toString());
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value) || value === "") {
      setAmount(value);
    }
  };

  const calculateRewards = () => {
    if (!amount || !selectedPeriod) return 0;
    const periodInfo = PERIOD_INFO[selectedPeriod];
    return (
      ((Number(amount) * periodInfo.apy) / 100) *
      (periodInfo.minutes / (365 * 24 * 60))
    );
  };

  const closeModal = () => {
    setModalOpen(false);
    if (modalStatus === "success") {
      setAmount("");
      setSelectedPeriod(StakingPeriod.Minutes1);
    }
  };

  const onStake = async () => {};

  const estimatedRewards = calculateRewards();
  const isValid = amount && Number(amount) <= balance;

  return {
    balance,
    amount,
    selectedPeriod,
    isLoading,
    handleAmountChange,
    handleMaxClick,
    onStake,
    setSelectedPeriod,
    estimatedRewards,
    isValid,
    periods: Object.entries(PERIOD_INFO).map(([key, info]) => ({
      ...info,
      period: info.period,
    })),
    modalOpen,
    modalStatus,
    errorMessage,
    transactionHash,
    closeModal,
    getSelectedPeriodLabel: () => PERIOD_INFO[selectedPeriod]?.label,
  };
}
