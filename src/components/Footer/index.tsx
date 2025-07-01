"use client";
import { motion } from "framer-motion";
import { ScrollAnimation } from "../ScrollAnimation";
import { LogoIcon } from "../Icons/LogoIcon";
import { Button } from "../Button";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { TwitterIcon } from "../Icons/TwitterIcon";
import { TelegramIcon } from "../Icons/TelegramIcon";
import { BoxIcon } from "../Icons/BoxIcon";
import { HistoricIcon } from "../Icons/HistoricIcon";
import { WhitepaperIcon } from "../Icons/WhitepaperIcon";

export function Footer() {
  const { t, language } = useLanguage();

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
              Imperador Token
            </motion.span>
          </motion.div>

          <div className="hidden lg:flex items-center gap-4 ml-10">
            <motion.nav
              className="flex items-center gap-2"
              initial="hidden"
              animate="visible"
            >
              <Link
                href="/boxes"
                className="text-white hover:text-[#28D939] transition-colors flex items-center gap-2"
              >
                <BoxIcon /> {t("header.boxes")}
              </Link>
            </motion.nav>

            <motion.nav
              className="flex items-center gap-6"
              initial="hidden"
              animate="visible"
            >
              <Link
                href="/transactions"
                className="text-white hover:text-[#28D939] transition-colors flex items-center gap-2"
              >
                <HistoricIcon /> {t("header.historic")}
              </Link>
            </motion.nav>

            <motion.nav
              className="flex items-center gap-6"
              initial="hidden"
              animate="visible"
            >
              <Link
                href={`https://adriano-imperador.gitbook.io/${
                  language === "en" ? "en" : "pt-br"
                }`}
                target="_blank"
                className="text-white hover:text-[#28D939] transition-colors flex items-center gap-2"
              >
                <WhitepaperIcon /> {t("header.whitepaper")}
              </Link>
            </motion.nav>
          </div>
        </div>

        <div className="flex w-full items-center justify-between bg-[#3A3A3A] h-[1px] mb-6 sm:mb-8" />

        <div className="w-full mb-6 sm:mb-8">
          <div className="flex items-center w-full justify-center gap-4 text-center">
            <Link
              href="/terms-of-use"
              className="text-[#BDBDBD] hover:text-[#28D939] transition-colors duration-200 text-sm font-medium"
            >
              {t("footer.terms")}
            </Link>
            <Link
              href="/privacy"
              className="text-[#BDBDBD] hover:text-[#28D939] transition-colors duration-200 text-sm font-medium"
            >
              {t("footer.privacy")}
            </Link>
            <Link
              href="/disclaimer"
              className="text-[#BDBDBD] hover:text-[#28D939] transition-colors duration-200 text-sm font-medium"
            >
              {t("footer.disclaimer")}
            </Link>
            <Link
              href="/jurisdiction"
              className="text-[#BDBDBD] hover:text-[#28D939] transition-colors duration-200 text-sm font-medium"
            >
              {t("footer.jurisdiction")}
            </Link>
            <Link
              href="/intellectual-property"
              className="text-[#BDBDBD] hover:text-[#28D939] transition-colors duration-200 text-sm font-medium"
            >
              {t("footer.intellectualProperty")}
            </Link>
          </div>
        </div>

        <div className="flex w-full items-center justify-between bg-[#3A3A3A] h-[1px] mb-6 sm:mb-8" />

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
            href="https://t.me/imperadorcoin"
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
            © 2025 Imperador Token. {t("footer.rights")}
          </div>

          <Link href="https://t.me/imperadorcoin" target="_blank">
            <Button className="w-full sm:w-auto py-3 px-4 sm:px-6 text-sm sm:text-base">
              {t("hero.joinCommunity")}
            </Button>
          </Link>
        </div>
      </ScrollAnimation>
    </footer>
  );
}
