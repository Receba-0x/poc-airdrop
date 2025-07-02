"use client";
import { useRef, useEffect, useState } from "react";
import { LogoIcon } from "../Icons/LogoIcon";
import { Button } from "../Button";
import Image from "next/image";
import { SimulationIcon } from "../Icons/SimulationIcon";
import { PurchaseIcon } from "../Icons/PurchaseIcon";
import ItemCard from "../ItemCard.tsx";
import { ScrollAnimation } from "../ScrollAnimation";
import { motion } from "framer-motion";
import { CRYPTO_PRIZE_TABLE, PRIZE_TABLE, getItensData } from "@/constants";
import { usePurchase } from "@/hooks/usePurchase";
import { useBoxStats } from "@/hooks/useBoxStats";
import { useLanguage } from "@/contexts/LanguageContext";
import { TransactionPurchaseModal } from "../TransactionPurchaseModal";
import crypto from "crypto";

export function BoxSection({ boxName }: { boxName: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const {
    onMint,
    modalOpen,
    modalStatus,
    errorMessage: purchaseErrorMessage,
    transactionHash,
    currentPrize,
    currentBoxType,
    closeModal,
    currentStock,
  } = usePurchase();
  const { stats, isLoading: statsLoading, refetch } = useBoxStats();
  const { t } = useLanguage();
  console.log(currentStock);

  const [simulationModalOpen, setSimulationModalOpen] = useState(false);
  const [simulationStatus, setSimulationStatus] = useState<
    | "initializing"
    | "paying_bnb_fee"
    | "checking_balance"
    | "approving_tokens"
    | "burning_tokens"
    | "validating_transaction"
    | "determining_prize"
    | "saving_transaction"
    | "success"
    | "error"
  >("initializing");
  const [simulationPrize, setSimulationPrize] = useState<any>(null);

  const isCrypto = boxName === "cryptos";
  const itens = isCrypto ? CRYPTO_PRIZE_TABLE : getItensData(t).slice(3, 10);

  const carouselItems = [];
  for (let i = 0; i < 30; i++) {
    const item = itens[i % itens.length];
    carouselItems.push(item);
  }

  const itemWidth = 160;
  const itemGap = 60;
  const speed = 0.1;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const animate = () => {
    if (!carouselRef.current) return;
    const currentTransform =
      carouselRef.current.style.transform || "translateX(0px)";
    let position = parseFloat(
      currentTransform.replace("translateX(", "").replace("px)", "")
    );
    position -= speed;
    const resetPoint = -((itemWidth + itemGap) * itens.length);
    if (position <= resetPoint) {
      position = 0;
    }
    carouselRef.current.style.transform = `translateX(${position}px)`;
    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.style.transform = "translateX(0px)";
    }
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const handlePurchase = async () => {
    /* try {
      await onMint(boxName === "cryptos");
      refetch();
    } catch (error: any) {
      console.error("Erro ao processar compra:", error);
    } */
  };

  const generateRandomNumber = () => {
    const buffer = crypto.randomBytes(4);
    const hexNumber = buffer.toString("hex").substring(0, 8);
    return parseInt(hexNumber, 16) / 0xffffffff;
  };

  const checkStock = (prizeId: number): boolean => {
    const prize = PRIZE_TABLE.find((p) => p.id === prizeId);
    if (!prize?.stockRequired) return true;
    return (currentStock[prizeId] || 0) > 0;
  };

  const simulateDeterminePrize = (
    randomNumber: number,
    isCrypto: boolean = false
  ) => {
    if (isCrypto) {
      let cumulativeProbability = 0;
      for (const prize of CRYPTO_PRIZE_TABLE) {
        cumulativeProbability += prize.probability;
        if (randomNumber < cumulativeProbability) return prize;
      }
      return CRYPTO_PRIZE_TABLE[0];
    } else {
      let cumulativeProbability = 0;
      for (const prize of PRIZE_TABLE) {
        cumulativeProbability += prize.probability;
        if (randomNumber < cumulativeProbability) {
          if (prize.stockRequired && !checkStock(prize.id)) continue;
          return prize;
        }
      }
      const fallbackPrize = PRIZE_TABLE.find(
        (p) => p.type === "sol" && !p.stockRequired
      );
      if (fallbackPrize) return fallbackPrize;
      return PRIZE_TABLE[0];
    }
  };

  const handleSimulation = async () => {
    setSimulationModalOpen(true);
    setSimulationStatus("initializing");
    setTimeout(() => {
      setSimulationStatus("paying_bnb_fee");
      setTimeout(() => {
        setSimulationStatus("burning_tokens");
        setTimeout(() => {
          setSimulationStatus("validating_transaction");
          setTimeout(() => {
            setSimulationStatus("determining_prize");
            setTimeout(() => {
              const randomNumber = generateRandomNumber();
              const prize = simulateDeterminePrize(randomNumber, isCrypto);
              setSimulationPrize(prize);
              setSimulationStatus("saving_transaction");
              setTimeout(() => {
                setSimulationStatus("success");
              }, 1000);
            }, 2000);
          }, 1500);
        }, 1500);
      }, 1500);
    }, 1000);
  };

  const closeSimulationModal = () => {
    setSimulationModalOpen(false);
    setSimulationPrize(null);
  };

  const boxImage =
    boxName === "cryptos"
      ? "/images/boxes/cripto.webp"
      : "/images/boxes/super-prize.webp";
  const boxPrice = boxName === "cryptos" ? 17.5 : 45;
  const tokenPrice = 0.002;
  const boxPriceInToken = boxPrice / tokenPrice;

  return (
    <>
      <section className="flex flex-col items-center justify-center w-full">
        <ScrollAnimation
          type="fade"
          direction="up"
          duration={0.8}
          className="bg-[#0F0F0F] mt-[56px] md:mt-[64px] flex flex-col items-center justify-center border-y border-[#222222] w-full h-[250px] sm:h-[280px] md:h-[318px] relative overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center z-0">
            <motion.div
              className="bg-[#6E6E6E]/50 w-[20rem] sm:w-[30rem] md:w-[40rem] h-[20rem] sm:h-[30rem] md:h-[40rem] rounded-full blur-[80px] md:blur-[140px]"
              animate={{
                scale: isHovered ? 1.1 : 1,
                opacity: isHovered ? 0.7 : 0.5,
                transition: { duration: 1.2, ease: "easeInOut" },
              }}
            />
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center z-0">
            <motion.div
              className="w-[20rem] sm:w-[30rem] md:w-[40rem] h-[20rem] sm:h-[30rem] md:h-[40rem] rounded-full border-[2px] md:border-[3px] border-[rgb(58,58,58)]"
              animate={{
                scale: isHovered ? 1.05 : 1,
                borderWidth: isHovered ? "3px" : "2px",
                transition: { duration: 1, ease: "easeInOut" },
              }}
            />
          </div>

          <div
            ref={containerRef}
            className="relative w-full h-full overflow-hidden z-10"
          >
            <div className="absolute left-0 top-0 bottom-0 z-20 w-[15%] sm:w-[20%] md:w-[25%] pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-[#0F0F0F] via-[#0F0F0F]/80 to-transparent"></div>
            </div>
            <div
              ref={carouselRef}
              className="absolute flex items-center h-full"
              style={{ gap: `${itemGap}px` }}
            >
              {carouselItems.map((item, index) => (
                <motion.div
                  key={`item-${index}`}
                  className="flex-shrink-0 bg-cover bg-center bg-no-repeat rounded-md"
                  style={{
                    width: `${itemWidth * (isMobile ? 0.8 : 1)}px`,
                    height: `${itemWidth * (isMobile ? 0.8 : 1)}px`,
                  }}
                  whileHover={{ scale: 1.1, transition: { duration: 0.3 } }}
                >
                  <Image
                    src={item.image}
                    alt={item.name || `Prize ${item.id}`}
                    width={100000}
                    height={100000}
                    className="w-full h-full object-contain"
                  />
                </motion.div>
              ))}
            </div>

            <div className="absolute right-0 top-0 bottom-0 z-20 w-[15%] sm:w-[20%] md:w-[25%] pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-l from-[#0F0F0F] via-[#0F0F0F]/80 to-transparent"></div>
            </div>
          </div>
        </ScrollAnimation>

        <div className="flex flex-col w-full max-w-[1280px] px-6 md:px-0 pt-6">
          <ScrollAnimation
            type="fade"
            direction="up"
            delay={0.2}
            duration={0.7}
          >
            <div className="flex flex-col md:flex-row items-start md:items-center w-full justify-between gap-4 md:gap-16">
              <div className="flex items-center gap-4 sm:gap-8">
                <motion.div
                  whileHover={{
                    rotate: [0, -5, 5, -5, 0],
                    transition: { duration: 0.5 },
                  }}
                  className="w-24 h-16 sm:w-32 sm:h-auto"
                >
                  <Image
                    src={boxImage}
                    alt="random"
                    width={130}
                    height={88}
                    className="w-full h-full object-contain"
                  />
                </motion.div>
                <div className="flex flex-col gap-2">
                  <motion.h1
                    className="bg-gradient-to-r from-[#FFF7A8] to-[#FFEB28] bg-clip-text text-transparent font-bold text-xl sm:text-2xl"
                    animate={{
                      textShadow: isHovered
                        ? "0 0 8px rgba(255, 235, 40, 0.5)"
                        : "0 0 0px rgba(255, 235, 40, 0)",
                      transition: {
                        duration: 0.5,
                        repeat: Infinity,
                        repeatType: "reverse",
                      },
                    }}
                  >
                    {boxName === "cryptos"
                      ? t("box.cryptos")
                      : t("box.superPrizes")}
                  </motion.h1>
                  <p className="text-xs sm:text-sm text-[#B4B4B4] max-w-[300px] sm:max-w-none">
                    {t("box.description")}{" "}
                    <span className="text-[#FFD700]">
                      {t("box.illustrationImages")}
                    </span>
                  </p>

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#FFD700] rounded-full animate-pulse"></div>
                      <span className="text-xs text-[#FFD700] font-medium">
                        {t("box.stats.limited")}
                      </span>
                    </div>
                    {!isCrypto && !statsLoading && (
                      <div className="flex flex-col sm:flex-row gap-2 text-xs text-[#B4B4B4]">
                        <span>
                          {t("box.stats.opened")}:{" "}
                          <span className="text-white font-medium">
                            {stats?.totalSuperPrizeBoxesOpened || 0}
                          </span>
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span>
                          {t("box.stats.remaining")}:{" "}
                          <span className="text-[#28D939] font-medium">
                            {stats?.remainingSuperPrizeBoxes || 0}
                          </span>
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span>
                          {t("box.stats.total")}:{" "}
                          <span className="text-white font-medium">
                            {stats?.maxSuperPrizeBoxes || 0}
                          </span>
                        </span>
                      </div>
                    )}
                    {isCrypto && !statsLoading && (
                      <div className="flex flex-col sm:flex-row gap-2 text-xs text-[#B4B4B4]">
                        <span>
                          {t("box.stats.opened")}:{" "}
                          <span className="text-white font-medium">
                            {stats?.totalCryptoBoxesOpened || 0}
                          </span>
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span>
                          {t("box.stats.remaining")}:{" "}
                          <span className="text-[#28D939] font-medium">
                            {stats?.remainingCryptoBoxes || 0}
                          </span>
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span>
                          {t("box.stats.total")}:{" "}
                          <span className="text-white font-medium">
                            {stats?.maxCryptoBoxes || 0}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-start md:items-end gap-2 w-full md:w-auto mt-4 md:mt-0">
                <motion.div
                  className="flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                >
                  <LogoIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="font-bold text-xl sm:text-2xl">
                    {boxPriceInToken.toLocaleString("en-US", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </motion.div>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    className="w-full sm:w-auto"
                  >
                    <Button
                      className="w-full sm:w-[209px] h-[44px] sm:h-[52px]"
                      variant="secondary"
                      onClick={handleSimulation}
                    >
                      <SimulationIcon className="w-5 h-5" />
                      <span className="ml-1 text-sm sm:text-base">
                        {t("box.simulation")}
                      </span>
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    className="w-full sm:w-auto"
                  >
                    <Button
                      className="w-full sm:w-[209px] h-[44px] sm:h-[52px]"
                      variant="primary"
                      onClick={handlePurchase}
                      disabled={
                        isCrypto
                          ? stats.remainingCryptoBoxes <= 0
                          : stats.remainingSuperPrizeBoxes <= 0
                      }
                    >
                      <PurchaseIcon className="w-5 h-5" />
                      <span className="ml-1 text-sm sm:text-base">
                        {isCrypto
                          ? stats.remainingCryptoBoxes <= 0
                            ? t("box.soldOut")
                            : t("box.purchase")
                          : stats.remainingSuperPrizeBoxes <= 0
                          ? t("box.soldOut")
                          : t("box.purchase")}
                      </span>
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </ScrollAnimation>

          <ScrollAnimation
            type="fade"
            direction="up"
            delay={0.4}
            duration={0.7}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mt-10">
              {!isCrypto &&
                itens.map((box, index) => (
                  <motion.div
                    key={Number(box.id) + index}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ItemCard
                      key={box.id}
                      item={box}
                      currentStock={currentStock}
                    />
                  </motion.div>
                ))}
            </div>
          </ScrollAnimation>
        </div>
      </section>

      <TransactionPurchaseModal
        isOpen={modalOpen}
        onClose={closeModal}
        status={modalStatus}
        amount={boxPriceInToken.toString()}
        boxType={currentBoxType}
        errorMessage={purchaseErrorMessage}
        transactionHash={transactionHash}
        prize={currentPrize}
        onBuyAgain={handlePurchase}
      />

      <TransactionPurchaseModal
        isOpen={simulationModalOpen}
        onClose={closeSimulationModal}
        status={simulationStatus}
        amount={boxPriceInToken.toString()}
        boxType={isCrypto ? t("box.cryptos") : t("box.superPrizes")}
        prize={simulationPrize}
        onBuyAgain={handleSimulation}
      />
    </>
  );
}
