"use client";
import { StaggeredContainer } from "@/components/StaggeredContainer";
import { Card1, Card2, Card3, Card4 } from "@/components/Cards";
import { useLanguage } from "@/contexts/LanguageContext";
export const FeaturesGrid = () => {
  const { t } = useLanguage();
  return (
    <StaggeredContainer
      className="flex flex-col mt-8 w-full px-6 sm:px-8 lg:px-0 max-w-[1440px] mx-auto"
      delay={0.2}
      staggerDelay={0.15}
      type="slide"
      direction="up"
    >
      <div className="hidden md:flex items-center justify-between h-[317px] w-full gap-3">
        <Card1
          title={t("features.card1.title")}
          description={t("features.card1.description")}
          width="lg:min-w-[733px] w-[733px]"
        />
        <Card2
          title={t("features.card2.title")}
          description={t("features.card2.description")}
          width="w-full"
        />
      </div>

      <div className="hidden md:flex items-center justify-between h-[317px] w-full gap-3 mt-3">
        <Card3
          title={t("features.card3.title")}
          description={t("features.card3.description")}
          width="lg:min-w-[843px] w-[843px]"
        />
        <Card4
          href={"https://t.me/imperadorcoin"}
          buttonText={t("hero.joinCommunity")}
          width="w-full"
        />
      </div>

      <div className="flex flex-col md:hidden w-full gap-6">
        <div className="h-[280px] w-full">
          <Card1
            title={t("features.card1.title")}
            description={t("features.card1.description")}
            width="w-full"
          />
        </div>
        <div className="h-[280px] w-full">
          <Card2
            title={t("features.card2.title")}
            description={t("features.card2.description")}
            width="w-full"
          />
        </div>
        <div className="h-[280px] w-full">
          <Card3
            title={t("features.card3.title")}
            description={t("features.card3.description")}
            width="w-full"
          />
        </div>
        <div className="h-[140px] w-full">
          <Card4
            href={"https://t.me/imperadorcoin"}
            buttonText={t("hero.joinCommunity")}
            width="w-full"
          />
        </div>
      </div>
    </StaggeredContainer>
  );
};
