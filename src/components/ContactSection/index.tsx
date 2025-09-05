'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

export const ContactSection: React.FC = () => {
  const { language } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-xl p-8 mb-16"
    >
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-6 text-green-400">
          {language === "pt" ? "Precisa de Ajuda?" : "Need Help?"}
        </h3>
        
        <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
          {language === "pt"
            ? "Entre em contato conosco através dos nossos canais oficiais para esclarecimentos sobre documentos legais, políticas ou dúvidas gerais."
            : "Contact us through our official channels for clarification on legal documents, policies, or general questions."}
        </p>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="mailto:adrianoimperadortoken@gmail.com"
              className="flex items-center space-x-3 text-green-400 hover:text-white transition-colors duration-200 bg-green-900/30 hover:bg-green-900/50 px-6 py-3 rounded-lg border border-green-500/30"
            >
              <span className="text-xl">📧</span>
              <span className="font-medium">adrianoimperadortoken@gmail.com</span>
            </a>
          </div>

          <p className="text-gray-400 text-sm">
            {language === "pt"
              ? "Resposta em até 10 dias úteis • Horário comercial: 9h às 18h (UTC-3)"
              : "Response within 10 business days • Business hours: 9am to 6pm (UTC-3)"}
          </p>

          <div className="pt-4 border-t border-green-500/20">
            <p className="text-xs text-gray-500 max-w-lg mx-auto">
              {language === "pt"
                ? "Para questões urgentes relacionadas à segurança ou violações de termos, utilize o e-mail oficial. Não respondemos a solicitações através de redes sociais não oficiais."
                : "For urgent security issues or terms violations, use the official email. We do not respond to requests through unofficial social media."}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
