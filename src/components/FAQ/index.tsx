"use client";
import { useState } from "react";
import { ScrollAnimation } from "../ScrollAnimation";
import { FAQIcon } from "../Icons/FAQIcon";

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

const FAQItem = ({ question, answer, isOpen, onToggle }: FAQItemProps) => (
  <div className="border-b-2 border-neutral-6 hover:border-primary-8 transition-all duration-300">
    <button
      onClick={onToggle}
      className="w-full p-3 sm:p-4 flex items-center justify-between text-left hover:bg-neutral-3 transition-colors duration-300 group"
    >
      <span className="text-neutral-12 font-medium text-base sm:text-lg group-hover:text-primary-10 transition-colors duration-300">
        {question}
      </span>
      <div
        className={`transform transition-transform duration-300 ${
          isOpen ? "rotate-180" : "-rotate-90"
        }`}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          className="text-neutral-11 group-hover:text-primary-10 transition-colors duration-300 sm:w-4 sm:h-4"
        >
          <path
            d="M12 6L8 10L4 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </button>
    <div
      className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      }`}
    >
      <div className="px-3 sm:px-4 pb-4 sm:pb-6">
        <p className="text-neutral-11 leading-relaxed text-sm sm:text-base">
          {answer}
        </p>
      </div>
    </div>
  </div>
);

export function FAQ() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index)
        ? prev.filter((item) => item !== index)
        : [...prev, index]
    );
  };

  const faqData = [
    {
      question: "O que fazemos?",
      answer:
        "Somos uma plataforma Web3 de caixas surpresa que combina colecionáveis digitais e físicos, oferecendo uma experiência única com transparência on-chain e foco em comunidade.",
    },
    {
      question: "Como funcionam as boxes?",
      answer:
        "Nossas boxes contêm itens variados, desde comuns até lendários. Cada box é uma surpresa garantida com diferentes níveis de raridade e valor. Você pode abrir as boxes e descobrir itens únicos para sua coleção.",
    },
    {
      question: "Como posso participar do leaderboard?",
      answer:
        "Participe abrindo boxes, completando desafios e interagindo com a comunidade. Quanto mais ativo você for na plataforma, maior será sua pontuação no leaderboard e maiores suas chances de ganhar prêmios exclusivos.",
    },
    {
      question: "Posso trocar ou vender meus itens?",
      answer:
        "Sim! Todos os itens são NFTs que podem ser negociados livremente. Você pode trocar, vender ou colecionar seus itens conforme desejar, aproveitando a natureza descentralizada da blockchain.",
    },
    {
      question: "Como funciona o programa de afiliados?",
      answer:
        "Indique novos jogadores para a plataforma e receba comissão pelas atividades deles. Quanto mais pessoas você trouxer, maiores serão seus ganhos. É uma forma excelente de monetizar sua rede de contatos.",
    },
    {
      question: "A plataforma é segura?",
      answer:
        "Absolutamente! Utilizamos tecnologia blockchain para garantir transparência total. Todos os itens são verificáveis on-chain e nossa plataforma segue os mais altos padrões de segurança da indústria Web3.",
    },
  ];

  const leftColumnData = faqData.filter((_, index) => index % 2 === 0);
  const rightColumnData = faqData.filter((_, index) => index % 2 === 1);

  return (
    <ScrollAnimation type="fade" direction="up" delay={0.2} duration={0.8}>
      <div className="max-w-[1280px] mx-auto py-6 pt-0 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
            <FAQIcon className="h-6 w-6 sm:h-8 sm:w-8" />
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-12">
              FAQ
            </h2>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
          <div className="flex-1 space-y-3 sm:space-y-4">
            {leftColumnData.map((faq, index) => {
              const originalIndex = index * 2;
              return (
                <div
                  key={originalIndex}
                  className="bg-neutral-3 rounded-xl overflow-hidden transition-all duration-300"
                >
                  <FAQItem
                    question={faq.question}
                    answer={faq.answer}
                    isOpen={openItems.includes(originalIndex)}
                    onToggle={() => toggleItem(originalIndex)}
                  />
                </div>
              );
            })}
          </div>

          <div className="flex-1 space-y-3 sm:space-y-4">
            {rightColumnData.map((faq, index) => {
              const originalIndex = index * 2 + 1;
              return (
                <div
                  key={originalIndex}
                  className="bg-neutral-3 rounded-xl overflow-hidden transition-all duration-300"
                >
                  <FAQItem
                    question={faq.question}
                    answer={faq.answer}
                    isOpen={openItems.includes(originalIndex)}
                    onToggle={() => toggleItem(originalIndex)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ScrollAnimation>
  );
}
