"use client";
import { ScrollAnimation } from "../ScrollAnimation";
import { useLanguage } from "@/contexts/LanguageContext";
import Image from "next/image";
import { InstagramIcon } from "../Icons/InstagramIcon";
import { TwitterIcon } from "../Icons/TwitterIcon";
import Link from "next/link";

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
    <footer className="w-full h-[252px] flex flex-col items-center justify-start overflow-hidden bg-neutral-3 border-t border-neutral-6">
      <ScrollAnimation
        type="slide"
        direction="up"
        duration={0.7}
        delay={0.1}
        className="w-full h-full flex items-center justify-between"
      >
        <div className="w-[5%] h-full relative bg-[url('/images/footer_side.png')] bg-cover bg-center overflow-hidden">
          <div
            className={`absolute top-0 left-1/2 -translate-x-1/2 inset-0 bg-primary-10 h-1 w-1/2 rounded-b-xl`}
          />
          <div
            className={`absolute -top-14 left-1/2 -translate-x-1/2 bg-primary-11 w-10 h-20 transition-all duration-500 ease-in-out blur-xl`}
          />
        </div>
        <div className="flex items-center justify-between w-full h-full p-8">
          <div className="flex flex-col items-start justify-between h-full w-1/2">
            <Image
              src="/images/logo_loot.png"
              alt="Logo"
              width={164}
              height={44}
              className="object-cover"
              draggable={false}
            />

            <p>
              Loot4Fun é uma plataforma Web3 de caixas surpresa que combina
              colecionáveis digitais e físicos, com transparência on-chain e
              foco em comunidade.
            </p>

            <div className="flex items-center gap-2">
              <Link href="https://x.com/Loot4Fun" target="_blank">
                <TwitterIcon className="text-white h-6 w-6" />
              </Link>
              <Link href="https://www.instagram.com/loot4fun/" target="_blank">
                <InstagramIcon className="text-white h-6 w-6" />
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 h-full w-1/3">
            <div className="flex flex-col items-center justify-between text-neutral-11 h-full">
              <h1 className="text-neutral-12 font-medium">Plataforma</h1>
              <Link href="/">Home</Link>
              <Link href="/boxes">Boxes</Link>
              <Link href="/leaderboard">Leaderboard</Link>
              <Link href="/affiliates">Affiliates</Link>
            </div>

            <div className="flex flex-col items-center justify-between text-neutral-11 h-full">
              <h1 className="text-neutral-12 font-medium">Recursos</h1>
              <Link href="/docs/privacy">Politic and Privacy</Link>
              <Link href="/docs/terms-of-use">Terms and services</Link>
              <Link href="/docs/refund">Refund</Link>
              <Link href="/docs/cookies">Cookies</Link>
            </div>

            <div className="flex flex-col items-center justify-between text-neutral-11 h-full">
              <h1 className="text-neutral-12 font-medium">Company</h1>
              <Link href="/#about-us">About us</Link>
              <Link href="/#tokenomics">Tokenomics</Link>
              <Link href="/#whitepaper">Whitepaper</Link>
              <Link href="/#gitbook">Gitbook</Link>
            </div>
          </div>
        </div>
        <div className="w-[5%] h-full relative bg-[url('/images/footer_right.png')] bg-cover bg-center overflow-hidden border-l border-neutral-6">
          <div
            className={`absolute top-0 left-1/2 -translate-x-1/2 inset-0 bg-primary-10 h-1 w-1/2 rounded-b-xl`}
          />
          <div
            className={`absolute -top-14 left-1/2 -translate-x-1/2 bg-primary-11 w-10 h-20 transition-all duration-500 ease-in-out blur-xl`}
          />
        </div>
      </ScrollAnimation>
    </footer>
  );
}
