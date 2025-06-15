"use client";
import { useRef, useEffect, useState } from "react";
import { ScrollAnimation } from "@/components/ScrollAnimation";
import { motion } from "framer-motion";
import { FutIcon } from "../Icons/FutIcon";
import { StarIcon } from "../Icons/StarIcon";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { useLanguage } from "@/contexts/LanguageContext";
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

export const TokenomicsChart = () => {
  const chartRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { t } = useLanguage();
  const tokenDistribution = [
    { label: t("tokenomics.presale"), percentage: 11, color: "#009C3B" },
    { label: t("tokenomics.lp"), percentage: 7.5, color: "#FFDF00" },
    { label: t("tokenomics.staking"), percentage: 25, color: "#002776" },
    { label: t("tokenomics.community"), percentage: 5, color: "#00A651" },
    { label: t("tokenomics.treasury"), percentage: 7, color: "#FFD700" },
    { label: t("tokenomics.reserveFunds"), percentage: 3, color: "#1E90FF" },
    { label: t("tokenomics.marketing"), percentage: 5, color: "#32CD32" },
    { label: t("tokenomics.team"), percentage: 25, color: "#4169E1" },
    { label: t("tokenomics.costs"), percentage: 11.5, color: "#FFA500" },
  ];

  useEffect(() => {
    setIsVisible(true);
    if (typeof window !== "undefined") {
      const registerAnimations = () => {
        Object.assign(ChartJS.defaults.transitions.active.animation, {
          duration: 400,
          easing: "easeOutBounce",
        });
      };

      registerAnimations();
    }
  }, []);

  const chartData = {
    labels: tokenDistribution.map(
      (item) => `${item.percentage}% ${item.label}`
    ),
    datasets: [
      {
        data: tokenDistribution.map((item) => item.percentage),
        backgroundColor: tokenDistribution.map((item, index) =>
          hoveredIndex === index ? `${item.color}DD` : item.color
        ),
        borderColor: "#0F0F0F",
        borderWidth: 5,
        borderRadius: 10,
        spacing: 3,
        offset: 5,
        hoverOffset: 15,
      },
    ],
  };

  // Enhanced Chart.js animation options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "65%",
    radius: "90%",
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 2500,
      delay(context: any) {
        if (context.type === "data" && context.mode === "default") {
          return context.dataIndex * 200 + 300;
        }
        return 0;
      },
      easing: "easeInOutQuart",
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: "#0F0F0F",
        titleColor: "#FFFFFF",
        bodyColor: "#FFFFFF",
        borderColor: "#333333",
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        boxWidth: 12,
        boxHeight: 12,
        boxPadding: 3,
        callbacks: {
          label: (context: any) => {
            return `${context.parsed}% ${
              tokenDistribution[context.dataIndex].label
            }`;
          },
        },
      },
      datalabels: {
        color: "#000",
        textShadow: "0px 1px 2px rgba(0, 0, 0, 0.5)",
        font: {
          weight: "bold",
          size: 14,
        },
        formatter: (value: number) => {
          return `${value}%`;
        },
        display: true,
        align: "center",
        anchor: "center",
        offset: 0,
      },
    },
    hover: {
      mode: "nearest",
      intersect: true,
      animationDuration: 300,
    },
    onHover: (event: any, elements: any[], chart: any) => {
      if (elements.length > 0) {
        const dataIndex = elements[0].index;
        setHoveredIndex(dataIndex);
      } else {
        setHoveredIndex(null);
      }
    },
  };

  return (
    <div className="w-full flex flex-col items-center justify-start overflow-hidden pb-10 lg:pb-[112px] bg-[#0F0F0F]">
      <div className="flex flex-col items-center justify-center max-w-[1062px] px-6 md:px-0">
        <ScrollAnimation
          type="slide"
          direction="down"
          duration={0.7}
          delay={0.1}
        >
          <div className="text-[#EEE] text-[30px] xl:text-[36px] w-full font-black text-center flex items-center justify-center gap-2 leading-[40px] md:leading-[61.6px]">
            {t("tokenomics.title")}
            <div className="flex items-center gap-2">
              <StarIcon fill={tokenDistribution[1].color} />
              <StarIcon fill={tokenDistribution[7].color} />
              <StarIcon fill={tokenDistribution[0].color} />
            </div>
          </div>
        </ScrollAnimation>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between w-full max-w-[1200px]">
        <div className="relative w-full lg:w-1/2 h-[400px] lg:h-[500px] flex items-center justify-center">
          <motion.div
            className="w-[90%] max-w-[500px] aspect-square relative cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Doughnut
              data={chartData}
              options={chartOptions as any}
              ref={chartRef}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div
                className="w-[60%] h-[60%] max-w-[120px] max-h-[120px] flex items-center justify-center"
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: isVisible ? 1 : 0,
                  scale: isVisible ? 1 : 0,
                }}
                transition={{ duration: 0.6, delay: 1.5 }}
              >
                <FutIcon />
              </motion.div>
            </div>
          </motion.div>
        </div>

        <div className="flex flex-col pl-[15%] gap-4 w-full lg:w-1/2">
          {tokenDistribution.map((item, index) => (
            <ScrollAnimation
              key={item.label}
              type="slide"
              direction="right"
              duration={0.5}
              delay={0.8 + index * 0.15}
            >
              <motion.div
                className="flex items-center gap-4 cursor-pointer"
                whileHover={{ scale: 1.05, x: 10 }}
                transition={{ duration: 0.2 }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div
                  className="w-[74px] h-[24px] rounded-full"
                  style={{ backgroundColor: item.color }}
                ></div>
                <div
                  style={{ color: item.color }}
                  className="text-[14px] md:text-[18px] font-medium"
                >
                  {item.percentage}% {item.label}
                </div>
              </motion.div>
            </ScrollAnimation>
          ))}
        </div>
      </div>
    </div>
  );
};
