import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

export function ContactSection() {
  const { t, language } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-[#1A1A1A] border border-[#333333] rounded-xl p-8"
    >
      <h3 className="text-xl font-bold mb-4 text-center text-[#28D939]">
        {language === "pt"
          ? "Precisa de Esclarecimentos?"
          : "Need Clarification?"}
      </h3>
      <p className="text-gray-300 text-center mb-6">
        {language === "pt"
          ? "Nossa equipe está disponível para esclarecer dúvidas sobre os Termos de Uso."
          : "Our team is available to clarify any questions about the Terms of Use."}
      </p>
      <div className="flex justify-center space-x-6">
        <a
          href="mailto:suporte@adrianotoken.org"
          className="flex items-center space-x-2 text-[#28D939] hover:text-white transition-colors"
        >
          <span>📧</span>
          <span>suporte@adrianotoken.org</span>
        </a>
        <a
          href="https://adrianotoken.org"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 text-[#28D939] hover:text-white transition-colors"
        >
          <span>🌐</span>
          <span>adrianotoken.org</span>
        </a>
      </div>
    </motion.div>
  );
}
