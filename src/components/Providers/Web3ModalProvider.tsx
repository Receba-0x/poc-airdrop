"use client";

import { ReactNode } from "react";
import { config, queryClient } from "@/libs/web3modal";

import { WagmiProvider } from "wagmi";
import { QueryClientProvider } from "@tanstack/react-query";

export default function Web3ModalProvider({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState?: any;
}) {
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
