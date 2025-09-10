"use client";
import type { PropsWithChildren } from "react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/hooks/useAuth";

const Providers = ({ children }: PropsWithChildren) => {
  return (
    <QueryProvider>
      <LanguageProvider>
        <AuthProvider>{children}</AuthProvider>
      </LanguageProvider>
    </QueryProvider>
  );
};

export default Providers;
