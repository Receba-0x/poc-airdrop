"use client"
import { ScrollAnimation } from "../ScrollAnimation";
import { useLanguage } from "@/contexts/LanguageContext";

export function RoadMapSection() {
  const { t } = useLanguage();

  const roadMap = [
    {
      title: "Phase 1",
      itens: [
        "Criação Website",
        "Criação de conta no Twitter",
        "Criação de conta no Telegram",
        "Criação de conta no Instagram",
        "Criação de conta no Facebook",
      ]
    },
    {
      title: "Phase 2",
      itens: [
        "Criação Website",
        "Criação de conta no Twitter",
        "Criação de conta no Telegram",
        "Criação de conta no Instagram",
      ]
    },
    {
      title: "Phase 3",
      itens: [
        "Criação Website",
        "Criação de conta no Twitter",
        "Criação de conta no Telegram",
        "Criação de conta no Instagram",
      ]
    },
    {
      title: "Phase 4",
      itens: [
        "Criação Website",
        "Criação de conta no Twitter",
        "Criação de conta no Telegram",
        "Criação de conta no Instagram",
      ]
    },
  ];

  return (
    <div className="w-full flex flex-col items-center justify-start overflow-hidden pb-10 lg:pb-[112px] bg-[#0F0F0F]">
      <div className="flex flex-col items-center justify-center max-w-[1062px] px-6 md:px-0">
        <ScrollAnimation
          type="slide"
          direction="down"
          duration={0.7}
          delay={0.1}
        >
          <div className="text-[#EEE] text-[30px] xl:text-[36px] w-full font-black text-center flex items-center justify-center gap-2 leading-[40px] md:leading-[61.6px]">
            {t("roadmap.title")}
          </div>
        </ScrollAnimation>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center justify-between w-full max-w-[1200px]">
        {roadMap.map((item, index) => (
          <div key={index} className="flex flex-col items-center justify-center">
            <h2 className="text-[#EEE] text-[24px] xl:text-[32px] w-full font-black text-center flex items-center justify-center gap-2 leading-[40px] md:leading-[61.6px]">
              {item.title}
            </h2>
          </div>
        ))}
      </div>
    </div>
  );
}
