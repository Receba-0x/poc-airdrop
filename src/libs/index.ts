export * from "./currency";

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

export function clearSolanaWalletCache() {
  try {
    const keysToRemove = [
      // Solana wallet adapter cache keys
      "walletName",
      "autoConnect",
      "sol_balance",
      "sol_price_cache",
      // Phantom wallet specific
      "phantom-encryption-key-pair",
      "phantom-user-account",
      // Solflare wallet specific
      "solflare-wallet",
      // General wallet adapter keys
      "wallet-adapter",
      "solana-wallet-adapter-cache",
    ];

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    // Clear any remaining wallet-related localStorage keys
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && (
        key.includes('wallet') || 
        key.includes('solana') || 
        key.includes('phantom') || 
        key.includes('solflare') ||
        key.includes('backpack') ||
        key.includes('glow')
      )) {
        localStorage.removeItem(key);
      }
    }

    if ("indexedDB" in window) {
      const dbsToDelete = [
        "phantom",
        "solflare",
        "wallet-adapter",
        "solana-wallet-cache",
      ];

      dbsToDelete.forEach((dbName) => {
        const deleteReq = indexedDB.deleteDatabase(dbName);
        deleteReq.onerror = () => console.warn(`Failed to delete ${dbName}`);
      });
    }

    console.log("✅ Cache de wallet Solana limpa com sucesso!");
    return true;
  } catch (error) {
    console.error("❌ Erro ao limpar cache Solana:", error);
    return false;
  }
}

export function clearDynamicWalletCache() {
  try {
    const keysToRemove = [
      // Dynamic wallet cache keys
      "dynamic_wallet_cache",
      "dynamic-labs-wallet",
      "dynamic-labs-auth",
      "dynamic_authentication",
      "sol_balance",
      "sol_price_cache",
      // Common wallet storage keys
      "walletconnect",
      "wallet-adapter",
    ];

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    // Clear any remaining dynamic-related localStorage keys
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && (
        key.includes('dynamic') || 
        key.includes('wallet') || 
        key.includes('solana') || 
        key.includes('auth')
      )) {
        localStorage.removeItem(key);
      }
    }

    if ("indexedDB" in window) {
      const dbsToDelete = [
        "dynamic-labs",
        "wallet-cache",
        "solana-wallet-cache",
      ];

      dbsToDelete.forEach((dbName) => {
        const deleteReq = indexedDB.deleteDatabase(dbName);
        deleteReq.onerror = () => console.warn(`Failed to delete ${dbName}`);
      });
    }

    console.log("✅ Cache de wallet Dynamic limpa com sucesso!");
    return true;
  } catch (error) {
    console.error("❌ Erro ao limpar cache Dynamic:", error);
    return false;
  }
}
