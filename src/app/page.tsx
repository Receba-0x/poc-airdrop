import BoxCard from "@/components/BoxCard";
import { FAQ } from "@/components/FAQ";
import { HomeBanners } from "@/components/HomeBanners";
import { HowItWorks } from "@/components/HowItWorks";
import { BoxIcon } from "@/components/Icons/BoxIcon";
import { ScrollAnimation } from "@/components/ScrollAnimation";
import { TopLeaders } from "@/components/TopLeaders";
import { boxesData } from "@/constants";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-2 space-y-8 sm:space-y-12 md:space-y-16 mt-6 sm:mt-8 md:mt-10 px-4 sm:px-6 lg:px-8">
      <ScrollAnimation type="fade" direction="up" delay={0.4} duration={0.7}>
        <HomeBanners />
      </ScrollAnimation>

      <ScrollAnimation type="fade" direction="up" delay={0.6} duration={0.7}>
        <TopLeaders />
      </ScrollAnimation>

      <ScrollAnimation type="fade" direction="up" delay={0.8} duration={0.7}>
        <div className="max-w-[1280px] mx-auto">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h1 className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-neutral-12">
              <BoxIcon className="h-6 w-6 sm:h-8 sm:w-8" /> Boxes
            </h1>
            <Link href="/boxes">
              <span className="text-neutral-11 font-medium text-sm sm:text-base hover:text-primary-10 transition-colors">
                View All
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
            {boxesData.map((box, index) => (
              <BoxCard key={index} box={box} />
            ))}
          </div>
        </div>
      </ScrollAnimation>

      <HowItWorks />

      <FAQ />
    </div>
  );
}
