"use client";
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useAccount } from "wagmi";
import { getProvider } from "@/libs";
import { ERC20__factory } from "@/contracts";
import { adrTokenAddress } from "@/constants";
import { ethers } from "ethers";

interface UserContextType {
  balance: number;
  setBalance: (balance: number) => void;
  refreshBalance: () => Promise<void>;
  bnbPrice: number;
  getBNBPrice: () => Promise<number>;
  refreshTransactions: boolean;
  setRefreshTransactions: (refresh: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const BNB_CACHE_KEY = "bnb_price_cache";
const BNB_PRICE_CACHE_EXPIRY = 1000 * 60 * 15;

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [balance, setBalance] = useState<number>(0);
  const [bnbPrice, setBnbPrice] = useState<number>(0);
  const { address, isConnected } = useAccount();
  const [refreshTransactions, setRefreshTransactions] =
    useState<boolean>(false);

  const handleSetBalance = (balance: number) => {
    setBalance(balance);
    localStorage.setItem("balance", balance.toString());
  };

  const loadBnbPriceFromCache = () => {
    const cachedData = localStorage.getItem(BNB_CACHE_KEY);
    if (cachedData) {
      try {
        const { price, timestamp } = JSON.parse(cachedData);
        const now = Date.now();
        if (now - timestamp < BNB_PRICE_CACHE_EXPIRY) {
          setBnbPrice(price);
          return price;
        }
      } catch (error) {
        console.error("Erro ao ler cache do preço da BNB:", error);
      }
    }
    return null;
  };

  async function getBNBPrice() {
    const cachedPrice = loadBnbPriceFromCache();
    if (cachedPrice !== null) return cachedPrice;

    try {
      const TOKEN_ID = "binancecoin";
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${TOKEN_ID}&vs_currencies=usd`;
      const { data } = await axios.get(url);
      const price = data.binancecoin.usd;
      setBnbPrice(price);
      localStorage.setItem(
        BNB_CACHE_KEY,
        JSON.stringify({ price, timestamp: Date.now() })
      );
      return price;
    } catch (error) {
      console.error("Erro ao buscar preço da BNB:", error);
      return bnbPrice;
    }
  }

  const getBalance = async () => {
    if (!isConnected || !address) return;
    try {
      const provider = await getProvider();
      const signer = await provider.getSigner();
      const tokenContract = ERC20__factory.connect(adrTokenAddress, signer);
      const balance = await tokenContract.balanceOf(address);
      const balanceFormatted = ethers.formatEther(balance);
      setBalance(Number(balanceFormatted));
    } catch (error) {
      console.error("Invalid token mint address:", error);
      setBalance(0);
    }
  };

  useEffect(() => {
    getBalance();
    const savedBalance = localStorage.getItem("balance");
    if (savedBalance) setBalance(parseFloat(savedBalance));
    const cachedPrice = loadBnbPriceFromCache();
    if (cachedPrice === null) {
      getBNBPrice().catch((err) =>
        console.error("Erro ao inicializar preço da BNB:", err)
      );
    }
  }, [isConnected, address]);

  return (
    <UserContext.Provider
      value={{
        balance,
        setBalance: handleSetBalance,
        refreshBalance: getBalance,
        bnbPrice,
        getBNBPrice,
        refreshTransactions,
        setRefreshTransactions,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
