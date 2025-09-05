"use client";
import { useRef, useEffect, useState } from "react";
import { HorizontalSpinCarouselRef } from "../HorizontalSpinCarousel";
import { LogoIcon } from "../Icons/LogoIcon";
import { Button } from "../Button";
import Image from "next/image";
import { SimulationIcon } from "../Icons/SimulationIcon";
import { PurchaseIcon } from "../Icons/PurchaseIcon";
import ItemCard from "../ItemCard";
import { ScrollAnimation } from "../ScrollAnimation";
import { motion } from "framer-motion";
import { CRYPTO_PRIZE_TABLE, PRIZE_TABLE, getItensData } from "@/constants";
import { usePurchase } from "@/hooks/usePurchase";
import { useBoxStats } from "@/hooks/useBoxStats";
import { useLanguage } from "@/contexts/LanguageContext";
import { TransactionPurchaseModal } from "../TransactionPurchaseModal";
import HorizontalSpinCarousel from "../HorizontalSpinCarousel";
import crypto from "crypto";

export function BoxSection({ boxName }: { boxName: string }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const carouselRef = useRef<HorizontalSpinCarouselRef>(null);
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

  const [simulationModalOpen, setSimulationModalOpen] = useState(false);
  const [simulationStatus, setSimulationStatus] = useState<
    | "initializing"
    | "processing_sol_fee"
    | "burning_tokens"
    | "validating_transaction"
    | "determining_prize"
    | "success"
    | "error"
  >("initializing");
  const [simulationPrize, setSimulationPrize] = useState<any>(null);

  const isCrypto = boxName === "cryptos";
  const itens = getItensData(t).slice(3, 10);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handlePurchase = async () => {
    try {
      await onMint(boxName === "cryptos");
      refetch();
    } catch (error: any) {
      console.error("Erro ao processar compra:", error);
    }
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
      setSimulationStatus("processing_sol_fee");
      setTimeout(() => {
        setSimulationStatus("burning_tokens");
        setTimeout(() => {
          setSimulationStatus("validating_transaction");
          setTimeout(() => {
            handleTestSpin();
            setSimulationModalOpen(false);
          }, 1500);
        }, 1500);
      }, 1500);
    }, 1000);
  };

  const closeSimulationModal = () => {
    setSimulationModalOpen(false);
    setSimulationPrize(null);
  };

  const handleSpinComplete = (winningItem: any) => {
    setIsSpinning(false);
  };

  const handleTestSpin = () => {
    if (carouselRef.current && !isSpinning) {
      setIsSpinning(true);
      const randomIndex = Math.floor(Math.random() * itens.length);
      console.log("🎰 Starting spin with random winner index:", randomIndex);
      carouselRef.current.startSpin(randomIndex);
    }
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
          className="bg-neutral-2 flex flex-col items-center justify-center border-b border-neutral-6 w-full h-[250px] sm:h-[280px] md:h-[318px] relative overflow-hidden"
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

          <HorizontalSpinCarousel
            ref={carouselRef}
            items={itens}
            itemWidth={isMobile ? 128 : 160}
            itemHeight={isMobile ? 128 : 160}
            gap={60}
            speed={0.1}
            spinDuration={8000}
            onSpinComplete={handleSpinComplete}
            className="relative w-full h-full z-10"
          />
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
                <Image
                  src={boxImage}
                  alt="random"
                  height={110}
                  width={130}
                  className="object-cover"
                  priority
                />
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
                      variant="outline"
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
                      variant="default"
                      onClick={handlePurchase}
                    >
                      <PurchaseIcon className="w-5 h-5" />
                      <span className="ml-1 text-sm sm:text-base">
                        {t("box.purchase")}
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
              {itens.map((box, index) => (
                <motion.div
                  key={Number(box.id) + index}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <ItemCard key={box.id} item={box} />
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
