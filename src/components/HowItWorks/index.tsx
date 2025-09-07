import { FilesIcon } from "../Icons/FilesIcon";
import { ThreeDBoxIcon } from "../Icons/ThreeDBoxIcon";
import { WalletIcon } from "../Icons/WalletIcon";
import { ScrollAnimation } from "../ScrollAnimation";

interface StepProps {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const Step = ({ number, title, description, icon }: StepProps) => (
  <div className="flex flex-col items-start justify-between relative h-full text-center space-y-4 p-5 bg-neutral-4">
    <div className="absolute top-0 right-0 w-20 h-11 bg-neutral-5 rounded-bl-lg flex items-center justify-center">
      <span className="text-primary-9 font-semibold text-3xl">{number}</span>
    </div>

    <div className="relative text-primary-9">{icon}</div>

    <div className="space-y-1 w-full text-left">
      <h3 className="text-neutral-12 font-semibold text-lg">{title}</h3>
      <p className="text-neutral-11 leading-relaxed text-sm">{description}</p>
    </div>
  </div>
);

export function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Escolha sua Caixa",
      description:
        "Comece explorando as categorias de caixas surpresa da Loot4Fun. Futebol, NFTs, tecnologia e colecionáveis",
      icon: <ThreeDBoxIcon className="h-16 w-16" />,
    },
    {
      number: "2",
      title: "Abra e Revele",
      description:
        "Use SOL para abrir sua box e descubra o que ela guarda. O sistema Provably Fair garante resultados justos e confiáveis. A revelação acontece em tempo real, com prêmios que vão do comum ao lendário.",
      icon: <FilesIcon className="h-16 w-16" />,
    },
    {
      number: "3",
      title: "Gerencie seus Itens",
      description:
        "Todos os itens ficam disponíveis em sua conta logo após a abertura. NFTs e tokens são entregues direto na wallet conectada. Já os colecionáveis físicos vêm com NFT de autenticidade para resgate",
      icon: <WalletIcon className="h-16 w-16" />,
    },
  ];

  return (
    <ScrollAnimation type="fade" direction="up" delay={0.2} duration={0.8}>
      <div className="max-w-[1280px] mx-auto min-h-[385px] bg-neutral-3 rounded-lg border border-neutral-6 p-5 pt-10">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <ThreeDBoxIcon className="h-8 w-8" />
            <h2 className="text-2xl font-bold text-neutral-12">
              Como funciona a Loot4Fun
            </h2>
          </div>
          <p className="text-neutral-12 text-base w-full">
            Na Loot4Fun você descobre prêmios digitais e físicos em caixas
            surpresa, tudo com transparência on-chain e experiências
            competitivas para a comunidade
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 border border-neutral-6 rounded-xl overflow-hidden divide-x-2 divide-neutral-6">
          {steps.map((step, index) => (
            <ScrollAnimation
              key={index}
              type="fade"
              direction="up"
              delay={0.1 * (index + 1)}
              duration={0.6}
            >
              <Step {...step} />
            </ScrollAnimation>
          ))}
        </div>
      </div>
    </ScrollAnimation>
  );
}
