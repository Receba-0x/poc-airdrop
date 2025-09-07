"use client";
import type { PropsWithChildren } from "react";
import { UserProvider } from "@/contexts/UserContext";
import { FloatingTransactionButton } from "../FloatingTransactionButton";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SolanaWalletProvider } from "@/contexts/SolanaWalletContext";
import { Header } from "../Header";
import { Footer } from "../Footer";
import { OnLive } from "../OnLive";
import { TransactionModalsProvider } from "../TransactionModals";

const Providers = ({ children }: PropsWithChildren) => {
  return (
    <LanguageProvider>
      <SolanaWalletProvider>
        <UserProvider>
          <div className="flex flex-col min-h-screen">
            <Header />

            <div className="mt-[64px] md:mt-[80px] mb-12 bg-neutral-2">
              <OnLive />
              {children}
            </div>
            <FloatingTransactionButton />
            <Footer />
          </div>

          {/* Transaction Modals Provider */}
          <TransactionModalsProvider />
        </UserProvider>
      </SolanaWalletProvider>
    </LanguageProvider>
  );
};

export default Providers;
