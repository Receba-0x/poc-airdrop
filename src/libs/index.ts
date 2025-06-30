import { ethers } from "ethers";
import { useMemo } from "react";
import type { Account, Chain, Client, Transport } from "viem";
import { type Config, useConnectorClient } from "wagmi";

export * from "./currency";

declare global {
  interface Window {
    ethereum: any;
  }
}

export async function getProvider() {
  if (!window.ethereum) throw new Error("Ethereum provider not found");
  return new ethers.BrowserProvider(window.ethereum);
}

// Ethers v6 adapter for Wagmi v2
export function clientToSigner(client: Client<Transport, Chain, Account>) {
  const { account, chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new ethers.BrowserProvider(transport, network);
  const signer = new ethers.JsonRpcSigner(provider, account.address);
  return signer;
}

/** Hook to convert a viem Wallet Client to an ethers.js Signer using Wagmi. */
export function useEthersSigner({ chainId }: { chainId?: number } = {}) {
  const { data: client } = useConnectorClient<Config>({ chainId });
  return useMemo(() => (client ? clientToSigner(client) : undefined), [client]);
}

// Utility function to clear all wallet connections and cache
export function clearWalletCache() {
  try {
    // Clear localStorage
    const keysToRemove = [
      // WalletConnect keys
      'wc@2:client:0.3//session',
      'wc@2:core:0.3//keychain',
      'wc@2:core:0.3//messages',
      'wc@2:core:0.3//publisher',
      'wc@2:core:0.3//relayer',
      'wc@2:core:0.3//storage',
      'wc@2:universal_provider:/optionalNamespaces',
      'wc@2:universal_provider:/namespaces',
      
      // Web3Modal keys
      '@w3m/wallet_id',
      '@w3m/connected_wallet_image_url',
      '@w3m/connected_wallet_info',
      '@w3m/wallet_connect_deep_link',
      
      // Wagmi keys
      'wagmi.cache',
      'wagmi.store',
      'wagmi.wallet',
      'wagmi.connected',
      
      // App specific keys
      'balance',
      'bnb_price_cache',
      
      // Generic wallet keys
      'walletconnect',
      'WALLET_CONNECT_V2_INDEXED_DB',
    ];

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });

    // Clear sessionStorage
    sessionStorage.clear();

    // Clear IndexedDB databases related to wallets
    if ('indexedDB' in window) {
      const dbsToDelete = [
        'WALLET_CONNECT_V2_INDEXED_DB',
        'wagmiCache',
        'keyvaluestorage'
      ];
      
      dbsToDelete.forEach(dbName => {
        const deleteReq = indexedDB.deleteDatabase(dbName);
        deleteReq.onerror = () => console.warn(`Failed to delete ${dbName}`);
      });
    }

    console.log('✅ Cache de wallet limpa com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao limpar cache:', error);
    return false;
  }
}
