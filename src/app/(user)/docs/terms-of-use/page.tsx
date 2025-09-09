"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DocumentRenderer } from "@/components/DocumentRenderer";
import { motion } from "framer-motion";
import extractedDocs from "@/data/extractedDocs.json";
import { ContactSection } from "@/components/ContactSection";

export default function TermsOfUsePage() {
  const { t, language } = useLanguage();

  const documentKey =
    language === "pt"
      ? "termos_de_uso_-_em_português"
      : "terms_of_use_-_in_english";
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
              {t("docs.termsOfUse")}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-400 max-w-3xl mx-auto"
            >
              {language === "pt"
                ? "Termos e condições para uso da plataforma ADR Token"
                : "Terms and conditions for using the ADR Token platform"}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#1A1A1A] border border-[#333333] rounded-xl p-8 mb-16"
          >
            {documentContent && (
              <DocumentRenderer
                htmlContent={documentContent.html}
                className="space-y-6"
              />
            )}
          </motion.div>

          <ContactSection />
        </div>
      </div>
      <Footer />
    </>
  );
}
