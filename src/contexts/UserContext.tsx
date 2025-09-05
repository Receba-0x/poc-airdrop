"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { PAYMENT_TOKEN_MINT } from "@/constants";
import { getAssociatedTokenAddress } from "@solana/spl-token";

interface UserContextType {
  balance: number;
  setBalance: (balance: number) => void;
  solPrice: number;
  setSolPrice: (price: number) => void;
  publicKey: string | null;
  isConnected: boolean;
  refreshBalance: () => void;
  refreshTransactions: boolean;
  setRefreshTransactions: (refresh: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const SOL_CACHE_KEY = "sol_price_cache";
const PRICE_CACHE_EXPIRY = 1000 * 60 * 15;

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [balance, setBalance] = useState<number>(0);
  const [solPrice, setSolPrice] = useState<number>(0);
  const [refreshTransactions, setRefreshTransactions] =
    useState<boolean>(false);

  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();

  const handleSetBalance = (balance: number) => {
    setBalance(balance);
    localStorage.setItem("sol_balance", balance.toString());
  };

  const getBalance = async () => {
    if (!connected || !publicKey) return;
    try {
      const tokenMint = new PublicKey(PAYMENT_TOKEN_MINT);
      getAssociatedTokenAddress(tokenMint, publicKey)
        .then((tokenAccount: any) => {
          return connection
            .getTokenAccountBalance(tokenAccount)
            .then((tokenAccountInfo: any) => {
              setBalance(
                parseFloat(tokenAccountInfo.value.uiAmount?.toString() || "0")
              );
            })
            .catch((err) => {
              console.log("Token account may not exist yet:", err);
              setBalance(0);
            });
        })
        .catch((error) => {
          console.error("Error fetching token balance:", error);
          setBalance(0);
        });
    } catch (error) {
      console.error("Invalid token mint address:", error);
      setBalance(0);
    }
  };

  useEffect(() => {
    if (!publicKey || !connected) {
      setBalance(0);
      return;
    }
    getBalance();
    const interval = setInterval(getBalance, 30000);

    return () => clearInterval(interval);
  }, [publicKey, connected, connection]);

  const loadSolPriceFromCache = () => {
    try {
      const cached = localStorage.getItem(SOL_CACHE_KEY);
      if (cached) {
        const { price, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < PRICE_CACHE_EXPIRY) {
          setSolPrice(price);
          return true;
        }
      }
    } catch (error) {
      console.warn("Error loading cached SOL price:", error);
    }
    return false;
  };

  const fetchSolPrice = async () => {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
      );
      const data = await response.json();
      const price = data.solana.usd;
      setSolPrice(price);
      localStorage.setItem(
        SOL_CACHE_KEY,
        JSON.stringify({ price, timestamp: Date.now() })
      );
    } catch (error) {
      console.error("Error fetching SOL price:", error);
    }
  };

  useEffect(() => {
    if (!loadSolPriceFromCache()) {
      fetchSolPrice();
    } else {
      setTimeout(fetchSolPrice, 1000);
    }

    const interval = setInterval(fetchSolPrice, PRICE_CACHE_EXPIRY);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const cachedBalance = localStorage.getItem("sol_balance");
    if (cachedBalance) {
      setBalance(parseFloat(cachedBalance));
    }
  }, []);

  const value: UserContextType = {
    balance,
    setBalance: handleSetBalance,
    solPrice,
    setSolPrice,
    publicKey: publicKey?.toString() || null,
    isConnected: connected,
    refreshBalance: getBalance,
    refreshTransactions,
    setRefreshTransactions,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
