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

export function useEthersSigner({ chainId }: { chainId?: number } = {}) {
  const { data: client } = useConnectorClient<Config>({ chainId });
  return useMemo(() => (client ? clientToSigner(client) : undefined), [client]);
}

export function clearWalletCache() {
  try {
    const keysToRemove = [
      "wc@2:client:0.3//session",
      "wc@2:core:0.3//keychain",
      "wc@2:core:0.3//messages",
      "wc@2:core:0.3//publisher",
      "wc@2:core:0.3//relayer",
      "wc@2:core:0.3//storage",
      "wc@2:universal_provider:/optionalNamespaces",
      "wc@2:universal_provider:/namespaces",
      "@w3m/wallet_id",
      "@w3m/connected_wallet_image_url",
      "@w3m/connected_wallet_info",
      "@w3m/wallet_connect_deep_link",
      "wagmi.cache",
      "wagmi.store",
      "wagmi.wallet",
      "wagmi.connected",
      "balance",
      "bnb_price_cache",
      "walletconnect",
      "WALLET_CONNECT_V2_INDEXED_DB",
    ];

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });
    sessionStorage.clear();
    if ("indexedDB" in window) {
      const dbsToDelete = [
        "WALLET_CONNECT_V2_INDEXED_DB",
        "wagmiCache",
        "keyvaluestorage",
      ];

      dbsToDelete.forEach((dbName) => {
        const deleteReq = indexedDB.deleteDatabase(dbName);
        deleteReq.onerror = () => console.warn(`Failed to delete ${dbName}`);
      });
    }

    console.log("✅ Cache de wallet limpa com sucesso!");
    return true;
  } catch (error) {
    console.error("❌ Erro ao limpar cache:", error);
    return false;
  }
}
