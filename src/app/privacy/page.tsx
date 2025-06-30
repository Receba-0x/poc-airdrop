"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DocumentRenderer } from "@/components/DocumentRenderer";
import { motion } from "framer-motion";
import extractedDocs from "@/data/extractedDocs.json";
import { ContactSection } from "@/components/ContactSection";

export default function PrivacyPage() {
  const { t, language } = useLanguage();

  const documentKey =
    language === "pt"
      ? "política_de_privacidade_-_em_português"
      : "privacy_policy_-_in_english";
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
              {t("docs.privacyPolicy")}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-400 max-w-3xl mx-auto"
            >
              {language === "pt"
                ? "Como coletamos, usamos e protegemos suas informações pessoais em conformidade com a LGPD e GDPR"
                : "How we collect, use and protect your personal information in compliance with LGPD and GDPR"}
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
              {language === "pt" ? "Política Completa" : "Complete Policy"}
            </h2>

            {documentContent && (
              <DocumentRenderer
                htmlContent={documentContent.html}
                className="space-y-6"
              />
            )}
          </motion.div>

          {/* Data Protection Rights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
          >
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 text-[#28D939]">
                {language === "pt"
                  ? "Seus Direitos (LGPD)"
                  : "Your Rights (LGPD)"}
              </h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-[#28D939] mt-1">•</span>
                  {language === "pt"
                    ? "Acesso aos seus dados"
                    : "Access to your data"}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#28D939] mt-1">•</span>
                  {language === "pt"
                    ? "Correção de dados inexatos"
                    : "Correction of inaccurate data"}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#28D939] mt-1">•</span>
                  {language === "pt" ? "Exclusão de dados" : "Data deletion"}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#28D939] mt-1">•</span>
                  {language === "pt"
                    ? "Revogação do consentimento"
                    : "Consent withdrawal"}
                </li>
              </ul>
            </div>

            <div className="bg-[#1A1A1A] border border-[#333333] rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 text-[#28D939]">
                {language === "pt"
                  ? "Como Exercer Seus Direitos"
                  : "How to Exercise Your Rights"}
              </h3>
              <p className="text-gray-300 text-sm mb-4">
                {language === "pt"
                  ? "Entre em contato conosco através dos canais oficiais:"
                  : "Contact us through our official channels:"}
              </p>
              <div className="space-y-2">
                <a
                  href="mailto:privacidade@adrianotoken.org"
                  className="flex items-center space-x-2 text-[#28D939] hover:text-white transition-colors text-sm"
                >
                  <span>📧</span>
                  <span>privacidade@adrianotoken.org</span>
                </a>
                <p className="text-gray-400 text-xs">
                  {language === "pt"
                    ? "Resposta em até 10 dias úteis"
                    : "Response within 10 business days"}
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
