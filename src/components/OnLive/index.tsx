"use client";
import { itensMock } from "@/constants";
import Image from "next/image";
import { ItemCard2 } from "../ItemCard/ItemCard2";
import { usePathname } from "next/navigation";
import { useRecentPurchases } from "@/hooks/usePurchase";

export function OnLive() {
  const pathname = usePathname();
  if (pathname === "/profile") return null;

  const { recentPurchases, isLoading, isError } = useRecentPurchases();

  if (isLoading) {
    return (
      <div className="flex items-center h-[106px] overflow-hidden ml-4">
        {itensMock.map((_, i) => (
          <div key={i} className="flex-shrink-0 h-full">
            <div className="bg-neutral-6 h-full w-full rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center max-w-screen-2xl mx-auto">
      <Image src="/images/on_live.png" alt="on_live" width={42} height={37} />
      <div className="flex items-center h-[106px] overflow-hidden ml-4">
        {recentPurchases.map((item) => (
          <div key={item.id} className="flex-shrink-0 h-full">
            <ItemCard2 item={item} />
          </div>
        ))}
      </div>
    </div>
  );
}
