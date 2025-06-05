"use client";
import { useRef, useEffect, useState } from "react";
import { LogoIcon } from "../Icons/LogoIcon";
import { Button } from "../Button";
import Image from "next/image";
import { SimulationIcon } from "../Icons/SimulationIcon";
import { PurchaseIcon } from "../Icons/PurchaseIcon";
import ItemCard from "../ItemCard.tsx";
import { ScrollAnimation } from "../ScrollAnimation";
import { motion, AnimatePresence } from "framer-motion";
import { getItensData } from "@/constants";
import { usePurchase } from "@/hooks/usePurchase";
import { useBoxStats } from "@/hooks/useBoxStats";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "react-hot-toast";

// Interface para os itens
interface Item {
  id: string;
  title: string;
  amount?: number;
  image: string;
}

// Dados dos prêmios crypto
const cryptoData: Item[] = [
  {
    id: "crypto-1",
    title: "5.0 SOL",
    amount: 5.0,
    image: "/images/itens/sol-coin.png",
  },
  {
    id: "crypto-2",
    title: "1.0 SOL",
    amount: 1.0,
    image: "/images/itens/sol-coin.png",
  },
  {
    id: "crypto-3",
    title: "0.1 SOL",
    amount: 0.1,
    image: "/images/itens/sol-coin.png",
  },
  {
    id: "crypto-4",
    title: "0.05 SOL",
    amount: 0.05,
    image: "/images/itens/sol-coin.png",
  },
  {
    id: "crypto-5",
    title: "0.01 SOL",
    amount: 0.01,
    image: "/images/itens/sol-coin.png",
  },
];

// Tipos de etapas do processo de compra
type ProcessStage =
  | "idle"
  | "initializing"
  | "processing_payment"
  | "determining_prize"
  | "delivering_prize"
  | "saving_data"
  | "complete"
  | "error";

export function BoxSection({ boxName }: { boxName: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [processingStage, setProcessingStage] = useState<ProcessStage>("idle");
  const [processMessage, setProcessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);
  const { onMint } = usePurchase();
  const { stats, isLoading: statsLoading, refetch } = useBoxStats();
  const { t } = useLanguage();

  const isCrypto = boxName === "cryptos";
  const itens = isCrypto ? cryptoData : getItensData(t);

  const carouselItems: Item[] = [];
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

  // Mensagens para cada etapa do processo
  const stageMessages: Record<ProcessStage, string> = {
    idle: "",
    initializing: t("purchase.initializing"),
    processing_payment: t("purchase.processingPayment"),
    determining_prize: t("purchase.determiningPrize"),
    delivering_prize: t("purchase.deliveringPrize"),
    saving_data: t("purchase.savingData"),
    complete: t("purchase.complete"),
    error: t("purchase.error")
  };

  const updateProcessStage = (stage: ProcessStage, customMessage?: string) => {
    setProcessingStage(stage);
    setProcessMessage(customMessage || stageMessages[stage]);
  };

  const handlePurchaseSimulation = () => {
    setShowModal(true);
    setErrorMessage("");
    updateProcessStage("initializing");

    setTimeout(() => {
      updateProcessStage("processing_payment");

      setTimeout(() => {
        updateProcessStage("determining_prize");

        setTimeout(() => {
          let prizeItem: Item;
          if (boxName === "cryptos") {
            const randomIndex = Math.floor(Math.random() * cryptoData.length);
            prizeItem = cryptoData[randomIndex];
          } else {
            const randomIndex = Math.floor(Math.random() * itens.length);
            prizeItem = itens[randomIndex];
          }

          setSelectedItem(prizeItem);
          updateProcessStage("delivering_prize");

          setTimeout(() => {
            updateProcessStage("complete");
          }, 500);

        }, 700);
      }, 700);
    }, 700);
  };

  const handlePurchase = async () => {
    setShowModal(true);
    setErrorMessage("");
    updateProcessStage("initializing");

    try {
      // Inicializar e verificar wallet
      updateProcessStage("processing_payment", t("purchase.processingPaymentDetail"));

      // Processar o pagamento
      updateProcessStage("determining_prize", t("purchase.determiningPrizeDetail"));

      // Determinar o prêmio
      const result = await onMint(boxName === "cryptos");

      updateProcessStage("delivering_prize", t("purchase.deliveringPrizeDetail"));

      // Atualizar estatísticas
      refetch();

      updateProcessStage("saving_data", t("purchase.savingDataDetail"));

      let prizeItem: Item | undefined;

      if (boxName === "cryptos" && result && result.prize) {
        const prizeAmount = (result.prize as any).amount;
        if (prizeAmount !== undefined) {
          prizeItem = cryptoData.find(item => {
            const itemAmount = parseFloat(item.title.replace(' SOL', ''));
            return itemAmount === prizeAmount || Math.abs(itemAmount - prizeAmount) < 0.001;
          });
        }
      } else if (result && result.prize) {
        const metadata = (result.prize as any).metadata;
        if (metadata) {
          prizeItem = itens.find(item => item.id === metadata);
        }
      }

      if (!prizeItem) {
        const randomIndex = Math.floor(Math.random() * itens.length);
        prizeItem = itens[randomIndex];
      }

      setSelectedItem(prizeItem);
      updateProcessStage("complete");

    } catch (error: any) {
      console.error("Erro ao processar compra:", error);
      updateProcessStage("error");
      setErrorMessage(error.message || t("purchase.genericError"));
    }
  };

  const handleSimulation = async () => {
    setShowModal(true);
    setErrorMessage("");
    updateProcessStage("initializing");

    try {
      updateProcessStage("processing_payment", "Simulando processamento de pagamento (sem custo real)");
      updateProcessStage("determining_prize", "Simulando determinação de prêmio");
      updateProcessStage("delivering_prize", "Simulando entrega de prêmio");
      updateProcessStage("saving_data", "Simulando salvamento de dados");
      let prizeItem: Item | undefined;

      if (boxName === "cryptos") {
        const randomIndex = Math.floor(Math.random() * cryptoData.length);
        prizeItem = cryptoData[randomIndex];
      } else {
        const randomIndex = Math.floor(Math.random() * itens.length);
        prizeItem = itens[randomIndex];
      }

      if (!prizeItem) {
        const randomIndex = Math.floor(Math.random() * itens.length);
        prizeItem = itens[randomIndex];
      }

      setSelectedItem(prizeItem);
      updateProcessStage("complete");

    } catch (error: any) {
      console.error("Erro ao processar simulação:", error);
      updateProcessStage("error");
      setErrorMessage("Erro na simulação: " + (error.message || "Erro desconhecido"));
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setProcessingStage("idle");
    setSelectedItem(null);
    setErrorMessage("");
  };

  const getProcessStagePercentage = () => {
    const stages: Record<ProcessStage, number> = {
      "idle": 0,
      "initializing": 10,
      "processing_payment": 30,
      "determining_prize": 60,
      "delivering_prize": 80,
      "saving_data": 90,
      "complete": 100,
      "error": 100
    };
    return stages[processingStage];
  };

  // Ativa modo desenvolvedor com Ctrl+Shift+D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setIsDevMode(prev => !prev);
        if (!isDevMode) {
          toast.success("Modo desenvolvedor ativado");
        } else {
          toast.success("Modo desenvolvedor desativado");
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDevMode]);

  const boxImage = boxName === "cryptos" ? "/images/boxes/cripto.png" : "/images/boxes/super-prize.png";

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
                    alt={item.title}
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
                    {t("box.description")}
                  </p>

                  {/* Estatísticas das Caixas */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#FFD700] rounded-full animate-pulse"></div>
                      <span className="text-xs text-[#FFD700] font-medium">
                        {t("box.stats.limited")}
                      </span>
                    </div>
                    {!statsLoading && (
                      <div className="flex flex-col sm:flex-row gap-2 text-xs text-[#B4B4B4]">
                        <span>
                          {t("box.stats.opened")}: <span className="text-white font-medium">{stats.totalBoxesOpened}</span>
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span>
                          {t("box.stats.remaining")}: <span className="text-[#28D939] font-medium">{stats.remainingBoxes}</span>
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span>
                          {t("box.stats.total")}: <span className="text-white font-medium">{stats.maxBoxes}</span>
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
                  <span className="font-bold text-xl sm:text-2xl">100.00</span>
                </motion.div>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    className="w-full sm:w-auto"
                  >
                    <Button
                      className="w-full sm:w-[209px] h-[44px] sm:h-[52px]"
                      variant="secondary"
                      onClick={handlePurchaseSimulation}
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
                      disabled={stats.remainingBoxes <= 0}
                    >
                      <PurchaseIcon className="w-5 h-5" />
                      <span className="ml-1 text-sm sm:text-base">
                        {stats.remainingBoxes <= 0 ? t("box.soldOut") : t("box.purchase")}
                      </span>
                    </Button>
                  </motion.div>

                  {isDevMode && (
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      className="w-full sm:w-auto"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Button
                        className="w-full sm:w-[209px] h-[44px] sm:h-[52px] border-[#FF9900] text-[#FF9900] hover:bg-[#FF9900]/10"
                        variant="secondary"
                        onClick={handleSimulation}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                        </svg>
                        <span className="ml-1 text-sm sm:text-base">
                          Dev Simulation
                        </span>
                      </Button>
                    </motion.div>
                  )}
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
              {itens.map((box: Item, index: number) => (
                <motion.div
                  key={box.id + index}
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

      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/80"
              onClick={closeModal}
            />
            <motion.div
              className="bg-[#0F0F0F] p-4 sm:p-8 rounded-xl w-[90%] max-w-[550px] relative z-10"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              {/* Etapas de processamento */}
              {processingStage !== "complete" && processingStage !== "error" && (
                <div className="flex flex-col items-center justify-center py-6 sm:py-10">
                  {/* Barra de progresso */}
                  <div className="w-full h-2 bg-[#222] rounded-full mb-6 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#28D939] to-[#1FAA2E]"
                      initial={{ width: "0%" }}
                      animate={{ width: `${getProcessStagePercentage()}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>

                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-6">
                    <motion.div
                      className="absolute inset-0 border-4 border-t-[#FFD700] border-r-transparent border-b-transparent border-l-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                    <motion.div
                      className="absolute inset-2 border-4 border-t-[#FFD700] border-r-transparent border-b-transparent border-l-transparent rounded-full"
                      animate={{ rotate: -360 }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-center mb-2">
                    {stageMessages[processingStage]}
                  </h3>

                  {processMessage && (
                    <p className="text-[#B4B4B4] text-center text-sm sm:text-base">
                      {processMessage}
                    </p>
                  )}
                </div>
              )}

              {/* Resultado com sucesso */}
              {processingStage === "complete" && selectedItem && (
                <div className="flex flex-col items-center justify-center py-4 sm:py-6">
                  <motion.div
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 10, stiffness: 100 }}
                    className="mb-4 sm:mb-6 relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700]/30 to-[#FFA500]/30 rounded-full filter blur-xl"></div>
                    <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-xl overflow-hidden">
                      <div className="w-full h-full">
                        <Image
                          src={selectedItem.image}
                          alt={selectedItem.title}
                          width={160}
                          height={160}
                          className="w-full h-full object-fill"
                        />
                        <div className="absolute inset-0"></div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center"
                  >
                    <motion.h3
                      className="text-xl sm:text-2xl font-bold mb-2 bg-gradient-to-r from-[#FFF7A8] to-[#FFEB28] bg-clip-text text-transparent"
                      animate={{
                        textShadow: [
                          "0 0 8px rgba(255, 235, 40, 0.2)",
                          "0 0 15px rgba(255, 235, 40, 0.4)",
                          "0 0 8px rgba(255, 235, 40, 0.2)",
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {t("box.congratulations")}
                    </motion.h3>
                    <h4 className="text-lg sm:text-xl font-semibold mb-1">
                      {selectedItem.title}
                    </h4>

                    <div className="flex justify-center mt-4">
                      <Button
                        className="w-full max-w-[280px] h-[48px]"
                        variant="primary"
                        onClick={closeModal}
                      >
                        {t("box.awesome")}
                      </Button>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Tela de erro */}
              {processingStage === "error" && (
                <div className="flex flex-col items-center justify-center py-6 sm:py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: [0, 10, -10, 10, -10, 0] }}
                    transition={{
                      scale: { duration: 0.3 },
                      rotate: { delay: 0.3, duration: 0.5 }
                    }}
                    className="w-16 h-16 sm:w-20 sm:h-20 mb-4 flex items-center justify-center rounded-full bg-[#FF3333]/10 border-2 border-[#FF3333]"
                  >
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#FF3333]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.div>

                  <h3 className="text-lg sm:text-xl font-bold text-center mb-2 text-[#FF3333]">
                    {t("purchase.errorTitle")}
                  </h3>

                  <p className="text-[#B4B4B4] text-center text-sm sm:text-base mb-6">
                    {errorMessage}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <Button
                      className="w-full sm:w-1/2"
                      variant="secondary"
                      onClick={closeModal}
                    >
                      {t("purchase.cancel")}
                    </Button>
                    <Button
                      className="w-full sm:w-1/2"
                      variant="primary"
                      onClick={() => {
                        setShowModal(false);
                        setTimeout(() => handlePurchase(), 300);
                      }}
                    >
                      {t("purchase.tryAgain")}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
