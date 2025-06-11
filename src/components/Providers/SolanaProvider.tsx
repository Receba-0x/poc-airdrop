"use client";
import { FC, ReactNode, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  LedgerWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  AlphaWalletAdapter,
  BitgetWalletAdapter,
  Coin98WalletAdapter,
  CoinbaseWalletAdapter,
  HuobiWalletAdapter,
  MathWalletAdapter,
  TokenPocketWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import "@solana/wallet-adapter-react-ui/styles.css";

interface SolanaProviderProps {
  children: ReactNode;
}

const SolanaProvider: FC<SolanaProviderProps> = ({ children }) => {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const appMetadata = {
    name: "ADR Token",
    icon: "https://adrtoken.xyz/icon.png",
    uri: "https://adrtoken.xyz",
  };
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter({ appMetadata }),
      new AlphaWalletAdapter({ appMetadata }),
      new SolflareWalletAdapter({ network }),
      new LedgerWalletAdapter(),
      new BitgetWalletAdapter({ appMetadata }),
      new MathWalletAdapter({ appMetadata }),
      new Coin98WalletAdapter({ appMetadata }),
      new CoinbaseWalletAdapter({ appMetadata }),
      new HuobiWalletAdapter({ appMetadata }),
      new TokenPocketWalletAdapter({ appMetadata }),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default SolanaProvider;
