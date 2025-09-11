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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../DropDown";
import Image from "next/image";
import { SettingsIcon, UserIcon } from "lucide-react";

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
        <div className="max-w-screen-2xl h-full w-full flex items-center justify-between px-6 md:px-0">
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
                <LogoIcon />
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
                <MoneyIcon /> {user?.balance.toLocaleString("en-US") || 0.0}
              </h1>
              {/*  <div className="flex items-center gap-2">
                <Button variant="default" onClick={() => openModal("deposit")}>
                  Deposit
                </Button>
                <Button variant="outline" onClick={() => openModal("withdraw")}>
                  Withdraw
                </Button>
              </div> */}
              {isAuthenticated && user ? (
                <DropdownMenu
                  modal={false}
                  open={dropdownOpen}
                  onOpenChange={setDropdownOpen}
                >
                  <DropdownMenuTrigger asChild>
                    <button className="relative group">
                      <div className="min-w-12 min-h-12 w-12 h-12 rounded-full overflow-hidden border-2 border-neutral-6 transition-all duration-200 group-hover:border-primary-10">
                        <Image
                          src={user.avatar || "/images/profile.png"}
                          alt="Profile"
                          width={48}
                          height={48}
                          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-neutral-1"></div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-64 bg-neutral-2 border border-neutral-6 shadow-lg mt-1"
                    align="end"
                    sideOffset={8}
                    onCloseAutoFocus={(event: any) => {
                      event.preventDefault();
                    }}
                  >
                    <div className="px-4 py-3 border-b border-neutral-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-neutral-6">
                          <Image
                            src={user.avatar || "/images/profile.png"}
                            alt="Profile"
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-12 truncate">
                            {user.username}
                          </p>
                          <p className="text-xs text-neutral-10 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    <DropdownMenuItem
                      className="px-4 py-3 hover:bg-neutral-3 cursor-pointer transition-colors"
                      onClick={() => push("/profile")}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <UserIcon />
                        <span className="text-sm text-neutral-12">
                          Meu Perfil
                        </span>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="px-4 py-3 hover:bg-neutral-3 cursor-pointer transition-colors"
                      onClick={() => push("/profile#settings")}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <SettingsIcon />
                        <span className="text-sm text-neutral-12">
                          Configurações
                        </span>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="px-4 py-3 hover:bg-neutral-3 cursor-pointer transition-colors"
                      onClick={() => push("/profile#transactions")}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <HistoricIcon />
                        <span className="text-sm text-neutral-12">
                          Transações
                        </span>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-neutral-6" />

                    <DropdownMenuItem
                      className="px-4 py-3 hover:bg-red-50 cursor-pointer transition-colors"
                      onClick={() => logout()}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-5 h-5 flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-red-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                        </div>
                        <span className="text-sm text-red-600 font-medium">
                          Sair
                        </span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
                      className="text-neutral-11 hover:text-neutral-11 transition-colors text-xl py-3 border-b border-[#222222] flex items-center gap-3"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <BoxIcon /> {t("header.boxes")}
                    </Link>
                  </motion.div>

                  <motion.div variants={menuItemVariants}>
                    <Link
                      href="/transactions"
                      className="text-neutral-11 hover:text-neutral-11 transition-colors text-xl py-3 border-b border-[#222222] flex items-center gap-4"
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
                      className="text-neutral-11 hover:text-neutral-11 transition-colors text-xl py-3 border-b border-[#222222] flex items-center gap-4"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <WhitepaperIcon /> {t("header.whitepaper")}
                    </Link>
                  </motion.div>
                </motion.div>

                <motion.div className="flex flex-col gap-4 mt-4 w-full">
                  <motion.div className="w-full" variants={menuItemVariants}>
                    <div className="flex items-center justify-between border-b border-[#222222] pb-3 mb-3">
                      <span className="text-neutral-11 text-sm">
                        {t("common.language")}
                      </span>
                      <LanguageToggle />
                    </div>
                    <Button onClick={() => push("/login")} variant="default">
                      Login
                    </Button>
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
