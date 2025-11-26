"use client";
import { useRef, useState, useEffect } from "react";
import HorizontalSpinCarousel, {
  HorizontalSpinCarouselRef,
} from "@/components/HorizontalSpinCarousel";
import { Button } from "@/components/Button";
import type { Item } from "@/types/item";
import {
  saveAirdropSubmission,
  checkExistingSubmission,
  checkAlreadyReceivedTokens,
} from "@/lib/supabase";
import toast from "react-hot-toast";
import QRCode from "react-qr-code";
import Link from "next/link";

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
  const [isSendingTokens, setIsSendingTokens] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    instagram: "",
    phone: "",
    email: "",
    wallet: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [hasAlreadySpun, setHasAlreadySpun] = useState(false);
  const [alreadyUsedReason, setAlreadyUsedReason] = useState<
    "wallet" | "email" | null
  >(null);
  const [isCheckingSubmission, setIsCheckingSubmission] = useState(false);
  const [productionUrl, setProductionUrl] = useState<string>("");

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    // Obter URL de produção ou usar a URL atual
    const url = "https://recebaairdrop.com";
    setProductionUrl(url);
  }, []);

  // Verificar se já existe uma submissão salva no localStorage e verificar no servidor
  useEffect(() => {
    const checkSubmission = async () => {
      const savedSubmission = localStorage.getItem("airdrop_submission");
      if (savedSubmission) {
        try {
          const parsed = JSON.parse(savedSubmission);
          // Se já existe uma submissão com dados válidos, verificar no servidor
          if (
            parsed.submittedAt &&
            parsed.name &&
            parsed.email &&
            parsed.wallet
          ) {
            // Pré-preencher os dados do formulário (caso precise acessar depois)
            setFormData({
              name: parsed.name || "",
              instagram: parsed.instagram || "",
              phone: parsed.phone || "",
              email: parsed.email || "",
              wallet: parsed.wallet || "",
            });

            // Verificar no servidor se já recebeu tokens (já girou)
            setIsCheckingSubmission(true);
            const tokensCheckResult = await checkAlreadyReceivedTokens(
              parsed.wallet,
              parsed.email
            );

            if (tokensCheckResult.received) {
              setHasAlreadySpun(true);
              if (tokensCheckResult.byWallet && tokensCheckResult.byEmail) {
                setAlreadyUsedReason("wallet"); // Mostrar wallet como principal
              } else if (tokensCheckResult.byWallet) {
                setAlreadyUsedReason("wallet");
              } else if (tokensCheckResult.byEmail) {
                setAlreadyUsedReason("email");
              }
            }

            setIsCheckingSubmission(false);
            // Pular direto para o carousel
            setFormSubmitted(true);
          }
        } catch (error) {
          console.error("Erro ao ler dados do localStorage:", error);
          setIsCheckingSubmission(false);
        }
      }
    };

    checkSubmission();
  }, []);

  const handleSpin = async () => {
    if (carouselRef.current && !isSpinning && !hasAlreadySpun) {
      // Verificar novamente antes de girar se já recebeu tokens
      const savedSubmission = localStorage.getItem("airdrop_submission");
      if (savedSubmission) {
        try {
          const parsed = JSON.parse(savedSubmission);
          const tokensCheckResult = await checkAlreadyReceivedTokens(
            parsed.wallet,
            parsed.email
          );

          if (tokensCheckResult.received) {
            setHasAlreadySpun(true);
            if (tokensCheckResult.byWallet && tokensCheckResult.byEmail) {
              setAlreadyUsedReason("wallet");
            } else if (tokensCheckResult.byWallet) {
              setAlreadyUsedReason("wallet");
            } else if (tokensCheckResult.byEmail) {
              setAlreadyUsedReason("email");
            }
            toast.error(
              tokensCheckResult.byWallet && tokensCheckResult.byEmail
                ? "Esta carteira e email já receberam tokens!"
                : tokensCheckResult.byWallet
                ? "Esta carteira já recebeu tokens!"
                : "Este email já recebeu tokens!"
            );
            return;
          }
        } catch (error) {
          console.error("Erro ao verificar tokens recebidos:", error);
          toast.error("Erro ao verificar dados. Tente novamente.");
          return;
        }
      }

      setIsSpinning(true);
      setWonItem(null);
      const randomIndex = Math.floor(Math.random() * AVAILABLE_ITEMS.length);
      carouselRef.current.startSpin(randomIndex);
    }
  };

  const handleSpinComplete = async (item: Item) => {
    setIsSpinning(false);
    setWonItem(item);

    // Marcar que já foi usado para evitar giros múltiplos
    setHasAlreadySpun(true);

    // Enviar tokens após o usuário ganhar
    await sendTokensToUser(item);
  };

  const sendTokensToUser = async (item: Item) => {
    // Obter dados do formulário do localStorage
    const savedSubmission = localStorage.getItem("airdrop_submission");
    if (!savedSubmission) {
      toast.error("Dados do formulário não encontrados");
      return;
    }

    try {
      const parsed = JSON.parse(savedSubmission);
      const recipientWallet = parsed.wallet;
      const tokenAmount = item.value || 0;

      if (!recipientWallet) {
        toast.error("Wallet do destinatário não encontrada");
        return;
      }

      setIsSendingTokens(true);
      toast.loading("Enviando tokens...", { id: "sending-tokens" });

      // Chamar API do servidor para enviar tokens
      const response = await fetch("/api/send-tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientWallet: recipientWallet,
          amount: tokenAmount,
          decimals: 9, // Token tem 9 decimais
          userEmail: parsed.email || null,
          userName: parsed.name || null,
        }),
      });

      const result = await response.json();

      if (result.success && result.signature) {
        toast.success(
          `Tokens enviados com sucesso! Signature: ${result.signature.slice(
            0,
            8
          )}...`,
          { id: "sending-tokens", duration: 5000 }
        );
      } else {
        toast.error(result.error || "Erro ao enviar tokens", {
          id: "sending-tokens",
        });
      }
    } catch (error: any) {
      console.error("Erro ao enviar tokens:", error);
      toast.error("Erro ao processar envio de tokens", {
        id: "sending-tokens",
      });
    } finally {
      setIsSendingTokens(false);
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      // Verificar se já recebeu tokens (já girou e recebeu)
      const tokensCheckResult = await checkAlreadyReceivedTokens(
        formData.wallet,
        formData.email
      );

      if (tokensCheckResult.received) {
        setHasAlreadySpun(true);
        if (tokensCheckResult.byWallet && tokensCheckResult.byEmail) {
          setAlreadyUsedReason("wallet");
          toast.error("Esta carteira e email já receberam tokens!");
        } else if (tokensCheckResult.byWallet) {
          setAlreadyUsedReason("wallet");
          toast.error("Esta carteira já recebeu tokens!");
        } else if (tokensCheckResult.byEmail) {
          setAlreadyUsedReason("email");
          toast.error("Este email já recebeu tokens!");
        }
        // Mesmo que já tenha recebido, ainda permite ver o carrossel com a mensagem
        // Não retorna aqui, permite continuar para mostrar a mensagem
      }

      // Salvar no localStorage
      const submissionData = {
        name: formData.name,
        instagram: formData.instagram,
        phone: formData.phone,
        email: formData.email,
        wallet: formData.wallet,
        submittedAt: new Date().toISOString(),
      };

      localStorage.setItem(
        "airdrop_submission",
        JSON.stringify(submissionData)
      );

      // Salvar no Supabase
      const result = await saveAirdropSubmission({
        name: formData.name,
        instagram: formData.instagram,
        phone: formData.phone,
        email: formData.email,
        wallet: formData.wallet,
      });

      if (result.success) {
        toast.success("Formulário enviado com sucesso!");
        setFormSubmitted(true);
      } else {
        // Verificar se o erro é de duplicata
        if (
          result.error?.includes("duplicate") ||
          result.error?.includes("unique")
        ) {
          setHasAlreadySpun(true);
          toast.error("Esta carteira ou email já foi usado para participar!");
          return;
        }
        // Mesmo com erro no Supabase, permite continuar se salvou no localStorage
        console.warn(
          "Erro ao salvar no Supabase, mas dados salvos localmente:",
          result.error
        );
        toast.error(
          "Erro ao salvar no servidor, mas dados foram salvos localmente"
        );
        setFormSubmitted(true);
      }
    } catch (error: any) {
      console.error("Erro ao processar formulário:", error);
      // Mesmo com erro, salva no localStorage e permite continuar
      localStorage.setItem(
        "airdrop_submission",
        JSON.stringify({
          name: formData.name,
          instagram: formData.instagram,
          phone: formData.phone,
          email: formData.email,
          wallet: formData.wallet,
          submittedAt: new Date().toISOString(),
        })
      );
      toast.error("Erro ao processar, mas dados foram salvos localmente");
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
    <div className="min-h-screen flex flex-col items-center justify-center pb-24 w-full animated-background relative">
      {/* Floating orbs for visual effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute rounded-full blur-3xl opacity-20"
          style={{
            width: "600px",
            height: "600px",
            background:
              "radial-gradient(circle, rgba(65, 174, 196, 0.4) 0%, transparent 70%)",
            top: "-300px",
            left: "-300px",
            animation: "float 20s ease-in-out infinite",
          }}
        />
        <div
          className="absolute rounded-full blur-3xl opacity-15"
          style={{
            width: "500px",
            height: "500px",
            background:
              "radial-gradient(circle, rgba(65, 174, 196, 0.3) 0%, transparent 70%)",
            bottom: "-250px",
            right: "-250px",
            animation: "float 25s ease-in-out infinite reverse",
          }}
        />
        <div
          className="absolute rounded-full blur-3xl opacity-10"
          style={{
            width: "400px",
            height: "400px",
            background:
              "radial-gradient(circle, rgba(29, 34, 75, 0.5) 0%, transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            animation: "pulse-glow 10s ease-in-out infinite",
          }}
        />
      </div>

      <div className="container w-full max-w-screen-2xl mx-auto px-6 md:px-0 relative z-10">
        <div className="flex flex-col items-center gap-8 mt-10">
          <div className="text-center">
            <h1
              className="text-3xl md:text-4xl font-bold mb-2"
              style={{ color: "#ffffff" }}
            >
              $RECEBA Airdrop
            </h1>
            <p className="text-sm md:text-base" style={{ color: "#41aec4" }}>
              Itens de 2.000 a 10.000 Solana
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
                  border: "1px solid rgba(65, 174, 196, 0.3)",
                }}
              >
                <HorizontalSpinCarousel
                  ref={carouselRef}
                  items={AVAILABLE_ITEMS}
                  itemWidth={isMobile ? 128 : 160}
                  itemHeight={isMobile ? 128 : 160}
                  gap={60}
                  speed={0.3}
                  spinDuration={8000}
                  onSpinComplete={handleSpinComplete}
                  className="relative w-full h-full z-10"
                />
              </div>

              <div className="flex flex-col items-center gap-6">
                {isCheckingSubmission && (
                  <div
                    className="w-full max-w-md p-4 rounded-xl text-center"
                    style={{
                      backgroundColor: "rgba(65, 174, 196, 0.2)",
                      border: "1px solid rgba(65, 174, 196, 0.5)",
                    }}
                  >
                    <p style={{ color: "#41aec4" }}>Verificando dados...</p>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    onClick={handleSpin}
                    disabled={
                      isSpinning || hasAlreadySpun || isCheckingSubmission
                    }
                    variant="default"
                    className="min-w-[150px] py-3 font-semibold rounded-lg transition-all"
                    style={{
                      backgroundColor:
                        isSpinning || hasAlreadySpun || isCheckingSubmission
                          ? "#3a9db0"
                          : "#41aec4",
                      color: "#000000",
                      border: "none",
                      opacity:
                        isSpinning || hasAlreadySpun || isCheckingSubmission
                          ? 0.6
                          : 1,
                      cursor:
                        isSpinning || hasAlreadySpun || isCheckingSubmission
                          ? "not-allowed"
                          : "pointer",
                    }}
                    onMouseEnter={(e) => {
                      if (
                        !isSpinning &&
                        !hasAlreadySpun &&
                        !isCheckingSubmission
                      ) {
                        e.currentTarget.style.backgroundColor = "#3a9db0";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (
                        !isSpinning &&
                        !hasAlreadySpun &&
                        !isCheckingSubmission
                      ) {
                        e.currentTarget.style.backgroundColor = "#41aec4";
                        e.currentTarget.style.transform = "translateY(0)";
                      }
                    }}
                  >
                    {isSpinning
                      ? "Girando..."
                      : hasAlreadySpun
                      ? "Já Participou"
                      : isCheckingSubmission
                      ? "Verificando..."
                      : "Airdrop"}
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
                      className="font-bold text-xl mb-2"
                      style={{ color: "#41aec4" }}
                    >
                      Você ganhou: {wonItem.value?.toLocaleString("pt-BR")}{" "}
                      $RECEBA
                    </p>
                    {isSendingTokens && (
                      <p className="text-sm" style={{ color: "#ffffff" }}>
                        Enviando tokens para sua carteira...
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-8 w-full">
                  {/* Layout responsivo: em mobile os QR codes ficam acima e abaixo, em desktop ficam nas laterais */}
                  <div className="flex flex-col lg:flex-row items-center justify-center gap-6 w-full">
                    {/* QR Code do site em produção - Esquerda (desktop) / Topo (mobile) */}
                    <div className="flex flex-col items-center gap-2 order-4 lg:order-1">
                      <div
                        className="rounded-xl p-4 flex flex-col items-center justify-center"
                        style={{
                          backgroundColor: "rgba(0, 0, 0, 0.4)",
                          border: "1px solid rgba(65, 174, 196, 0.3)",
                          backdropFilter: "blur(10px)",
                        }}
                      >
                        {productionUrl && (
                          <QRCode
                            value={productionUrl}
                            size={200}
                            style={{
                              height: "auto",
                              maxWidth: "100%",
                              width: "100%",
                            }}
                            viewBox={`0 0 120 120`}
                            fgColor="#41aec4"
                            bgColor="transparent"
                          />
                        )}
                      </div>
                      <Link
                        href={productionUrl}
                        target="_blank"
                        className="text-xs text-center max-w-[140px] text-blue-500"
                      >
                        Acesse o site
                      </Link>
                    </div>

                    {/* Grid de itens - Centro */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 flex-1 max-w-4xl order-2 lg:order-2">
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

                    {/* QR Codes da Phantom - Direita (desktop) / Abaixo (mobile) */}
                    <div className="flex flex-row lg:flex-col items-center justify-center gap-4 order-3 lg:order-3">
                      {/* QR Code Phantom iOS */}
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className="rounded-xl p-4 flex flex-col items-center justify-center"
                          style={{
                            backgroundColor: "rgba(0, 0, 0, 0.4)",
                            border: "1px solid rgba(65, 174, 196, 0.3)",
                            backdropFilter: "blur(10px)",
                          }}
                        >
                          <QRCode
                            value="https://apps.apple.com/app/phantom-solana-wallet/1598432977"
                            size={120}
                            style={{
                              height: "auto",
                              maxWidth: "100%",
                              width: "100%",
                            }}
                            viewBox={`0 0 120 120`}
                            fgColor="#41aec4"
                            bgColor="transparent"
                          />
                        </div>
                        <Link
                          href="https://apps.apple.com/app/phantom-solana-wallet/1598432977"
                          target="_blank"
                          className="text-xs text-center max-w-[140px] text-blue-500"
                        >
                          Phantom iOS
                        </Link>
                      </div>

                      {/* QR Code Phantom Android */}
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className="rounded-xl p-4 flex flex-col items-center justify-center"
                          style={{
                            backgroundColor: "rgba(0, 0, 0, 0.4)",
                            border: "1px solid rgba(65, 174, 196, 0.3)",
                            backdropFilter: "blur(10px)",
                          }}
                        >
                          <QRCode
                            value="https://play.google.com/store/apps/details?id=app.phantom"
                            size={120}
                            style={{
                              height: "auto",
                              maxWidth: "100%",
                              width: "100%",
                            }}
                            viewBox={`0 0 120 120`}
                            fgColor="#41aec4"
                            bgColor="transparent"
                          />
                        </div>
                        <Link
                          href="https://play.google.com/store/apps/details?id=app.phantom"
                          target="_blank"
                          className="text-xs text-center max-w-[140px] text-blue-500"
                        >
                          Phantom Android
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

