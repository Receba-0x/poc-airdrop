"use client";
import { useRef, useEffect, useState, useMemo } from "react";
import { HorizontalSpinCarouselRef } from "@/components/HorizontalSpinCarousel";
import { LogoIcon } from "../Icons/LogoIcon";
import { Button } from "../Button";
import Image from "next/image";
import { SimulationIcon } from "../Icons/SimulationIcon";
import { PurchaseIcon } from "../Icons/PurchaseIcon";
import ItemCard from "../ItemCard";
import { ScrollAnimation } from "../ScrollAnimation";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import HorizontalSpinCarousel from "@/components/HorizontalSpinCarousel";
import {
  useClientSeed,
  useLootbox,
  usePurchaseLootbox,
} from "@/hooks/useLootbox";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { WonItemModal } from "../WonItemModal";
import { useSellItem } from "@/hooks/useSellItem";
import { LootboxPurchaseModal } from "../LootboxPurchaseModal";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export function BoxSection({ id }: { id: string }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const carouselRef = useRef<HorizontalSpinCarouselRef>(null);
  const [wonPrize, setWonPrize] = useState<any>(null);
  const [shouldSpin, setShouldSpin] = useState(false);
  const [showWonItemModal, setShowWonItemModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const { lootbox, isLoading } = useLootbox(id);
  const { refetchUser, isAuthenticated } = useAuth();
  const { push } = useRouter();
  const { purchase, isLoading: isPurchasing } = usePurchaseLootbox();
  const { generateSeed } = useClientSeed();
  const { sellItem, isLoading: isSelling } = useSellItem();
  const { t } = useLanguage();
  const itens = useMemo(
    () => lootbox?.items?.map((item: any) => item.item) || [],
    [lootbox]
  );

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handlePurchase = () => {
    if (!isAuthenticated) {
      push("/login");
      return;
    }
    setShowPurchaseModal(true);
  };

  const handleConfirmPurchase = async () => {
    try {
      const seed = generateSeed();
      const purchaseResult = await purchase({
        action: "purchase",
        boxId: id,
        clientSeed: seed,
      });
      if (purchaseResult?.data?.wonPrize) {
        setWonPrize(purchaseResult.data.wonPrize);
        setShouldSpin(true);
      }
      setShowPurchaseModal(false);
    } catch (error: any) {
      console.error("Erro ao processar compra:", error);
      setShowPurchaseModal(false);
    }
  };

  const handleSimulation = async () => {
    handleTestSpin();
  };

  const handleSpinComplete = () => {
    setIsSpinning(false);
    setShouldSpin(false);

    if (wonPrize) {
      setTimeout(() => {
        setShowWonItemModal(true);
      }, 2000);
    }

    refetchUser();
  };

  const handleKeepItem = () => {
    setWonPrize(null);
    setShowWonItemModal(false);
  };

  const handleSellItem = async () => {
    if (wonPrize?.id) {
      try {
        await sellItem(wonPrize.id);
        setWonPrize(null);
        setShowWonItemModal(false);
        refetchUser();
      } catch (error) {
        console.error("Erro ao vender item:", error);
      }
    }
  };

  const handleCloseWonItemModal = () => {
    setShowWonItemModal(false);
    if (!wonPrize) {
      setWonPrize(null);
    }
  };

  const handleTestSpin = () => {
    if (carouselRef.current && !isSpinning) {
      setIsSpinning(true);
      const randomIndex = Math.floor(Math.random() * itens.length);
      carouselRef.current.startSpin(randomIndex);
    }
  };

  useEffect(() => {
    if (shouldSpin && wonPrize && carouselRef.current && !isSpinning) {
      setTimeout(() => {
        setIsSpinning(true);
        const prizeIndex = itens.findIndex(
          (item: any) => item.id === wonPrize.id
        );
        const targetIndex =
          prizeIndex >= 0
            ? prizeIndex
            : Math.floor(Math.random() * itens.length);
        carouselRef.current?.startSpin(targetIndex);
      }, 500);
    }
  }, [shouldSpin, wonPrize, isSpinning, itens]);

  return (
    <>
      <section className="flex flex-col items-center justify-center w-full">
        <ScrollAnimation
          type="fade"
          direction="up"
          duration={0.8}
          className="bg-neutral-2 flex flex-col items-center justify-center border-b border-neutral-6 w-full h-[250px] sm:h-[280px] md:h-[350px] relative overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {!isLoading ? (
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
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          )}
        </ScrollAnimation>

        <div className="flex flex-col w-full max-w-screen-2xl px-6 md:px-0 pt-6">
          <ScrollAnimation
            type="fade"
            direction="up"
            delay={0.2}
            duration={0.7}
          >
            <div className="flex flex-col md:flex-row items-start md:items-center w-full justify-between gap-4 md:gap-16">
              <div className="flex items-center gap-4 sm:gap-8">
                {lootbox?.imageUrl && (
                  <Image
                    src={lootbox.imageUrl}
                    alt="random"
                    height={110}
                    width={130}
                    className="object-cover"
                    priority
                  />
                )}
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
                    {lootbox?.name}
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
                    {lootbox?.price.toLocaleString("en-US", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })} {" "}
                     USD
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
              {itens.map((box: any, index: number) => (
                <motion.div
                  key={index}
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

      <LootboxPurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        onConfirm={handleConfirmPurchase}
        lootbox={lootbox}
        isLoading={isPurchasing}
      />

      <WonItemModal
        isOpen={showWonItemModal}
        onClose={handleCloseWonItemModal}
        item={wonPrize}
        onKeep={handleKeepItem}
        onSell={handleSellItem}
        isSelling={isSelling}
      />
    </>
  );
}
