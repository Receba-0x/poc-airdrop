"use client";
import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface CarouselItem {
  id: string | number;
  name: string;
  image: string;
  [key: string]: any;
}

interface HorizontalSpinCarouselProps {
  items: CarouselItem[];
  itemWidth?: number;
  itemHeight?: number;
  speed?: number;
  gap?: number;
  onSpinComplete?: (winningItem: CarouselItem) => void;
  selectedIndex?: number;
  spinDuration?: number;
  className?: string;
}

export interface HorizontalSpinCarouselRef {
  startSpin: (winningIndex?: number) => void;
  resetSpin: () => void;
}

const HorizontalSpinCarousel = forwardRef<
  HorizontalSpinCarouselRef,
  HorizontalSpinCarouselProps
>(
  (
    {
      items,
      itemWidth = 160,
      itemHeight = 160,
      speed = 0.1,
      gap = 60,
      onSpinComplete,
      selectedIndex = 0,
      spinDuration = 12000,
      className = "",
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const carouselRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number | null>(null);

    const [isSpinning, setIsSpinning] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [winningIndex, setWinningIndex] = useState(selectedIndex);

    useImperativeHandle(ref, () => ({
      startSpin: (targetWinningIndex?: number) => {
        if (isSpinning) return;

        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }

        const finalWinningIndex =
          targetWinningIndex !== undefined ? targetWinningIndex : selectedIndex;
        setWinningIndex(finalWinningIndex);
        setShowResult(false);

        setTimeout(() => {
          if (!containerRef.current || !carouselRef.current) return;

          setIsSpinning(true);

          const itemWidthWithGap = itemWidth;
          carouselRef.current.style.transition = "none";
          carouselRef.current.style.transform = "translateX(0px)";
          void carouselRef.current.offsetWidth;
          const itemsPerCycle = items.length;

          const calculatedTargetCycle = Math.floor(
            displayItems.length / itemsPerCycle / 2
          );
          const targetIndex =
            calculatedTargetCycle * itemsPerCycle + finalWinningIndex;
          const centerPosition = containerRef.current.offsetWidth / 2;
          const itemFullWidth = itemWidthWithGap;

          const gapOffset = targetIndex * gap;
          const finalPosition = -(
            targetIndex * itemFullWidth +
            gapOffset -
            centerPosition +
            itemFullWidth / 2
          );

          carouselRef.current.style.transition = "none";
          carouselRef.current.style.transform = "translateX(0px)";
          void carouselRef.current.offsetWidth;

          carouselRef.current.style.transition = `transform ${spinDuration}ms cubic-bezier(0.25, 0.1, 0.25, 1.0)`;
          carouselRef.current.style.transform = `translateX(${finalPosition}px)`;

          setTimeout(() => {
            setIsSpinning(false);
            setShowResult(true);

            setTimeout(() => {
              setShowResult(false);
              if (carouselRef.current) {
                carouselRef.current.style.transition = "none";
                carouselRef.current.style.transform = "translateX(0px)";
                void carouselRef.current.offsetWidth;
              }
              animationRef.current = requestAnimationFrame(animate);
            }, 3000);
          }, spinDuration);
        }, 100);
      },

      resetSpin: () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }

        setIsSpinning(false);
        setShowResult(false);
        setWinningIndex(selectedIndex);

        if (carouselRef.current) {
          carouselRef.current.style.transition = "none";
          carouselRef.current.style.transform = "translateX(0px)";
          void carouselRef.current.offsetWidth;
        }

        setTimeout(() => {
          animationRef.current = requestAnimationFrame(animate);
        }, 50);
      },
    }));

    const displayItems = React.useMemo(() => {
      if (isSpinning) {
        const repeatedItems = [];
        for (let i = 0; i < 30; i++) {
          repeatedItems.push(...items);
        }
        return repeatedItems;
      } else {
        const repeatedItems = [];
        for (let i = 0; i < 10; i++) {
          repeatedItems.push(...items);
        }
        return repeatedItems;
      }
    }, [items, isSpinning]);

    const animate = () => {
      if (!carouselRef.current || isSpinning) return;

      const currentTransform =
        carouselRef.current.style.transform || "translateX(0px)";
      let position = parseFloat(
        currentTransform.replace("translateX(", "").replace("px)", "")
      );
      position -= speed;
      const resetPoint = -((itemWidth + gap) * items.length);
      if (position <= resetPoint) {
        position = 0;
      }
      carouselRef.current.style.transform = `translateX(${position}px)`;
      animationRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
      if (carouselRef.current && !isSpinning) {
        carouselRef.current.style.transform = "translateX(0px)";
        animationRef.current = requestAnimationFrame(animate);
        return () => {
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
          }
        };
      }
    }, [items.length, speed, isSpinning]);

    useEffect(() => {
      if (showResult && onSpinComplete) {
        onSpinComplete(items[winningIndex]);
      }
    }, [showResult, winningIndex, items, onSpinComplete]);

    const handleItemClick = (index: number) => {
      if (!isSpinning && !showResult) {
        if (ref && "current" in ref && ref.current) {
          ref.current.startSpin(index);
        }
      }
    };

    return (
      <div
        className={`${
          isSpinning || showResult
            ? "flex flex-col items-center"
            : "relative overflow-hidden"
        } w-full h-full ${className}`}
      >
        <div
          className={`relative ${
            isSpinning || showResult
              ? "flex flex-col justify-center items-center gap-2"
              : "flex justify-center items-center"
          } w-full h-full`}
        >
          <div
            ref={containerRef}
            className="relative w-full overflow-hidden"
            style={{ height: `${itemHeight}px` }}
          >
            <div
              ref={carouselRef}
              className={`absolute flex items-center h-full`}
              style={{
                willChange: "transform",
                transformStyle: "preserve-3d",
                gap: `${gap}px`,
              }}
            >
              {displayItems.map((item, index) => {
                return (
                  <div
                    key={`${item.id}-${index}`}
                    className={`shrink-0 rounded-lg overflow-hidden border-2 border-transparent`}
                    style={{
                      width: `${itemWidth}px`,
                      height: `${itemHeight}px`,
                    }}
                    onClick={() => handleItemClick(index % items.length)}
                  >
                    <div className="w-full h-full relative flex items-center justify-center p-[1px]">
                      <Image
                        src={item.image}
                        alt={item.name || `Item ${item.id}`}
                        width={1000}
                        height={1000}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              className={`absolute left-0 top-0 bottom-0 z-20 h-full ${
                isSpinning || showResult
                  ? "w-[25%]"
                  : "w-[15%] sm:w-[20%] md:w-[25%]"
              } pointer-events-none`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-r h-full ${
                  isSpinning || showResult
                    ? "from-neutral-2 via-neutral-2/20"
                    : "from-neutral-2 via-neutral-2/80"
                } to-transparent`}
              ></div>
            </div>
            <div
              className={`absolute right-0 top-0 bottom-0 z-20 h-full ${
                isSpinning || showResult
                  ? "w-[25%]"
                  : "w-[15%] sm:w-[20%] md:w-[25%]"
              } pointer-events-none`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-l h-full ${
                  isSpinning || showResult
                    ? "from-neutral-2 via-neutral-2/20"
                    : "from-neutral-2 via-neutral-2/80"
                } to-transparent`}
              ></div>
            </div>
          </div>
        </div>

        {showResult && (
          <motion.div
            className="bg-[#28211D] p-4 pt-0 rounded-lg text-center max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-lg font-bold text-[#eec9a0] mb-2">
              Congratulations!
            </h3>
            <p className="text-[#eec9a0] mb-2">
              You won{" "}
              <span className="text-[#44B941] font-bold">
                {items[winningIndex].name}
              </span>
              !
            </p>
            {items[winningIndex].description && (
              <p className="text-[#eec9a0] text-sm">
                {items[winningIndex].description}
              </p>
            )}
          </motion.div>
        )}
      </div>
    );
  }
);

HorizontalSpinCarousel.displayName = "HorizontalSpinCarousel";

export default HorizontalSpinCarousel;
