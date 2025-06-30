"use client";
import {
  adrControllerAddress,
  adrNftAddress,
  adrTokenAddress,
  CRYPTO_PRIZE_TABLE,
  PRIZE_TABLE,
} from "@/constants";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAccount } from "wagmi";
import { useEthersSigner } from "@/libs";
import { AdrAbi__factory, ERC20__factory } from "@/contracts";
import { ethers } from "ethers";
import {
  getErrorMessage,
  calculateTokenAmount,
  calculateBnbFee,
  getBoxTypeString,
  formatTokenAmount,
  PURCHASE_CONFIG,
} from "@/utils/purchase";

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

const ERROR_MESSAGES = {
  "replay attack":
    "Esta transação já foi utilizada. Cada transação só pode ser usada uma vez.",
  "Invalid server signature":
    "Assinatura do servidor inválido. Tente novamente.",
  "BNB fee validation failed":
    "Falha na validação da taxa BNB. Verifique se a taxa foi paga corretamente.",
  "Verified burn validation failed":
    "Falha na validação da queima verificada. Verifique se a transação foi confirmada.",
  "VerifiedTokensBurned event not found":
    "Evento de queima verificada não encontrado. Verifique se o contrato foi chamado corretamente.",
  "Treasury wallet not configured":
    "Configuração do sistema incompleta. Tente novamente mais tarde.",
  "too old": "Transação muito antiga. Por favor, tente novamente.",
  "Amount mismatch":
    "Valor da transação não confere. Verifique o valor enviado.",
  "Timestamp mismatch": "Timestamp da transação não confere. Tente novamente.",
  "Invalid sender":
    "Remetente da transação inválido. A transação deve ser enviada da sua carteira.",
} as const;

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

  const contractsRef = useRef<{ token?: any; adr?: any }>({});

  const getCachedContracts = useCallback(async () => {
    if (!signer) throw new Error("Signer not available");

    if (!contractsRef.current.token) {
      contractsRef.current.token = ERC20__factory.connect(
        adrTokenAddress,
        signer
      );
    }
    if (!contractsRef.current.adr) {
      contractsRef.current.adr = AdrAbi__factory.connect(
        adrControllerAddress,
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
      const response = await axios.post("/api/lootbox", {
        action: "get-stock",
      });
      if (response.data.success) {
        setCurrentStock(response.data.stock);
        return response.data.stock;
      }
      throw new Error("Erro ao buscar estoque");
    } catch (error) {
      console.error("Erro ao buscar estoque:", error);
      return {};
    }
  }, []);

  const executeParallelBlockchainOps = useCallback(
    async (amountToBurn: string, isCrypto: boolean) => {
      if (!signer) throw new Error("Signer not available");
      const contracts = await getCachedContracts();

      const [, bnbFeeTx] = await Promise.all([
        (async () => {
          const balance = await contracts.token.balanceOf(address!);
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
        const { data: purchaseData } = await axios.post("/api/lootbox", {
          action: "purchase",
          boxType: isCrypto ? 1 : 2,
          wallet: address,
          clientSeed: address + "_" + Date.now(),
        });

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
        const approveTx = await contracts.token.approve(
          adrControllerAddress,
          tokens,
          { gasLimit: PURCHASE_CONFIG.GAS_LIMITS.APPROVE }
        );
        await approveTx.wait();
        updateState({ status: "burning_tokens" });
        const burnTx = await contracts.adr.verifiedBurn(
          amountToBurn,
          timestamp,
          signature,
          { gasLimit: PURCHASE_CONFIG.GAS_LIMITS.BURN }
        );
        await burnTx.wait();

        const txSig = burnTx.hash;
        updateState({
          status: "determining_prize",
          transactionHash: txSig || "",
        });
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const { data } = await axios.put("/api/lootbox", {
          wallet: address,
          amount: amountToBurn,
          timestamp,
          txHash: txSig,
          signature,
          clientSeed,
          bnbFeeTransactionHash: bnbFeeTx.hash,
          bnbPrice,
          boxType: isCrypto ? 1 : 2,
        });
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
          nftMint: data.nftMint || adrNftAddress,
          nftMetadata: data.nftMetadata || adrNftAddress,
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
    if (address) {
      Promise.all([refreshBalance(), fetchCurrentStock()]);
    }
  }, [address, refreshBalance, fetchCurrentStock]);

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
