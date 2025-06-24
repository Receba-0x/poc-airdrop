"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAccount } from "wagmi";

export type Transaction = {
  id: string;
  name: string;
  value: number;
  status:
    | "Completed"
    | "Error"
    | "Processing..."
    | "Claimed"
    | "Delivering"
    | "Delivered";
  date: string;
  prizeId: number;
  isCrypto: boolean;
  txHash: string;
  claimed?: boolean;
};

export function useTransactions() {
  const { address, isConnected } = useAccount();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    if (!address) return;
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await axios.get("/api/get-transactions", {
        params: { wallet: address },
      });
      if (data.success && Array.isArray(data.transactions)) {
        if (data.transactions.length === 0) {
          setTransactions([]);
          return;
        }
        const formattedTransactions: Transaction[] = [];
        try {
          for (let i = 0; i < data.transactions.length; i++) {
            const tx = data.transactions[i];
            try {
              const prizeName = tx.prize_name || "Unknown Prize";
              const prizeValue = tx.amount_purchased || 0;
              const prizeId = tx.prize_id || 0;
              const isCrypto = tx.is_crypto || prizeId >= 100;
              const claimed = tx.claimed;
              let status:
                | "Completed"
                | "Error"
                | "Processing..."
                | "Claimed"
                | "Delivering"
                | "Delivered" = "Completed";
              if (tx.status === "error") {
                status = "Error";
              } else if (tx.status === "processing") {
                status = "Processing...";
              } else if (tx.status === "claimed") {
                status = "Claimed";
              } else if (tx.status === "delivering") {
                status = "Delivering";
              } else if (tx.status === "delivered") {
                status = "Delivered";
              }

              let formattedDate = "Unknown date";
              try {
                const txDate = new Date(
                  tx.purchase_timestamp || tx.timestamp || Date.now()
                );
                formattedDate =
                  txDate.toLocaleDateString() +
                  " " +
                  txDate.toLocaleTimeString();
              } catch (dateError) {
                console.error("Erro ao formatar data:", dateError);
              }

              const formattedTransaction: Transaction = {
                id: tx.nft_mint || tx.nftMint || tx.id || `unknown-${i}`,
                name: prizeName,
                value: prizeValue,
                status,
                date: formattedDate,
                prizeId: prizeId,
                isCrypto,
                txHash:
                  tx.transaction_signature || tx.transactionSignature || "",
                claimed: claimed,
              };
              formattedTransactions.push(formattedTransaction);
            } catch (txError) {
              console.error(`Erro ao processar transação ${i}:`, txError);
            }
          }
        } catch (mapError) {
          console.error("Erro ao mapear transações:", mapError);
        }
        setTransactions(formattedTransactions);
      } else {
        console.error("Erro nos dados da API:", data);
        setError("Não foi possível carregar as transações");
      }
    } catch (err) {
      console.error("Erro ao buscar transações:", err);
      setError("Erro ao carregar transações");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      fetchTransactions();
    } else {
      setTransactions([]);
    }
  }, [isConnected, address]);

  return {
    transactions,
    isLoading,
    error,
    refreshTransactions: fetchTransactions,
  };
}
