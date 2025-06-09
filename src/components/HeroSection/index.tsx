"use client";
import { Button } from "@/components/Button";
import { ScrollAnimation } from "@/components/ScrollAnimation";
import { useLanguage } from "@/contexts/LanguageContext";

export const HeroSection = () => {
  const { t } = useLanguage();
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-start md:pt-[80px] pt-[80px] md:mt-10 bg-[url('/images/home_bg.webp')] max-w-[1440px] bg-cover bg-center bg-no-repeat">
      <ScrollAnimation type="fade" direction="down" duration={0.8} delay={0.2}>
        <h1 className="text-[#EEE] text-[36px] xl:text-[56px] font-semibold w-full text-center leading-[40px] md:leading-[61.6px]">
          {t("hero.title")} <br />
          <span className="bg-gradient-to-r from-[#FFF7A8] to-[#FFEB28] font-black bg-clip-text text-transparent">
            {t("hero.adriano")}
          </span>{" "}
          {t("hero.token")}
        </h1>
      </ScrollAnimation>

      <ScrollAnimation type="fade" direction="up" duration={0.7} delay={0.5}>
        <p className="xl:text-lg md:leading-[23.4px] text-center text-[#B4B4B4] mt-4 px-6 md:px-0">
          {t("hero.subtitle")}
        </p>
      </ScrollAnimation>

      <ScrollAnimation type="scale" duration={0.6} delay={0.8}>
        <Button className="mt-[20px] md:mt-[40px] w-[287px] h-[56px]">
          {t("hero.cta")}
        </Button>
      </ScrollAnimation>
    </div>
  );
};
