"use client";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
  useMemo,
} from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import type { Item } from "@/types/item";

interface HorizontalSpinCarouselProps {
  items: Item[];
  itemWidth?: number;
  itemHeight?: number;
  speed?: number;
  gap?: number;
  onSpinComplete?: (winningItem: Item) => void;
  onItemInCenter?: (item: Item, index: number) => void;
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
      onItemInCenter,
      selectedIndex = 0,
      spinDuration = 1600,
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
    const [finalPosition, setFinalPosition] = useState(0);
    const [hasSpun, setHasSpun] = useState(false);
    const [currentCenterIndex, setCurrentCenterIndex] = useState<number>(-1);
    const highFrequencyDetectionRef = useRef<number | null>(null);
    const [virtualStartIndex, setVirtualStartIndex] = useState(0);
    const [virtualEndIndex, setVirtualEndIndex] = useState(0);
    const [currentPosition, setCurrentPosition] = useState(0);
    const currentPositionRef = useRef(0);

    const tickAudioRef = useRef<HTMLAudioElement | null>(null);
    const finishAudioRef = useRef<HTMLAudioElement | null>(null);
    const startAudioRef = useRef<HTMLAudioElement | null>(null);

    const VIRTUAL_BUFFER = 5;
    const itemFullWidth = itemWidth + gap;

    useEffect(() => {
      tickAudioRef.current = new Audio("/sounds/spin_short.mp3");
      finishAudioRef.current = new Audio("/sounds/spin_finish.mp3");
      startAudioRef.current = new Audio("/sounds/spin_start.mp3");

      if (tickAudioRef.current) {
        tickAudioRef.current.volume = 0.25;
        tickAudioRef.current.preload = "auto";
      }
      if (finishAudioRef.current) {
        finishAudioRef.current.volume = 0.5;
        finishAudioRef.current.preload = "auto";
      }
      if (startAudioRef.current) {
        startAudioRef.current.volume = 0.5;
        startAudioRef.current.preload = "auto";
      }

      const checkAudioLoad = () => {};

      if (
        tickAudioRef.current &&
        finishAudioRef.current &&
        startAudioRef.current &&
        tickAudioRef.current.readyState >= 2 &&
        finishAudioRef.current.readyState >= 2 &&
        startAudioRef.current.readyState >= 2
      ) {
        checkAudioLoad();
      } else {
        const handleLoad = () => {
          if (
            tickAudioRef.current &&
            finishAudioRef.current &&
            startAudioRef.current &&
            tickAudioRef.current.readyState >= 2 &&
            finishAudioRef.current.readyState >= 2 &&
            startAudioRef.current.readyState >= 2
          ) {
            checkAudioLoad();
            tickAudioRef.current.removeEventListener("canplay", handleLoad);
            finishAudioRef.current.removeEventListener("canplay", handleLoad);
            startAudioRef.current.removeEventListener("canplay", handleLoad);
          }
        };

        if (
          tickAudioRef.current &&
          finishAudioRef.current &&
          startAudioRef.current
        ) {
          tickAudioRef.current.addEventListener("canplay", handleLoad);
          finishAudioRef.current.addEventListener("canplay", handleLoad);
          startAudioRef.current.addEventListener("canplay", handleLoad);
        }
      }

      return () => {
        if (tickAudioRef.current) {
          tickAudioRef.current.pause();
          tickAudioRef.current = null;
        }
        if (finishAudioRef.current) {
          finishAudioRef.current.pause();
          finishAudioRef.current = null;
        }
        if (startAudioRef.current) {
          startAudioRef.current.pause();
          startAudioRef.current = null;
        }
      };
    }, []);

    const playTickSound = () => {
      try {
        if (tickAudioRef.current) {
          tickAudioRef.current.pause();
          tickAudioRef.current.currentTime = 0;
          tickAudioRef.current.play().catch((error) => {
            if (error.name !== "NotAllowedError") {
              console.log("Tick sound error:", error);
            }
          });
        }
      } catch (error) {
        console.log("Tick sound not available");
      }
    };

    const playStartSound = () => {
      try {
        if (startAudioRef.current) {
          startAudioRef.current.currentTime = 0;
          startAudioRef.current.play().catch((error) => {
            if (error.name !== "NotAllowedError") {
              console.log("Start sound error:", error);
            }
          });
        }
      } catch (error) {
        console.log("Start sound not available");
      }
    };

    const playFinishSound = () => {
      try {
        if (finishAudioRef.current) {
          finishAudioRef.current.currentTime = 0;
          finishAudioRef.current.play().catch((error) => {
            if (error.name !== "NotAllowedError") {
              console.log("Finish sound error:", error);
            }
          });
        }
      } catch (error) {
        console.log("Finish sound not available");
      }
    };

    useImperativeHandle(ref, () => ({
      startSpin: (targetWinningIndex?: number) => {
        if (isSpinning) return;
        playStartSound();

        const finalWinningIndex =
          targetWinningIndex !== undefined ? targetWinningIndex : selectedIndex;
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
        setWinningIndex(finalWinningIndex);
        setShowResult(false);

        setTimeout(() => {
          if (!containerRef.current || !carouselRef.current) return;
          setIsSpinning(true);
          const itemWidthWithGap = itemWidth;
          const carousel = carouselRef.current;
          carousel.style.transition = "none";
          carousel.style.transform = "translateX(0px)";
          carousel.style.willChange = "transform";
          carousel.style.contain = "layout style paint";
          void carousel.offsetWidth;
          const itemsPerCycle = items.length;
          detectCenterItem();
          const calculatedTargetCycle = 4;
          const targetIndex =
            calculatedTargetCycle * itemsPerCycle + finalWinningIndex;
          const centerPosition = containerRef.current.offsetWidth / 2;
          const itemFullWidth = itemWidthWithGap;

          const gapOffset = targetIndex * gap;
          const calculatedFinalPosition = -(
            targetIndex * itemFullWidth +
            gapOffset -
            centerPosition +
            itemFullWidth / 2
          );

          setFinalPosition(calculatedFinalPosition);

          const startPosition = 0;
          const endPosition = calculatedFinalPosition;
          const animationDuration = spinDuration;
          const startTime = performance.now();
          const totalDistance = endPosition - startPosition;

          let frameCount = 0;
          let lastFrameTime = startTime;

          const animateSpin = () => {
            frameCount++;
            const currentTime = performance.now();
            const elapsed = currentTime - startTime;
            const deltaTime = currentTime - lastFrameTime;
            lastFrameTime = currentTime;
            if (frameCount <= 5 && deltaTime > 33) {
              const targetProgress = Math.min(elapsed / animationDuration, 1);
              const easedProgress = 1 - Math.pow(1 - targetProgress, 5);
              const currentPosition =
                startPosition + totalDistance * easedProgress;
              carousel.style.transform = `translateX(${currentPosition}px)`;
            }

            const progress = Math.min(elapsed / animationDuration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 5);
            const currentPosition =
              startPosition + totalDistance * easedProgress;
            carousel.style.transform = `translateX(${currentPosition}px)`;

            if (progress < 1) {
              requestAnimationFrame(animateSpin);
            }
          };
          requestAnimationFrame(() => {
            requestAnimationFrame(animateSpin);
          });

          let spinFrameCount = 0;
          const monitorStartTime = performance.now();
          let monitorAnimationId: number | null = null;
          let lastDetectedIndex = currentCenterIndex;
          let detectionThrottle = 0;

          const monitorSpin = () => {
            spinFrameCount++;
            if (!carouselRef.current) return;
            const elapsedTime = performance.now() - monitorStartTime;
            if (elapsedTime > spinDuration * 1.1) {
              if (monitorAnimationId) {
                cancelAnimationFrame(monitorAnimationId);
                monitorAnimationId = null;
              }
              return;
            }
            detectionThrottle++;
            if (detectionThrottle < 2 && elapsedTime < 200) {
              monitorAnimationId = requestAnimationFrame(monitorSpin);
              return;
            }
            detectionThrottle = 0;

            const centerIndex = detectCenterItem();

            if (
              centerIndex !== lastDetectedIndex &&
              centerIndex >= 0 &&
              centerIndex < items.length
            ) {
              lastDetectedIndex = centerIndex;
              setCurrentCenterIndex(centerIndex);
              playTickSound();
              if (onItemInCenter) {
                onItemInCenter(items[centerIndex], centerIndex);
              }
            }

            if (elapsedTime < spinDuration + 100) {
              monitorAnimationId = requestAnimationFrame(monitorSpin);
            } else {
              monitorAnimationId = null;
            }
          };

          if (monitorAnimationId) {
            cancelAnimationFrame(monitorAnimationId);
          }
          monitorAnimationId = requestAnimationFrame(monitorSpin);
          setTimeout(() => {
            setIsSpinning(false);
            setShowResult(true);
            setHasSpun(true);
            playFinishSound();

            if (carouselRef.current) {
              carouselRef.current.style.willChange = "auto";
              carouselRef.current.style.contain = "none";
            }
          }, spinDuration - 1000);
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
        setHasSpun(false);
        setFinalPosition(0);
        setCurrentPosition(0);
        setCurrentCenterIndex(-1);

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
        for (let i = 0; i < 10; i++) {
          repeatedItems.push(...items);
        }
        return repeatedItems;
      } else if (hasSpun) {
        const repeatedItems = [];
        for (let i = 0; i < 10; i++) {
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
    }, [items, isSpinning, hasSpun]);

    const virtualItems = React.useMemo(() => {
      if (isSpinning || hasSpun) {
        const allItems = displayItems.map((item, index) => ({
          item,
          index,
          virtualIndex: index,
        }));
        return allItems;
      } else {
        const items = [];
        for (let i = virtualStartIndex; i <= virtualEndIndex; i++) {
          if (i < displayItems.length) {
            items.push({
              item: displayItems[i],
              index: i,
              virtualIndex: i - virtualStartIndex,
            });
          }
        }
        return items;
      }
    }, [displayItems, virtualStartIndex, virtualEndIndex, isSpinning, hasSpun]);

    const calculateVisibleItems = useCallback(
      (position: number) => {
        if (!containerRef.current) {
          return { start: 0, end: 0 };
        }

        const containerWidth = containerRef.current.offsetWidth;
        const totalItems = displayItems.length;

        const startPosition = Math.abs(position);
        const visibleStartIndex = Math.floor(startPosition / itemFullWidth);
        const visibleEndIndex = Math.ceil(
          (startPosition + containerWidth) / itemFullWidth
        );

        const bufferedStart = Math.max(0, visibleStartIndex - VIRTUAL_BUFFER);
        const bufferedEnd = Math.min(
          totalItems - 1,
          visibleEndIndex + VIRTUAL_BUFFER
        );

        return { start: bufferedStart, end: bufferedEnd };
      },
      [displayItems.length, itemFullWidth]
    );

    const detectionCache = useRef({
      lastContainerCenterX: 0,
      lastResult: -1,
      lastTimestamp: 0,
    });

    const detectCenterItem = () => {
      if (!containerRef.current || !carouselRef.current) return -1;

      const containerRect = containerRef.current.getBoundingClientRect();
      const containerCenterX = containerRect.left + containerRect.width / 2;

      const now = Date.now();
      if (
        Math.abs(
          containerCenterX - detectionCache.current.lastContainerCenterX
        ) < 5 &&
        now - detectionCache.current.lastTimestamp < 50
      ) {
        return detectionCache.current.lastResult;
      }

      const currentTransform =
        carouselRef.current.style.transform || "translateX(0px)";
      const position = parseFloat(
        currentTransform.replace("translateX(", "").replace("px)", "")
      );
      const containerWidth = containerRef.current.offsetWidth;
      const centerOffset = containerWidth / 2;
      const absoluteCenterPosition = Math.abs(position) + centerOffset;
      const centerItemIndex = Math.round(
        absoluteCenterPosition / itemFullWidth
      );
      const result = centerItemIndex % items.length;
      detectionCache.current = {
        lastContainerCenterX: containerCenterX,
        lastResult: result,
        lastTimestamp: now,
      };

      return result;
    };

    const startHighFrequencyDetection = () => {
      let lastCenterIndex = currentCenterIndex;
      let detectionCount = 0;

      const detectAndUpdate = () => {
        detectionCount++;
        const centerIndex = detectCenterItem();

        if (
          centerIndex !== lastCenterIndex &&
          centerIndex !== currentCenterIndex &&
          centerIndex >= 0 &&
          centerIndex < items.length &&
          isSpinning
        ) {
          lastCenterIndex = centerIndex;
          setCurrentCenterIndex(centerIndex);
          playTickSound();
          if (onItemInCenter) {
            onItemInCenter(items[centerIndex], centerIndex);
          }
        }

        highFrequencyDetectionRef.current =
          requestAnimationFrame(detectAndUpdate);
      };

      highFrequencyDetectionRef.current =
        requestAnimationFrame(detectAndUpdate);
    };

    const animate = useCallback(() => {
      if (!carouselRef.current || isSpinning || hasSpun) return;

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
      currentPositionRef.current = position;
      animationRef.current = requestAnimationFrame(animate);
    }, [isSpinning, hasSpun, speed, itemWidth, gap, items.length]);

    useEffect(() => {
      const syncInterval = setInterval(() => {
        if (!isSpinning && !hasSpun) {
          const position = currentPositionRef.current;
          if (Math.abs(position - currentPosition) > 1) {
            setCurrentPosition(position);
          }
        }
      }, 100);

      return () => clearInterval(syncInterval);
    }, [isSpinning, hasSpun, currentPosition]);

    useEffect(() => {
      if (!isSpinning && !hasSpun) {
        const { start, end } = calculateVisibleItems(currentPosition);
        setVirtualStartIndex(start);
        setVirtualEndIndex(end);
      }
    }, [currentPosition, isSpinning, hasSpun, calculateVisibleItems]);

    useEffect(() => {
      if (carouselRef.current && !isSpinning && !hasSpun) {
        carouselRef.current.style.transform = "translateX(0px)";
        setCurrentPosition(0);
        currentPositionRef.current = 0;
        animationRef.current = requestAnimationFrame(animate);
        startHighFrequencyDetection();
        return () => {
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
          }
        };
      } else if (hasSpun && carouselRef.current) {
        carouselRef.current.style.transform = `translateX(${finalPosition}px)`;
        setCurrentPosition(finalPosition);
        currentPositionRef.current = finalPosition;
      }
    }, [isSpinning, hasSpun]);

    useEffect(() => {
      if (showResult && onSpinComplete) {
        onSpinComplete(items[winningIndex]);
      }
    }, [showResult, winningIndex]);

    const colors = {
      common: {
        bar: "neutral-11",
        bg: "neutral-2",
        light: "neutral-9",
      },
      uncommon: {
        bar: "green-11",
        bg: "green-2",
        light: "green-9",
      },
      rare: {
        bar: "link-11",
        bg: "link-2",
        light: "link-9",
      },
      epic: {
        bar: "purple-11",
        bg: "purple-2",
        light: "purple-6",
      },
      legendary: {
        bar: "warning-11",
        bg: "warning-2",
        light: "warning-9",
      },
    };

    const itemColor = useMemo(() => {
      return !isSpinning && showResult
        ? colors[
            items[winningIndex].rarity?.toLowerCase() as keyof typeof colors
          ] || colors.common
        : colors.common;
    }, [isSpinning, showResult, winningIndex]);

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
            className="relative w-full overflow-hidden h-full"
          >
            <div className="absolute top-1 md:top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center rotate-180 pointer-events-none">
              <Image
                src="/images/arrow_item.png"
                alt="arrow-up"
                width={10}
                height={10}
                className="w-6 h-6 rotate-180 animate-bounce"
              />
              <div
                className="w-40 h-0.5 rounded-full animate-pulse mx-auto mt-1 md:mt-4"
                style={{
                  backgroundColor: "rgba(65, 174, 196, 0.8)",
                }}
              />
            </div>

            <div className="absolute bottom-1 md:bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center pointer-events-none">
              <Image
                src="/images/arrow_item.png"
                alt="arrow-up"
                width={10}
                height={10}
                className="w-6 h-6 animate-bounce"
              />
              <div
                className="w-40 h-0.5 animate-pulse mx-auto mt-1 md:mt-4"
                style={{
                  backgroundColor: "rgba(65, 174, 196, 0.8)",
                }}
              />
            </div>
            <div
              ref={carouselRef}
              className={`absolute flex items-center h-full z-10`}
              style={{
                willChange: "transform",
                transformStyle: "preserve-3d",
                gap: `${gap}px`,
                ...(isSpinning || hasSpun
                  ? {}
                  : {
                      width: `${displayItems.length * itemFullWidth - gap}px`,
                      left: `${virtualStartIndex * itemFullWidth}px`,
                    }),
              }}
            >
              {virtualItems.map(({ item, index, virtualIndex }) => {
                const itemIndexInOriginal = index % items.length;
                const isInCenter = itemIndexInOriginal === currentCenterIndex;
                const isWinner = itemIndexInOriginal === winningIndex;
                return (
                  <div
                    key={`${item.id}-${index}`}
                    className={`shrink-0 relative rounded-lg transition-all duration-300 ease-in-out flex flex-col items-center justify-center ${
                      isWinner && showResult
                        ? "scale-110"
                        : isInCenter
                        ? "scale-105"
                        : showResult
                        ? "scale-95"
                        : "scale-95"
                    }`}
                    style={{
                      width: `${itemWidth}px`,
                      height: `${itemHeight}px`,
                      ...(isSpinning || hasSpun
                        ? {}
                        : {
                            position: "absolute",
                            left: `${virtualIndex * itemFullWidth}px`,
                          }),
                    }}
                  >
                    <div className="text-center flex flex-col items-center justify-center">
                      <span
                        className={`font-bold transition-all duration-300 ease-in-out ${
                          isWinner && showResult
                            ? "text-2xl"
                            : isInCenter
                            ? "text-xl"
                            : "text-lg"
                        }`}
                        style={{ 
                          color: isInCenter || isWinner ? "#41aec4" : "rgba(65, 174, 196, 0.7)",
                          textShadow: isInCenter || isWinner ? "0 0 10px rgba(65, 174, 196, 0.5)" : "none"
                        }}
                      >
                        {item.value?.toLocaleString("pt-BR")}
                      </span>
                      <span
                        className="text-xs mt-1"
                        style={{ color: isInCenter || isWinner ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.5)" }}
                      >
                        tokens
                      </span>
                    </div>
                    {showResult && isInCenter && (
                      <motion.div
                        className="text-center flex flex-col items-center space-y-1 mt-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <span
                          className="text-sm font-semibold p-3 px-5 rounded-lg shadow-lg"
                          style={{
                            backgroundColor: "#41aec4",
                            color: "#000000",
                            border: "1px solid rgba(65, 174, 196, 0.5)",
                          }}
                        >
                          {items[winningIndex].value?.toLocaleString("pt-BR")}{" "}
                          tokens $RECEBA
                        </span>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center z-0">
              <motion.div
                className="transition-all duration-300 ease-in-out w-[20rem] sm:w-[30rem] md:w-[40rem] h-[20rem] sm:h-[30rem] md:h-[40rem] rounded-full blur-[80px] md:blur-[140px]"
                style={{
                  backgroundColor: isSpinning || showResult ? "#41aec4" : "rgba(65, 174, 196, 0.2)",
                  opacity: isSpinning || showResult ? 0.4 : 0.2,
                }}
                animate={{
                  scale: isSpinning || showResult ? 1.1 : 1,
                }}
              />
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center z-0">
              <motion.div
                className="w-[20rem] sm:w-[30rem] md:w-[40rem] h-[20rem] sm:h-[30rem] md:h-[40rem] rounded-full transition-all duration-300 ease-in-out border-[1px] md:border-[2px]"
                style={{
                  borderColor: isSpinning || showResult ? "rgba(65, 174, 196, 0.6)" : "rgba(65, 174, 196, 0.3)",
                }}
                animate={{ scale: isSpinning || showResult ? 1.05 : 1 }}
              />
            </div>

            <div
              className={`absolute left-0 top-0 bottom-0 z-20 h-full ${
                isSpinning || showResult
                  ? "w-[25%]"
                  : "w-[15%] sm:w-[20%] md:w-[25%]"
              } pointer-events-none`}
            >
              <div
                className="absolute inset-0 bg-gradient-to-r h-full to-transparent"
                style={{
                  background: `linear-gradient(to right, #000000, rgba(0, 0, 0, 0.8), transparent)`,
                }}
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
                className="absolute inset-0 bg-gradient-to-l h-full to-transparent"
                style={{
                  background: `linear-gradient(to left, #000000, rgba(0, 0, 0, 0.8), transparent)`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

HorizontalSpinCarousel.displayName = "HorizontalSpinCarousel";

export default HorizontalSpinCarousel;

