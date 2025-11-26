"use client";
import { useRef, useState, useEffect } from "react";
import HorizontalSpinCarousel, {
  HorizontalSpinCarouselRef,
} from "@/components/HorizontalSpinCarousel";
import { Button } from "@/components/Button";
import type { Item } from "@/types/item";

interface FormData {
  name: string;
  instagram: string;
  phone: string;
  email: string;
  wallet: string;
}

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
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    instagram: "",
    phone: "",
    email: "",
    wallet: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

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

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    if (!formData.instagram.trim()) {
      newErrors.instagram = "Instagram é obrigatório";
    } else if (!formData.instagram.startsWith("@")) {
      newErrors.instagram = "Instagram deve começar com @";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Número é obrigatório";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.wallet.trim()) {
      newErrors.wallet = "Carteira Solana é obrigatória";
    } else if (formData.wallet.length < 32) {
      newErrors.wallet = "Carteira Solana inválida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setFormSubmitted(true);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center pb-24 w-full"
      style={{ backgroundColor: "#1d224b" }}
    >
      <div className="container w-full max-w-screen-2xl mx-auto px-6 md:px-0">
        <div className="flex flex-col items-center gap-8 mt-10">
          <div className="text-center">
            <h1
              className="text-3xl md:text-4xl font-bold mb-2"
              style={{ color: "#ffffff" }}
            >
              $RECEBA Airdrop
            </h1>
            <p className="text-sm md:text-base" style={{ color: "#41aec4" }}>
              Itens de 2.000 a 10.000 SPL Solana
            </p>
          </div>

          {!formSubmitted ? (
            <form
              onSubmit={handleSubmit}
              className="w-full max-w-md rounded-xl p-6 md:p-8 space-y-5 shadow-2xl"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                border: "1px solid rgba(65, 174, 196, 0.3)",
                backdropFilter: "blur(10px)",
              }}
            >
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold mb-2"
                  style={{ color: "#ffffff" }}
                >
                  Nome
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-all ${
                    errors.name ? "border-destructive" : ""
                  }`}
                  style={{
                    backgroundColor: "rgba(29, 34, 75, 0.6)",
                    color: "#ffffff",
                    borderColor: errors.name
                      ? "#e5484d"
                      : "rgba(65, 174, 196, 0.4)",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#41aec4";
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(65, 174, 196, 0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = "none";
                    if (!errors.name) {
                      e.target.style.borderColor = "rgba(65, 174, 196, 0.4)";
                    }
                  }}
                  placeholder="Seu nome completo"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-destructive">{errors.name}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="instagram"
                  className="block text-sm font-semibold mb-2"
                  style={{ color: "#ffffff" }}
                >
                  @ do Instagram
                </label>
                <input
                  id="instagram"
                  type="text"
                  value={formData.instagram}
                  onChange={(e) =>
                    handleInputChange("instagram", e.target.value)
                  }
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-all ${
                    errors.instagram ? "border-destructive" : ""
                  }`}
                  style={{
                    backgroundColor: "rgba(29, 34, 75, 0.6)",
                    color: "#ffffff",
                    borderColor: errors.instagram
                      ? "#e5484d"
                      : "rgba(65, 174, 196, 0.4)",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#41aec4";
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(65, 174, 196, 0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = "none";
                    if (!errors.instagram) {
                      e.target.style.borderColor = "rgba(65, 174, 196, 0.4)";
                    }
                  }}
                  placeholder="@seuusuario"
                />
                {errors.instagram && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.instagram}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-semibold mb-2"
                  style={{ color: "#ffffff" }}
                >
                  Número
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-all ${
                    errors.phone ? "border-destructive" : ""
                  }`}
                  style={{
                    backgroundColor: "rgba(29, 34, 75, 0.6)",
                    color: "#ffffff",
                    borderColor: errors.phone
                      ? "#e5484d"
                      : "rgba(65, 174, 196, 0.4)",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#41aec4";
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(65, 174, 196, 0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = "none";
                    if (!errors.phone) {
                      e.target.style.borderColor = "rgba(65, 174, 196, 0.4)";
                    }
                  }}
                  placeholder="(00) 00000-0000"
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.phone}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold mb-2"
                  style={{ color: "#ffffff" }}
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-all ${
                    errors.email ? "border-destructive" : ""
                  }`}
                  style={{
                    backgroundColor: "rgba(29, 34, 75, 0.6)",
                    color: "#ffffff",
                    borderColor: errors.email
                      ? "#e5484d"
                      : "rgba(65, 174, 196, 0.4)",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#41aec4";
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(65, 174, 196, 0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = "none";
                    if (!errors.email) {
                      e.target.style.borderColor = "rgba(65, 174, 196, 0.4)";
                    }
                  }}
                  placeholder="seu@email.com"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="wallet"
                  className="block text-sm font-semibold mb-2"
                  style={{ color: "#ffffff" }}
                >
                  Carteira Solana
                </label>
                <input
                  id="wallet"
                  type="text"
                  value={formData.wallet}
                  onChange={(e) => handleInputChange("wallet", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-all font-mono text-sm ${
                    errors.wallet ? "border-destructive" : ""
                  }`}
                  style={{
                    backgroundColor: "rgba(29, 34, 75, 0.6)",
                    color: "#ffffff",
                    borderColor: errors.wallet
                      ? "#e5484d"
                      : "rgba(65, 174, 196, 0.4)",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#41aec4";
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(65, 174, 196, 0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.boxShadow = "none";
                    if (!errors.wallet) {
                      e.target.style.borderColor = "rgba(65, 174, 196, 0.4)";
                    }
                  }}
                  placeholder="Endereço da sua carteira Solana"
                />
                {errors.wallet && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.wallet}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                variant="default"
                className="w-full mt-6 py-3 font-semibold text-base rounded-lg transition-all"
                style={{
                  backgroundColor: "#41aec4",
                  color: "#000000",
                  border: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#3a9db0";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#41aec4";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Participar do Airdrop
              </Button>
            </form>
          ) : (
            <>
              <div
                className="w-full flex flex-col items-center justify-center rounded-xl overflow-hidden h-[250px] sm:h-[280px] md:h-[350px] relative shadow-2xl"
                style={{
                  backgroundColor: "#000000",
                  border: "1px solid rgba(65, 174, 196, 0.3)",
                }}
              >
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

              <div className="flex flex-col items-center gap-6">
                <div className="flex gap-4">
                  <Button
                    onClick={handleSpin}
                    disabled={isSpinning}
                    variant="default"
                    className="min-w-[150px] py-3 font-semibold rounded-lg transition-all"
                    style={{
                      backgroundColor: isSpinning ? "#3a9db0" : "#41aec4",
                      color: "#000000",
                      border: "none",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSpinning) {
                        e.currentTarget.style.backgroundColor = "#3a9db0";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSpinning) {
                        e.currentTarget.style.backgroundColor = "#41aec4";
                        e.currentTarget.style.transform = "translateY(0)";
                      }
                    }}
                  >
                    {isSpinning ? "Girando..." : "Girar Carousel"}
                  </Button>
                  <Button
                    onClick={handleReset}
                    disabled={isSpinning}
                    variant="outline"
                    className="min-w-[150px] py-3 font-semibold rounded-lg transition-all"
                    style={{
                      backgroundColor: "transparent",
                      color: "#41aec4",
                      border: "1px solid rgba(65, 174, 196, 0.5)",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSpinning) {
                        e.currentTarget.style.backgroundColor =
                          "rgba(65, 174, 196, 0.1)";
                        e.currentTarget.style.borderColor = "#41aec4";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSpinning) {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.borderColor =
                          "rgba(65, 174, 196, 0.5)";
                      }
                    }}
                  >
                    Resetar
                  </Button>
                </div>

                {wonItem && (
                  <div
                    className="mt-4 p-6 rounded-xl text-center shadow-xl"
                    style={{
                      backgroundColor: "rgba(0, 0, 0, 0.4)",
                      border: "1px solid rgba(65, 174, 196, 0.3)",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <p
                      className="font-bold text-xl"
                      style={{ color: "#41aec4" }}
                    >
                      Você ganhou: {wonItem.value?.toLocaleString("pt-BR")}{" "}
                      $RECEBA
                    </p>
                  </div>
                )}

                <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 w-full">
                  {AVAILABLE_ITEMS.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg p-4 flex flex-col items-center justify-center gap-1 min-h-[90px] transition-all hover:scale-105"
                      style={{
                        backgroundColor: "rgba(0, 0, 0, 0.3)",
                        border: "1px solid rgba(65, 174, 196, 0.2)",
                        backdropFilter: "blur(5px)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor =
                          "rgba(65, 174, 196, 0.5)";
                        e.currentTarget.style.backgroundColor =
                          "rgba(0, 0, 0, 0.5)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor =
                          "rgba(65, 174, 196, 0.2)";
                        e.currentTarget.style.backgroundColor =
                          "rgba(0, 0, 0, 0.3)";
                      }}
                    >
                      <p
                        className="text-lg font-bold"
                        style={{ color: "#41aec4" }}
                      >
                        {item.value?.toLocaleString("pt-BR")}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "rgba(255, 255, 255, 0.7)" }}
                      >
                        $RECEBA
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

