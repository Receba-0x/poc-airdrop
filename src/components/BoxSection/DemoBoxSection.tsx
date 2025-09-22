"use client";
import BoxCard from "../BoxCard";
import { useLootboxes } from "@/hooks/useLootbox";
import { BoxIcon } from "../Icons/BoxIcon";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export function DemoBoxSection() {
  const { lootboxes } = useLootboxes();
  const { t } = useLanguage();
  return (
    <div className="max-w-screen-2xl mx-auto">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="flex items-center gap-2 text-xl font-bold text-neutral-12">
          <BoxIcon className="h-6 w-6" /> {t("nav.boxes")}
        </h1>
        <Link href="/boxes">
          <span className="text-neutral-11 font-medium text-sm sm:text-base hover:text-primary-10 transition-colors">
            {t("nav.viewAll")}
          </span>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
        {lootboxes.map((box: any, index: number) => (
          <BoxCard key={index} box={box} />
        ))}
      </div>
    </div>
  );
}
