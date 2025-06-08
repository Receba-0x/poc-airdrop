"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Transaction } from "@solana/web3.js";
import { useLanguage } from "@/contexts/LanguageContext";
import axios from "axios";
import { Button } from "../Button";

interface ApproveNFTDelegateProps {
  nftMint: string;
  onSuccess: (signature: string) => void;
  onError: (error: string) => void;
}

export function ApproveNFTDelegate({ nftMint, onSuccess, onError }: ApproveNFTDelegateProps) {
  const { t } = useLanguage();
  const { publicKey, signTransaction, connected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "preparing" | "signing" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleApprove = async () => {
    if (!connected || !publicKey || !signTransaction) {
      onError(t("common.walletNotConnected") || "Carteira não conectada");
      return;
    }

    setIsLoading(true);
    setStatus("preparing");
    setErrorMessage("");

    try {
      const { data } = await axios.post("/api/approve-delegate", {
        nftMint,
        walletAddress: publicKey.toString()
      });

      if (!data.success) {
        throw new Error(data.error || "Erro ao gerar transação");
      }

      setStatus("signing");

      const transactionBuffer = Buffer.from(data.transaction, "base64");
      const transaction = Transaction.from(transactionBuffer);

      const signedTransaction = await signTransaction(transaction);

      setStatus("sending");

      const { data: sendData } = await axios.post("/api/send-transaction", {
        signedTransaction: Array.from(signedTransaction.serialize())
      });

      if (!sendData.success) {
        throw new Error(sendData.error || "Erro ao enviar transação");
      }

      setStatus("success");
      onSuccess(sendData.signature);
    } catch (error: any) {
      console.error("Erro ao aprovar delegado:", error);
      setStatus("error");
      setErrorMessage(error.message || "Erro desconhecido");
      onError(error.message || "Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    switch (status) {
      case "preparing":
        return t("common.preparing") || "Preparando...";
      case "signing":
        return t("common.pleaseSign") || "Assine com sua carteira...";
      case "sending":
        return t("common.sending") || "Enviando...";
      case "success":
        return t("common.approved") || "Aprovado!";
      case "error":
        return t("common.tryAgain") || "Tentar novamente";
      default:
        return t("nft.approveOperator") || "Aprovar Operador";
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {errorMessage && (
        <div className="bg-red-900/30 border border-red-700 rounded-md p-3 text-sm text-red-300">
          {errorMessage}
        </div>
      )}
      
      <div className="text-sm text-gray-300 mb-2">
        {t("nft.approveOperatorExplanation") || 
          "Antes de reclamar seu prêmio físico, você precisa aprovar nosso servidor como operador para essa NFT. Isso permitirá que queimemos a NFT quando você reclamar seu prêmio."}
      </div>

      <Button 
        onClick={handleApprove}
        disabled={isLoading || !connected || status === "success"}
        className={`w-full ${status === "success" ? "bg-green-600" : ""}`}
      >
        {getButtonText()}
      </Button>
    </div>
  );
} 