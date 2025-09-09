"use client";
import type { PropsWithChildren } from "react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SolanaWalletProvider } from "@/contexts/SolanaWalletContext";
import { QueryProvider } from "@/providers/QueryProvider";
import { ModalsProvider } from "../TransactionModals";
import { AuthProvider } from "@/hooks/useAuth";

const Providers = ({ children }: PropsWithChildren) => {
  return (
    <QueryProvider>
      <LanguageProvider>
        <AuthProvider>
          {children}
          <ModalsProvider />
        </AuthProvider>
      </LanguageProvider>
    </QueryProvider>
  );
};

export default Providers;
