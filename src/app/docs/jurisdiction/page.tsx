"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DocumentRenderer } from "@/components/DocumentRenderer";
import { motion } from "framer-motion";
import extractedDocs from "@/data/extractedDocs.json";
import { ContactSection } from "@/components/ContactSection";

export default function JurisdictionPage() {
  const { t, language } = useLanguage();

  const documentKey =
    language === "pt"
      ? "aviso_de_jurisdição_-_em_português"
      : "jurisdiction_notice_-_in_english";
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
              {t("docs.jurisdictionNotice")}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-400 max-w-3xl mx-auto"
            >
              {language === "pt"
                ? "Informações sobre jurisdição legal, leis aplicáveis e resolução de disputas"
                : "Information about legal jurisdiction, applicable laws and dispute resolution"}
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

          {/* Jurisdiction Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
          >
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 text-[#28D939] flex items-center">
                <span className="mr-3">🇧🇷</span>
                {language === "pt"
                  ? "Jurisdição Principal"
                  : "Primary Jurisdiction"}
              </h3>
              <div className="space-y-3 text-gray-300 text-sm">
                <p>
                  {language === "pt"
                    ? "República Federativa do Brasil"
                    : "Federative Republic of Brazil"}
                </p>
                <p>
                  {language === "pt"
                    ? "Foro: Rio de Janeiro, RJ"
                    : "Jurisdiction: Rio de Janeiro, RJ"}
                </p>
                <p>
                  {language === "pt"
                    ? "Leis brasileiras aplicáveis"
                    : "Brazilian laws applicable"}
                </p>
              </div>
            </div>

            <div className="bg-[#1A1A1A] border border-[#333333] rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 text-[#28D939] flex items-center">
                <span className="mr-3">⚖️</span>
                {language === "pt"
                  ? "Responsabilidade do Usuário"
                  : "User Responsibility"}
              </h3>
              <div className="space-y-3 text-gray-300 text-sm">
                <p>
                  {language === "pt"
                    ? "Verificar leis locais de seu país"
                    : "Check local laws in your country"}
                </p>
                <p>
                  {language === "pt"
                    ? "Conformidade regulatória local"
                    : "Local regulatory compliance"}
                </p>
                <p>
                  {language === "pt"
                    ? "Restrições podem se aplicar"
                    : "Restrictions may apply"}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Legal Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-500/30 rounded-xl p-8 mb-16"
          >
            <div className="flex items-start space-x-4">
              <span className="text-blue-400 text-2xl">📍</span>
              <div>
                <h3 className="text-xl font-bold mb-4 text-blue-400">
                  {language === "pt"
                    ? "Importante sobre Jurisdição"
                    : "Important about Jurisdiction"}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {language === "pt"
                    ? "Este projeto opera sob as leis brasileiras. Usuários internacionais devem verificar se o uso do ADR Token é permitido em suas jurisdições locais. Não nos responsabilizamos por restrições legais fora do Brasil."
                    : "This project operates under Brazilian laws. International users must verify if ADR Token usage is permitted in their local jurisdictions. We are not responsible for legal restrictions outside Brazil."}
                </p>
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
