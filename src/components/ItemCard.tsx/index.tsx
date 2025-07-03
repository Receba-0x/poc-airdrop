"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

interface ItemCardProps {
  item: any;
  currentStock?: { [key: number]: number };
}

export default function ItemCard({ item, currentStock = {} }: ItemCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const { t } = useLanguage();

  const jerseyImages = [
    "/images/itens/camisa1.webp",
    "/images/itens/camisa2.webp",
    "/images/itens/camisa3.webp",
    "/images/itens/camisa4.webp",
  ];
  const isJerseyItem = item.id === 5;
  const isOutOfStock =
    item.type === "physical" && (currentStock[item.id] || 0) <= 0;

  useEffect(() => {
    if (!isHovered || !isJerseyItem) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % jerseyImages.length);
    }, 1000);

    return () => clearInterval(interval);
  }, [isHovered, isJerseyItem]);

  const currentImage = isJerseyItem
    ? jerseyImages[currentImageIndex]
    : item.image;

  return (
    <div
      className={`bg-[#171717] rounded-lg overflow-hidden transition-colors ${
        isOutOfStock ? "opacity-50 cursor-not-allowed" : "hover:bg-[#1E1E1E]"
      }`}
      onMouseEnter={() => !isOutOfStock && setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setCurrentImageIndex(0);
      }}
    >
      <div className="w-full h-[150px] relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImage}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full h-full"
          >
            <Image
              src={currentImage}
              alt={item.name}
              width={100000}
              height={100000}
              priority
              className="object-contain p-4 w-full h-full"
            />
          </motion.div>
        </AnimatePresence>

        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="text-center">
              <div className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded mb-2">
                {t("common.soldOut")}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-2 p-4 justify-between">
        <div className="flex flex-col w-full gap-2">
          <h3
            className={`text-lg bg-gradient-to-r from-[#FFF7A8] to-[#FFEB28] bg-clip-text text-transparent font-bold ${
              isOutOfStock ? "opacity-60" : ""
            }`}
          >
            {item.name}
          </h3>
        </div>
      </div>
    </div>
  );
}
