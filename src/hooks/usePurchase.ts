"use client";
import {
  adrControllerAddress,
  adrNftAddress,
  adrTokenAddress,
  CRYPTO_PRIZE_TABLE,
  PRIZE_TABLE,
} from "@/constants";
import { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAccount } from "wagmi";
import { getProvider } from "@/libs";
import { AdrAbi__factory, ERC20__factory } from "@/contracts";
import { ethers } from "ethers";

export function usePurchase() {
  const { address, isConnected } = useAccount();
  const { balance, refreshBalance, bnbPrice } = useUser();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStock, setCurrentStock] = useState<{ [key: number]: number }>(
    {}
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState<
    | "initializing"
    | "paying_bnb_fee"
    | "checking_balance"
    | "approving_tokens"
    | "burning_tokens"
    | "validating_transaction"
    | "determining_prize"
    | "saving_transaction"
    | "success"
    | "error"
  >("initializing");
  const [errorMessage, setErrorMessage] = useState("");
  const [transactionHash, setTransactionHash] = useState("");
  const [currentPrize, setCurrentPrize] = useState<any>(null);
  const [currentBoxType, setCurrentBoxType] = useState<string>("");
  const [currentAmount, setCurrentAmount] = useState<string>("");

  const closeModal = () => {
    setModalOpen(false);
    if (modalStatus === "success") {
      setCurrentPrize(null);
      setTransactionHash("");
    }
  };

  async function fetchCurrentStock(): Promise<{ [key: number]: number }> {
    try {
      const response = await axios.get("/api/get-stock");
      if (response.data.success) {
        setCurrentStock(response.data.stock);
        return response.data.stock;
      }
      throw new Error("Erro ao buscar estoque");
    } catch (error) {
      console.error("Erro ao buscar estoque:", error);
      return {};
    }
  }

  async function onMint(isCrypto: boolean) {
    try {
      if (!address) throw new Error("Wallet not connected");
      setIsLoading(true);
      setModalOpen(true);
      setModalStatus("initializing");
      setErrorMessage("");
      setTransactionHash("");
      setCurrentPrize(null);
      setCurrentBoxType(isCrypto ? t("box.cryptos") : t("box.superPrizes"));
      setCurrentAmount(
        isCrypto
          ? (17.5 / 0.002).toLocaleString("en-US")
          : (45 / 0.002).toLocaleString("en-US")
      );

      setModalStatus("paying_bnb_fee");
      const bnbFeeTx = await sendBnbFeeTransaction(isCrypto);
      const bnbFeeTransactionHash = bnbFeeTx.hash;

      const { data: purchaseData } = await axios.post("/api/purchase", {
        boxType: isCrypto ? 1 : 2,
        wallet: address,
        clientSeed: address + "_" + Date.now(),
      });

      if (!purchaseData.success) {
        throw new Error(purchaseData.error || "Failed to get purchase data");
      }

      const { amountToBurn, timestamp, signature, clientSeed } = purchaseData;

      setModalStatus("checking_balance");
      await checkSufficientBalance(amountToBurn);

      setModalStatus("approving_tokens");
      await approveTokens(amountToBurn);

      setModalStatus("burning_tokens");
      const txSig = await verifiedBurnTokens(
        amountToBurn,
        timestamp,
        signature
      );
      setTransactionHash(txSig || "");

      setModalStatus("validating_transaction");

      setModalStatus("determining_prize");

      const { data } = await axios.post("/api/claim-prize", {
        wallet: address,
        amount: amountToBurn,
        timestamp,
        txHash: txSig,
        signature,
        clientSeed,
        bnbFeeTransactionHash,
        bnbPrice,
        boxType: isCrypto ? 1 : 2,
      });

      if (!data.success) {
        console.error("❌ Claim-prize API error:", data.error);

        if (data.error?.includes("replay attack")) {
          throw new Error(
            "Esta transação já foi utilizada. Cada transação só pode ser usada uma vez."
          );
        } else if (data.error?.includes("Invalid server signature")) {
          throw new Error("Assinatura do servidor inválida. Tente novamente.");
        } else if (data.error?.includes("BNB fee validation failed")) {
          throw new Error(
            "Falha na validação da taxa BNB. Verifique se a taxa foi paga corretamente."
          );
        } else if (data.error?.includes("Verified burn validation failed")) {
          throw new Error(
            "Falha na validação da queima verificada. Verifique se a transação foi confirmada."
          );
        } else if (
          data.error?.includes("VerifiedTokensBurned event not found")
        ) {
          throw new Error(
            "Evento de queima verificada não encontrado. Verifique se o contrato foi chamado corretamente."
          );
        } else if (data.error?.includes("Treasury wallet not configured")) {
          throw new Error(
            "Configuração do sistema incompleta. Tente novamente mais tarde."
          );
        } else if (data.error?.includes("too old")) {
          throw new Error(
            "Transação muito antiga. Por favor, tente novamente."
          );
        } else if (data.error?.includes("Amount mismatch")) {
          throw new Error(
            "Valor da transação não confere. Verifique o valor enviado."
          );
        } else if (data.error?.includes("Timestamp mismatch")) {
          throw new Error(
            "Timestamp da transação não confere. Tente novamente."
          );
        } else if (data.error?.includes("Invalid sender")) {
          throw new Error(
            "Remetente da transação inválido. A transação deve ser enviada da sua carteira."
          );
        }

        throw new Error(data.error || "Error processing purchase");
      }

      setModalStatus("saving_transaction");

      const prizeId = data.prizeId;
      let wonPrize = null;

      if (prizeId >= 100 && prizeId <= 111) {
        wonPrize = CRYPTO_PRIZE_TABLE.find((p) => p.id === prizeId);
      } else {
        wonPrize = PRIZE_TABLE.find((p) => p.id === prizeId);
      }
      setCurrentPrize(wonPrize);
      if (data.txSignature) setTransactionHash(data.txSignature);

      setModalStatus("success");
      await refreshBalance();

      const result = {
        tx: txSig,
        prizeTx: data.txSignature,
        nftMint: data.nftMint || adrNftAddress,
        nftMetadata: data.nftMetadata || adrNftAddress,
        prize: wonPrize,
        isCrypto: prizeId >= 100 && prizeId <= 111,
        prizeId,
        provablyFair: data.randomData,
      };

      return result;
    } catch (error: any) {
      handleMintError(error);
      setModalStatus("error");
      setErrorMessage(error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  async function checkSufficientBalance(amount: string | number) {
    try {
      const provider = await getProvider();
      const contractToken = ERC20__factory.connect(adrTokenAddress, provider);
      const balance = await contractToken.balanceOf(address!);
      const amountBigInt =
        typeof amount === "string"
          ? BigInt(amount)
          : ethers.parseUnits(amount.toString(), 18);
      if (balance < amountBigInt) throw new Error("Insuficient balance");
    } catch (error) {
      console.error("Erro ao verificar saldo:", error);
      throw error;
    }
  }

  async function sendBnbFeeTransaction(isCrypto: boolean) {
    try {
      const FEE_USD = isCrypto ? 1.65 : 7.65;
      const provider = await getProvider();
      const signer = await provider.getSigner();
      const valueInBnb = FEE_USD / bnbPrice;
      const valueInBnbFixed = valueInBnb.toFixed(18);
      const value = ethers.parseEther(valueInBnbFixed);
      const treasuryWallet = process.env.NEXT_PUBLIC_TREASURY_WALLET!;
      const tx = await signer.sendTransaction({ to: treasuryWallet, value });
      await tx.wait();
      return tx;
    } catch (error) {
      console.error("Error sending BNB fee:", error);
      throw new Error("Failed to process BNB fee payment");
    }
  }

  async function approveTokens(amount: string | number) {
    try {
      const provider = await getProvider();
      const signer = await provider.getSigner();
      console.log(Number(amount))
      const tokens = typeof amount === "string" ? BigInt(amount) : ethers.parseUnits(amount.toString(), 18);
      const tokenContract = ERC20__factory.connect(adrTokenAddress, signer);
      const approveTx = await tokenContract.approve(
        adrControllerAddress,
        tokens
      );
      await approveTx.wait();
      return approveTx;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to approve token spending");
    }
  }

  async function verifiedBurnTokens(
    amount: string | number,
    timestamp: number,
    signature: string
  ) {
    try {
      const provider = await getProvider();
      const signer = await provider.getSigner();
      const adrContract = AdrAbi__factory.connect(adrControllerAddress, signer);
      const tx = await adrContract.verifiedBurn(amount, timestamp, signature, {
        gasLimit: 1000000,
      });
      const txSig = await tx.wait();
      return txSig?.hash;
    } catch (error: any) {
      console.error("Error in verified burn:", error);

      if (error.reason) {
        console.error("Revert reason:", error.reason);
      }
      if (error.data) {
        console.error("Error data:", error.data);
      }
      if (error.transaction) {
        console.error("Failed transaction:", error.transaction);
      }

      throw new Error("Failed to execute verified burn");
    }
  }

  function handleMintError(error: any) {
    console.error("Error processing transaction:", error);
    if (error.message) console.error("Error message:", error.message);
    if (error.stack) console.error("Error stack:", error.stack);
    let errorMsg = "Error opening surprise box. Try again.";
    if (error.message?.includes("_bn")) {
      errorMsg = "Error in NFT configuration. Try again.";
    } else if (error.message?.includes("insufficient")) {
      errorMsg = "Insuficient balance";
    } else if (error.message?.includes("User rejected")) {
      errorMsg = "Transaction cancelled by user";
    }
    setErrorMessage(errorMsg);
  }

  useEffect(() => {
    refreshBalance();
    fetchCurrentStock();
  }, [address]);

  return {
    onMint,
    balance,
    isLoading,
    isConnected,
    currentStock,
    modalOpen,
    modalStatus,
    errorMessage,
    transactionHash,
    currentPrize,
    currentBoxType,
    currentAmount,
    closeModal,
  };
}
