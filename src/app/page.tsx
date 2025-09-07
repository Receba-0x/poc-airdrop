import BoxCard from "@/components/BoxCard";
import { HomeBanners } from "@/components/HomeBanners";
import { BoxIcon } from "@/components/Icons/BoxIcon";
import { ScrollAnimation } from "@/components/ScrollAnimation";
import { TopLeaders } from "@/components/TopLeaders";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-2 space-y-10 mt-10">
      <HomeBanners />

      <TopLeaders />

      <ScrollAnimation type="fade" direction="up" delay={0.4} duration={0.7}>
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
            {Array.from({ length: 10 }).map((_, index) => (
              <BoxCard
                key={index}
                box={{
                  id: index.toString(),
                  title: `Box ${index + 1}`,
                  image: "/images/boxes/cripto.webp",
                }}
              />
            ))}
          </div>
        </div>
      </ScrollAnimation>
    </div>
  );
}
