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
  onItemInCenter?: (item: CarouselItem, index: number) => void;
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

    const tickAudioRef = useRef<HTMLAudioElement | null>(null);
    const finishAudioRef = useRef<HTMLAudioElement | null>(null);
    const startAudioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
      const startTime = Date.now();

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

      const checkAudioLoad = () => {
        const loadTime = Date.now() - startTime;
        console.log(`[AUDIO] Áudios carregados em ${loadTime}ms`);
      };

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

          // Otimização crítica: preparar animação com performance máxima
          const carousel = carouselRef.current;
          carousel.style.transition = "none";
          carousel.style.transform = "translateX(0px)";
          carousel.style.willChange = "transform";
          carousel.style.contain = "layout style paint";

          // Forçar reflow de forma otimizada
          carousel.offsetWidth;

          // Pré-aquecer cálculos críticos e cache
          const containerRect = containerRef.current.getBoundingClientRect();
          const itemsPerCycle = items.length;

          // Warm-up: pré-calcular primeira detecção
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
          const startTime = performance.now(); // Melhor precisão de timing
          const totalDistance = endPosition - startPosition;

          let frameCount = 0;
          let lastFrameTime = startTime;

          const animateSpin = () => {
            frameCount++;
            const currentTime = performance.now();
            const elapsed = currentTime - startTime;

            // Otimização: calcular FPS e ajustar se necessário
            const deltaTime = currentTime - lastFrameTime;
            lastFrameTime = currentTime;

            // Garantir mínimo de 30fps nos primeiros frames
            if (frameCount <= 5 && deltaTime > 33) {
              // Frame lento detectado, pular para próxima posição
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

          // Prioridade máxima para primeiro frame
          requestAnimationFrame(() => {
            requestAnimationFrame(animateSpin);
          });

          let spinFrameCount = 0;
          const monitorStartTime = performance.now(); // Melhor precisão
          let monitorAnimationId: number | null = null;

          let lastDetectedIndex = currentCenterIndex;
          let detectionThrottle = 0; // Throttle para primeiros frames

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

            // Otimização: throttle detecção nos primeiros frames para reduzir carga
            detectionThrottle++;
            if (detectionThrottle < 2 && elapsedTime < 200) {
              // Primeiros 200ms
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

            // Limpar otimizações após animação
            if (carouselRef.current) {
              carouselRef.current.style.willChange = "auto";
              carouselRef.current.style.contain = "none"; // Remover containment
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

    // Cache para otimização de detecção
    const detectionCache = useRef({
      lastContainerCenterX: 0,
      lastResult: -1,
      lastTimestamp: 0,
    });

    const detectCenterItem = () => {
      if (!containerRef.current || !carouselRef.current) return -1;

      const containerRect = containerRef.current.getBoundingClientRect();
      const containerCenterX = containerRect.left + containerRect.width / 2;

      // Otimização: usar cache se a posição não mudou muito
      const now = Date.now();
      if (
        Math.abs(
          containerCenterX - detectionCache.current.lastContainerCenterX
        ) < 5 &&
        now - detectionCache.current.lastTimestamp < 50 // Cache por 50ms
      ) {
        return detectionCache.current.lastResult;
      }

      const itemElements = carouselRef.current.children;
      let closestIndex = -1;
      let closestDistance = Infinity;
      let intersectingIndex = -1;

      for (let i = 0; i < itemElements.length; i++) {
        const itemElement = itemElements[i] as HTMLElement;
        const itemRect = itemElement.getBoundingClientRect();

        if (
          itemRect.left <= containerCenterX &&
          containerCenterX <= itemRect.right
        ) {
          intersectingIndex = i % items.length;
          break;
        }

        const itemCenterX = itemRect.left + itemRect.width / 2;
        const distance = Math.abs(containerCenterX - itemCenterX);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = i;
        }
      }
      const result =
        intersectingIndex >= 0
          ? intersectingIndex
          : closestIndex >= 0
          ? closestIndex % items.length
          : -1;

      // Atualizar cache
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

    const animate = () => {
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

      animationRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
      if (carouselRef.current && !isSpinning && !hasSpun) {
        carouselRef.current.style.transform = "translateX(0px)";
        animationRef.current = requestAnimationFrame(animate);
        startHighFrequencyDetection();
        return () => {
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
          }
        };
      } else if (hasSpun && carouselRef.current) {
        carouselRef.current.style.transform = `translateX(${finalPosition}px)`;
      }
    }, [isSpinning, hasSpun]);

    useEffect(() => {
      if (showResult && onSpinComplete) {
        onSpinComplete(items[winningIndex]);
      }
    }, [showResult, winningIndex]);

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
                className={`w-40 h-0.5 bg-gradient-to-r from-transparent animate-pulse ${
                  !isSpinning && showResult ? "via-green-11" : "via-neutral-10"
                } to-transparent mx-auto mt-1 md:mt-4`}
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
                className={`w-40 h-0.5 bg-gradient-to-r from-transparent animate-pulse ${
                  !isSpinning && showResult ? "via-green-11" : "via-neutral-10"
                } to-transparent mx-auto mt-1 md:mt-4`}
              />
            </div>
            <div
              ref={carouselRef}
              className={`absolute flex items-center h-full z-10`}
              style={{
                willChange: "transform",
                transformStyle: "preserve-3d",
                gap: `${gap}px`,
              }}
            >
              {displayItems.map((item, index) => {
                const itemIndexInOriginal = index % items.length;
                const isInCenter = itemIndexInOriginal === currentCenterIndex;

                return (
                  <div
                    key={`${item.id}-${index}`}
                    className={`shrink-0 rounded-lg transition-all duration-300 ease-in-out ${
                      isInCenter
                        ? "scale-110"
                        : isInCenter && showResult
                        ? "scale-100"
                        : !isInCenter && showResult
                        ? "scale-90"
                        : "scale-100"
                    }`}
                    style={{
                      width: `${itemWidth}px`,
                      height: `${itemHeight}px`,
                    }}
                  >
                    <div className="w-full h-full relative flex flex-col items-center justify-center p-[1px]">
                      <Image
                        src={item.image}
                        alt={item.name || `Item ${item.id}`}
                        width={1000}
                        height={1000}
                        className="w-full h-full object-contain"
                        draggable={false}
                      />
                      {showResult && isInCenter && (
                        <motion.div
                          className="rounded-lg text-center flex flex-col items-center mt-2"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          <span className="text-neutral-12 font-bold">
                            {items[winningIndex].name}
                          </span>
                          <span className="text-neutral-12 font-bold">
                            {items[winningIndex].id}
                          </span>
                        </motion.div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center z-0 animate-pulse">
              <motion.div
                className={` ${
                  !isSpinning && showResult ? "bg-green-9" : "bg-neutral-10"
                } transition-all duration-300 ease-in-out w-[20rem] sm:w-[30rem] md:w-[40rem] h-[20rem] sm:h-[30rem] md:h-[40rem] rounded-full blur-[80px] md:blur-[140px]`}
                animate={{
                  scale: isSpinning || showResult ? 1.1 : 1,
                  opacity: isSpinning || showResult ? 0.7 : 0.5,
                }}
              />
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center z-0 animate-pulse">
              <motion.div
                className={`w-[20rem] sm:w-[30rem] md:w-[40rem] h-[20rem] sm:h-[30rem] md:h-[40rem] rounded-full transition-all duration-300 ease-in-out opacity-50 border-[2px] md:border-[3px] ${
                  !isSpinning && showResult
                    ? "border-green-8"
                    : "border-neutral-10"
                }`}
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
      </div>
    );
  }
);

HorizontalSpinCarousel.displayName = "HorizontalSpinCarousel";

export default HorizontalSpinCarousel;
