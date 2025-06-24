"use client";
import type { PropsWithChildren } from "react";
import Web3ModalProvider from "./Web3ModalProvider";
import { FloatingTransactionButton } from "../FloatingTransactionButton";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { UserProvider } from "@/contexts/UserContext";

const Providers = ({ children }: PropsWithChildren) => {
  return (
    <LanguageProvider>
      <Web3ModalProvider>
        <UserProvider>
          {children}
          <FloatingTransactionButton />
        </UserProvider>
      </Web3ModalProvider>
    </LanguageProvider>
  );
};

export default Providers;
