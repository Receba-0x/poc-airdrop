"use client";
import {
  controllerAddress,
  ERC20Address,
  CRYPTO_PRIZE_TABLE,
  PRIZE_TABLE,
} from "@/constants";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAccount } from "wagmi";
import { useEthersSigner } from "@/libs";
import {
  ControllerAbi__factory,
  ERC20__factory,
  type ControllerAbi,
  type ERC20,
} from "@/contracts";
import { ethers } from "ethers";
import {
  getErrorMessage,
  calculateTokenAmount,
  calculateBnbFee,
  getBoxTypeString,
  formatTokenAmount,
  PURCHASE_CONFIG,
} from "@/utils/purchase";
import { getCsrfToken, CSRF_TOKEN_HEADER } from "@/utils/getCsrfToken";

type PurchaseStatus =
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

interface PurchaseState {
  isLoading: boolean;
  modalOpen: boolean;
  status: PurchaseStatus;
  errorMessage: string;
  transactionHash: string;
  prize: any;
  boxType: string;
  amount: string;
}

export function usePurchase() {
  const { address, isConnected } = useAccount();
  const { balance, refreshBalance, bnbPrice } = useUser();
  const { t } = useLanguage();
  const signer = useEthersSigner();

  const [currentStock, setCurrentStock] = useState<{ [key: number]: number }>(
    {}
  );
  const [purchaseState, setPurchaseState] = useState<PurchaseState>({
    isLoading: false,
    modalOpen: false,
    status: "initializing",
    errorMessage: "",
    transactionHash: "",
    prize: null,
    boxType: "",
    amount: "",
  });

  const contractsRef = useRef<{
    token?: ERC20;
    controller?: ControllerAbi;
  }>({});

  const getCachedContracts = useCallback(async () => {
    if (!signer) throw new Error("Signer not available");

    if (!contractsRef.current.token) {
      contractsRef.current.token = ERC20__factory.connect(ERC20Address, signer);
    }
    if (!contractsRef.current.controller) {
      contractsRef.current.controller = ControllerAbi__factory.connect(
        controllerAddress,
        signer
      );
    }

    return contractsRef.current;
  }, [signer]);

  const updateState = useCallback((updates: Partial<PurchaseState>) => {
    setPurchaseState((prev) => ({ ...prev, ...updates }));
  }, []);

  const closeModal = useCallback(() => {
    updateState({
      modalOpen: false,
      ...(purchaseState.status === "success" && {
        prize: null,
        transactionHash: "",
      }),
    });
  }, [purchaseState.status, updateState]);

  const fetchCurrentStock = useCallback(async (): Promise<{
    [key: number]: number;
  }> => {
    try {
      const { data } = await axios.post("/api/lootbox", {
        action: "get-stock",
      });
      if (data.success) {
        const prizeStockArray = data.data.prizeStock;
        const formattedStock = prizeStockArray.reduce(
          (
            acc: { [key: number]: number },
            item: { prize_id: number; current_stock: number }
          ) => {
            acc[item.prize_id] = item.current_stock;
            return acc;
          },
          {} as { [key: number]: number }
        );
        setCurrentStock(formattedStock);
        return formattedStock;
      }
      throw new Error("Erro ao buscar estoque");
    } catch (error) {
      console.error("Erro ao buscar estoque:", error);
      return {};
    }
  }, [address]);

  const executeParallelBlockchainOps = useCallback(
    async (amountToBurn: string, isCrypto: boolean) => {
      if (!signer) throw new Error("Signer not available");
      const contracts = await getCachedContracts();

      const [, bnbFeeTx] = await Promise.all([
        (async () => {
          const balance = await contracts.token?.balanceOf(address!);
          if (!balance) throw new Error("Insufficient balance");
          const amountBigInt = BigInt(amountToBurn);
          if (balance < amountBigInt) throw new Error("Insufficient balance");
        })(),
        (async () => {
          updateState({ status: "paying_bnb_fee" });
          const feeUSD = calculateBnbFee(isCrypto);
          const valueInBnb = feeUSD / bnbPrice;
          const value = ethers.parseEther(valueInBnb.toFixed(18));
          const treasuryWallet = process.env.NEXT_PUBLIC_TREASURY_WALLET!;
          const tx = await signer.sendTransaction({
            to: treasuryWallet,
            value,
            gasLimit: PURCHASE_CONFIG.GAS_LIMITS.BNB_TRANSFER,
          });
          await tx.wait();
          return tx;
        })(),
      ]);

      return bnbFeeTx;
    },
    [address, bnbPrice, getCachedContracts, signer, updateState]
  );

  const onMint = useCallback(
    async (isCrypto: boolean) => {
      if (!address) throw new Error("Wallet not connected");
      if (!signer) throw new Error("Signer not available");

      const boxType = getBoxTypeString(isCrypto, t);
      const tokenAmount = calculateTokenAmount(isCrypto);
      const amount = formatTokenAmount(tokenAmount);

      updateState({
        isLoading: true,
        modalOpen: true,
        status: "initializing",
        errorMessage: "",
        transactionHash: "",
        prize: null,
        boxType,
        amount,
      });

      try {
        const csrfToken = await getCsrfToken();
        const { data: purchaseData } = await axios.post(
          "/api/lootbox",
          {
            action: "purchase",
            boxType: isCrypto ? 1 : 2,
            wallet: address,
            clientSeed: address + "_" + Date.now(),
          },
          {
            headers: { [CSRF_TOKEN_HEADER]: csrfToken },
            withCredentials: true,
          }
        );

        if (!purchaseData.success) {
          throw new Error(purchaseData.error || "Failed to get purchase data");
        }

        const { amountToBurn, timestamp, signature, clientSeed } =
          purchaseData.data;

        const bnbFeeTx = await executeParallelBlockchainOps(
          amountToBurn,
          isCrypto
        );
        updateState({ status: "approving_tokens" });
        const contracts = await getCachedContracts();
        const tokens = BigInt(amountToBurn);
        const approveTx = await contracts?.token?.approve(
          controllerAddress,
          tokens,
          { gasLimit: PURCHASE_CONFIG.GAS_LIMITS.APPROVE }
        );
        await approveTx?.wait();
        updateState({ status: "burning_tokens" });
        const burnTx = await contracts?.controller?.burn(
          amountToBurn,
          timestamp,
          signature,
          { gasLimit: PURCHASE_CONFIG.GAS_LIMITS.BURN }
        );
        await burnTx?.wait();

        const txSig = burnTx?.hash;
        updateState({
          status: "determining_prize",
          transactionHash: txSig || "",
        });
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const csrfTokenPut = await getCsrfToken();
        const { data } = await axios.put(
          "/api/lootbox",
          {
            wallet: address,
            amount: amountToBurn,
            timestamp,
            txHash: txSig,
            signature,
            clientSeed,
            bnbFeeTransactionHash: bnbFeeTx.hash,
            bnbPrice,
            boxType: isCrypto ? 1 : 2,
          },
          {
            headers: { [CSRF_TOKEN_HEADER]: csrfTokenPut },
            withCredentials: true,
          }
        );
        if (!data.success) {
          console.error("❌ Prize claim API error:", data.error);
          throw new Error(getErrorMessage(data.error));
        }
        updateState({ status: "saving_transaction" });
        const prizeId = data.prizeId;
        const wonPrize =
          prizeId >= 100 && prizeId <= 111
            ? CRYPTO_PRIZE_TABLE.find((p) => p.id === prizeId)
            : PRIZE_TABLE.find((p) => p.id === prizeId);
        updateState({
          status: "success",
          prize: wonPrize,
          transactionHash: data.txSignature || txSig || "",
        });
        await refreshBalance();
        return {
          tx: txSig,
          prizeTx: data.txSignature,
          nftMint: data.nftMint,
          nftMetadata: data.nftMetadata,
          prize: wonPrize,
          isCrypto: prizeId >= 100 && prizeId <= 111,
          prizeId,
          provablyFair: data.randomData,
        };
      } catch (error: any) {
        console.error("Error processing transaction:", error);
        const errorMsg = error.message?.includes("insufficient")
          ? "Insufficient balance"
          : error.message?.includes("User rejected")
          ? "Transaction cancelled by user"
          : error.message?.includes("_bn")
          ? "Error in NFT configuration. Try again."
          : "Error opening surprise box. Try again.";

        updateState({
          status: "error",
          errorMessage: errorMsg,
        });
        throw error;
      } finally {
        updateState({ isLoading: false });
      }
    },
    [
      address,
      t,
      updateState,
      executeParallelBlockchainOps,
      getCachedContracts,
      refreshBalance,
      signer,
    ]
  );

  useEffect(() => {
    Promise.all([refreshBalance(), fetchCurrentStock()]);
  }, [address]);

  return useMemo(
    () => ({
      onMint,
      balance,
      isLoading: purchaseState.isLoading,
      isConnected,
      currentStock,
      modalOpen: purchaseState.modalOpen,
      modalStatus: purchaseState.status,
      errorMessage: purchaseState.errorMessage,
      transactionHash: purchaseState.transactionHash,
      currentPrize: purchaseState.prize,
      currentBoxType: purchaseState.boxType,
      currentAmount: purchaseState.amount,
      closeModal,
    }),
    [onMint, balance, purchaseState, isConnected, currentStock, closeModal]
  );
}
