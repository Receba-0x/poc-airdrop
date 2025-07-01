"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogoIcon } from "../Icons/LogoIcon";
import { usePathname } from "next/navigation";
import { useBurnTransactions } from "@/hooks/useBurnTransactions";

type BurnTransaction = {
  id: string;
  amount: number;
  timestamp: number;
  wallet_address: string;
  nft_mint: string;
  transaction_signature: string;
};

const MAX_ITEMS = 15;

export function BurnTicker() {
  const pathname = usePathname();
  const isBoxes = pathname.includes("/boxes");

  if (!isBoxes) return null;

  const { transactions, isLoading } = useBurnTransactions();
  const [displayTransactions, setDisplayTransactions] = useState<
    BurnTransaction[]
  >([]);
  const [newItemIds, setNewItemIds] = useState<Set<string>>(new Set());
  const [animationKey, setAnimationKey] = useState(0);
  const previousIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (transactions.length > 0) {
      const newList = transactions.slice(0, MAX_ITEMS);
      const currentIds = new Set(newList.map((tx) => tx.id));
      const newIds = new Set(
        [...currentIds].filter((id) => !previousIdsRef.current.has(id))
      );

      if (newIds.size > 0) {
        // Increment animation key to trigger re-render with new animations
        setAnimationKey((prev) => prev + 1);
      }

      setDisplayTransactions(newList);
      setNewItemIds(newIds);
      previousIdsRef.current = currentIds;

      if (newIds.size > 0) {
        setTimeout(() => {
          setNewItemIds(new Set());
        }, 800);
      }
    }
  }, [transactions]);

  if (isLoading) {
    return (
      <div className="w-full bg-[#0F0F0F] overflow-hidden fixed top-[60px] left-0 right-0 z-50 drop-shadow-2xl shadow-2xl shadow-black">
        <div className="relative flex items-center h-[36px] justify-center">
          <span className="text-white/50 text-sm">Loading transactions...</span>
        </div>
      </div>
    );
  }

  if (displayTransactions.length <= 10) {
    return null;
  }

  const itemCount = displayTransactions.length;
  const itemWidth = `${100 / itemCount}%`;

  return (
    <div className="w-full bg-[#0F0F0F] overflow-hidden fixed top-[56px] md:top-[64px] left-0 right-0 z-50 drop-shadow-2xl shadow-2xl shadow-black">
      <div className="relative h-[36px] w-full">
        <motion.div
          className="flex h-full w-full"
          key={animationKey}
          initial={false}
          animate={{ x: 0 }}
          transition={{
            duration: 0.7,
            ease: [0.25, 0.46, 0.45, 0.94],
            when: "beforeChildren",
            staggerChildren: 0.05,
          }}
        >
          <AnimatePresence mode="popLayout">
            {displayTransactions.slice(0, 20).map((tx, index) => {
              const isNewItem = newItemIds.has(tx.id);

              return (
                <motion.div
                  key={`${tx.id}-${tx.timestamp}`}
                  className="flex items-center justify-center relative bg-[url('/images/burn_bg.png')] bg-cover bg-right bg-no-repeat"
                  style={{ width: itemWidth, minWidth: "80px", height: "36px" }}
                  initial={
                    isNewItem
                      ? {
                          x: "-100%",
                          opacity: 0,
                          scale: 0.9,
                        }
                      : {
                          x: 0,
                          opacity: 1,
                          scale: 1,
                        }
                  }
                  animate={{
                    x: 0,
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{
                    x: "100%",
                    opacity: 0,
                    scale: 0.9,
                    transition: { duration: 0.4 },
                  }}
                  transition={{
                    duration: isNewItem ? 0.7 : 0.5,
                    ease: [0.25, 0.46, 0.45, 0.94],
                    delay: isNewItem ? 0 : index * 0.02,
                    layout: {
                      duration: 0.6,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    },
                  }}
                  layout
                  layoutId={tx.id}
                >
                  <motion.div
                    className="flex items-center justify-start gap-1 px-1 pl-4 w-full"
                    initial={isNewItem ? { scale: 0.8, opacity: 0 } : false}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      duration: 0.4,
                      delay: isNewItem ? 0.3 : 0,
                      ease: "easeOut",
                    }}
                  >
                    <LogoIcon className="w-3 h-3 sm:w-4 sm:h-4 text-white flex-shrink-0" />
                    <span className="text-white font-medium text-xs sm:text-sm truncate">
                      {tx.amount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
