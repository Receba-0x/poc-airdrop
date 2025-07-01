"use client";
import { useState, useRef } from "react";
import BoxCard from "@/components/BoxCard";
import { motion, useInView } from "framer-motion";
import { Header } from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";
const boxData = [
  {
    id: "cryptos",
    title: "Cryptos",
    image: "/images/boxes/cripto.webp",
  },
  {
    id: "super",
    title: "Super prizes",
    image: "/images/boxes/super-prize.webp",
  },
];

export default function BoxesPage() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.1 });
  const { t } = useLanguage();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const bannerVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#0F0F0F] text-white pb-24 w-full">
      <Header />
      <div className="container w-full py-8 md:pt-[80px] mt-[80px] max-w-[1280px] md:mt-20 px-6 md:px-0">
        <motion.div
          className='bg-[url("/images/banner.png")] md:bg-[url("/images/banner.png")] bg-cover bg-no-repeat h-[220px] sm:h-[320px] rounded-xl mb-8'
          variants={bannerVariants}
          initial="hidden"
          animate="visible"
        />

        <motion.div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold">{t("boxes.title")}</h2>
        </motion.div>

        <motion.div
          ref={containerRef}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {boxData.map((box) => (
            <motion.div key={box.id} variants={itemVariants}>
              <BoxCard box={box} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
