"use client";

import Image from "next/image";
import Link from "next/link";
import { LogoIcon } from "../Icons/LogoIcon";
import { motion } from "framer-motion";

interface BoxCardProps {
  box: {
    id: string;
    title: string;
    image: string;
    price: number;
  };
}

export default function BoxCard({ box }: BoxCardProps) {
  const boxPrice = box.id === "cryptos" ? 17.50 : 45;
  const tokenPrice = 0.002
  const boxPriceInSol = boxPrice / tokenPrice;
  return (
    <motion.div
      className="bg-[#171717] rounded-lg overflow-hidden hover:bg-[#1E1E1E] transition-colors h-full"
      whileHover={{
        y: -8,
        boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)"
      }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/boxes/${box.id}`} className="block h-full">
        <div className="w-full h-[200px] relative overflow-hidden">
          <motion.div
            className="w-full h-full"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src={box.image}
              alt={box.title}
              fill
              className="object-contain p-4"
            />
          </motion.div>
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-[#171717] to-transparent opacity-40"
            whileHover={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="p-4">
          <motion.h3
            className="text-lg bg-gradient-to-r from-[#FFF7A8] to-[#FFEB28] bg-clip-text text-transparent font-bold mb-2"
            whileHover={{ textShadow: "0 0 8px rgba(255, 235, 40, 0.5)" }}
          >
            {box.title}
          </motion.h3>

          <motion.div
            className="flex items-center bg-[#222222] rounded-lg px-4 py-2 gap-2 w-min"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <LogoIcon className="w-5 h-6" />
            <span className="font-bold">{boxPriceInSol}</span>
          </motion.div>
        </div>
      </Link>
    </motion.div>
  );
}
