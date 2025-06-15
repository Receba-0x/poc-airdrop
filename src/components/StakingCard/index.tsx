import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StakeContent } from "./StakeContent";
import { UnstakeContent } from "./UnstakeContent";
import { useLanguage } from "@/contexts/LanguageContext";

export function StakingCard() {
  const [activeTab, setActiveTab] = useState<"stake" | "unstake">("stake");
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-[#FFD60A] to-[#0f0f0f00] to-70% rounded-xl p-[2px] w-full max-w-[624px] mx-auto"
    >
      <div className="flex flex-col bg-[#0F0F0F] rounded-xl p-4 sm:p-6 md:p-8 w-full h-full text-white">
        <div className="bg-[#1A1A1A] p-1 rounded-lg mb-6 sm:mb-8 self-center w-full max-w-sm sm:max-w-md">
          <motion.div className="flex relative w-full">
            <motion.div
              className="absolute bg-[#313131] h-full rounded-md transition-all duration-200"
              initial={false}
              animate={{
                width: "50%",
                x: activeTab === "stake" ? "0%" : "100%",
              }}
            />
            <motion.button
              onClick={() => setActiveTab("stake")}
              className={`relative z-10 px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-md text-sm font-medium transition-colors duration-200 w-full ${
                activeTab === "stake" ? "text-white" : "text-gray-400"
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {t("staking.stake")}
            </motion.button>
            <motion.button
              onClick={() => setActiveTab("unstake")}
              className={`relative z-10 px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-md text-sm font-medium transition-colors duration-200 w-full ${
                activeTab === "unstake" ? "text-white" : "text-gray-400"
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {t("staking.unstake")}
            </motion.button>
          </motion.div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === "stake" ? (
            <motion.div
              key="stake"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <StakeContent />
            </motion.div>
          ) : (
            <motion.div
              key="unstake"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <UnstakeContent />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
