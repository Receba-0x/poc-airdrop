"use client";
import {
  adrControllerAddress,
  adrNftAddress,
  adrTokenAddress,
  CRYPTO_PRIZE_TABLE,
  PRIZE_TABLE,
} from "@/constants";
import { toast } from "react-hot-toast";
import { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "@/contexts/UserContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAccount } from "wagmi";
import { getProvider } from "@/libs";
import { AdrAbi__factory, AdrNFT__factory, ERC20__factory } from "@/contracts";
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
    | "processing"
    | "determining"
    | "delivering"
    | "saving"
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
      setCurrentAmount(isCrypto ? "17.5" : "45");
      setModalStatus("processing");
      /* await sendBnbFeeTransaction(isCrypto); */
      const { tokenAmount, clientSeed } = await fetchBackendData(isCrypto);
      await checkSufficientBalance(tokenAmount);
      const txSig = await sendCryptoTransaction(tokenAmount);
      setTransactionHash(txSig || "");
      setModalStatus("determining");
      const { data } = await axios.post("/api/mint-nft", {
        wallet: address,
        boxType: isCrypto ? 1 : 2,
        clientSeed,
        transactionSignature: txSig,
        tokenAmount,
      });

      if (!data.success) {
        throw new Error(data.error || "Error processing purchase");
      }

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

  async function checkSufficientBalance(amount: number) {
    try {
      const provider = await getProvider();
      const contractToken = ERC20__factory.connect(adrTokenAddress, provider);
      const balance = await contractToken.balanceOf(address!);
      if (Number(balance) < amount) throw new Error("Insuficient balance");
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

  async function fetchBackendData(isCrypto: boolean) {
    const clientSeed = address + "_" + Date.now();
    const boxType = isCrypto ? 1 : 2;
    const payload = { boxType, wallet: address, clientSeed };
    const { data } = await axios.post("/api/purchase", payload);
    const { tokenAmount, clientSeed: serverClientSeed } = data;
    const provider = await getProvider();
    const signer = await provider.getSigner();
    const adrTokenContract = ERC20__factory.connect(adrTokenAddress, signer);
    const balance = await adrTokenContract.balanceOf(address!);
    if (Number(balance) < tokenAmount) {
      throw new Error("Insuficient balance of tokens");
    }
    return { tokenAmount, clientSeed: serverClientSeed };
  }

  async function sendCryptoTransaction(amount: number) {
    const provider = await getProvider();
    const signer = await provider.getSigner();
    const tokens = ethers.parseUnits(amount.toString(), 9);
    const tokenContract = ERC20__factory.connect(adrTokenAddress, signer);
    const approveTx = await tokenContract.approve(adrControllerAddress, tokens);
    await approveTx.wait();
    console.log("approveTx", approveTx);
    const adrContract = AdrAbi__factory.connect(adrControllerAddress, signer);
    const tx = await adrContract.burnTokens(tokens, "Burn Tokens");
    const txSig = await tx.wait();
    console.log("txSig", txSig);
    return txSig?.hash;
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
