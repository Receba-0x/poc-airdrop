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
    <div className="min-h-screen bg-neutral-2 space-y-10 mt-10">
      <ScrollAnimation type="fade" direction="up" delay={0.4} duration={0.7}>
        <HomeBanners />
      </ScrollAnimation>

      <ScrollAnimation type="fade" direction="up" delay={0.6} duration={0.7}>
        <TopLeaders />
      </ScrollAnimation>

      <ScrollAnimation type="fade" direction="up" delay={0.8} duration={0.7}>
        <div className="max-w-[1280px] mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="flex items-center gap-2 text-2xl font-bold text-neutral-12">
              <BoxIcon className="h-8 w-8" /> Boxes
            </h1>
            <Link href="/boxes">
              <span className="text-neutral-11 font-medium">View All</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-4">
            {boxesData.map((box, index) => (
              <BoxCard key={index} box={box} />
            ))}
          </div>
        </div>
      </ScrollAnimation>

      <ScrollAnimation type="fade" direction="up" delay={1} duration={0.7}>
        <HowItWorks />
      </ScrollAnimation>

      <ScrollAnimation type="fade" direction="up" delay={1.2} duration={0.7}>
        <FAQ />
      </ScrollAnimation>
    </div>
  );
}
