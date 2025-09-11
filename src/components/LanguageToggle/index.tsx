"use client";
import { motion } from "framer-motion";
import { useLanguage, Language } from "@/contexts/LanguageContext";

interface LanguageToggleProps {
  className?: string;
}

export function LanguageToggle({ className = "" }: LanguageToggleProps) {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    const newLanguage: Language = language === "en" ? "pt" : "en";
    setLanguage(newLanguage);
  };

  return (
    <motion.button
      onClick={toggleLanguage}
      className={`relative w-12 flex items-center h-full rounded-lg border border-none md:border-neutral-6 bg-transparent md:bg-neutral-3 hover:bg-neutral-4 transition-all duration-200 ${className}`}
      whileTap={{ scale: 0.95 }}
      title={language === "en" ? "Switch to Portuguese" : "Mudar para Inglês"}
    >
      <motion.div
        className={`w-5 h-5 rounded-sm overflow-hidden absolute inset-0 m-auto transition-opacity duration-300 ${
          language === "en" ? "opacity-100" : "opacity-0"
        }`}
      >
        <svg viewBox="0 0 24 16" className="w-full h-full">
          <rect width="24" height="16" fill="#B22234" />
          <rect width="24" height="1.23" y="1.23" fill="white" />
          <rect width="24" height="1.23" y="3.69" fill="white" />
          <rect width="24" height="1.23" y="6.15" fill="white" />
          <rect width="24" height="1.23" y="8.61" fill="white" />
          <rect width="24" height="1.23" y="11.07" fill="white" />
          <rect width="24" height="1.23" y="13.53" fill="white" />
          <rect width="9.6" height="8.61" fill="#3C3B6E" />
        </svg>
      </motion.div>

      <motion.div
        className={`w-5 h-5 rounded-sm overflow-hidden absolute inset-0 m-auto transition-opacity duration-300 ${
          language === "pt" ? "opacity-100" : "opacity-0"
        }`}
      >
        <svg viewBox="0 0 24 16" className="w-full h-full">
          <rect width="24" height="16" fill="#009739" />
          <polygon points="12,2 22,8 12,14 2,8" fill="#FEDD00" />
          <circle cx="12" cy="8" r="3" fill="#012169" />
        </svg>
      </motion.div>
    </motion.button>
  );
}
