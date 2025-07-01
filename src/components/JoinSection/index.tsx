"use client";
import Link from "next/link";
import { Button } from "../Button";
import { ScrollAnimation } from "../ScrollAnimation";
import { useLanguage } from "@/contexts/LanguageContext";
export function JoinSection() {
  const { t } = useLanguage();
  return (
    <div className="w-full flex flex-col items-center justify-start py-12 sm:py-20 px-6 md:px-0 overflow-hidden bg-[#0F0F0F]">
      <ScrollAnimation
        type="slide"
        direction="up"
        duration={0.7}
        delay={0.1}
        className="flex flex-col items-center justify-center max-w-[1280px] w-full bg-[#191919] rounded-xl"
      >
        <div className="flex flex-col md:flex-row items-center justify-between w-full p-6 sm:p-8 gap-8 h-full">
          <div className="flex flex-col items-start justify-between w-full space-y-6 md:space-y-0 md:h-[235px]">
            <div className="bg-gradient-to-r from-[#2E59FE] via-[#FFEB28] to-[#40F45F] rounded-full w-[120px] sm:w-[156px] h-[4px]" />
            <div className="flex flex-col items-start justify-start">
              <h1 className="bg-gradient-to-r from-[#FFF7A8] to-[#FFEB28] text-transparent bg-clip-text text-2xl sm:text-3xl xl:text-[36px] font-black">
                {t("join.title")}
              </h1>
              <p className="text-[#BDBDBD] text-xs sm:text-sm xl:text-[16px] mt-2">
                {t("join.description")}
              </p>
            </div>

            <Link href="https://t.me/imperadorcoin" target="_blank">
              <Button className="w-full sm:w-[290px] py-3 sm:h-[56px] text-sm sm:text-base">
                {t("hero.joinCommunity")}
              </Button>
            </Link>
          </div>

          <div className="h-[180px] sm:h-[236px] w-full rounded-lg bg-[url('/images/join-bg.png')] bg-cover bg-center bg-no-repeat border border-[#3A3A3A]" />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between w-full border-t border-[#3A3A3A] sm:h-[77px] divide-y sm:divide-y-0 sm:divide-x divide-[#3A3A3A] text-[#EEEEEE]">
          <div className="flex items-center justify-center w-full sm:w-1/3 py-4 sm:py-0 px-4 text-center">
            <h1 className="text-sm sm:text-base lg:text-lg font-semibold">
              {t("join.feature1")}
            </h1>
          </div>
          <div className="flex items-center justify-center w-full sm:w-1/3 py-4 sm:py-0 px-4 text-center border-t sm:border-t-0 border-[#3A3A3A]">
            <h1 className="text-sm sm:text-base lg:text-lg font-semibold">
              {t("join.feature2")}
            </h1>
          </div>
          <div className="flex items-center justify-center w-full sm:w-1/3 py-4 sm:py-0 px-4 text-center border-t sm:border-t-0 border-[#3A3A3A]">
            <h1 className="text-sm sm:text-base lg:text-lg font-semibold">
              {t("join.feature3")}
            </h1>
          </div>
        </div>
      </ScrollAnimation>
    </div>
  );
}
