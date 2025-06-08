"use client";
import type { PropsWithChildren } from "react";
import SolanaProvider from "./SolanaProvider";
import { FloatingTransactionButton } from "../FloatingTransactionButton";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { UserProvider } from "@/contexts/UserContext";

const Providers = ({ children }: PropsWithChildren) => {
  return (
    <LanguageProvider>
      <SolanaProvider>
        <UserProvider>
          {children}
          <FloatingTransactionButton />
        </UserProvider>
      </SolanaProvider>
    </LanguageProvider>
  );
};

export default Providers;
