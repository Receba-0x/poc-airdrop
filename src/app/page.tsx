"use client";
import { useRef, useState, useEffect } from "react";
import HorizontalSpinCarousel, {
  HorizontalSpinCarouselRef,
} from "@/components/HorizontalSpinCarousel";
import { Button } from "@/components/Button";
import type { Item } from "@/types/item";

const AVAILABLE_ITEMS: Item[] = [
  {
    id: "1",
    name: "Soccer Ball",
    imageUrl: "/images/itens/ball.png",
    value: 2000,
    rarity: "common",
  },
  {
    id: "2",
    name: "T-Shirt 1",
    imageUrl: "/images/itens/camisa1.webp",
    value: 3000,
    rarity: "uncommon",
  },
  {
    id: "3",
    name: "T-Shirt 2",
    imageUrl: "/images/itens/camisa2.webp",
    value: 3500,
    rarity: "uncommon",
  },
  {
    id: "4",
    name: "T-Shirt 3",
    imageUrl: "/images/itens/camisa3.webp",
    value: 4000,
    rarity: "rare",
  },
  {
    id: "5",
    name: "T-Shirt 4",
    imageUrl: "/images/itens/camisa4.webp",
    value: 4500,
    rarity: "rare",
  },
  {
    id: "6",
    name: "Soccer Cleats",
    imageUrl: "/images/itens/chuteira.webp",
    value: 5000,
    rarity: "epic",
  },
  {
    id: "7",
    name: "iPhone",
    imageUrl: "/images/itens/iphone.webp",
    value: 6000,
    rarity: "epic",
  },
  {
    id: "8",
    name: "Knee Pads",
    imageUrl: "/images/itens/joelheira.webp",
    value: 2500,
    rarity: "common",
  },
  {
    id: "9",
    name: "Gloves",
    imageUrl: "/images/itens/luvas.webp",
    value: 2800,
    rarity: "common",
  },
  {
    id: "10",
    name: "MacBook",
    imageUrl: "/images/itens/macbook.webp",
    value: 8000,
    rarity: "legendary",
  },
  {
    id: "11",
    name: "Shorts",
    imageUrl: "/images/itens/shorts.webp",
    value: 3200,
    rarity: "uncommon",
  },
  {
    id: "12",
    name: "Golden Ticket",
    imageUrl: "/images/itens/golden-ticket.png",
    value: 10000,
    rarity: "legendary",
  },
  {
    id: "13",
    name: "SOL Coin",
    imageUrl: "/images/itens/sol-coin.webp",
    value: 7000,
    rarity: "epic",
  },
];

export default function HomePage() {
  const carouselRef = useRef<HorizontalSpinCarouselRef>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [wonItem, setWonItem] = useState<Item | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSpin = () => {
    if (carouselRef.current && !isSpinning) {
      setIsSpinning(true);
      setWonItem(null);
      const randomIndex = Math.floor(Math.random() * AVAILABLE_ITEMS.length);
      carouselRef.current.startSpin(randomIndex);
    }
  };

  const handleSpinComplete = (item: Item) => {
    setIsSpinning(false);
    setWonItem(item);
  };

  const handleReset = () => {
    if (carouselRef.current) {
      carouselRef.current.resetSpin();
      setWonItem(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-neutral-12 pb-24 w-full bg-neutral-1">
      <div className="container w-full max-w-screen-2xl mx-auto px-6 md:px-0">
        <div className="flex flex-col items-center gap-8 mt-10">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-12 mb-2">
              Airdrop $RECEBA
            </h1>
            <p className="text-neutral-10 text-sm md:text-base">
              Itens de 2.000 a 10.000 SPL Solana
            </p>
          </div>

          <div className="w-full bg-neutral-2 flex flex-col items-center justify-center border border-neutral-6 rounded-lg overflow-hidden h-[250px] sm:h-[280px] md:h-[350px] relative">
            <HorizontalSpinCarousel
              ref={carouselRef}
              items={AVAILABLE_ITEMS}
              itemWidth={isMobile ? 128 : 160}
              itemHeight={isMobile ? 128 : 160}
              gap={60}
              speed={0.1}
              spinDuration={8000}
              onSpinComplete={handleSpinComplete}
              className="relative w-full h-full z-10"
            />
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-4">
              <Button
                onClick={handleSpin}
                disabled={isSpinning}
                variant="default"
                className="min-w-[150px]"
              >
                {isSpinning ? "Girando..." : "Girar Carousel"}
              </Button>
              <Button
                onClick={handleReset}
                disabled={isSpinning}
                variant="outline"
                className="min-w-[150px]"
              >
                Resetar
              </Button>
            </div>

            {wonItem && (
              <div className="mt-4 p-4 bg-neutral-3 border border-neutral-6 rounded-lg text-center">
                <p className="text-neutral-12 font-semibold text-lg">
                  Você ganhou: {wonItem.value?.toLocaleString("pt-BR")} $RECEBA
                </p>
              </div>
            )}

            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 w-full">
              {AVAILABLE_ITEMS.map((item) => (
                <div
                  key={item.id}
                  className="bg-neutral-2 border border-neutral-6 rounded-lg p-4 flex flex-col items-center justify-center gap-1 min-h-[80px]"
                >
                  <p className="text-lg font-bold text-neutral-12">
                    {item.value?.toLocaleString("pt-BR")}
                  </p>
                  <p className="text-xs text-neutral-10">$RECEBA</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

