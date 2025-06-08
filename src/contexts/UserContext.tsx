"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { PAYMENT_TOKEN_MINT } from '@/constants';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import axios from 'axios';

interface UserContextType {
  balance: number;
  setBalance: (balance: number) => void;
  refreshBalance: () => Promise<void>;
  solanaPrice: number;
  getSolanaPrice: () => Promise<number>;
  refreshTransactions: boolean;
  setRefreshTransactions: (refresh: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const SOLANA_PRICE_CACHE_KEY = 'solana_price_cache';
const SOLANA_PRICE_CACHE_EXPIRY = 1000 * 60 * 15;

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number>(0);
  const [solanaPrice, setSolanaPrice] = useState<number>(0);
  const [refreshTransactions, setRefreshTransactions] = useState<boolean>(false);

  const handleSetBalance = (balance: number) => {
    setBalance(balance);
    localStorage.setItem('balance', balance.toString());
  };

  const loadSolanaPriceFromCache = () => {
    console.log("Tentando carregar preço da Solana do cache");
    const cachedData = localStorage.getItem(SOLANA_PRICE_CACHE_KEY);
    
    if (cachedData) {
      try {
        const { price, timestamp } = JSON.parse(cachedData);
        const now = Date.now();
        
        if (now - timestamp < SOLANA_PRICE_CACHE_EXPIRY) {
          console.log('Usando preço da Solana em cache:', price);
          setSolanaPrice(price);
          return price;
        } else {
          console.log('Cache do preço da Solana expirou');
        }
      } catch (error) {
        console.error('Erro ao ler cache do preço da Solana:', error);
      }
    } else {
      console.log('Nenhum cache de preço da Solana encontrado');
    }
    
    return null;
  };

  async function getSolanaPrice() {
    const cachedPrice = loadSolanaPriceFromCache();
    if (cachedPrice !== null) {
      return cachedPrice;
    }

    try {
      const TOKEN_ID = "solana";
      const { data } = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${TOKEN_ID}&vs_currencies=usd`
      );
      const price = data.solana.usd;
      setSolanaPrice(price);
      localStorage.setItem(
        SOLANA_PRICE_CACHE_KEY,
        JSON.stringify({
          price,
          timestamp: Date.now()
        })
      );
      console.log('Preço da Solana atualizado:', price);
      return price;
    } catch (error) {
      console.error('Erro ao buscar preço da Solana:', error);
      return solanaPrice;
    }
  }

  const getBalance = async () => {
    if (!connected || !publicKey) return;

    try {
      const tokenMint = new PublicKey(PAYMENT_TOKEN_MINT);
      getAssociatedTokenAddress(tokenMint, publicKey)
        .then((tokenAccount) => {
          return connection
            .getTokenAccountBalance(tokenAccount)
            .then((tokenAccountInfo) => {
              setBalance(parseFloat(tokenAccountInfo.value.uiAmount?.toString() || "0"));
            })
            .catch((err) => {
              console.log("Token account may not exist yet:", err);
              setBalance(0);
            });
        })
        .catch((error) => {
          console.error("Error fetching token balance:", error);
          setBalance(0);
        })
    } catch (error) {
      console.error("Invalid token mint address:", error);
      setBalance(0);
    }
  };

  useEffect(() => {
    getBalance();
    const savedBalance = localStorage.getItem('balance');
    if (savedBalance) setBalance(parseFloat(savedBalance));
    
    // Inicializar o preço da Solana no carregamento
    const cachedPrice = loadSolanaPriceFromCache();
    if (cachedPrice === null) {
      console.log("Buscando preço da Solana da API no carregamento inicial");
      getSolanaPrice()
        .then(price => console.log("Preço da Solana inicializado:", price))
        .catch(err => console.error("Erro ao inicializar preço da Solana:", err));
    }
  }, [connected, publicKey]);

  return (
    <UserContext.Provider value={{
      balance,
      setBalance: handleSetBalance,
      refreshBalance: getBalance,
      solanaPrice,
      getSolanaPrice,
      refreshTransactions,
      setRefreshTransactions
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 