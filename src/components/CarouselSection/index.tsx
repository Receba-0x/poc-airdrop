"use client";
import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

const topCarouselImages = [
  "/images/carousel1/img-galeria01.png",
  "/images/carousel1/img-galeria02.png",
  "/images/carousel1/img-galeria03.png",
  "/images/carousel1/img-galeria04.png",
  "/images/carousel1/img-galeria05.png",
  "/images/carousel1/img-galeria06.png",
  "/images/carousel1/img-galeria07.png",
  "/images/carousel1/img-galeria08.png",
  "/images/carousel1/img-galeria09.png",
];

const bottomCarouselImages = [
  "/images/carousel2/img-galeria10.png",
  "/images/carousel2/img-galeria11.png",
  "/images/carousel2/img-galeria12.png",
  "/images/carousel2/img-galeria14.png",
  "/images/carousel2/img-galeria15.png",
  "/images/carousel2/img-galeria16.png",
  "/images/carousel2/img-galeria17.png",
  "/images/carousel2/img-galeria18.png",
];

export const CarouselSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const topCarouselX = useTransform(
    scrollYProgress,
    [0, 1],
    isMobile ? ["0%", "0%"] : ["50%", "-100%"]
  );

  const bottomCarouselX = useTransform(
    scrollYProgress,
    [0, 1],
    isMobile ? ["0%", "0%"] : ["-100%", "100%"]
  );

  const mobileTopImages = topCarouselImages.slice(0, 4);
  const mobileBottomImages = bottomCarouselImages.slice(0, 4);

  return (
    <div
      ref={sectionRef}
      className="w-full min-h-[60vh] md:min-h-[80vh] flex flex-col items-center justify-start pt-10 sm:pt-20 pb-10 md:pb-0 overflow-hidden"
    >
      <div className="w-full mt-0 overflow-hidden -rotate-[4deg] relative">
        <div
          className="absolute top-0 left-0 w-[100px] md:w-[200px] h-full z-10 pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, #0F0F0F 0%, rgba(15, 15, 15, 0) 100%)",
          }}
        />

        <motion.div
          className="flex gap-2 md:gap-4 py-4"
          style={{ x: topCarouselX }}
        >
          {(isMobile ? mobileTopImages : topCarouselImages).map(
            (src, index) => (
              <div
                key={`top-${index}`}
                className="relative min-w-[180px] sm:min-w-[250px] md:min-w-[300px] h-[120px] sm:h-[160px] md:h-[200px] rounded-lg overflow-hidden flex-shrink-0"
              >
                <Image
                  src={src}
                  alt={`Impact image ${index}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
            )
          )}
        </motion.div>

        <div
          className="absolute top-0 right-0 w-[100px] md:w-[200px] h-full z-10 pointer-events-none"
          style={{
            background:
              "linear-gradient(to left, #0F0F0F 0%, rgba(15, 15, 15, 0) 100%)",
          }}
        />
      </div>

      <div className="w-full mt-4 sm:mt-6 overflow-hidden -rotate-[4deg] relative">
        <div
          className="absolute top-0 left-0 w-[100px] md:w-[200px] h-full z-10 pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, #0F0F0F 0%, rgba(15, 15, 15, 0) 100%)",
          }}
        />

        <motion.div
          className="flex gap-2 md:gap-4 py-4"
          style={{ x: bottomCarouselX }}
        >
          {(isMobile ? mobileBottomImages : bottomCarouselImages).map(
            (src, index) => (
              <div
                key={`bottom-${index}`}
                className="relative min-w-[180px] sm:min-w-[250px] md:min-w-[300px] h-[120px] sm:h-[160px] md:h-[200px] rounded-lg overflow-hidden flex-shrink-0"
              >
                <Image
                  src={src}
                  alt={`Impact image ${index}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
            )
          )}
        </motion.div>
        <div
          className="absolute top-0 right-0 w-[100px] md:w-[200px] h-full z-10 pointer-events-none"
          style={{
            background:
              "linear-gradient(to left, #0F0F0F 0%, rgba(15, 15, 15, 0) 100%)",
          }}
        />
      </div>
    </div>
  );
};
