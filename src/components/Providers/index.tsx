"use client";
import type { PropsWithChildren } from "react";
import SolanaProvider from "./SolanaProvider";
import { FloatingTransactionButton } from "../FloatingTransactionButton";
import { LanguageProvider } from "@/contexts/LanguageContext";

const Providers = ({ children }: PropsWithChildren) => {
  return (
    <LanguageProvider>
      <SolanaProvider>
        {children} 
        <FloatingTransactionButton />
      </SolanaProvider>
    </LanguageProvider>
  );
};

export default Providers;
