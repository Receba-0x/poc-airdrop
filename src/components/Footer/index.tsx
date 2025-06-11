"use client";
import { motion } from "framer-motion";
import { ScrollAnimation } from "../ScrollAnimation";
import { LogoIcon } from "../Icons/LogoIcon";
import { Button } from "../Button";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { TwitterIcon } from "../Icons/TwitterIcon";
import { TelegramIcon } from "../Icons/TelegramIcon";
import { DocumentIcon } from "../Icons/DocumentIcon";

export function Footer() {
  const { t } = useLanguage();

  const logoVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  return (
    <footer className="w-full flex flex-col items-center justify-start py-12 sm:py-16 md:py-24 px-6 md:px-0 overflow-hidden bg-[#0F0F0F]">
      <ScrollAnimation
        type="slide"
        direction="up"
        duration={0.7}
        delay={0.1}
        className="flex flex-col items-center justify-between max-w-[1280px] w-full p-6 sm:p-8 bg-[#191919] rounded-xl"
      >
        <div className="flex w-full items-center justify-between mb-6 sm:mb-8">
          <motion.div
            className="flex items-center gap-1 md:gap-2 cursor-pointer"
            initial="hidden"
            animate="visible"
            variants={logoVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="w-8 h-8 md:w-auto md:h-auto"
              whileHover={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <LogoIcon />
            </motion.div>
            <motion.span
              className="text-white text-base sm:text-lg xl:text-[25px] font-medium"
              whileHover={{
                color: "#28D939",
                transition: { duration: 0.2 },
              }}
            >
              $ADR
            </motion.span>
          </motion.div>

          <div className="flex items-center space-x-4 sm:space-x-6">
            <Link
              href="/boxes"
              className="text-[#EEEEEE] text-xs sm:text-sm lg:text-base font-semibold"
            >
              {t("header.boxes")}
            </Link>
            <Link
              href="/transactions"
              className="text-[#EEEEEE] text-xs sm:text-sm lg:text-base font-semibold hidden md:block"
            >
              {t("header.historic")}
            </Link>
          </div>
        </div>

        <div className="flex w-full items-center justify-between bg-[#3A3A3A] h-[1px] mb-6 sm:mb-8" />

        {/* Social Media Links */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-6 sm:mb-8">
          <motion.a
            href="https://x.com/imperadortoken"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[#EEEEEE] hover:text-[#28D939] transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <TwitterIcon className="w-5 h-5" />
            <span className="text-sm font-medium">{t("footer.twitter")}</span>
          </motion.a>

          <motion.a
            href="https://t.me/imperadortokenofficial"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[#EEEEEE] hover:text-[#28D939] transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <TelegramIcon className="w-5 h-5" />
            <span className="text-sm font-medium">{t("footer.telegram")}</span>
          </motion.a>
        </div>

        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[#BDBDBD] text-xs sm:text-sm text-center sm:text-left">
            © 2025 ADR Token. {t("footer.rights")}{" "}
            <Link
              href="/terms"
              className="text-[#28D939] hover:text-[#28D939] transition-colors duration-200"
            >
              {t("footer.terms")}
            </Link>
          </div>

          <Button className="w-full sm:w-auto py-3 px-4 sm:px-6 text-sm sm:text-base">
            {t("header.buyToken")}
          </Button>
        </div>
      </ScrollAnimation>
    </footer>
  );
}
