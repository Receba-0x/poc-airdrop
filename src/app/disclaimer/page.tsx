"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DocumentRenderer } from "@/components/DocumentRenderer";
import { motion } from "framer-motion";
import extractedDocs from "@/data/extractedDocs.json";
import { ContactSection } from "@/components/ContactSection";

export default function DisclaimerPage() {
  const { t, language } = useLanguage();

  const documentKey =
    language === "pt"
      ? "disclaimer_legal_-_em_português"
      : "legal_disclaimer_-_in_english";
  const documentContent =
    extractedDocs[documentKey as keyof typeof extractedDocs];

  return (
    <>
      <Header />
      <div className="min-h-screen text-white pt-20 bg-[#0F0F0F]">
        <div className="container mx-auto pt-12 max-w-7xl">
          <div className="text-center mb-16">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-bold mb-4"
            >
              {t("docs.legalDisclaimer")}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-400 max-w-3xl mx-auto"
            >
              {language === "pt"
                ? "Aviso legal importante sobre o uso da plataforma ADR Token e limitações de responsabilidade"
                : "Important legal notice regarding the use of the ADR Token platform and liability limitations"}
            </motion.p>
          </div>

          {/* Document Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#1A1A1A] border border-[#333333] rounded-xl p-8 mb-16"
          >
            <h2 className="text-3xl font-bold mb-8 text-center border-b border-[#333333] pb-4">
              {language === "pt" ? "Documento Completo" : "Complete Document"}
            </h2>

            {documentContent && (
              <DocumentRenderer
                htmlContent={documentContent.html}
                className="space-y-6"
              />
            )}
          </motion.div>

          {/* Risk Warning */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/30 rounded-xl p-8 mb-16"
          >
            <div className="flex items-start space-x-4">
              <span className="text-red-400 text-2xl">⚠️</span>
              <div>
                <h3 className="text-xl font-bold mb-4 text-red-400">
                  {language === "pt"
                    ? "Aviso Importante de Riscos"
                    : "Important Risk Warning"}
                </h3>
                <div className="space-y-3 text-gray-300">
                  <p>
                    {language === "pt"
                      ? "O ADR Token é um token utilitário e comunitário. Não é um investimento ou garantia de retorno financeiro."
                      : "ADR Token is a utility and community token. It is not an investment or guarantee of financial return."}
                  </p>
                  <p>
                    {language === "pt"
                      ? "Interações com blockchain envolvem riscos tecnológicos, regulatórios e de mercado."
                      : "Blockchain interactions involve technological, regulatory, and market risks."}
                  </p>
                  <p className="font-semibold text-red-400">
                    {language === "pt"
                      ? "Sempre consulte um profissional qualificado antes de tomar decisões."
                      : "Always consult a qualified professional before making decisions."}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <ContactSection />
        </div>
      </div>
      <Footer />
    </>
  );
}
