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
    <footer className="w-full flex flex-col items-center justify-start p-4 py-8 overflow-hidden bg-neutral-3 border-t border-neutral-6">
      <ScrollAnimation
        type="slide"
        direction="up"
        duration={0.7}
        delay={0.1}
        className="w-full"
      >
        <div className="grid grid-cols-3 gap-4 max-w-[1280px] mx-auto w-full bg-neutral-3 rounded-xl">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="bg-neutral-2 rounded-xl p-4 h-[190px] w-full flex flex-col"
            ></div>
          ))}
        </div>
      </ScrollAnimation>
    </footer>
  );
}
