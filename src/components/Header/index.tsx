"use client";
import { Button } from "../Button";
import { LogoIcon } from "../Icons/LogoIcon";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BoxIcon } from "../Icons/BoxIcon";
import { HistoricIcon } from "../Icons/HistoricIcon";
import { WhitepaperIcon } from "../Icons/WhitepaperIcon";
import { BurnTicker } from "../BurnTicker";
import { StakingIcon } from "../Icons/StakingIcon";
import { LanguageToggle } from "../LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { WalletConnectButton } from "../WalletConnectButton";
import { useAccount } from "wagmi";
import { useUser } from "@/contexts/UserContext";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 50], [0.8, 1]);
  const { t, language } = useLanguage();
  const { isConnected } = useAccount();
  const { balance } = useUser();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

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

  const buttonVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        delay: 0.3,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  const burgerVariants = {
    closed: {
      rotate: 0,
    },
    open: {
      rotate: 0,
    },
  };

  const topLineVariants = {
    closed: { rotate: 0, translateY: -8, width: 16, x: 4 },
    open: { rotate: 45, translateY: 0, width: 20, x: 0 },
  };

  const middleLineVariants = {
    closed: { opacity: 1, width: 24, x: 0 },
    open: { opacity: 0, width: 0, x: 10 },
  };

  const bottomLineVariants = {
    closed: { rotate: 0, translateY: 8, width: 20, x: 2 },
    open: { rotate: -45, translateY: 0, width: 20, x: 0 },
  };
  const menuItemVariants = {
    closed: { opacity: 0, y: -10, x: 20 },
    open: { opacity: 1, y: 0, x: 0, transition: { duration: 0.4 } },
  };

  const BalanceDisplay = ({ className }: { className?: string }) => {
    if (!isConnected || !balance) return null;

    return (
      <div className={`flex items-center gap-2 text-sm mr-2 ${className}`}>
        <div className="flex items-center text-white">
          <span>
            {balance.toLocaleString("en-US", {
              maximumFractionDigits: 4,
              minimumFractionDigits: 2,
            })}{" "}
            Tokens
          </span>
        </div>
      </div>
    );
  };

  return (
    <>
      <motion.header
        className={`w-full fixed top-0 left-0 z-[99999] h-[56px] md:h-[64px] transition-all duration-300 flex items-center justify-center ${
          scrolled ? "shadow-md" : ""
        }`}
        style={{
          backgroundColor: scrolled ? "rgba(15, 15, 15, 0.7)" : "transparent",
          backdropFilter: scrolled ? "blur(8px)" : "blur(0px)",
          opacity: headerOpacity,
        }}
      >
        <div className="max-w-[1280px] w-full flex items-center justify-between px-6 md:px-0">
          <div className="flex items-center gap-4">
            <motion.div
              className="flex items-center gap-1 md:gap-2 cursor-pointer"
              initial="hidden"
              animate="visible"
              variants={logoVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/">
                <div className="md:flex items-center gap-1 md:gap-2 hidden">
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
                </div>
              </Link>
            </motion.div>

            <div className="hidden lg:flex items-center gap-4 ml-10">
              <motion.nav
                className="flex items-center gap-2"
                initial="hidden"
                animate="visible"
                variants={buttonVariants}
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
                variants={buttonVariants}
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
                variants={buttonVariants}
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

          <div className="hidden md:flex items-center gap-4">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={buttonVariants}
            >
              <LanguageToggle />
            </motion.div>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={buttonVariants}
              className="flex items-center gap-2"
            >
              <WalletConnectButton
                style={{
                  width: "100%",
                  height: "40px",
                  background:
                    "linear-gradient(135deg, #0B3B10 0%, #24682B 100%)",
                  color: "#ADF0B4",
                  fontWeight: "bold",
                  fontSize: "14px",
                  border: "1.5px solid #28D939",
                  borderRadius: "6px",
                  padding: "8px 24px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              />
            </motion.div>
            {/* <motion.div
              initial="hidden"
              animate="visible"
              variants={buttonVariants}
            >
              <Button className="text-sm sm:text-base py-2 px-3 sm:px-4 md:py-2 md:px-6">
                {t("header.buyToken")}
              </Button>
            </motion.div> */}
          </div>
          <motion.div
            className="md:hidden flex items-center z-50"
            initial="hidden"
            animate="visible"
            variants={buttonVariants}
          >
            <motion.button
              className={`flex flex-col items-center justify-center w-10 h-10 rounded-full relative transition-colors ${
                mobileMenuOpen ? "bg-[#28D939]/20" : "hover:bg-[#222222]/50"
              }`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              animate={mobileMenuOpen ? "open" : "closed"}
              variants={burgerVariants}
              whileTap={{ scale: 0.95 }}
              aria-label="Menu"
              role="button"
            >
              <div className="w-8 h-8 flex items-center justify-center relative">
                <motion.span
                  className={`absolute h-[2px] rounded-full ${
                    mobileMenuOpen
                      ? "bg-[#28D939]"
                      : "bg-gradient-to-r from-[#FFF7A8] to-[#FFEB28]"
                  }`}
                  variants={topLineVariants}
                  transition={{ duration: 0.4, ease: [0.6, 0.05, -0.01, 0.9] }}
                  style={{ originX: 0.5 }}
                />
                <motion.span
                  className={`absolute h-[2px] rounded-full ${
                    mobileMenuOpen ? "bg-[#28D939]" : "bg-white"
                  }`}
                  variants={middleLineVariants}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                />
                <motion.span
                  className={`absolute h-[2px] rounded-full ${
                    mobileMenuOpen
                      ? "bg-[#28D939]"
                      : "bg-gradient-to-r from-[#FFEB28] to-[#FFF7A8]"
                  }`}
                  variants={bottomLineVariants}
                  transition={{ duration: 0.4, ease: [0.6, 0.05, -0.01, 0.9] }}
                  style={{ originX: 0.5 }}
                />
              </div>
            </motion.button>
          </motion.div>
        </div>
      </motion.header>
      <BurnTicker />

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-[#0F0F0F]/30 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              className="fixed inset-y-0 right-0 z-40 w-[85%] max-w-[360px] bg-gradient-to-l from-[#0F0F0F] to-[#0F0F0F] pt-20 px-6 shadow-xl border-l border-[#222222]"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
            >
              <motion.div
                className="flex flex-col gap-8 py-6 h-full w-full"
                initial="closed"
                animate="open"
                exit="closed"
                variants={{
                  open: {
                    transition: {
                      staggerChildren: 0.1,
                      delayChildren: 0.1,
                    },
                  },
                  closed: {
                    transition: {
                      staggerChildren: 0.05,
                      staggerDirection: -1,
                    },
                  },
                }}
              >
                <motion.div className="flex flex-col gap-4">
                  <motion.div variants={menuItemVariants}>
                    <Link
                      href="/boxes"
                      className="text-white hover:text-[#28D939] transition-colors text-xl py-3 border-b border-[#222222] flex items-center gap-3"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <BoxIcon /> {t("header.boxes")}
                    </Link>
                  </motion.div>

                  <motion.div variants={menuItemVariants}>
                    <Link
                      href="/transactions"
                      className="text-white hover:text-[#28D939] transition-colors text-xl py-3 border-b border-[#222222] flex items-center gap-4"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <HistoricIcon /> {t("header.historic")}
                    </Link>
                  </motion.div>

                  <motion.div variants={menuItemVariants}>
                    <Link
                      href={`https://adriano-imperador.gitbook.io/${
                        language === "en" ? "en" : "pt-br"
                      }`}
                      target="_blank"
                      className="text-white hover:text-[#28D939] transition-colors text-xl py-3 border-b border-[#222222] flex items-center gap-4"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <WhitepaperIcon /> {t("header.whitepaper")}
                    </Link>
                  </motion.div>
                </motion.div>

                <motion.div className="flex flex-col gap-4 mt-4 w-full">
                  <motion.div className="w-full" variants={menuItemVariants}>
                    <div className="flex items-center justify-between border-b border-[#222222] pb-3 mb-3">
                      <span className="text-white text-sm">
                        {t("common.language")}
                      </span>
                      <LanguageToggle />
                    </div>
                    {isConnected && <BalanceDisplay className="mb-4" />}
                    <WalletConnectButton
                      style={{
                        width: "100%",
                        height: "40px",
                        background:
                          "linear-gradient(135deg, #0B3B10 0%, #24682B 100%)",
                        color: "#ADF0B4",
                        fontWeight: "bold",
                        fontSize: "14px",
                        border: "1.5px solid #28D939",
                        borderRadius: "6px",
                        padding: "8px 24px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                      }}
                    />
                  </motion.div>
                  <motion.div variants={menuItemVariants}>
                    <Button
                      className="w-full py-3 flex items-center justify-center gap-2 h-[40px]"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t("hero.joinCommunity")}
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
