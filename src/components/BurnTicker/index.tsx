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
  const isHome = pathname === "/";
  const isTransactions = pathname === "/transactions";
  const isStaking = pathname === "/staking";

  if (isHome || isTransactions || isStaking) return null;

  const { transactions, isLoading } = useBurnTransactions();
  const [displayTransactions, setDisplayTransactions] = useState<BurnTransaction[]>([]);
  const [newItemIds, setNewItemIds] = useState<Set<string>>(new Set());
  const previousIdsRef = useRef<Set<string>>(new Set());

  // Update display transactions and detect new items
  useEffect(() => {
    if (transactions.length > 0) {
      const newList = transactions.slice(0, MAX_ITEMS);

      // Detect new items by comparing with previous IDs
      const currentIds = new Set(newList.map(tx => tx.id));
      const newIds = new Set([...currentIds].filter(id => !previousIdsRef.current.has(id)));

      setDisplayTransactions(newList);
      setNewItemIds(newIds);
      previousIdsRef.current = currentIds;

      // Clear new item flags after animation
      if (newIds.size > 0) {
        setTimeout(() => {
          setNewItemIds(new Set());
        }, 700);
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

  if (displayTransactions.length === 0) {
    return (
      <div className="w-full bg-[#0F0F0F] overflow-hidden fixed top-[60px] left-0 right-0 z-50 drop-shadow-2xl shadow-2xl shadow-black">
        <div className="relative flex items-center h-[36px] justify-center">
          <span className="text-white/50 text-sm">No transactions yet...</span>
        </div>
      </div>
    );
  }

  // Calculate item width based on screen size and number of items
  const itemCount = displayTransactions.length;
  const itemWidth = `${100 / itemCount}%`;

  return (
    <div className="w-full bg-[#0F0F0F] overflow-hidden fixed top-[60px] left-0 right-0 z-50 drop-shadow-2xl shadow-2xl shadow-black">
      <div className="relative h-[36px] w-full">
        <div className="flex h-full w-full">
          <AnimatePresence mode="popLayout">
            {displayTransactions.slice(0, 20).map((tx) => {
              const isNewItem = newItemIds.has(tx.id);

              return (
                <motion.div
                  key={`${tx.id}-${tx.timestamp}`}
                  className="flex items-center justify-center relative bg-[url('/images/burn_bg.png')] bg-cover bg-center bg-no-repeat border-r border-gray-700 last:border-r-0"
                  style={{ 
                    width: itemWidth,
                    minWidth: '80px', // Largura mínima para legibilidade
                    height: '36px' 
                  }}
                  initial={isNewItem ? { x: '100%', opacity: 0 } : false}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: '-100%', opacity: 0 }}
                  transition={{
                    duration: 0.6,
                    ease: "easeOut"
                  }}
                  layout
                >
                  <div className="flex items-center justify-center gap-1 px-1 w-full">
                    <LogoIcon className="w-3 h-3 sm:w-4 sm:h-4 text-white flex-shrink-0" />
                    <span className="text-white font-medium text-xs sm:text-sm truncate">
                      {tx.amount.toFixed(0)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
