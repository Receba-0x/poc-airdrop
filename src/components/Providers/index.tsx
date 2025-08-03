"use client";
import type { PropsWithChildren } from "react";
import { UserProvider } from "@/contexts/UserContext";
import { FloatingTransactionButton } from "../FloatingTransactionButton";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SolanaWalletProvider } from "@/contexts/SolanaWalletContext";

const Providers = ({ children }: PropsWithChildren) => {
  return (
    <LanguageProvider>
      <SolanaWalletProvider>
        <UserProvider>
          {children}
          <FloatingTransactionButton />
        </UserProvider>
      </SolanaWalletProvider>
    </LanguageProvider>
  );
};

export default Providers;
