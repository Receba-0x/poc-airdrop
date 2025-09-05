"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DocumentRenderer } from "@/components/DocumentRenderer";
import { motion } from "framer-motion";
import extractedDocs from "@/data/extractedDocs.json";
import { ContactSection } from "@/components/ContactSection";

export default function IntellectualPropertyPage() {
  const { t, language } = useLanguage();

  const documentKey =
    language === "pt"
      ? "política_de_propriedade_intelectual_-_em_português"
      : "intellectual_property_policy_-_in_english";
  const documentContent =
    extractedDocs[documentKey as keyof typeof extractedDocs];

  return (
    <>
      <Header />
      <div className="min-h-screen text-white pt-20 bg-[#0F0F0F]">
        <div className="container mx-auto px-4 pt-12 max-w-7xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-bold mb-4"
            >
              {t("docs.intellectualProperty")}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-400 max-w-3xl mx-auto"
            >
              {language === "pt"
                ? "Política de proteção de propriedade intelectual, direitos autorais e uso de marcas"
                : "Intellectual property protection policy, copyright and trademark usage"}
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

          {/* Protection Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
          >
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4 text-[#28D939] flex items-center">
                <span className="mr-3">©️</span>
                {language === "pt" ? "Direitos Autorais" : "Copyright"}
              </h3>
              <p className="text-gray-300 text-sm">
                {language === "pt"
                  ? "Todo conteúdo protegido por leis brasileiras e internacionais"
                  : "All content protected by Brazilian and international laws"}
              </p>
            </div>

            <div className="bg-[#1A1A1A] border border-[#333333] rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4 text-[#28D939] flex items-center">
                <span className="mr-3">®️</span>
                {language === "pt" ? "Marcas Registradas" : "Trademarks"}
              </h3>
              <p className="text-gray-300 text-sm">
                {language === "pt"
                  ? "ADR Token e logo são marcas protegidas"
                  : "ADR Token and logo are protected trademarks"}
              </p>
            </div>

            <div className="bg-[#1A1A1A] border border-[#333333] rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4 text-[#28D939] flex items-center">
                <span className="mr-3">🛡️</span>
                {language === "pt" ? "Proteção Legal" : "Legal Protection"}
              </h3>
              <p className="text-gray-300 text-sm">
                {language === "pt"
                  ? "Uso não autorizado pode resultar em ação legal"
                  : "Unauthorized use may result in legal action"}
              </p>
            </div>
          </motion.div>

          {/* DMCA Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl p-8 mb-16"
          >
            <div className="flex items-start space-x-4">
              <span className="text-purple-400 text-2xl">⚖️</span>
              <div>
                <h3 className="text-xl font-bold mb-4 text-purple-400">
                  {language === "pt" ? "Política DMCA" : "DMCA Policy"}
                </h3>
                <div className="space-y-3 text-gray-300">
                  <p>
                    {language === "pt"
                      ? "Respeitamos os direitos de propriedade intelectual de terceiros e esperamos que nossos usuários façam o mesmo."
                      : "We respect the intellectual property rights of others and expect our users to do the same."}
                  </p>
                  <p>
                    {language === "pt"
                      ? "Se você acredita que seu trabalho foi usado indevidamente, entre em contato conosco."
                      : "If you believe your work has been used improperly, please contact us."}
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
