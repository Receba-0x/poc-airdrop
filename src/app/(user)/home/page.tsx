import { DemoBoxSection } from "@/components/BoxSection/DemoBoxSection";
import { FAQ } from "@/components/FAQ";
import { HomeBanners } from "@/components/HomeBanners";
import { HowItWorks } from "@/components/HowItWorks";
import { ScrollAnimation } from "@/components/ScrollAnimation";
import { TopLeaders } from "@/components/TopLeaders";

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
        <DemoBoxSection />
      </ScrollAnimation>

      <HowItWorks />

      <FAQ />
    </div>
  );
}
