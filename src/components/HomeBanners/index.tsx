"use client";

import { ArrowButton } from "../ArrowButton";
import { ShineBorder } from "../ShineBorder";
import { useLanguage } from "@/contexts/LanguageContext";

export function HomeBanners() {
  const { t } = useLanguage();

  return (
    <div className="max-w-screen-2xl mx-auto">
      <div className="relative group bg-neutral-3 overflow-hidden rounded-xl h-[240px] sm:h-[300px] lg:h-[400px] w-full transition-all duration-300 ease-in-out">
        <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />
        <video
          src="/videos/banner.mp4"
          autoPlay
          muted
          loop
          controls={false}
          playsInline
          preload="auto"
          className="w-full h-full object-cover object-center transition-all duration-500 ease-in-out"
        />

        <div className="absolute inset-0 top-4 md:top-12 left-4 p-4 sm:p-6 z-20">
          <h1 className="text-neutral-12 font-bold text-xl sm:text-2xl lg:text-3xl">
            {t("banner.title")
              .split("\n")
              .map((line, index) => (
                <span key={index}>
                  {line}
                  {index === 0 && <br className="hidden sm:block" />}
                </span>
              ))}
          </h1>
          <div className="text-neutral-12 font-medium flex items-center gap-2 mt-10">
            <ArrowButton />
            <p className="text-sm sm:text-base">
              {t("banner.description")
                .split(" ")
                .map((word, index) => {
                  if (word === "comuns" || word === "common") {
                    return (
                      <span key={index} className="text-primary-10">
                        {t("banner.common")}
                      </span>
                    );
                  } else if (word === "lendários" || word === "legendary") {
                    return (
                      <span key={index} className="text-primary-10">
                        {t("banner.legendary")}
                      </span>
                    );
                  } else if (word === "a") {
                    return <span key={index}> {word} </span>;
                  } else {
                    return <span key={index}>{word} </span>;
                  }
                })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
