"use client"
import { LogoIcon } from "../Icons/LogoIcon";
import { ScrollAnimation } from "../ScrollAnimation";
import { useLanguage } from "@/contexts/LanguageContext";

export function RoadMapSection() {
  const { t } = useLanguage();

  const roadMap = [
    {
      title: t("roadmap.phase1"),
      itens: [
        t("roadmap.phase1.item1"),
        t("roadmap.phase1.item2"),
        t("roadmap.phase1.item3"),
        t("roadmap.phase1.item4"),
        t("roadmap.phase1.item5"),
      ]
    },
    {
      title: t("roadmap.phase2"),
      itens: [
        t("roadmap.phase2.item1"),
        t("roadmap.phase2.item2"),
        t("roadmap.phase2.item3"),
        t("roadmap.phase2.item4"),
      ]
    },
    {
      title: t("roadmap.phase3"),
      itens: [
        t("roadmap.phase3.item1"),
        t("roadmap.phase3.item2"),
        t("roadmap.phase3.item3"),
        t("roadmap.phase3.item4"),
      ]
    },
    {
      title: t("roadmap.phase4"),
      itens: [
        t("roadmap.phase4.item1"),
        t("roadmap.phase4.item2"),
        t("roadmap.phase4.item3"),
      ]
    },
  ];

  function IconItem() {
    return (
      <svg width="14" height="20" viewBox="0 0 14 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.12602 18.7329L1.40855 18.7329L6.24908 10.2373L1.40855 1.05016L8.12602 1.4453L13.3617 10.2373L8.12602 18.7329Z" fill="url(#paint0_linear_475_2281)" />
        <path d="M12.1725 10.1165L7.66977 2.01211L2.71662 2.01211L7.21931 10.1165L2.71663 18.221L7.66977 18.221L12.1725 10.1165ZM14 10.1165L13.5693 10.893L9.06463 18.9974L8.60824 19.8193L0 19.8193L1.31979 17.4445L5.39176 10.1146L1.31979 2.78462L-8.48418e-07 0.409798L8.60824 0.409798L9.06463 1.2317L13.5673 9.33613L13.998 10.1126L14 10.1165Z" fill="#0F2E12" />
        <defs>
          <linearGradient id="paint0_linear_475_2281" x1="13.3617" y1="18.7329" x2="7.63821" y2="-0.777362" gradientUnits="userSpaceOnUse">
            <stop stopColor="#28D939" />
            <stop offset="1" stopColor="#2A7E32" />
          </linearGradient>
        </defs>
      </svg>
    )
  }

  return (
    <div className="w-full flex flex-col items-center justify-start overflow-hidden pb-10 lg:pb-[112px] bg-[#0F0F0F]">
      <div className="flex flex-col items-center justify-center max-w-[1062px] px-6 md:px-0">
        <ScrollAnimation
          type="slide"
          direction="down"
          duration={0.7}
          delay={0.1}
        >
          <div className="text-[#EEE] text-[30px] xl:text-[36px] w-full font-black text-center flex items-center justify-center gap-4 mb-4">
            <LogoIcon /> {t("roadmap.title")} <LogoIcon />
          </div>
        </ScrollAnimation>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center justify-between w-full max-w-[1200px]">
        {roadMap.map((item, index) => (
          <div key={index} className="flex flex-col items-center justify-start rounded-lg overflow-hidden bg-[#191919] h-full">
            <h2 className="text-[#EEE] text-lg xl:text-[24px] bg-[#222222] w-full font-bold text-center flex items-center justify-center gap-2 py-4">
              {item.title}
            </h2>

            <ul className="flex flex-col items-start justify-start gap-2 w-full p-4 py-5">
              {item.itens.map((item, index) => (
                <li key={index} className="text-[#EEE] text-xs xl:text-lg w-full text-start gap-2 py-1 flex items-center justify-start">
                  <IconItem /> {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
