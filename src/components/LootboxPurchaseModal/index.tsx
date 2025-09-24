"use client";
import React from "react";
import { BaseModal } from "../TransactionModals/BaseModal";
import { Button } from "../Button";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader2, AlertTriangle, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";

interface LootboxPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  lootbox: any;
  isLoading?: boolean;
}

export function LootboxPurchaseModal({
  isOpen,
  onClose,
  onConfirm,
  lootbox,
  isLoading = false,
}: LootboxPurchaseModalProps) {
  const { t } = useLanguage();

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={t("purchase.confirmTitle")}
      size="md"
      preventClose={isLoading}
    >
      <div className="flex flex-col items-center text-center space-y-6">
        <p className="text-sm text-neutral-11 text-left">
          You’re about to open 1 box. Confirm your purchase to continue
        </p>

        <div className="flex flex-col items-center divide-y divide-neutral-6 justify-center gap-2 bg-neutral-4 border border-neutral-6 rounded-lg py-3 w-full">
          <motion.div
            className="relative flex items-center gap-2 w-full px-3"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {lootbox?.imageUrl && (
              <div className="w-6 h-6 sm:w-12 sm:h-12 relative">
                <Image
                  src={lootbox.imageUrl}
                  alt={lootbox.name}
                  fill
                  className="object-cover rounded-lg border border-neutral-6"
                />
              </div>
            )}
            <p className="text-sm text-neutral-11">{lootbox?.name}</p>
          </motion.div>

          {/* Price Display */}
          <motion.div
            className="w-full px-3 pt-2"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-sm font-bold text-neutral-11 flex items-center gap-2">
              Box price:{" "}
              {lootbox?.price?.toLocaleString("en-US", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              })}{" "}
              USD
            </span>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 w-full"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
            disabled={isLoading}
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {t("purchase.processing")}
              </>
            ) : (
              <>
                {t("purchase.confirm")}
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </BaseModal>
  );
}
