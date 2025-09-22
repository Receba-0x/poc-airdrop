"use client";
import { Button } from "../Button";
import { LogoIcon } from "../Icons/LogoIcon";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BoxIcon } from "../Icons/BoxIcon";
import { HistoricIcon } from "../Icons/HistoricIcon";
import { WhitepaperIcon } from "../Icons/WhitepaperIcon";
import { LanguageToggle } from "../LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { LeaderBoardIcon } from "../Icons/LeaderBoardIcon";
import { HomeIcon } from "../Icons/HomeIcon";
import { MoneyIcon } from "../Icons/MoneyIcon";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { HeaderAvatar } from "../HeaderAvatar";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { t, language } = useLanguage();
  const { push } = useRouter();
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (dropdownOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "auto";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [dropdownOpen]);

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
    closed: { rotate: 0 },
    open: { rotate: 0 },
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

  const links = [
    {
      href: "/",
      label: t("header.home"),
      key: "home",
      icon: <HomeIcon />,
    },
    {
      href: "/boxes",
      label: t("header.boxes"),
      key: "boxes",
      icon: <BoxIcon />,
    },
    {
      href: "/leaderboard",
      label: t("header.leaderboard"),
      key: "leaderboard",
      icon: <LeaderBoardIcon />,
    },
    {
      href: "/profile#transactions",
      label: t("header.transactions"),
      key: "transactions",
      icon: <WhitepaperIcon />,
    },
  ];

  return (
    <>
      <motion.header
        className={`w-full fixed top-0 left-0 p-[14px] px-6 z-[100] h-[64px] md:h-[72px] border-b transition-all duration-300 flex items-center justify-center bg-neutral-2 ${
          scrolled ? "shadow-md border-neutral-6" : "border-transparent"
        }`}
      >
        <div className="max-w-screen-2xl h-full w-full flex items-center justify-between md:px-0">
          <div className="flex items-center gap-4">
            <Link href="/">
              <motion.div
                className="flex items-center gap-1 md:gap-2 cursor-pointer"
                initial="hidden"
                animate="visible"
                variants={logoVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogoIcon className="w-10 h-10" />
              </motion.div>
            </Link>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={buttonVariants}
              className="hidden lg:flex items-center ml-6 text-neutral-11"
            >
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center text-sm gap-2 p-2 fill-neutral-11 hover:fill-primary-12 hover:bg-primary-3 hover:text-primary-12 border border-transparent hover:border-primary-6 rounded-md transition-all duration-300"
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </motion.div>
          </div>

          <div className="hidden md:flex items-center h-full gap-2">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={buttonVariants}
              className="h-full rounded-lg"
            >
              <LanguageToggle />
            </motion.div>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={buttonVariants}
              className="flex items-center gap-2 h-full rounded-lg"
            >
              <h1 className="text-neutral-12 rounded-lg border border-neutral-6 bg-neutral-3 hover:bg-neutral-4 h-full px-2 flex items-center gap-1">
                <MoneyIcon /> {user?.balance?.toLocaleString("en-US") || 0.0}
              </h1>
              {isAuthenticated && user ? (
                <HeaderAvatar
                  user={user}
                  dropdownOpen={dropdownOpen}
                  setDropdownOpen={setDropdownOpen}
                  push={push}
                  logout={logout}
                />
              ) : (
                <Button
                  onClick={() => push("/login")}
                  variant="default"
                  className="h-full"
                >
                  Login
                </Button>
              )}
            </motion.div>
          </div>
          <motion.div
            className="md:hidden flex items-center z-50"
            initial="hidden"
            animate="visible"
            variants={buttonVariants}
          >
            <motion.button
              className={`flex flex-col items-center justify-center w-10 h-10 rounded-full relative transition-colors ${
                mobileMenuOpen ? "bg-primary-10/20" : "hover:bg-neutral-6/50"
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
                      ? "bg-primary-10"
                      : "bg-gradient-to-r from-primary-2 to-primary-10"
                  }`}
                  variants={topLineVariants}
                  transition={{ duration: 0.4, ease: [0.6, 0.05, -0.01, 0.9] }}
                  style={{ originX: 0.5 }}
                />
                <motion.span
                  className={`absolute h-[2px] rounded-full ${
                    mobileMenuOpen
                      ? "bg-primary-10"
                      : "bg-gradient-to-r from-primary-2 to-primary-10"
                  }`}
                  variants={middleLineVariants}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                />
                <motion.span
                  className={`absolute h-[2px] rounded-full ${
                    mobileMenuOpen
                      ? "bg-primary-10"
                      : "bg-gradient-to-r from-primary-2 to-primary-10"
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

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-neutral-2/30 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              className="fixed inset-y-0 right-0 z-40 w-[85%] max-w-[360px] bg-gradient-to-l from-neutral-2 to-neutral-2 pt-20 px-6 shadow-xl border-l border-neutral-6"
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
                  {links.map((link) => (
                    <motion.div key={link.href} variants={menuItemVariants}>
                      <Link
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-4 text-neutral-11 hover:text-neutral-11 transition-colors text-xl py-3 border-b border-neutral-6"
                      >
                        {link.icon} {link.label}
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div className="flex flex-col gap-4 mt-4 w-full">
                  <motion.div className="w-full" variants={menuItemVariants}>
                    <div className="flex items-center justify-between border-b border-neutral-6 pb-3 mb-3">
                      <span className="text-neutral-11 text-sm">
                        {t("common.language")}
                      </span>
                      <LanguageToggle />
                    </div>
                    {isAuthenticated && user ? (
                      <HeaderAvatar
                        user={user}
                        dropdownOpen={dropdownOpen}
                        setDropdownOpen={setDropdownOpen}
                        push={push}
                        setMobileMenuOpen={setMobileMenuOpen}
                        logout={logout}
                      />
                    ) : (
                      <Button
                        onClick={() => push("/login")}
                        variant="default"
                        className="w-full"
                      >
                        Login
                      </Button>
                    )}
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
