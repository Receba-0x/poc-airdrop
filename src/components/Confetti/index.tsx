"use client";

import confetti from "canvas-confetti";
import { Button } from "@/components/Button";
import { useRef } from "react";

interface ConfettiOptions {
  particleCount?: number;
  angle?: number;
  spread?: number;
  startVelocity?: number;
  decay?: number;
  gravity?: number;
  drift?: number;
  flat?: boolean;
  ticks?: number;
  origin?: { x: number; y: number };
  colors?: string[];
  shapes?: (string | any)[];
  scalar?: number;
  zIndex?: number;
  disableForReducedMotion?: boolean;
}

export function ConfettiCustomShapes() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Função para criar efeito de fogos de artifício com o logo
  const triggerFireworks = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        particleCount,
        startVelocity: randomInRange(50, 100),
        spread: randomInRange(50, 70),
        origin: {
          x: randomInRange(0.1, 0.3),
          y: Math.random() - 0.2
        },
        shapes: ['circle'],
        colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff'],
        gravity: 1.5,
        scalar: 0.8,
      });

      confetti({
        particleCount,
        startVelocity: randomInRange(50, 100),
        spread: randomInRange(50, 70),
        origin: {
          x: randomInRange(0.7, 0.9),
          y: Math.random() - 0.2
        },
        shapes: ['circle'],
        colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff'],
        gravity: 1.5,
        scalar: 0.8,
      });
    }, 250);
  };

  // Função para criar efeito de estrelas caindo
  const triggerStars = () => {
    const defaults: ConfettiOptions = {
      spread: 360,
      ticks: 100,
      gravity: 0,
      decay: 0.94,
      startVelocity: 30,
      shapes: ['star'],
      colors: ['#FFE400', '#FFBD00', '#E89400', '#FFCA6C', '#FDFFB8'],
      scalar: 1.2,
    };

    const shoot = () => {
      confetti({
        ...defaults,
        particleCount: 40,
        scalar: 1.2,
        shapes: ['star'],
      });

      confetti({
        ...defaults,
        particleCount: 10,
        scalar: 0.75,
        shapes: ['star'],
      });
    };

    setTimeout(shoot, 0);
    setTimeout(shoot, 100);
    setTimeout(shoot, 200);
  };

  // Função para criar efeito com formas customizadas do logo
  const triggerLogoShapes = () => {
    const scalar = 2;

    // Criar shapes personalizadas baseadas no logo da coruja
    const owlBody = confetti.shapeFromPath({
      path: "M14.8423 7.82633C20.205 7.46789 24.6924 8.75153 27.8708 11.6943C31.0974 14.6816 32.7333 19.1549 32.7854 24.6338L32.7859 24.7757C32.7804 27.7464 31.7028 30.0985 29.9177 31.8501C28.145 33.5897 25.7616 34.6557 23.2752 35.2696C18.3233 36.4922 12.4741 36.0419 8.61715 34.934C5.48676 34.0359 3.08735 32.7237 1.61544 30.557C0.145306 28.3928 -0.199653 25.6698 0.0981587 22.4116C0.481676 18.2052 1.86173 14.694 4.35931 12.1468C6.86363 9.59283 10.3344 8.16835 14.5863 7.84463L14.8423 7.82633Z",
    });

    const owlWing = confetti.shapeFromPath({
      path: "M7.24775 0.558938C9.16681 -0.0452047 11.2137 1.02529 11.8196 2.94995L14.9028 12.7436L7.95323 14.9314L4.87008 5.13774C4.26417 3.21308 5.32869 1.16308 7.24775 0.558938Z",
    });

    const owlEmoji = confetti.shapeFromText({
      text: "🦉",
      scalar: 2,
      color: "#EDEDF0"
    });

    const defaults: ConfettiOptions = {
      spread: 360,
      ticks: 60,
      gravity: 0,
      decay: 0.96,
      startVelocity: 20,
      shapes: [owlBody, owlWing, owlEmoji],
      scalar,
    };

    const shoot = () => {
      confetti({
        ...defaults,
        particleCount: 15,
      });

      confetti({
        ...defaults,
        particleCount: 8,
        scalar: scalar * 1.5,
      });
    };

    setTimeout(shoot, 0);
    setTimeout(shoot, 150);
    setTimeout(shoot, 300);
  };

  // Função para efeito aleatório
  const triggerRandom = () => {
    const effects = [triggerFireworks, triggerStars, triggerLogoShapes];
    const randomEffect = effects[Math.floor(Math.random() * effects.length)];
    randomEffect();
  };

  return (
    <div className="relative flex flex-col items-center justify-center gap-4 p-8">
      <div className="grid grid-cols-2 gap-4">
        <Button onClick={triggerFireworks} className="bg-purple-600 hover:bg-purple-700">
          Fogos de Artifício 🎆
        </Button>
        <Button onClick={triggerStars} className="bg-yellow-600 hover:bg-yellow-700">
          Estrelas ⭐
        </Button>
        <Button onClick={triggerLogoShapes} className="bg-green-600 hover:bg-green-700">
          Logo Coruja 🦉
        </Button>
        <Button onClick={triggerRandom} className="bg-pink-600 hover:bg-pink-700">
          Efeito Aleatório 🎲
        </Button>
      </div>

      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 100 }}
      />
    </div>
  );
}
