"use client";
import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import { useUser } from "@/contexts/UserContext";
import { CRYPTO_PRIZE_TABLE, PRIZE_TABLE } from "@/constants";

export type Transaction = {
  id: string;
  name: string;
  value: number;
  status: "Completed" | "Error" | "Processing..." | "Claimed";
  date: string;
  prizeId: number;
  isCrypto: boolean;
  txHash: string;
  claimed?: boolean;
};

export function useTransactions() {
  const { publicKey, connected } = useWallet();
  const { solanaPrice } = useUser();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Valor padrão para solanaPrice quando não estiver disponível
  const currentSolanaPrice = solanaPrice || 165; // Valor aproximado de 1 SOL em USD

  const fetchTransactions = async () => {
    if (!publicKey) return;
    
    console.log("Buscando transações para wallet:", publicKey.toString());
    setIsLoading(true);
    setError(null);
    
    try {
      const { data } = await axios.get('/api/get-transactions', {
        params: { wallet: publicKey.toString() }
      });
      
      console.log("Resposta da API:", data);
      
      if (data.success && Array.isArray(data.transactions)) {
        console.log("Dados brutos das transações:", data.transactions);
        
        if (data.transactions.length === 0) {
          console.log("Nenhuma transação retornada pela API");
          setTransactions([]);
          return;
        }
        
        // Transformar dados da API para o formato que precisamos
        const formattedTransactions: Transaction[] = [];

        try {
          // Tentar mapear cada transação individualmente
          for (let i = 0; i < data.transactions.length; i++) {
            const tx = data.transactions[i];
            try {
              console.log(`Processando transação ${i}:`, tx);
              
              // Encontrar informações do prêmio
              let prizeName = tx.prize_name || "Unknown Prize";
              let prizeValue = 0;
              
              // Os IDs dos prêmios crypto são >= 100
              const prizeId = tx.prize_id || 0;
              const isCrypto = tx.is_crypto || prizeId >= 100;
              
              if (isCrypto) {
                // Prêmio crypto
                const cryptoPrize = CRYPTO_PRIZE_TABLE.find(p => p.id === prizeId);
                if (cryptoPrize) {
                  prizeName = cryptoPrize.name;
                  prizeValue = cryptoPrize.amount * currentSolanaPrice; // Converter SOL para USD
                }
              } else {
                // Prêmio normal
                const prize = PRIZE_TABLE.find(p => p.id === prizeId);
                if (prize) {
                  prizeName = prize.name;
                  if (prize.type === "sol") {
                    prizeValue = (prize.amount || 0) * currentSolanaPrice; // Converter SOL para USD
                  } else {
                    // Para prêmios físicos, usamos o valor da caixa
                    prizeValue = 45; // Valor da caixa em USD
                  }
                }
              }
              
              // Determinar status
              let status: "Completed" | "Error" | "Processing..." | "Claimed" = "Completed";
              if (tx.status === "error") {
                status = "Error";
              } else if (tx.status === "processing") {
                status = "Processing...";
              } else if (tx.status === "claimed") {
                status = "Claimed";
              }
              
              // Check if the transaction is claimed
              const claimed = tx.status === "claimed" || tx.claimed || false;
              
              // Formatar data
              let formattedDate = "Unknown date";
              try {
                const txDate = new Date(tx.purchase_timestamp || tx.timestamp || Date.now());
                formattedDate = txDate.toLocaleDateString() + " " + txDate.toLocaleTimeString();
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
                txHash: tx.transaction_signature || tx.transactionSignature || "",
                claimed: claimed
              };
              
              console.log("Transação formatada:", formattedTransaction);
              formattedTransactions.push(formattedTransaction);
            } catch (txError) {
              console.error(`Erro ao processar transação ${i}:`, txError);
              // Adicionar uma transação de fallback para não quebrar a UI
              formattedTransactions.push({
                id: `error-${i}`,
                name: "Error processing transaction",
                value: 0,
                status: "Error",
                date: new Date().toLocaleString(),
                prizeId: 0,
                isCrypto: false,
                txHash: "",
                claimed: false
              });
            }
          }
        } catch (mapError) {
          console.error("Erro ao mapear transações:", mapError);
        }

        console.log("Transações formatadas final:", formattedTransactions);
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
    if (connected && publicKey) {
      fetchTransactions();
    } else {
      setTransactions([]);
    }
  }, [connected, publicKey]);

  return {
    transactions,
    isLoading,
    error,
    refreshTransactions: fetchTransactions
  };
} 