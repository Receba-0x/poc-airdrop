"use client";
import { useEffect, useState } from "react";

export function useUnstaking() {
  const [isLoading, setIsLoading] = useState(false);
  const [stakeInfo, setStakeInfo] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState<
    "loading" | "success" | "error"
  >("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [transactionHash, setTransactionHash] = useState("");

  const closeModal = () => {
    setModalOpen(false);
    if (modalStatus === "success") {
      setTimeout(() => {
        getCurrentStake();
      }, 1000);
    }
  };

  const onUnstake = async () => {};

  const getCurrentStake = async () => {};

  /*  useEffect(() => {
    if (address) {
      getCurrentStake();
    } else {
      setStakeInfo(null);
    }
  }, [address]); */

  return {
    isLoading,
    onUnstake,
    stakeInfo,
    // Modal props
    modalOpen,
    modalStatus,
    errorMessage,
    transactionHash,
    closeModal,
  };
}
