"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

interface BoxCardProps {
  box: {
    id: string;
    title: string;
    image: string;
  };
}

export default function BoxCard({ box }: BoxCardProps) {
  return (
    <Link href={`/boxes/${box.id}`} className="group">
      <motion.div
        className="bg-neutral-3 flex flex-col justify-between h-[259px] border relative p-4 border-neutral-6 rounded-lg overflow-hidden hover:bg-neutral-4 transition-colors duration-300 ease-in-out"
        whileHover={{
          y: -8,
          boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)",
        }}
        transition={{ duration: 0.3 }}
      >
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 inset-0 bg-neutral-11 h-1 w-[60%] rounded-b-xl`}
        />

        <div className="w-full h-full flex items-center justify-center">
          <Image
            src={box.image}
            alt={box.title}
            width={177}
            height={150}
            className="object-cover z-10 group-hover:-rotate-6 transition-all duration-300 ease-in-out"
          />

          <div
            className={`absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-20 h-20 bg-neutral-11 blur-2xl`}
          />
        </div>

        <span className="text-neutral-12 font-semibold">{box.title}</span>
      </motion.div>
    </Link>
  );
}
