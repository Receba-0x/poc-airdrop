import { createWeb3Modal } from "@web3modal/wagmi/react";
import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import { bsc, bscTestnet } from "wagmi/chains";
import { QueryClient } from "@tanstack/react-query";
import { cookieStorage, createStorage } from "wagmi";

const queryClient = new QueryClient();

export const projectId = "4ebbf2eddb8738c4c84cd8082b5e9756";

const metadata = {
  name: "Imperador Token",
  description: "Imperador Token - Decentralized Mystery Boxes",
  url: "https://imperadortoken.com",
  icons: ["https://imperadortoken.com/images/logo_token.png"],
};

const chains = [bsc, bscTestnet] as const;

export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
});

createWeb3Modal({
  metadata,
  wagmiConfig: config,
  projectId,
  enableAnalytics: true,
  enableOnramp: true,
  themeMode: "dark",
  themeVariables: {
    "--w3m-accent": "#28D939",
    "--w3m-border-radius-master": "6px",
    "--w3m-font-family": "Inter, sans-serif",
  },
});

export { queryClient };
