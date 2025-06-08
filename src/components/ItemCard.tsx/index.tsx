"use client";
import Image from "next/image";

interface ItemCardProps {
  item: any;
}

export default function ItemCard({ item }: ItemCardProps) {
  return (
    <div className="bg-[#171717] rounded-lg overflow-hidden hover:bg-[#1E1E1E] transition-colors">
      <div className="w-full h-[150px] relative">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-contain p-1 pt-4"
        />
      </div>
      <div className="flex gap-2 p-4 justify-between">
        <div className="flex flex-col w-full gap-2">
          <h3 className="text-lg bg-gradient-to-r from-[#FFF7A8] to-[#FFEB28] bg-clip-text text-transparent font-bold">
            {item.name}
          </h3>
        </div>
      </div>
    </div>
  );
}
